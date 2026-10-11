#!/usr/bin/env bash
set -euo pipefail

# Render a rendiv composition to MP4 (or capture a still with --still).
# Uses a Docker container because Chromium (Playwright) only works
# inside the node:20-bookworm container on this machine.
#
# Usage:
#   ./render.sh COMPOSITION_ID [OUTPUT]           # Render video
#   ./render.sh COMPOSITION_ID [OUTPUT] --still   # Capture single frame (add --frame N)
#   ./render.sh --draft [OUTPUT]                  # Rough draft: full Navaratri timeline
#                                                 # at 960x540, cheapest encode — for
#                                                 # fast inconsistency checks
# Example:
#   ./render.sh MyVideo out/my-video.mp4
#   ./render.sh MyVideo out/frame.png --still --frame 90
#   ./render.sh --draft out/navaratri-draft.mp4

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_NAME="rendiv"
IMAGE="node:20-bookworm"

if [[ "${1:-}" == "--draft" ]]; then
  shift
  OUTPUT="${1:-out/navaratri-draft.mp4}"
  [[ -n "${1:-}" ]] && shift || true
  ENTRY_FILE="src/__ephemeral__.tsx"
  trap 'rm -f "${PROJECT_DIR}/${ENTRY_FILE}"' EXIT
  node -e "
const fs = require('fs');
const lines = [
  \"import React from 'react';\",
  \"import { setRootComponent, Composition } from '@rendiv/core';\",
  \"import { TOTAL_FRAMES } from './theme';\",
  \"import { NavaratriSadhana } from './NavaratriSadhana';\",
  '',
  'const Draft: React.FC = () => (',
  '  <div style={{ width: 1920, height: 1080, transform: \\'scale(0.5)\\', transformOrigin: \\'top left\\' }}>',
  '    <NavaratriSadhana />',
  '  </div>',
  ');',
  '',
  'const Root: React.FC = () => (',
  '  <Composition id=\"NavaratriDraft\" component={Draft}',
  '    durationInFrames={TOTAL_FRAMES} fps={30} width={960} height={540} />',
  ');',
  '',
  'setRootComponent(Root);',
  '',
];
fs.writeFileSync('$ENTRY_FILE', lines.join('\n'));
console.log('draft entry: $ENTRY_FILE (960x540, removed on exit)');
"
  COMPOSITION="NavaratriDraft"
  ENTRY="${ENTRY_FILE}"
  EXTRA_ARGS="--concurrency 10 --image-format jpeg --jpeg-quality 60 --preset ultrafast --crf 30"
else
  COMPOSITION="${1:?usage: render.sh COMPOSITION_ID [OUTPUT] [--still [--frame N]]}"
  shift
  OUTPUT="${1:-out/${COMPOSITION,,}.mp4}"
  shift || true
  ENTRY="${ENTRY:-src/index.tsx}"
  EXTRA_ARGS=""
fi
MODE="render"

while [ $# -gt 0 ]; do
  case "$1" in
    --still) MODE="still"; OUTPUT="${OUTPUT%.mp4}"; [[ "${OUTPUT}" != *.png ]] && OUTPUT="${OUTPUT}.png" ;;
    --frame) EXTRA_ARGS="$EXTRA_ARGS --frame $2"; shift ;;
    --frames) EXTRA_ARGS="$EXTRA_ARGS --frames $2"; shift ;;
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