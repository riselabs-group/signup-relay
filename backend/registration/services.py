import logging
import os
from dataclasses import dataclass
from uuid import UUID

from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import Relay, RelayAccount
from .providers import ProviderError, get_email_provider

logger = logging.getLogger("security")


class MailboxError(Exception):
    def __init__(self, message: str, *, code: str = "mailbox_error", status_code: int = 400):
        super().__init__(message)
        self.code = code
        self.status_code = status_code


@dataclass(frozen=True)
class ProvisionResult:
    account: RelayAccount
    replayed: bool = False


class MailboxProvisioningService:
    """Product-level mailbox lifecycle; providers stay behind this boundary."""

    def __init__(self, provider_name: str = "stalwart"):
        self.provider_name = provider_name
        self.provider = get_email_provider(provider_name)

    def _domain_id(self, relay: Relay) -> str:
        if relay.provider_domain_id:
            return relay.provider_domain_id
        domain = self.provider.find_domain(relay.domain)
        if domain is None:
            raise MailboxError("This domain has not been provisioned in the mail provider.", code="domain_not_provisioned", status_code=409)
        relay.provider_domain_id = domain.id
        relay.save(update_fields=["provider_domain_id", "updated_at"])
        return domain.id

    @staticmethod
    def _as_uuid(value: str | None) -> UUID | None:
        if not value:
            return None
        try:
            return UUID(str(value))
        except (TypeError, ValueError) as exc:
            raise MailboxError("Idempotency-Key must be a UUID.", code="invalid_idempotency_key") from exc

    def create_mailbox(self, *, owner, relay: Relay, username: str, password: str, idempotency_key: str | None = None) -> ProvisionResult:
        if not relay.is_active or not relay.registration_open:
            raise MailboxError("Mailbox registration is closed for this domain.", code="registration_closed", status_code=423)
        if relay.provider != self.provider_name:
            raise MailboxError("Relay provider does not match this provisioning service.", code="provider_mismatch", status_code=409)

        request_id = self._as_uuid(idempotency_key)
        if request_id:
            existing = RelayAccount.objects.filter(request_id=request_id).first()
            if existing:
                if existing.owner_id != getattr(owner, "id", None):
                    raise MailboxError("This idempotency key cannot be reused.", code="idempotency_conflict", status_code=409)
                return ProvisionResult(account=existing, replayed=True)

        email = f"{username}@{relay.domain}"
        try:
            with transaction.atomic():
                account = RelayAccount.objects.create(
                    owner=owner,
                    relay=relay,
                    username=username,
                    domain=relay.domain,
                    email=email,
                    provider=relay.provider,
                    request_id=request_id,
                    provisioning_status=RelayAccount.Status.PENDING,
                )
        except IntegrityError as exc:
            raise MailboxError("This email address is unavailable.", code="email_unavailable", status_code=409) from exc

        try:
            provider_account = self.provider.create_account(
                local_part=username,
                domain_id=self._domain_id(relay),
                password=password,
            )
        except ProviderError as exc:
            account.provisioning_status = RelayAccount.Status.FAILED
            account.failure_code = exc.code
            account.failure_message = str(exc)[:255]
            account.save(update_fields=["provisioning_status", "failure_code", "failure_message", "updated_at"])
            logger.warning("mailbox_provisioning_failed email=%s code=%s", email, exc.code)
            raise MailboxError("We could not provision this mailbox.", code=exc.code, status_code=502) from exc

        account.stalwart_id = provider_account.id
        account.provisioning_status = RelayAccount.Status.ACTIVE
        account.failure_code = ""
        account.failure_message = ""
        account.provisioned_at = timezone.now()
        account.save(update_fields=["stalwart_id", "provisioning_status", "failure_code", "failure_message", "provisioned_at", "updated_at"])
        logger.info("mailbox_provisioned account_id=%s email=%s provider=%s", account.pk, email, relay.provider)
        return ProvisionResult(account=account)

    def set_password(self, account: RelayAccount, password: str) -> RelayAccount:
        self._require_remote_account(account)
        try:
            self.provider.set_password(account.stalwart_id, password)
        except ProviderError as exc:
            self._record_failure(account, exc)
            raise MailboxError("We could not update the mailbox password.", code=exc.code, status_code=502) from exc
        return account

    def suspend(self, account: RelayAccount) -> RelayAccount:
        self._require_remote_account(account)
        try:
            self.provider.suspend_account(account.stalwart_id)
        except ProviderError as exc:
            self._record_failure(account, exc)
            raise MailboxError("We could not suspend the mailbox.", code=exc.code, status_code=502) from exc
        account.provisioning_status = RelayAccount.Status.SUSPENDED
        account.failure_code = ""
        account.failure_message = ""
        account.save(update_fields=["provisioning_status", "failure_code", "failure_message", "updated_at"])
        return account

    def resume(self, account: RelayAccount) -> RelayAccount:
        self._require_remote_account(account)
        try:
            self.provider.resume_account(account.stalwart_id)
        except ProviderError as exc:
            self._record_failure(account, exc)
            raise MailboxError("We could not resume the mailbox.", code=exc.code, status_code=502) from exc
        account.provisioning_status = RelayAccount.Status.ACTIVE
        account.failure_code = ""
        account.failure_message = ""
        account.save(update_fields=["provisioning_status", "failure_code", "failure_message", "updated_at"])
        return account

    def delete(self, account: RelayAccount) -> RelayAccount:
        self._require_remote_account(account)
        account.provisioning_status = RelayAccount.Status.DELETING
        account.save(update_fields=["provisioning_status", "updated_at"])
        try:
            self.provider.delete_account(account.stalwart_id)
        except ProviderError as exc:
            self._record_failure(account, exc)
            raise MailboxError("We could not delete the mailbox.", code=exc.code, status_code=502) from exc
        account.provisioning_status = RelayAccount.Status.DELETED
        account.save(update_fields=["provisioning_status", "updated_at"])
        logger.info("mailbox_deleted account_id=%s email=%s", account.pk, account.email)
        return account

    @staticmethod
    def _require_remote_account(account: RelayAccount) -> None:
        if not account.stalwart_id or account.provisioning_status == RelayAccount.Status.DELETED:
            raise MailboxError("This mailbox has no active provider account.", code="mailbox_not_active", status_code=409)

    @staticmethod
    def _record_failure(account: RelayAccount, error: ProviderError) -> None:
        account.failure_code = error.code
        account.failure_message = str(error)[:255]
        account.save(update_fields=["failure_code", "failure_message", "updated_at"])


def configured_relay() -> Relay:
    """Compatibility adapter for the existing public signup endpoint.

    Production installations should create Relay rows through Django Admin. This
    allows the existing single-relay frontend to remain functional during the
    migration to authenticated business mailboxes.
    """
    domain = os.getenv("RELAY_DOMAIN", "rise.example").lower()
    relay, _ = Relay.objects.get_or_create(
        domain=domain,
        defaults={
            "name": os.getenv("RELAY_NAME", "R.I.S.E Relay"),
            "slug": domain.replace(".", "-"),
            "provider": os.getenv("EMAIL_PROVIDER", "stalwart"),
            "provider_domain_id": os.getenv("STALWART_DOMAIN_ID", ""),
            "registration_open": os.getenv("REGISTRATION_OPEN", "true").lower() == "true",
            "imap_host": os.getenv("IMAP_HOST", domain),
            "smtp_host": os.getenv("SMTP_HOST", domain),
        },
    )
    return relay
