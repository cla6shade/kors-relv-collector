#!/usr/bin/env bash
# Register (or remove) a Linux crontab entry that runs `pnpm collect` at HH:10
# on every Nth hour. Idempotent — re-running replaces the existing entry.
#
#   ./scripts/register_cron.sh           # every hour at :10
#   ./scripts/register_cron.sh 3         # every 3 hours at :10  (00:10, 03:10, ...)
#   ./scripts/register_cron.sh --remove  # delete the entry
#   ./scripts/register_cron.sh --show    # print current entry
#
# pnpm is resolved via the nvm-managed Node bin directory; override with
# NODE_BIN_DIR=/path/to/bin if your nvm version differs.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$REPO_DIR/.collect-cron.log"
MARKER="# kors-relv-collect"
NODE_BIN_DIR="${NODE_BIN_DIR:-$HOME/.nvm/versions/node/v24.13.0/bin}"

current_crontab() { crontab -l 2>/dev/null || true; }
without_marker()  { current_crontab | grep -v -F "$MARKER" || true; }

case "${1:-}" in
  --remove)
    without_marker | crontab -
    echo "removed: $MARKER entries"
    exit 0
    ;;
  --show)
    current_crontab | grep -F "$MARKER" || echo "(none)"
    exit 0
    ;;
esac

INTERVAL="${1:-1}"
if ! [[ "$INTERVAL" =~ ^[0-9]+$ ]] || (( INTERVAL < 1 || INTERVAL > 23 )); then
  echo "usage: $0 [N=1..23 | --remove | --show]" >&2
  exit 1
fi

if [[ ! -x "$NODE_BIN_DIR/pnpm" ]]; then
  echo "warning: $NODE_BIN_DIR/pnpm not executable; cron job will fail" >&2
  echo "         override with NODE_BIN_DIR=/path/to/bin $0 ..." >&2
fi

if (( INTERVAL == 1 )); then
  HOUR_FIELD="*"
else
  HOUR_FIELD="*/$INTERVAL"
fi

# Linux cron uses /bin/sh and a near-empty PATH; prepend the nvm bin dir
# explicitly so pnpm/node resolve.
CMD="cd '$REPO_DIR' && PATH='$NODE_BIN_DIR':\$PATH pnpm collect >> '$LOG_FILE' 2>&1"
LINE="10 $HOUR_FIELD * * * $CMD $MARKER"

{ without_marker; printf '%s\n' "$LINE"; } | sed '/^[[:space:]]*$/d' | crontab -

echo "registered:"
echo "  $LINE"
echo "log: $LOG_FILE"
echo
echo "verify with: crontab -l | grep -F '$MARKER'"
