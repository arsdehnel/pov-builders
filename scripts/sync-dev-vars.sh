#!/bin/sh
# Reads ATP_SERVICE_DID and ATP_SERVICE_APP_PASSWORD from data/accounts.env
# (written by the dc-init container on first docker:up) and upserts them into
# .dev.vars so the worker can use them in local development.
#
# Run after first docker:up: pnpm docker:sync-vars

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ACCOUNTS_ENV="${SCRIPT_DIR}/../data/accounts.env"
DEV_VARS="${SCRIPT_DIR}/../.dev.vars"

if [ ! -f "$ACCOUNTS_ENV" ]; then
  echo "Error: data/accounts.env not found. Run 'pnpm docker:up' first and wait for init to complete." >&2
  exit 1
fi

SERVICE_DID=$(grep '^SERVICE_DID=' "$ACCOUNTS_ENV" | cut -d= -f2)
SERVICE_APP_PASSWORD=$(grep '^SERVICE_APP_PASSWORD=' "$ACCOUNTS_ENV" | cut -d= -f2)

if [ -z "$SERVICE_DID" ]; then
  echo "Error: SERVICE_DID missing from data/accounts.env — did the init container finish successfully?" >&2
  exit 1
fi

if [ -z "$SERVICE_APP_PASSWORD" ]; then
  echo "Error: SERVICE_APP_PASSWORD missing from data/accounts.env — did create_service_account succeed?" >&2
  exit 1
fi

# Upsert: remove any existing lines for these keys, then append the new values.
tmpfile=$(mktemp)
grep -v '^ATP_SERVICE_DID=' "$DEV_VARS" | grep -v '^ATP_SERVICE_APP_PASSWORD=' > "$tmpfile" || true
printf 'ATP_SERVICE_DID=%s\nATP_SERVICE_APP_PASSWORD=%s\n' "$SERVICE_DID" "$SERVICE_APP_PASSWORD" >> "$tmpfile"
mv "$tmpfile" "$DEV_VARS"

echo "Updated .dev.vars:"
echo "  ATP_SERVICE_DID=${SERVICE_DID}"
echo "  ATP_SERVICE_APP_PASSWORD=<set>"
