#!/usr/bin/env bash
set -euo pipefail

# Start Rendiv Studio for live preview (hot reload).
# Open the printed URL in your browser to preview compositions interactively.

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_NAME="rendiv"
IMAGE="node:20-bookworm"
ENTRY="${ENTRY:-src/index.tsx}"
PORT="${PORT:-3000}"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker start "${CONTAINER_NAME}" >/dev/null
else
  docker run -d --name "${CONTAINER_NAME}" -v "${PROJECT_DIR}:/workspace" -p "${PORT}:${PORT}" \
    "${IMAGE}" sh -c "tail -f /dev/null" >/dev/null
fi

if ! docker exec "${CONTAINER_NAME}" test -f /root/.rendiv-fonts-done; then
  docker exec "${CONTAINER_NAME}" sh -c \
    "apt-get update -qq && apt-get install -y -qq fonts-inter fonts-liberation fontconfig" 2>&1 | tail -n 2 || true
  docker exec "${CONTAINER_NAME}" touch /root/.rendiv-fonts-done || true
fi

echo "Starting Rendiv Studio on http://localhost:${PORT}"
echo "Press Ctrl+C to stop"
# Use -i only if stdin is a TTY (interactive terminal)
if [ -t 0 ]; then
  DOCKER_TTY="-it"
else
  DOCKER_TTY="-i"
fi
docker exec -w /workspace ${DOCKER_TTY} "${CONTAINER_NAME}" sh -c \
  "node /workspace/node_modules/@rendiv/cli/dist/cli.js studio ${ENTRY} --port ${PORT} --host 0.0.0.0"