# Business Mail architecture

## Responsibility boundary

```text
Browser / React
        │  HTTPS + product token
        ▼
Django product API
  ├─ Django User: product identity and login
  ├─ Relay: an allowed product domain and connection metadata
  ├─ RelayAccount: product ↔ provider mapping and audit state
  └─ EmailProvider interface
        │  private HTTPS, Bearer API key
        ▼
Stalwart management JMAP API (/api)
  └─ Domain, Account, credential, mailbox and mail protocols
```

The browser never talks to Stalwart management APIs and never receives the Stalwart API key. Stalwart remains authoritative for mail storage, SMTP/IMAP/JMAP authentication, mailbox contents and mail permissions. Django owns only product identity, entitlement, relay selection, lifecycle state and the mapping record.

## Current data model

`django.contrib.auth.User` is the product user. It is deliberately independent of the mailbox credential.

`Relay` is an allowed business-email domain. It stores `domain`, `provider`, `provider_domain_id`, registration status and IMAP/SMTP hostnames. Add these in Django Admin before exposing them to users.

`RelayAccount` maps one product mailbox to its owner and provider:

| Field | Meaning |
| --- | --- |
| `owner` | Internal Django user, nullable only for the old public relay-signup compatibility route |
| `relay` / `domain` | Selected product domain |
| `email` | Canonical product email address |
| `provider` | `stalwart` today; provider seam for a future Madmail implementation |
| `stalwart_id` | Server-assigned Stalwart Account ID |
| `provisioning_status` | `pending`, `active`, `failed`, `suspended`, `deleting`, or `deleted` |
| `request_id` | Idempotency UUID supplied by the client |
| `failure_code` / `failure_message` | Safe upstream diagnostic; never a password or API key |

## Provider abstraction

`registration.providers.base.EmailProvider` defines create/get/find/update/delete/suspend/resume account methods and create/get/find domain methods. `StalwartProvider` is the sole current implementation. Product views only call `MailboxProvisioningService`, so a future `MadmailProvider` can be selected through `EMAIL_PROVIDER` without duplicating product lifecycle code.

## Provisioning lifecycle

1. Authenticated product user selects a `Relay` and a local part.
2. Django validates the selected domain, local part, password and uniqueness.
3. Django creates a local `RelayAccount` in `pending` state, bound to the supplied `Idempotency-Key`.
4. `MailboxProvisioningService` calls the provider; Stalwart receives `x:Account/set` over its management JMAP endpoint.
5. On success, Django stores Stalwart’s returned Account ID and marks the mapping `active`.
6. On upstream failure, Django retains a `failed` record for audit/reconciliation and returns a safe `502`; it never marks the mailbox successful.

External side effects cannot be made fully transactional with a remote mail server. The idempotency key prevents normal client retries from creating another local mailbox. Operators should use the provider ID and failure status in Admin to reconcile a network failure that occurred after Stalwart accepted a request but before Django received its response.

## Stalwart API usage

The provider uses `POST <STALWART_JMAP_URL>/api`, `Authorization: Bearer <STALWART_API_KEY>`, capabilities `urn:ietf:params:jmap:core` and `urn:stalwart:jmap`.

- `x:Account/set`: create, update, delete and credential updates.
- `x:Account/get` and `x:Account/query`: read and reconciliation.
- `x:Domain/get`, `x:Domain/query`, `x:Domain/set`: domain management.

Account suspension disables Stalwart’s `authenticate` permission while retaining the mailbox. It does not stop inbound delivery; deletion is the operation that removes the mailbox.
