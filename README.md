# R.I.S.E Relay Registration

Secure, multi-relay Delta Chat account registration with a Django API and React UI. The central service provisions accounts in Stalwart; relay VPS instances proxy traffic through an encrypted tunnel.

## Quick start
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
python backend/manage.py migrate && python backend/manage.py runserver
```
In another terminal: `cd frontend && npm install && npm run dev`.

See `docs/` for the PRD, threat model, API contract, and deployment guide.
