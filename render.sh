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
# below — no tuning flags. Dynamic draft mode scales any composition to 960x540.

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_NAME="rendiv"
IMAGE="node:20-bookworm"
CONCURRENCY="$(nproc)"

COMPOSITION="${1:?usage: render.sh ProjectName [output.mp4] [--draft] [--still [--frame N]]}"
shift
MODE="render"
ENTRY="src/index.tsx"
OUTPUT="out/${COMPOSITION,,}.mp4"
EXTRA_ARGS=""

DRAFT=0
CUSTOM_OUTPUT=0
STOP=0
while [ $# -gt 0 ]; do
  case "$1" in
    --draft) DRAFT=1 ;;
    --still) MODE="still" ;;
    --frame) EXTRA_ARGS="$EXTRA_ARGS --frame $2"; shift ;;
    --stop) STOP=1 ;;
    -o|--output) OUTPUT="$2"; CUSTOM_OUTPUT=1; shift ;;
    -*) echo "Unknown option: $1"; exit 1 ;;
    *) OUTPUT="$1"; CUSTOM_OUTPUT=1 ;;
  esac
  shift
done

if [[ "${MODE}" == "still" ]]; then
  OUTPUT="${OUTPUT%.mp4}"
  [[ "${OUTPUT}" != *.png ]] && OUTPUT="${OUTPUT}.png"
elif [[ "${DRAFT}" == "1" ]]; then
  if [[ "${CUSTOM_OUTPUT}" == "0" ]]; then
    OUTPUT="out/${COMPOSITION,,}-draft.mp4"
  fi
  ENTRY_FILE="src/__ephemeral__.tsx"
  CLEANUP_EPHEMERAL=1
  TARGET_COMP="${COMPOSITION}"
  DRAFT_COMP="${COMPOSITION}Draft"
  node -e "
const fs = require('fs');
const src = fs.readFileSync('src/index.tsx', 'utf8');
const comp = '${TARGET_COMP}';
const regex = new RegExp('<Composition\\\\b(?=[^>]*?\\\\bid=[\"\'\`]' + comp + '[\"\'\`])[^>]*?\\\\/>', 's');
const match = src.match(regex);
if (!match) {
  console.error('ERROR: Composition \"' + comp + '\" not found in src/index.tsx');
  process.exit(1);
}
const compName = match[0].match(/component=\\{([^}]+)\\}/)[1];
const duration = match[0].match(/durationInFrames=\\{([^}]+)\\}/)[1];
const fps = match[0].match(/fps=\\{([^}]+)\\}/)[1];
const header = src.split('const Root: React.FC')[0];
const lines = [
  header,
  'const Draft: React.FC = () => (',
  '  <div style={{ width: 1920, height: 1080, transform: \\'scale(0.5)\\', transformOrigin: \\'top left\\' }}>',
  '    <' + compName + ' />',
  '  </div>',
  ');',
  '',
  'const Root: React.FC = () => (',
  '  <Composition id=\"${DRAFT_COMP}\" component={Draft}',
  '    durationInFrames={' + duration + '} fps={' + fps + '} width={960} height={540} />',
  ');',
  '',
  'setRootComponent(Root);',
  '',
];
fs.writeFileSync('${ENTRY_FILE}', lines.join('\\n'));
console.log('draft entry: ${ENTRY_FILE} (960x540, removed on exit)');
"
  COMPOSITION="${DRAFT_COMP}"
  ENTRY="${ENTRY_FILE}"
  EXTRA_ARGS=" --concurrency ${CONCURRENCY} --image-format jpeg --jpeg-quality 60 --preset ultrafast --crf 30"
else
  EXTRA_ARGS=" --concurrency ${CONCURRENCY} --image-format jpeg --jpeg-quality 85 --preset faster --crf 20"
fi

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker start "${CONTAINER_NAME}" >/dev/null
else
  docker run -d --name "${CONTAINER_NAME}" -v "${PROJECT_DIR}:/workspace" \
    "${IMAGE}" sh -c "tail -f /dev/null" >/dev/null
fi

if [[ "${CLEANUP_EPHEMERAL:-0}" == "1" ]]; then
  trap 'rm -f "${PROJECT_DIR}/${ENTRY_FILE}"' EXIT
fi

if ! docker exec "${CONTAINER_NAME}" test -f /workspace/node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/ffmpeg; then
  docker exec "${CONTAINER_NAME}" sh -c \
    "node /workspace/node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/install.js"
fi

if ! docker exec "${CONTAINER_NAME}" test -f /root/.rendiv-fonts-done; then
  docker exec "${CONTAINER_NAME}" sh -c \
    "apt-get update -qq && apt-get install -y -qq fonts-inter fonts-liberation fontconfig" 2>&1 | tail -n 2 || true
  docker exec "${CONTAINER_NAME}" touch /root/.rendiv-fonts-done || true
fi

CMD="node /workspace/node_modules/@rendiv/cli/dist/cli.js ${MODE} ${ENTRY} ${COMPOSITION} ${OUTPUT}${EXTRA_ARGS}"
docker exec -w /workspace "${CONTAINER_NAME}" sh -c "${CMD}"

echo "Output written to: ${PROJECT_DIR}/${OUTPUT}"

if [[ "${STOP}" == "1" || "${STOP_CONTAINER:-0}" == "1" ]]; then
  echo "Stopping ${CONTAINER_NAME} container..."
  docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
fi
