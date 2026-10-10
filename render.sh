#!/usr/bin/env bash
set -euo pipefail

# Render a rendiv composition to MP4 (or capture a still with --still).
# Uses a Docker container because Chromium (Playwright) only works
# inside the node:20-bookworm container on this machine.
#
# Usage:
#   ./render.sh COMPOSITION_ID [OUTPUT]           # Render video
#   ./render.sh COMPOSITION_ID [OUTPUT] --still   # Capture single frame (add --frame N)
# Example:
#   ./render.sh MyVideo out/my-video.mp4
#   ./render.sh MyVideo out/frame.png --still --frame 90

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_NAME="rendiv"
IMAGE="node:20-bookworm"

COMPOSITION="${1:?usage: render.sh COMPOSITION_ID [OUTPUT] [--still [--frame N]]}"
shift
OUTPUT="${1:-out/${COMPOSITION,,}.mp4}"
shift || true
ENTRY="${ENTRY:-src/index.tsx}"
MODE="render"
EXTRA_ARGS=""

while [ $# -gt 0 ]; do
  case "$1" in
    --still) MODE="still"; OUTPUT="${OUTPUT%.mp4}"; [[ "${OUTPUT}" != *.png ]] && OUTPUT="${OUTPUT}.png" ;;
    --frame) EXTRA_ARGS="$EXTRA_ARGS --frame $2"; shift ;;
    --crf) EXTRA_ARGS="$EXTRA_ARGS --crf $2"; shift ;;
    --preset) EXTRA_ARGS="$EXTRA_ARGS --preset $2"; shift ;;
    --concurrency) EXTRA_ARGS="$EXTRA_ARGS --concurrency $2"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker start "${CONTAINER_NAME}" >/dev/null
else
  docker run -d --name "${CONTAINER_NAME}" -v "${PROJECT_DIR}:/workspace" \
    "${IMAGE}" sh -c "tail -f /dev/null" >/dev/null
fi

if ! docker exec "${CONTAINER_NAME}" test -f /root/.rendiv-fonts-done; then
  docker exec "${CONTAINER_NAME}" sh -c \
    "apt-get update -qq && apt-get install -y -qq fonts-inter fonts-liberation fontconfig" 2>&1 | tail -n 2 || true
  docker exec "${CONTAINER_NAME}" touch /root/.rendiv-fonts-done || true
fi

CMD="node /workspace/node_modules/@rendiv/cli/dist/cli.js ${MODE} ${ENTRY} ${COMPOSITION} ${OUTPUT}${EXTRA_ARGS}"
docker exec -w /workspace "${CONTAINER_NAME}" sh -c "${CMD}" 2>&1 || true

echo "Output written to: ${PROJECT_DIR}/${OUTPUT}"