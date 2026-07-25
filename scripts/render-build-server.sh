#!/usr/bin/env bash
# Render build entrypoint — always uses the workspace TypeScript, never a global tsc.
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm install --frozen-lockfile
pnpm --filter bakugan-arena-server build
