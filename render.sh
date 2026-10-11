#!/usr/bin/env bash
set -euo pipefail

# Render a rendiv composition to MP4 (or capture a still).
# Uses a Docker container because Chromium (Playwright) only works
# inside the node:20-bookworm container on this machine.
#
# Usage:
#   ./render.sh ProjectName            # Production master: 1920x1080, best quality
#   ./render.sh ProjectName --draft    # Rough draft: same timeline at 960x540,
#                                      # cheapest encode — for fast checks
#   ./render.sh ProjectName --still [--frame N]  # Single-frame still (verify look)
#
# Examples:
#   ./render.sh NavaratriSadhana
#   ./render.sh NavaratriSadhana --draft
#   ./render.sh NavaratriThumbnail --still
#
# All performance settings (max concurrency, presets, quality) are baked in
# below — no tuning flags. Draft mode currently supports NavaratriSadhana only.

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_NAME="rendiv"
IMAGE="node:20-bookworm"
CONCURRENCY="$(nproc)"

COMPOSITION="${1:?usage: render.sh ProjectName [--draft] [--still [--frame N]]}"
shift
MODE="render"
ENTRY="src/index.tsx"
OUTPUT="out/${COMPOSITION,,}.mp4"
EXTRA_ARGS=""

DRAFT=0
while [ $# -gt 0 ]; do
  case "$1" in
    --draft) DRAFT=1 ;;
    --still) MODE="still" ;;
    --frame) EXTRA_ARGS="$EXTRA_ARGS --frame $2"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

if [[ "${MODE}" == "still" ]]; then
  OUTPUT="${OUTPUT%.mp4}"
  [[ "${OUTPUT}" != *.png ]] && OUTPUT="${OUTPUT}.png"
elif [[ "${DRAFT}" == "1" ]]; then
  if [[ "${COMPOSITION}" != "NavaratriSadhana" ]]; then
    echo "ERROR: --draft currently supports NavaratriSadhana only" >&2
    exit 1
  fi
  OUTPUT="out/${COMPOSITION,,}-draft.mp4"
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
  EXTRA_ARGS="--concurrency ${CONCURRENCY} --image-format jpeg --jpeg-quality 60 --preset ultrafast --crf 30"
else
  EXTRA_ARGS="--concurrency ${CONCURRENCY} --image-format png --preset medium --crf 16"
fi

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
