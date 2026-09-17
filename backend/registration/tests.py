import os
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import BlogPost, Relay, RelayAccount
from .providers.base import ProviderAccount, ProviderError
from .providers.stalwart import StalwartProvider

User = get_user_model()


@patch.dict(os.environ, {"STALWART_DRY_RUN": "true"}, clear=False)
class SignupTests(APITestCase):
    def test_legacy_signup_and_duplicate(self):
        payload = {"username": "nora", "password": "a-very-strong-pass", "password_confirmation": "a-very-strong-pass", "accept_terms": True}
        response = self.client.post("/api/signup/", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["email"], f"nora@{os.getenv('RELAY_DOMAIN', 'rise.example')}")
        account = RelayAccount.objects.get(email=response.data["email"])
        self.assertEqual(account.provisioning_status, RelayAccount.Status.ACTIVE)
        self.assertTrue(account.stalwart_id.startswith("dry-"))
        self.assertEqual(self.client.post("/api/signup/", payload, format="json").status_code, 400)

    def test_invalid_password(self):
        response = self.client.post("/api/signup/", {"username": "abc", "password": "short", "password_confirmation": "short", "accept_terms": True}, format="json")
        self.assertEqual(response.status_code, 400)


@patch.dict(os.environ, {"STALWART_DRY_RUN": "true"}, clear=False)
class ProductAuthAndMailboxTests(APITestCase):
    def setUp(self):
        self.relay = Relay.objects.create(
            name="Business Relay",
            slug="business-relay",
            domain="business.example",
            provider="stalwart",
            provider_domain_id="domain-1",
            imap_host="imap.business.example",
            smtp_host="smtp.business.example",
        )
        self.user = User.objects.create_user(username="owner", email="owner@example.test", password="product-password-123")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        self.payload = {
            "username": "alice",
            "domain": self.relay.domain,
            "password": "mail-password-123",
            "password_confirmation": "mail-password-123",
        }

    def test_product_registration_returns_token(self):
        self.client.credentials()
        response = self.client.post("/api/auth/register/", {
            "username": "new-owner",
            "email": "new-owner@example.test",
            "password": "another-product-password-123",
            "password_confirmation": "another-product-password-123",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["email"], "new-owner@example.test")

    def test_create_mailbox_maps_owner_and_stalwart_id(self):
        response = self.client.post("/api/mailboxes/", self.payload, format="json", HTTP_IDEMPOTENCY_KEY="260f8a55-5e6f-4b6e-9a77-bc9089950f81")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["email"], "alice@business.example")
        account = RelayAccount.objects.get(email="alice@business.example")
        self.assertEqual(account.owner, self.user)
        self.assertEqual(account.relay, self.relay)
        self.assertEqual(account.provisioning_status, RelayAccount.Status.ACTIVE)
        self.assertTrue(account.stalwart_id)

        replay = self.client.post("/api/mailboxes/", self.payload, format="json", HTTP_IDEMPOTENCY_KEY="260f8a55-5e6f-4b6e-9a77-bc9089950f81")
        self.assertEqual(replay.status_code, 200)
        self.assertEqual(RelayAccount.objects.filter(email="alice@business.example").count(), 1)

    def test_owner_can_manage_own_mailbox_lifecycle(self):
        created = self.client.post("/api/mailboxes/", self.payload, format="json")
        account_id = created.data["id"]
        self.assertEqual(self.client.post(f"/api/mailboxes/{account_id}/password/", {"password": "changed-mail-password-123", "password_confirmation": "changed-mail-password-123"}, format="json").status_code, 200)
        suspended = self.client.post(f"/api/mailboxes/{account_id}/suspend/", format="json")
        self.assertEqual(suspended.status_code, 200)
        self.assertEqual(suspended.data["provisioning_status"], RelayAccount.Status.SUSPENDED)
        resumed = self.client.post(f"/api/mailboxes/{account_id}/resume/", format="json")
        self.assertEqual(resumed.status_code, 200)
        self.assertEqual(resumed.data["provisioning_status"], RelayAccount.Status.ACTIVE)
        self.assertEqual(self.client.delete(f"/api/mailboxes/{account_id}/delete/").status_code, 204)
        self.assertEqual(RelayAccount.objects.get(pk=account_id).provisioning_status, RelayAccount.Status.DELETED)

    def test_owner_cannot_read_another_users_mailbox(self):
        account = RelayAccount.objects.create(
            owner=User.objects.create_user(username="other", password="product-password-123"),
            relay=self.relay,
            username="other",
            domain=self.relay.domain,
            email="other@business.example",
            stalwart_id="account-other",
            provisioning_status=RelayAccount.Status.ACTIVE,
        )
        self.assertEqual(self.client.get(f"/api/mailboxes/{account.pk}/").status_code, 404)

    @patch("registration.services.get_email_provider")
    def test_provider_failure_is_recorded_not_marked_successful(self, provider_factory):
        provider = Mock()
        provider.create_account.side_effect = ProviderError("Stalwart unavailable", code="provider_unreachable", retryable=True)
        provider_factory.return_value = provider
        response = self.client.post("/api/mailboxes/", self.payload, format="json")
        self.assertEqual(response.status_code, 502)
        account = RelayAccount.objects.get(email="alice@business.example")
        self.assertEqual(account.provisioning_status, RelayAccount.Status.FAILED)
        self.assertEqual(account.failure_code, "provider_unreachable")


class BlogTests(APITestCase):
    def test_only_published_posts_are_public(self):
        BlogPost.objects.create(title="Published", slug="published", excerpt="Visible", content="Body", published=True, published_at=timezone.now())
        BlogPost.objects.create(title="Draft", slug="draft", excerpt="Hidden", content="Body", published=False)
        response = self.client.get("/api/blog/")
        self.assertEqual(response.status_code, 200)
        titles = {post["title"] for post in response.data}
        self.assertIn("Published", titles)
        self.assertNotIn("Draft", titles)


class StalwartProviderTests(APITestCase):
    def test_account_create_uses_management_jmap_and_password_credential(self):
        provider = StalwartProvider(base_url="https://mail.example.test", api_key="test-key", dry_run=False)
        response = Mock(ok=True, status_code=200)
        response.json.return_value = {
            "methodResponses": [["x:Account/set", {"created": {"new1": {"id": "account-42", "emailAddress": "alice@example.test"}}}, "c1"]]
        }
        with patch.object(provider.session, "post", return_value=response) as post:
            account = provider.create_account(local_part="alice", domain_id="domain-9", password="not-logged-password")

        self.assertEqual(account.id, "account-42")
        self.assertEqual(post.call_args.args[0], "https://mail.example.test/api")
        payload = post.call_args.kwargs["json"]
        created = payload["methodCalls"][0][1]["create"]["new1"]
        self.assertEqual(payload["methodCalls"][0][0], "x:Account/set")
        self.assertEqual(created["domainId"], "domain-9")
        self.assertEqual(created["credentials"]["0"]["@type"], "Password")
        self.assertEqual(created["credentials"]["0"]["secret"], "not-logged-password")
        self.assertEqual(post.call_args.kwargs["headers"]["Authorization"], "Bearer test-key")
