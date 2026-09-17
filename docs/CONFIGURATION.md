# Multi-relay and Stalwart configuration

Copy `backend/.env.example` to `backend/.env`. Keep `STALWART_DRY_RUN=true` while developing locally. In that mode Django executes the complete state machine but makes no network request and creates no remote mailbox.

For an actual Stalwart environment set:

```env
EMAIL_PROVIDER=stalwart
STALWART_DRY_RUN=false
STALWART_JMAP_URL=https://mail-internal.example
STALWART_API_KEY=replace-with-a-server-side-api-key
STALWART_TIMEOUT_SECONDS=10
STALWART_VERIFY_TLS=true
```

`STALWART_API_KEY` belongs only in the backend environment or a secret manager; do not put it in Vite variables, React source, Docker image layers, Django Admin text fields or git.

Create a dedicated Stalwart service principal and key with `authenticate`, `sysAccountCreate`, `sysAccountGet` and `sysAccountUpdate`. Add `sysAccountDestroy` only if the product delete endpoint is intended to permanently remove mailboxes. Limit the key by source IP where the Stalwart deployment permits it.

## Adding a business domain / relay

1. Create and verify the domain in Stalwart (DNS, TLS, MX/SPF/DKIM/DMARC policy are operational responsibilities).
2. In Django Admin, create a **Relay** record.
3. Set its `domain`, `provider=stalwart`, and Stalwart `provider_domain_id`.
4. Set the externally reachable IMAP and SMTP names, for example `imap.example.com` and `smtp.example.com`.
5. Keep `registration_open` disabled until the domain and mail protocols have been tested; then enable it.

The database `Relay` table is the product domain allow-list. Users cannot supply an arbitrary Stalwart domain to `/api/mailboxes/`.

`RELAY_DOMAIN` and `STALWART_DOMAIN_ID` remain as a compatibility fallback for the existing public relay registration page. For business mail, prefer explicit Relay rows so several domains can coexist.
