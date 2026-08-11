#!/usr/bin/env bash
set -euo pipefail

# Render a rendiv composition to MP4.
# Uses a Docker container because Chromium (Playwright) only works
# inside the node:20-bookworm container on this machine.
#
# Usage:
#   ./render.sh COMPOSITION_ID [OUTPUT]
# Example:
#   ./render.sh MyVideo out/my-video.mp4

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_NAME="rendiv"
IMAGE="node:20-bookworm"
VOLUME_SRC="$(dirname "$PROJECT_DIR")"

COMPOSITION="${1:-MyVideo}"
OUTPUT="${2:-out/my-video.mp4}"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker start "${CONTAINER_NAME}" >/dev/null
else
  docker run -d --name "${CONTAINER_NAME}" -v "${VOLUME_SRC}:/workspace" \
    "${IMAGE}" sh -c "tail -f /dev/null" >/dev/null
fi

# Work in the project dir and stdout/stderr wired through for live progress.
# Uses the monorepo CLI (Playwright 1.49 / Chromium 1208) which is already
# installed in the container — the npm-published renderer needs a newer
# Chromium that fails to download on this network.
docker exec -w /workspace "${CONTAINER_NAME}" sh -c \
  "node /workspace/rendiv/packages/cli/dist/cli.js render src/index.tsx ${COMPOSITION} ${OUTPUT}" 2>&1 || true

echo "Output written to: ${PROJECT_DIR}/${OUTPUT}"