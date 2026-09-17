import base64
import hashlib
import hmac
import json
import logging
import os
import secrets

from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import IntegrityError
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import BlogPost, Relay, RelayAccount
from .serializers import (
    LoginSerializer,
    MailboxCreateSerializer,
    MailboxPasswordSerializer,
    MailboxSerializer,
    ProductRegistrationSerializer,
    RelayPublicSerializer,
    SignupSerializer,
)
from .services import MailboxError, MailboxProvisioningService, configured_relay

log = logging.getLogger("security")
User = get_user_model()


class SignupThrottle(ScopedRateThrottle): scope = "signup"
class UsernameThrottle(ScopedRateThrottle): scope = "username"
class ConfigThrottle(ScopedRateThrottle): scope = "config"
class BlogThrottle(ScopedRateThrottle): scope = "blog"
class AuthThrottle(ScopedRateThrottle): scope = "auth"
class MailboxThrottle(ScopedRateThrottle): scope = "mailbox"


def _altcha_signature(algorithm, challenge, salt):
    return hmac.new(os.getenv("ALTCHA_HMAC_KEY", "dev-altcha-key").encode(), f"{algorithm}:{challenge}:{salt}".encode(), hashlib.sha256).hexdigest()


def verify_altcha(value):
    if not value:
        return False
    try:
        decoded = json.loads(base64.b64decode(value).decode())
        expected = _altcha_signature(decoded["algorithm"], decoded["challenge"], decoded["salt"])
        return hmac.compare_digest(expected, decoded["signature"]) and hashlib.sha256(f"{decoded['salt']}{int(decoded['number'])}".encode()).hexdigest() == decoded["challenge"]
    except (KeyError, ValueError, TypeError, UnicodeDecodeError, json.JSONDecodeError):
        return False


def _mailbox_response(account):
    relay = account.relay
    return {
        "id": account.pk,
        "email": account.email,
        "status": account.provisioning_status,
        "imap_host": relay.imap_host or relay.domain,
        "imap_port": 993,
        "smtp_host": relay.smtp_host or relay.domain,
        "smtp_port": 465,
        "security": "TLS",
    }


def _mailbox_error_response(error: MailboxError):
    return Response({"detail": str(error), "code": error.code}, status=error.status_code)


def _idempotency_replay(request, owner):
    """Return a prior completed/pending request before validating a replay body."""
    raw_key = request.headers.get("Idempotency-Key")
    if not raw_key:
        return None
    try:
        request_id = MailboxProvisioningService._as_uuid(raw_key)
    except MailboxError as error:
        return _mailbox_error_response(error)
    account = RelayAccount.objects.filter(request_id=request_id).select_related("relay").first()
    if account is None:
        return None
    if account.owner_id != getattr(owner, "id", None):
        return Response({"detail": "This idempotency key cannot be reused."}, status=status.HTTP_409_CONFLICT)
    return Response(_mailbox_response(account), status=status.HTTP_200_OK)


def _owned_mailbox_or_404(request, mailbox_id):
    return RelayAccount.objects.filter(pk=mailbox_id, owner=request.user).select_related("relay").first()


@api_view(["GET"])
@permission_classes([AllowAny])
def api_index(request):
    return Response({
        "service": "R.I.S.E Business Mail API",
        "endpoints": {
            "config": "/api/config/",
            "auth_register": "/api/auth/register/",
            "auth_login": "/api/auth/login/",
            "mailboxes": "/api/mailboxes/",
            "domains": "/api/domains/",
            "legacy_signup": "/api/signup/",
        },
    })


@api_view(["GET"])
@throttle_classes([SignupThrottle])
@permission_classes([AllowAny])
def altcha_challenge(request):
    salt = secrets.token_hex(16)
    number = secrets.randbelow(1_000_000)
    challenge = hashlib.sha256(f"{salt}{number}".encode()).hexdigest()
    return Response({"algorithm": "SHA-256", "challenge": challenge, "salt": salt, "signature": _altcha_signature("SHA-256", challenge, salt)})


@api_view(["GET"])
@throttle_classes([ConfigThrottle])
@permission_classes([AllowAny])
def config(request):
    relay = configured_relay()
    return Response({
        "brand": "R.I.S.E",
        "relay_name": relay.name,
        "domain": relay.domain,
        "description": relay.description or os.getenv("RELAY_DESCRIPTION", "A private, secure home for Delta Chat."),
        "registration_open": relay.is_active and relay.registration_open,
        "terms_url": os.getenv("TERMS_URL", "#"),
        "privacy_url": os.getenv("PRIVACY_URL", "#"),
    })


@api_view(["GET"])
@throttle_classes([BlogThrottle])
@permission_classes([AllowAny])
def blog(request):
    posts = list(BlogPost.objects.filter(published=True))
    if not posts:
        return Response([{"title": "R.I.S.E Journal", "slug": "rise-journal", "excerpt": "Stories about privacy, open communication and Delta Chat.", "content": "Welcome to the R.I.S.E Journal.", "cover_url": "", "published_at": None}])
    return Response([{"title": post.title, "slug": post.slug, "excerpt": post.excerpt, "content": post.content, "cover_url": post.cover_url, "published_at": post.published_at} for post in posts])


@api_view(["GET"])
@throttle_classes([UsernameThrottle])
@permission_classes([AllowAny])
def username(request, value):
    relay = configured_relay()
    return Response({"available": not RelayAccount.objects.filter(username=value.lower(), domain=relay.domain).exists()})


@api_view(["POST"])
@throttle_classes([SignupThrottle])
@permission_classes([AllowAny])
def signup(request):
    """Compatibility route for the public R.I.S.E registration form.

    Product clients should use auth/register followed by authenticated
    /mailboxes/ requests, which creates an explicit product-user mapping.
    """
    origin = request.headers.get("Origin")
    if origin and origin not in settings.CORS_ALLOWED_ORIGINS:
        return Response({"detail": "Invalid request origin."}, status=status.HTTP_403_FORBIDDEN)
    if os.getenv("ALTCHA_REQUIRED", "false").lower() == "true" and not verify_altcha(request.data.get("altcha")):
        return Response({"detail": "Please complete the anti-bot challenge."}, status=status.HTTP_400_BAD_REQUEST)

    replay = _idempotency_replay(request, owner=None)
    if replay is not None:
        return replay

    relay = configured_relay()
    serializer = SignupSerializer(data=request.data, context={"domain": relay.domain})
    serializer.is_valid(raise_exception=True)
    try:
        result = MailboxProvisioningService(relay.provider).create_mailbox(
            owner=None,
            relay=relay,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
            idempotency_key=request.headers.get("Idempotency-Key"),
        )
    except MailboxError as exc:
        return _mailbox_error_response(exc)
    response_status = status.HTTP_200_OK if result.replayed else status.HTTP_201_CREATED
    return Response(_mailbox_response(result.account), status=response_status)


@api_view(["POST"])
@throttle_classes([AuthThrottle])
@permission_classes([AllowAny])
def auth_register(request):
    serializer = ProductRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        user = serializer.save()
    except IntegrityError:
        return Response({"detail": "This account is unavailable."}, status=status.HTTP_409_CONFLICT)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": {"id": user.pk, "username": user.username, "email": user.email}}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@throttle_classes([AuthThrottle])
@permission_classes([AllowAny])
def auth_login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = authenticate(request, username=serializer.validated_data["username"], password=serializer.validated_data["password"])
    if not user or not user.is_active:
        return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": {"id": user.pk, "username": user.username, "email": user.email}})


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def auth_logout(request):
    if request.auth:
        request.auth.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({"id": request.user.pk, "username": request.user.username, "email": request.user.email})


@api_view(["GET"])
@permission_classes([AllowAny])
def domains(request):
    relays = Relay.objects.filter(is_active=True, registration_open=True).order_by("name")
    return Response(RelayPublicSerializer(relays, many=True).data)


@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@throttle_classes([MailboxThrottle])
def mailboxes(request):
    if request.method == "GET":
        accounts = RelayAccount.objects.filter(owner=request.user).select_related("relay").order_by("-created_at")
        return Response(MailboxSerializer(accounts, many=True).data)

    replay = _idempotency_replay(request, owner=request.user)
    if replay is not None:
        return replay
    serializer = MailboxCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        result = MailboxProvisioningService(serializer.context["relay"].provider).create_mailbox(
            owner=request.user,
            relay=serializer.context["relay"],
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
            idempotency_key=request.headers.get("Idempotency-Key"),
        )
    except MailboxError as exc:
        return _mailbox_error_response(exc)
    response_status = status.HTTP_200_OK if result.replayed else status.HTTP_201_CREATED
    return Response(_mailbox_response(result.account), status=response_status)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def mailbox_detail(request, mailbox_id):
    account = _owned_mailbox_or_404(request, mailbox_id)
    if account is None:
        return Response({"detail": "Mailbox not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(MailboxSerializer(account).data)


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@throttle_classes([MailboxThrottle])
def mailbox_password(request, mailbox_id):
    account = _owned_mailbox_or_404(request, mailbox_id)
    if account is None:
        return Response({"detail": "Mailbox not found."}, status=status.HTTP_404_NOT_FOUND)
    serializer = MailboxPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        MailboxProvisioningService(account.provider).set_password(account, serializer.validated_data["password"])
    except MailboxError as exc:
        return _mailbox_error_response(exc)
    return Response({"detail": "Mailbox password updated."})


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@throttle_classes([MailboxThrottle])
def mailbox_suspend(request, mailbox_id):
    account = _owned_mailbox_or_404(request, mailbox_id)
    if account is None:
        return Response({"detail": "Mailbox not found."}, status=status.HTTP_404_NOT_FOUND)
    try:
        MailboxProvisioningService(account.provider).suspend(account)
    except MailboxError as exc:
        return _mailbox_error_response(exc)
    return Response(MailboxSerializer(account).data)


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@throttle_classes([MailboxThrottle])
def mailbox_resume(request, mailbox_id):
    account = _owned_mailbox_or_404(request, mailbox_id)
    if account is None:
        return Response({"detail": "Mailbox not found."}, status=status.HTTP_404_NOT_FOUND)
    try:
        MailboxProvisioningService(account.provider).resume(account)
    except MailboxError as exc:
        return _mailbox_error_response(exc)
    return Response(MailboxSerializer(account).data)


@api_view(["DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@throttle_classes([MailboxThrottle])
def mailbox_delete(request, mailbox_id):
    account = _owned_mailbox_or_404(request, mailbox_id)
    if account is None:
        return Response({"detail": "Mailbox not found."}, status=status.HTTP_404_NOT_FOUND)
    try:
        MailboxProvisioningService(account.provider).delete(account)
    except MailboxError as exc:
        return _mailbox_error_response(exc)
    return Response(status=status.HTTP_204_NO_CONTENT)
