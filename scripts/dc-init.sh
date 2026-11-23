#!/bin/sh
set -eu

# atproto devnet init: create invite code and seed test accounts.
# Runs as a one-shot container after PDS and PLC are healthy.

PDS_URL="http://pds:3000"
DATA_DIR="/devnet-data"

log() { echo "[init] $*"; }

apk add --no-cache curl jq >/dev/null 2>&1

# ── Create invite code ────────────────────────────────────────────
log "Creating invite code..."
INVITE_RESPONSE=$(curl -s -X POST "${PDS_URL}/xrpc/com.atproto.server.createInviteCode" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(printf 'admin:%s' "${PDS_ADMIN_PASSWORD}" | base64)" \
  -d '{"useCount": 10}')

INVITE_CODE=$(echo "$INVITE_RESPONSE" | jq -r '.code')
log "Invite code: ${INVITE_CODE}"

# ── Create test accounts ──────────────────────────────────────────
create_account() {
  local handle="$1"
  local email="$2"
  local password="$3"
  local var_prefix="$4"

  log "Creating account: ${handle}"
  # Use -s (silent) not -sf: -f aborts on HTTP 4xx/5xx which combined with
  # set -eu would exit the whole script before we can log the error.
  RESULT=$(curl -s -X POST "${PDS_URL}/xrpc/com.atproto.server.createAccount" \
    -H "Content-Type: application/json" \
    -d "{
      \"handle\": \"${handle}\",
      \"email\": \"${email}\",
      \"password\": \"${password}\",
      \"inviteCode\": \"${INVITE_CODE}\"
    }")

  DID=$(echo "$RESULT" | jq -r '.did')

  if [ "$DID" = "null" ] || [ -z "$DID" ]; then
    log "WARNING: Failed to create ${handle}: $(echo "$RESULT" | jq -r '.message // "unknown error"')"
    return 0
  fi

  log "Created ${handle} → ${DID}"
  printf '%s_HANDLE=%s\n%s_DID=%s\n%s_PASSWORD=%s\n' \
    "$var_prefix" "$handle" \
    "$var_prefix" "$DID" \
    "$var_prefix" "$password" \
    >> "${DATA_DIR}/accounts.env"
}

# create_service_account creates a PDS account and then provisions an app
# password for it. App passwords are the credential used by PasswordSession
# (service-to-PDS auth) — the main account password is not stored.
create_service_account() {
  local handle="$1"
  local email="$2"
  local password="$3"
  local var_prefix="$4"
  local app_password_name="$5"

  create_account "$handle" "$email" "$password" "$var_prefix"

  local did
  did=$(grep "^${var_prefix}_DID=" "${DATA_DIR}/accounts.env" | cut -d= -f2)
  if [ -z "$did" ] || [ "$did" = "null" ]; then
    log "WARNING: Skipping app password for ${handle} — no DID found"
    return 0
  fi

  log "Authenticating ${handle} to provision app password..."
  AUTH_RESULT=$(curl -s -X POST "${PDS_URL}/xrpc/com.atproto.server.createSession" \
    -H "Content-Type: application/json" \
    -d "{\"identifier\": \"${did}\", \"password\": \"${password}\"}")

  ACCESS_JWT=$(echo "$AUTH_RESULT" | jq -r '.accessJwt')
  if [ "$ACCESS_JWT" = "null" ] || [ -z "$ACCESS_JWT" ]; then
    log "WARNING: Failed to authenticate ${handle}: $(echo "$AUTH_RESULT" | jq -r '.message // "unknown error"')"
    return 0
  fi

  APP_PASS_RESULT=$(curl -s -X POST "${PDS_URL}/xrpc/com.atproto.server.createAppPassword" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_JWT}" \
    -d "{\"name\": \"${app_password_name}\"}")

  APP_PASSWORD=$(echo "$APP_PASS_RESULT" | jq -r '.password')
  if [ "$APP_PASSWORD" = "null" ] || [ -z "$APP_PASSWORD" ]; then
    log "WARNING: Failed to create app password for ${handle}: $(echo "$APP_PASS_RESULT" | jq -r '.message // "unknown error"')"
    return 0
  fi

  log "Created app password for ${handle}"
  printf '%s_APP_PASSWORD=%s\n' "$var_prefix" "$APP_PASSWORD" >> "${DATA_DIR}/accounts.env"
}

: > "${DATA_DIR}/accounts.env"
printf 'DEVNET_INVITE_CODE=%s\n' "$INVITE_CODE" >> "${DATA_DIR}/accounts.env"

create_account "alice${HANDLE_DOMAIN}" "alice@devnet.test" "alice-devnet-pass" "ALICE"
create_account "bob${HANDLE_DOMAIN}" "bob@devnet.test" "bob-devnet-pass" "BOB"
create_account "carol${HANDLE_DOMAIN}" "carol@devnet.test" "carol-devnet-pass" "CAROL"
create_service_account "stance-build${HANDLE_DOMAIN}" "stance-build@devnet.test" "stance-build-devnet-pass" "SERVICE" "stance-build"

chmod 666 "${DATA_DIR}/accounts.env" 2>/dev/null || true

log "Done. Credentials written to data/accounts.env"