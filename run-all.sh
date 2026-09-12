#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")"

ROOT="$(pwd)"
PYTHON="${ROOT}/../.venv/bin/python"
[[ -x "$PYTHON" ]] || PYTHON="${ROOT}/.venv/bin/python"
[[ -x "$PYTHON" ]] || { echo "Virtualenv not found. Run: python3 -m venv ../.venv" >&2; exit 1; }

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
export VITE_API_URL="${VITE_API_URL:-http://127.0.0.1:${BACKEND_PORT}/api}"

echo "Preparing database..."
"$PYTHON" backend/manage.py migrate --noinput

cleanup(){
  trap - TERM INT EXIT
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup TERM INT EXIT

echo "Starting Django API on http://127.0.0.1:${BACKEND_PORT}"
"$PYTHON" backend/manage.py runserver "127.0.0.1:${BACKEND_PORT}" & BACKEND_PID=$!
sleep 1
echo "Starting React site on http://127.0.0.1:${FRONTEND_PORT}"
npm --prefix frontend run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" & FRONTEND_PID=$!
echo
echo "R.I.S.E is running. Open http://127.0.0.1:${FRONTEND_PORT}"
echo "Press Ctrl+C to stop both services."
wait -n "$BACKEND_PID" "$FRONTEND_PID"
