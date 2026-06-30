#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

echo "Starting AURA Studio for hardware testing..."
npm install
npm run dev --workspace @aura-dcos/studio
