import hashlib
import os
from typing import Any

import requests

from .base import EmailProvider, ProviderAccount, ProviderConflict, ProviderDomain, ProviderError, ProviderNotFound


class StalwartProvider(EmailProvider):
    """Stalwart management JMAP implementation.

    The API key is used only by this server-side class and is never returned to
    serializers, views, or clients.
    """

    name = "stalwart"
    capabilities = ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"]

    def __init__(self, *, base_url: str, api_key: str, dry_run: bool = True, timeout: float = 10, verify_tls: bool = True):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.dry_run = dry_run
        self.timeout = timeout
        self.verify_tls = verify_tls
        self.session = requests.Session()

    @classmethod
    def from_environment(cls):
        return cls(
            base_url=os.getenv("STALWART_JMAP_URL", os.getenv("STALWART_ADMIN_URL", "")),
            api_key=os.getenv("STALWART_API_KEY", os.getenv("STALWART_ADMIN_TOKEN", "")),
            dry_run=os.getenv("STALWART_DRY_RUN", "true").lower() == "true",
            timeout=float(os.getenv("STALWART_TIMEOUT_SECONDS", "10")),
            verify_tls=os.getenv("STALWART_VERIFY_TLS", "true").lower() == "true",
        )

    @property
    def endpoint(self) -> str:
        return self.base_url if self.base_url.endswith("/api") else f"{self.base_url}/api"

    def _dry_id(self, object_type: str, value: str) -> str:
        digest = hashlib.sha256(f"{object_type}:{value}".encode()).hexdigest()[:20]
        return f"dry-{digest}"

    def _call(self, method: str, arguments: dict[str, Any], call_id: str = "c1") -> dict[str, Any]:
        if not self.base_url or not self.api_key:
            raise ProviderError("Stalwart is not configured.", code="provider_not_configured")
        try:
            response = self.session.post(
                self.endpoint,
                json={"using": self.capabilities, "methodCalls": [[method, arguments, call_id]]},
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                timeout=self.timeout,
                verify=self.verify_tls,
            )
        except requests.Timeout as exc:
            raise ProviderError("Stalwart timed out.", code="provider_timeout", retryable=True) from exc
        except requests.RequestException as exc:
            raise ProviderError("Stalwart is unreachable.", code="provider_unreachable", retryable=True) from exc

        if response.status_code == 401:
            raise ProviderError("Stalwart rejected the API key.", code="provider_unauthorized")
        if response.status_code == 403:
            raise ProviderError("The Stalwart API key lacks permission.", code="provider_forbidden")
        if response.status_code == 404:
            raise ProviderNotFound()
        if response.status_code == 409:
            raise ProviderConflict()
        if response.status_code >= 500:
            raise ProviderError("Stalwart returned a server error.", code="provider_server_error", retryable=True)
        if not response.ok:
            raise ProviderError(f"Stalwart rejected the request ({response.status_code}).", code="provider_rejected")

        try:
            payload = response.json()
        except ValueError as exc:
            raise ProviderError("Stalwart returned invalid JSON.", code="provider_invalid_response") from exc

        method_responses = payload.get("methodResponses")
        if not isinstance(method_responses, list) or not method_responses:
            raise ProviderError("Stalwart returned no method response.", code="provider_invalid_response")
        response_name, result, response_call_id = method_responses[0]
        if response_call_id != call_id:
            raise ProviderError("Stalwart returned a mismatched call id.", code="provider_invalid_response")
        if response_name == "error":
            error_type = result.get("type", "jmap_error") if isinstance(result, dict) else "jmap_error"
            if error_type in {"notFound", "accountNotFound"}:
                raise ProviderNotFound()
            raise ProviderError("Stalwart rejected the JMAP operation.", code=f"stalwart_{error_type}")
        if response_name != method:
            raise ProviderError("Stalwart returned an unexpected method response.", code="provider_invalid_response")
        return result

    @staticmethod
    def _mutation_error(result: dict[str, Any], key: str) -> None:
        errors = result.get(key) or {}
        if errors:
            details = next(iter(errors.values())) if isinstance(errors, dict) else {}
            error_type = details.get("type", "mutation_failed") if isinstance(details, dict) else "mutation_failed"
            if error_type in {"alreadyExists", "duplicate", "invalidProperties"}:
                raise ProviderConflict()
            if error_type == "notFound":
                raise ProviderNotFound()
            raise ProviderError("Stalwart rejected the object mutation.", code=f"stalwart_{error_type}")

    @staticmethod
    def _account_from_object(item: dict[str, Any]) -> ProviderAccount:
        email = item.get("emailAddress") or item.get("name", "")
        return ProviderAccount(id=str(item["id"]), email=email, raw=item)

    @staticmethod
    def _domain_from_object(item: dict[str, Any]) -> ProviderDomain:
        return ProviderDomain(id=str(item["id"]), name=item.get("name", ""), raw=item)

    def create_domain(self, name: str, **options: Any) -> ProviderDomain:
        if self.dry_run:
            return ProviderDomain(id=self._dry_id("domain", name), name=name, raw={"dry_run": True})
        obj = {
            "name": name,
            "aliases": {},
            "isEnabled": options.get("is_enabled", True),
            "certificateManagement": {"@type": "Manual"},
            "dkimManagement": {"@type": "Automatic"},
            "dnsManagement": {"@type": "Manual"},
            "subAddressing": {"@type": "Enabled"},
        }
        result = self._call("x:Domain/set", {"create": {"new1": obj}})
        self._mutation_error(result, "notCreated")
        created = (result.get("created") or {}).get("new1")
        if not created or "id" not in created:
            raise ProviderError("Stalwart did not return the domain id.", code="provider_invalid_response")
        return ProviderDomain(id=str(created["id"]), name=created.get("name", name), raw=created)

    def get_domain(self, domain_id: str) -> ProviderDomain:
        if self.dry_run:
            return ProviderDomain(id=domain_id, name="dry-run.example", raw={"dry_run": True})
        result = self._call("x:Domain/get", {"ids": [domain_id]})
        items = result.get("list") or []
        if not items:
            raise ProviderNotFound()
        return self._domain_from_object(items[0])

    def find_domain(self, name: str) -> ProviderDomain | None:
        if self.dry_run:
            return ProviderDomain(id=self._dry_id("domain", name), name=name, raw={"dry_run": True})
        query = self._call("x:Domain/query", {"filter": {"name": name}, "limit": 2})
        ids = query.get("ids") or []
        if not ids:
            return None
        return self.get_domain(str(ids[0]))

    def create_account(self, *, local_part: str, domain_id: str, password: str) -> ProviderAccount:
        if self.dry_run:
            account_id = self._dry_id("account", f"{local_part}:{domain_id}")
            return ProviderAccount(id=account_id, email=local_part, raw={"dry_run": True})
        obj = {
            "@type": "User",
            "name": local_part,
            "domainId": domain_id,
            "credentials": {"0": {"@type": "Password", "secret": password}},
            "memberGroupIds": {},
            "roles": {"@type": "User"},
            "permissions": {"@type": "Inherit"},
            "quotas": {},
            "aliases": {},
            "encryptionAtRest": {"@type": "Disabled"},
        }
        result = self._call("x:Account/set", {"create": {"new1": obj}})
        self._mutation_error(result, "notCreated")
        created = (result.get("created") or {}).get("new1")
        if not created or "id" not in created:
            raise ProviderError("Stalwart did not return the account id.", code="provider_invalid_response")
        return ProviderAccount(id=str(created["id"]), email=created.get("emailAddress", local_part), raw=created)

    def get_account(self, account_id: str) -> ProviderAccount:
        if self.dry_run:
            return ProviderAccount(id=account_id, email="dry-run", raw={"dry_run": True})
        result = self._call("x:Account/get", {"ids": [account_id]})
        items = result.get("list") or []
        if not items:
            raise ProviderNotFound()
        return self._account_from_object(items[0])

    def find_account(self, *, local_part: str, domain_id: str) -> ProviderAccount | None:
        if self.dry_run:
            return None
        query = self._call("x:Account/query", {"filter": {"name": local_part, "domainId": domain_id}, "limit": 2})
        ids = query.get("ids") or []
        if not ids:
            return None
        return self.get_account(str(ids[0]))

    def update_account(self, account_id: str, changes: dict[str, Any]) -> ProviderAccount:
        if self.dry_run:
            return ProviderAccount(id=account_id, email=changes.get("name", "dry-run"), raw={"dry_run": True, **changes})
        result = self._call("x:Account/set", {"update": {account_id: changes}})
        self._mutation_error(result, "notUpdated")
        if account_id not in (result.get("updated") or {}):
            raise ProviderError("Stalwart did not confirm the account update.", code="provider_invalid_response")
        return self.get_account(account_id)

    def set_password(self, account_id: str, password: str) -> None:
        self.update_account(account_id, {"credentials": {"0": {"@type": "Password", "secret": password}}})

    def suspend_account(self, account_id: str) -> None:
        self.update_account(account_id, {
            "permissions": {
                "@type": "Merge",
                "enabledPermissions": {},
                "disabledPermissions": {"authenticate": True},
            }
        })

    def resume_account(self, account_id: str) -> None:
        self.update_account(account_id, {"permissions": {"@type": "Inherit"}})

    def delete_account(self, account_id: str) -> None:
        if self.dry_run:
            return
        result = self._call("x:Account/set", {"destroy": [account_id]})
        self._mutation_error(result, "notDestroyed")
        if account_id not in (result.get("destroyed") or []):
            raise ProviderError("Stalwart did not confirm account deletion.", code="provider_invalid_response")
