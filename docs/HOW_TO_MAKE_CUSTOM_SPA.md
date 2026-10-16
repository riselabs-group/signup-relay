# How to make a custom SPA

Fork this frontend or write your own against the same Stalwart DeltaChat module. The Django tree in this repo is unused. The API is Stalwart `GET|POST /api/v1/...`.

Do not hardcode mail hosts, ports, `ic`, or the hash algorithm. Read them from `GET /config`.

The browser may fetch only this origin (static files) and Stalwart `/api/v1`. No CDNs, no Google Fonts, no third-party QR/image hosts. Fonts are self-hosted woff2 under `frontend/public/fonts/` (Inter, Vazirmatn, JetBrains Mono). QR: in-memory SVG. `https://i.delta.chat/#invite?...` is a share URI, not a fetch.

## Base URL

- Browser calls are relative: `/api/v1`.
- Dev: Vite proxies `/api` → Stalwart (this repo: `http://localhost:8080`).
- Prod: set `VITE_API_BASE_URL` to the origin that serves `/api/v1`, or serve the SPA behind the same host.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/config` | Public. Cache in-flight; one fetch is enough. |
| GET | `/api/v1/altcha/challenge` | Only if `config.altcha.required`. |
| POST | `/api/v1/accounts/instant` | Header `Idempotency-Key`. Body hash only. |
| POST | `/api/v1/accounts/custom` | Same. |

Config shape (fields you must use):

```json
{
  "domain": "example.org",
  "registration_open": true,
  "instant_accounts_enabled": true,
  "password_hash_algorithm": "argon2id",
  "certificate_checks": "1",
  "endpoints": {
    "imap": { "host": "imap.example.org", "port": 993, "security": "ssl" },
    "smtp": { "host": "smtp.example.org", "port": 465, "security": "ssl" }
  },
  "altcha": { "required": false, "max_number": 10000 }
}
```

Empty `imap.host` / `smtp.host` is a valid 200. Do not build a QR. Show “mail endpoints are not configured” until an admin sets them.

## Signup body

```json
{ "username": "alice", "password_hash": "$argon2id$..." }
```

Add `altcha_payload` only when `altcha.required` is true.

Rules:

- Hash in the browser with `config.password_hash_algorithm` (`argon2id` \| `bcrypt` \| `scrypt` \| `pbkdf2`). No silent fallback.
- Never POST plaintext `password`.
- Never read `dclogin_link` from the server. It is not returned.
- Instant username: `dc_` + 12 hex.
- Custom username: 3–32 `[a-z0-9._-]`, no `dc_`, no reserved names (`admin`, `postmaster`, …), no leading/trailing/consecutive dots. Server re-checks.
- Custom password is optional. Empty → generate 24 random `[a-z0-9]` in RAM. If set: ≥12 chars, upper + lower + digit + one of `-_.`, only `[A-Za-z0-9._-]`, not equal to username. Client-only; server still only rejects plaintext and checks the hash prefix. Hash it; never POST `password`. Username+domain UI stays LTR (`dir="ltr"` on the join) in every locale.

2xx body you need: `{ "email": "alice@example.org", "account_type": "instant"|"custom" }`. Use `email` as the QR identity.

## DCLogin QR (client)

Build after 2xx, from RAM password + `data.email` + config:

Must-have query keys: `p` `v=1` `ih` `ip` `is` `sh` `sp` `ss` `ic`.

Skip: `iu` `ipw` `su` `spw` `sc`.

`p` is plaintext because Delta Chat logs in with it. Keep it in RAM / QR only.

```
dclogin:alice@example.org/?p=...&v=1&ih=...&ip=993&is=ssl&sh=...&sp=465&ss=ssl&ic=1
```

`is`/`ss`: `ssl|starttls|default|plain`. `ic`: `0` automatic, `1` strict, `3` accept-invalid.

## Errors

Wire body is always:

```json
{ "error": "<code>", "message": "<text>" }
```

Key off `error`. Do not show `message` in the UI (`message` is English). Several 400s share one status.

`message` is the Display of the variant. Codes with no extra text are fixed. Codes with `{msg}` append that string after the prefix (`Invalid username: `, `Invalid domain: `, `Bad request: `, `Internal server error: `, `Not found: `). Use the suffix only to pick among variants of the same `error`; still never render the English `message`.

| HTTP | `error` | `message` | This SPA i18n key |
| --- | --- | --- | --- |
| 404 | `deltachat_disabled` | DeltaChat module is disabled | `error_deltachat_disabled` |
| 404 | `not_found` | Not found: Endpoint not found | `error_not_found` |
| 405 | `method_not_allowed` | Method not allowed | `error_method_not_allowed` |
| 403 | `registration_closed` | Account registration is currently closed | `error_registration_closed` |
| 403 | `instant_accounts_disabled` | Instant account creation is disabled | `error_instant_accounts_disabled` |
| 403 | `custom_accounts_disabled` | Custom account creation is disabled | `error_custom_accounts_disabled` |
| 400 | `invalid_username` | Invalid username: Instant username must match dc_ + 12 hex chars | `validation_username_instant` |
| 400 | `invalid_username` | Invalid username: Username must be between 3 and 32 characters | `validation_username_length` |
| 400 | `invalid_username` | Invalid username: Username prefix 'dc_' is reserved for instant accounts | `validation_username_dc_prefix` |
| 400 | `invalid_username` | Invalid username: Username is reserved | `validation_username_reserved` |
| 400 | `invalid_username` | Invalid username: Username cannot start/end with dot or contain consecutive dots | `validation_username_dots` |
| 400 | `invalid_username` | Invalid username: Username contains invalid characters | `validation_username_chars` |
| 400 | `invalid_password` | Invalid password: Plaintext password is not accepted | `error_invalid_password` |
| 400 | `invalid_password_hash` | Password hash does not match the configured algorithm | `error_invalid_password_hash` |
| 400 | `endpoints_not_configured` | IMAP/SMTP endpoints are not configured | `error_endpoints_not_configured` |
| 400 | `invalid_domain` | Invalid domain: Primary domain is not configured | `error_invalid_domain_not_configured` |
| 400 | `invalid_domain` | Invalid domain: Primary domain not found | `error_invalid_domain_not_found` |
| 400 | `invalid_domain` | Invalid domain: Domain has no name | `error_invalid_domain_no_name` |
| 400 | `altcha_required` | Altcha proof-of-work solution is required | `error_altcha_required` |
| 400 | `altcha_invalid` | Invalid Altcha challenge solution | `error_altcha_invalid` |
| 400 | `altcha_replay` | Altcha challenge solution has already been used | `error_altcha_replay` |
| 400 | `bad_request` | Bad request: Missing request body | `error_bad_request_body` |
| 400 | `bad_request` | Bad request: &lt;serde error&gt; | `error_bad_request` |
| 409 | `account_already_exists` | An account with this email already exists | `error_account_exists` |
| 500 | `internal_error` | Internal server error: &lt;detail&gt; | `error_internal` |
| — | unknown | — | `error_create_account` |

Unknown `invalid_username` / `invalid_domain` suffixes fall back to `validation_username_format` / `error_invalid_domain`.

Mapper: `apiErrorKey()` in `frontend/src/utils/account.ts`. Pre-flight checks (open registration, hash algo, hosts, username) are UX only; the server still enforces them. Do not collapse `registration_closed`, `instant_accounts_disabled`, and `custom_accounts_disabled` into one string.

## Minimal flow

1. `GET /config`. If `registration_open` is false or hosts empty or hash unknown → block signup.
2. If `altcha.required` → `GET /altcha/challenge`, solve PoW, keep payload.
3. Generate password in RAM. Hash with advertised algo.
4. `POST` username + `password_hash` (+ altcha if required) with `Idempotency-Key`.
5. On 2xx, build `dclogin:` and show QR. Do not persist the password.
