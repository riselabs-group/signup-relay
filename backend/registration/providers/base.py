from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


class ProviderError(Exception):
    """A safe, provider-independent upstream error."""

    def __init__(self, message: str, *, code: str = "provider_error", retryable: bool = False):
        super().__init__(message)
        self.code = code
        self.retryable = retryable


class ProviderConflict(ProviderError):
    def __init__(self, message: str = "The provider object already exists."):
        super().__init__(message, code="provider_conflict")


class ProviderNotFound(ProviderError):
    def __init__(self, message: str = "The provider object was not found."):
        super().__init__(message, code="provider_not_found")


@dataclass(frozen=True)
class ProviderAccount:
    id: str
    email: str
    raw: dict[str, Any] = field(default_factory=dict, repr=False)


@dataclass(frozen=True)
class ProviderDomain:
    id: str
    name: str
    raw: dict[str, Any] = field(default_factory=dict, repr=False)


class EmailProvider(ABC):
    name = "base"

    @abstractmethod
    def create_domain(self, name: str, **options: Any) -> ProviderDomain: ...

    @abstractmethod
    def get_domain(self, domain_id: str) -> ProviderDomain: ...

    @abstractmethod
    def find_domain(self, name: str) -> ProviderDomain | None: ...

    @abstractmethod
    def create_account(self, *, local_part: str, domain_id: str, password: str) -> ProviderAccount: ...

    @abstractmethod
    def get_account(self, account_id: str) -> ProviderAccount: ...

    @abstractmethod
    def find_account(self, *, local_part: str, domain_id: str) -> ProviderAccount | None: ...

    @abstractmethod
    def update_account(self, account_id: str, changes: dict[str, Any]) -> ProviderAccount: ...

    @abstractmethod
    def set_password(self, account_id: str, password: str) -> None: ...

    @abstractmethod
    def suspend_account(self, account_id: str) -> None: ...

    @abstractmethod
    def resume_account(self, account_id: str) -> None: ...

    @abstractmethod
    def delete_account(self, account_id: str) -> None: ...
