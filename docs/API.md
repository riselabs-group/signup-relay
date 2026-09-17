# API contract

All JSON API paths are under `/api/`. Product endpoints use `Authorization: Token <token>` over HTTPS. The Stalwart API key is never an API response field.

## Public and compatibility endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/config/` | Current single-relay display configuration |
| `GET` | `/domains/` | Active business-mail domains available for selection |
| `GET` | `/blog/` | Published journal posts |
| `GET` | `/username/{value}/` | Legacy relay-form availability hint |
| `POST` | `/signup/` | Legacy public R.I.S.E mailbox registration; preserved for the existing React form |

## Product identity

`POST /auth/register/`

```json
{"username":"erfan","email":"erfan@example.com","password":"product-password","password_confirmation":"product-password"}
```

`POST /auth/login/` accepts `{ "username", "password" }`. Both successful endpoints return:

```json
{"token":"server-issued-token","user":{"id":1,"username":"erfan","email":"erfan@example.com"}}
```

`POST /auth/logout/` revokes the supplied token. `GET /me/` returns the authenticated product user.

## Mailbox lifecycle

`POST /mailboxes/` requires product authentication and an `Idempotency-Key` UUID header.

```json
{
  "username":"sales",
  "domain":"example.com",
  "password":"mailbox-password",
  "password_confirmation":"mailbox-password"
}
```

On success it returns `201` with the canonical address and IMAP/SMTP settings. Repeating the same idempotency key returns the original result with `200`, without issuing a second provider creation request.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/mailboxes/` | List mailboxes owned by the authenticated user |
| `GET` | `/mailboxes/{id}/` | Get an owned mailbox mapping/status |
| `POST` | `/mailboxes/{id}/password/` | Set a new Stalwart mailbox password |
| `POST` | `/mailboxes/{id}/suspend/` | Prevent authentication while preserving the mailbox |
| `POST` | `/mailboxes/{id}/resume/` | Restore authentication |
| `DELETE` | `/mailboxes/{id}/delete/` | Permanently delete the provider mailbox |

Password update requests use `{ "password", "password_confirmation" }`. Passwords are sent only to Django and Stalwart over TLS; they are not persisted in `RelayAccount`, admin views, audit fields, or application logs.

## Error responses

Validation errors return `400`; ownership hiding returns `404`; a duplicate mailbox or idempotency-key conflict returns `409`; closed registration returns `423`; and a Stalwart/network problem returns `502` with a stable safe `code`. Detailed JMAP response bodies are not exposed to the browser.
