#!/usr/bin/env bash
# ============================================================
# Pornește serverul PHP cu php.ini întărit:
#   ./server-php/bin/start.sh
#
# Trebuie rulat din rădăcina proiectului.
# Exportă PROJECT_DIR și DATA_DIR pentru interpolarea ${}
# din php.ini (open_basedir, error_log etc.).
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

export PROJECT_DIR="$ROOT"
export DATA_DIR="$ROOT/server-php/data"
export TRUST_PROXY="${TRUST_PROXY:-0}"   # pune TRUST_PROXY=1 doar în spatele unui reverse proxy
# 4 workeri: php -S e single-threaded altfel (cereri paralele așteaptă la coadă)
export PHP_CLI_SERVER_WORKERS="${PHP_CLI_SERVER_WORKERS:-4}"

# Bind pe localhost implicit — /admin pe 0.0.0.0 ar expune parola/cookie-ul
# de sesiune necriptat în rețea. Pe VPS, doar nginx (cu TLS) trebuie public.
BIND="${BIND:-127.0.0.1}"

exec php -c "$ROOT/server-php/php.ini" \
    -S "$BIND:8462" -t "$ROOT/la-macrea" \
    "$ROOT/server-php/router.php"
