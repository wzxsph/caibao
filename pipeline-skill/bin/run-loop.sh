#!/usr/bin/env bash
# Convenience wrapper: run the loop entry point via the locally installed tsx.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
exec npx --prefix "$HERE" tsx "$HERE/src/agent/loop.ts" "$@"