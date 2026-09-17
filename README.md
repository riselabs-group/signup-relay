# R.I.S.E Relay Registration

Secure, multi-relay Delta Chat and business-mail registration with a Django API and React UI. The central service provisions accounts through Stalwart's management JMAP API; relay VPS instances proxy traffic through an encrypted tunnel.

## Quick start
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
python backend/manage.py migrate && python backend/manage.py runserver
```
In another terminal: `cd frontend && npm install && npm run dev`.

See `docs/` for the PRD, threat model, API contract, and deployment guide.

## Run the frontend from the project root

```bash
npm run install:frontend
npm run dev
```

`npm run ve` is also supported as a short alias for the development server.

To run Django and React together with one command, use `./run-all.sh`.

## Business mail API

The product now separates a Django product user from a Stalwart mailbox. Register/login through `/api/auth/`, choose a managed domain from `/api/domains/`, then create and manage owned mailboxes at `/api/mailboxes/`. See [the API contract](docs/API.md) and [architecture](docs/ARCHITECTURE.md). Local development is intentionally safe: `STALWART_DRY_RUN=true` means no real Stalwart account is created.
