# Testing

Run the safe test suite:

```bash
cd ~/Code/deltachat/rise/signup-relay
python backend/manage.py test registration -v 2
```

The suite forces `STALWART_DRY_RUN=true`; it never contacts a production mail server. It covers product registration, token issuance, mailbox creation and internal-user/Stalwart-ID mapping, idempotent retries, password change, suspend/resume/delete lifecycle, cross-user isolation, provider failure state, legacy signup, duplicate usernames and invalid passwords.

## Staging integration test

1. Use a disposable Stalwart instance and domain. Set `STALWART_DRY_RUN=false`, a TLS JMAP URL and a narrowly scoped API key in `backend/.env`.
2. Run `python backend/manage.py migrate`.
3. Create a Relay in Django Admin with the real Stalwart Domain ID and set `registration_open=true`.
4. Register a product user: `POST /api/auth/register/`.
5. Use the returned token to call `POST /api/mailboxes/` with a fresh UUID `Idempotency-Key`.
6. Verify the `stalwart_id` stored in Django Admin matches the Stalwart Account object.
7. Configure Thunderbird or Delta Chat with the returned email/password and the published TLS IMAP/SMTP settings; send and receive a message.
8. Exercise password change, suspend, resume and delete using the mailbox lifecycle endpoints.
9. Inspect Django and proxy logs: no password, API key or raw Authorization header should appear.

For distributed rate limiting, set `REDIS_URL`; DRF’s in-process cache is not sufficient across several Gunicorn workers. Apply WAF/reverse-proxy limits before Django for volumetric DDoS protection.
