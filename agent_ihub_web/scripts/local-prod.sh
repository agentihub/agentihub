#!/usr/bin/env bash
set -euo pipefail

# Determine repository root relative to this script.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-5173}"
HOST="${HOST:-0.0.0.0}"

cd "${ROOT_DIR}"

echo "delete dist"
rm -rf dist

echo "[local-prod] Building production bundle..."
npm run build

echo "[local-prod] Starting preview server on http://${HOST}:${PORT}"
npm run preview -- --host "${HOST}" --port "${PORT}"
