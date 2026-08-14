#!/usr/bin/env bash
set -euo pipefail

# Render a rendiv composition to MP4.
# Uses a Docker container because Chromium (Playwright) only works
# inside the node:20-bookworm container on this machine.
#
# Usage:
#   ./render.sh COMPOSITION_ID [OUTPUT]
# Example:
#   ./render.sh AuctionExplainer out/auction-explainer.mp4

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_NAME="rendiv"
IMAGE="node:20-bookworm"
VOLUME_SRC="$(dirname "$PROJECT_DIR")"

COMPOSITION="${1:-AuctionExplainer}"
OUTPUT="${2:-out/auction-explainer.mp4}"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker start "${CONTAINER_NAME}" >/dev/null
else
  docker run -d --name "${CONTAINER_NAME}" -v "${PROJECT_DIR}:/workspace" \
    "${IMAGE}" sh -c "tail -f /dev/null" >/dev/null
fi

# Work in the project dir and stdout/stderr wired through for live progress.
# Uses the npm-published CLI (Playwright 1.62 / Chromium 1234). The browser
# binaries and system deps are provisioned inside the container under
# /root/.cache/ms-playwright — see the container bootstrap note.
docker exec -w /workspace "${CONTAINER_NAME}" sh -c \
  "node /workspace/node_modules/@rendiv/cli/dist/cli.js render src/index.tsx ${COMPOSITION} ${OUTPUT}" 2>&1 || true

echo "Output written to: ${PROJECT_DIR}/${OUTPUT}"