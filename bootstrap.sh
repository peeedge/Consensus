#!/usr/bin/env bash
# Consensus — quick start for macOS and Linux.
#
#   ./bootstrap.sh            install if needed, then start the dev server
#   ./bootstrap.sh --check    also typecheck and run the unit tests
#   ./bootstrap.sh --help     list every option

set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Node is not installed, or is not on your PATH." >&2
  echo "Install Node 22.12 or newer from https://nodejs.org and run this again." >&2
  exit 1
fi

cd "$(dirname "$0")"
exec node scripts/bootstrap.mjs "$@"
