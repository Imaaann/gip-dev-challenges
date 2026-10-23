#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST="$ROOT/backend/dist"

cd "$ROOT/backend"
rm -rf dist
pnpm build

mkdir -p dist/migrations
cp -r src/migrations/. dist/migrations/
cp openapi.yml dist/
cp .env dist/.env.production

mkdir -p dist/public/calculator dist/public/app

cd "$ROOT"
cp -r frontend-vanilla/. "$DIST/public/calculator/"

cd "$ROOT/frontend"
pnpm install
pnpm build
cp -r dist/. "$DIST/public/app/"

echo "Build complete: $DIST"
