import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Relay, RelayAccount

User = get_user_model()
RESERVED = {"admin", "administrator", "support", "postmaster", "abuse", "security", "root", "noreply", "no-reply", "help", "info"}
USERNAME_RE = re.compile(r"[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])?")


def validate_local_part(value: str) -> str:
    value = value.strip().lower()
    if not USERNAME_RE.fullmatch(value):
        raise serializers.ValidationError("Use 3–32 lowercase letters, numbers, dot, dash or underscore.")
    if value in RESERVED:
        raise serializers.ValidationError("This username is reserved.")
    return value


class SignupSerializer(serializers.Serializer):
    """Legacy public registration contract kept for the existing R.I.S.E UI."""
    username = serializers.CharField(min_length=3, max_length=32)
    password = serializers.CharField(min_length=12, write_only=True, trim_whitespace=False)
    password_confirmation = serializers.CharField(write_only=True, trim_whitespace=False)
    accept_terms = serializers.BooleanField()

    def validate_username(self, value):
        value = validate_local_part(value)
        if RelayAccount.objects.filter(username=value, domain=self.context["domain"]).exists():
            raise serializers.ValidationError("This username is unavailable.")
        return value

    def validate(self, data):
        if data["password"] != data["password_confirmation"]:
            raise serializers.ValidationError({"password_confirmation": "Passwords do not match."})
        if len(set(data["password"])) < 5:
            raise serializers.ValidationError({"password": "Choose a stronger password."})
        return data


class ProductRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirmation = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is unavailable.")
        return value

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, data):
        if data["password"] != data["password_confirmation"]:
            raise serializers.ValidationError({"password_confirmation": "Passwords do not match."})
        user = User(username=data["username"], email=data["email"])
        validate_password(data["password"], user)
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirmation")
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class RelayPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relay
        fields = ("id", "name", "domain", "description")


class MailboxCreateSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=32)
    domain = serializers.CharField(max_length=255)
    password = serializers.CharField(min_length=12, write_only=True, trim_whitespace=False)
    password_confirmation = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_username(self, value):
        return validate_local_part(value)

    def validate_domain(self, value):
        domain = value.strip().lower()
        relay = Relay.objects.filter(domain=domain, is_active=True, registration_open=True).first()
        if relay is None:
            raise serializers.ValidationError("This domain is not available for mailbox registration.")
        self.context["relay"] = relay
        return domain

    def validate(self, data):
        if data["password"] != data["password_confirmation"]:
            raise serializers.ValidationError({"password_confirmation": "Passwords do not match."})
        if len(set(data["password"])) < 5:
            raise serializers.ValidationError({"password": "Choose a stronger password."})
        if RelayAccount.objects.filter(username=data["username"], domain=data["domain"]).exists():
            raise serializers.ValidationError({"username": "This email address is unavailable."})
        return data


class MailboxPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=12, write_only=True, trim_whitespace=False)
    password_confirmation = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, data):
        if data["password"] != data["password_confirmation"]:
            raise serializers.ValidationError({"password_confirmation": "Passwords do not match."})
        if len(set(data["password"])) < 5:
            raise serializers.ValidationError({"password": "Choose a stronger password."})
        return data


class MailboxSerializer(serializers.ModelSerializer):
    relay_name = serializers.CharField(source="relay.name", read_only=True)

    class Meta:
        model = RelayAccount
        fields = (
            "id", "relay", "relay_name", "username", "domain", "email", "provider",
            "stalwart_id", "provisioning_status", "failure_code", "created_at", "updated_at", "provisioned_at",
        )
        read_only_fields = fields
