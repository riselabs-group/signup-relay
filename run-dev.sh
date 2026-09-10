#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Uses the repository virtualenv automatically; no manual activation required.
PYTHON="$(cd .. && pwd)/.venv/bin/python"
if [[ ! -x "$PYTHON" ]]; then
  echo "Virtualenv not found at $PYTHON. Create it with: python3 -m venv ../.venv" >&2
  exit 1
fi

PORT="${PORT:-8000}"
exec "$PYTHON" backend/manage.py runserver "127.0.0.1:${PORT}"
