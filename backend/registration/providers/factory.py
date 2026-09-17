import os

from .base import EmailProvider, ProviderError
from .stalwart import StalwartProvider


def get_email_provider(name: str | None = None) -> EmailProvider:
    provider_name = (name or os.getenv("EMAIL_PROVIDER", "stalwart")).strip().lower()
    if provider_name == "stalwart":
        return StalwartProvider.from_environment()
    raise ProviderError(f"Unsupported email provider: {provider_name}", code="unsupported_provider")
