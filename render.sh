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

# --- dependency self-healing ------------------------------------------------
# The container's writable layer loses downloaded browsers/fonts whenever the
# container is recreated, and node_modules can carry MULTIPLE playwright
# versions (pnpm nests one under @rendiv/renderer while a stray hoisted copy
# shadows top-level resolution). Guessing which one the render uses fails, so
# instead: scan EVERY playwright-core copy, read the browser revision each one
# pins from its own browsers.json, and download only the pinned executables
# that are missing — using that exact copy's own CLI. Whichever version the
# renderer resolves at runtime, its browsers are already in the container.

PW_CACHE="/root/.cache/ms-playwright"

browser_present() { # dir exe-path-inside-dir
  docker exec "${CONTAINER_NAME}" test -f "${PW_CACHE}/${1}/${2}" 2>/dev/null
}

ensure_browsers() {
  local MISSING_COPIES="" REL REV REV_C REV_S HAS_SHELL CLI_IN NEED INSTALL_ARGS SPEC
  while IFS= read -r REL; do
    REV="$(node -e '
const b = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).browsers;
const r = Object.fromEntries(b.map((x) => [x.name, x.revision]));
const shell = b.find((x) => x.name === "chromium-headless-shell");
console.log(r.chromium || "-", shell ? shell.revision : "-", shell ? "Y" : "N");
' "${REL}/browsers.json" 2>/dev/null || echo "- - N")"
    read -r REV_C REV_S HAS_SHELL <<<"${REV}"
    [[ "${REV_C}" != "-" ]] || continue
    CLI_IN="/workspace/${REL}/cli.js"
    NEED=0
    INSTALL_ARGS="chromium"
    if ! browser_present "chromium-${REV_C}" "chrome-linux/chrome"; then NEED=1; fi
    if [[ "${HAS_SHELL}" == "Y" ]]; then
      INSTALL_ARGS+=" chromium-headless-shell"
      if ! browser_present "chromium_headless_shell-${REV_S}" \
        "chrome-headless-shell-linux64/chrome-headless-shell"; then NEED=1; fi
    fi
    if [[ "${NEED}" == "1" ]]; then
      echo "render.sh: ${REL} pins chromium rev ${REV_C} — browsers missing."
      MISSING_COPIES+="${CLI_IN} ${INSTALL_ARGS}"$'\n'
    fi
  done < <(
    {
      ls -d node_modules/playwright-core 2>/dev/null
      ls -d node_modules/.pnpm/playwright-core@*/node_modules/playwright-core 2>/dev/null
      ls -d node_modules/.pnpm/playwright@*/node_modules/playwright-core 2>/dev/null
    } | sort -u
  )

  if [[ -n "${MISSING_COPIES}" ]]; then
    while IFS= read -r SPEC; do
      [[ -n "${SPEC}" ]] || continue
      echo "render.sh: downloading missing Playwright browsers via ${SPEC%% *}..."
      docker exec -w /workspace -e PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 \
        "${CONTAINER_NAME}" node ${SPEC}
    done <<<"${MISSING_COPIES}"
  fi
}

# --- container bootstrap -----------------------------------------------------
if ! docker inspect "${CONTAINER_NAME}" >/dev/null 2>&1; then
  docker run -d --name "${CONTAINER_NAME}" -v "${PROJECT_DIR}:/workspace" \
    "${IMAGE}" sh -c "tail -f /dev/null" >/dev/null
elif [[ "$(docker inspect -f '{{.State.Running}}' "${CONTAINER_NAME}")" != "true" ]]; then
  docker start "${CONTAINER_NAME}" >/dev/null
fi

if [[ "${CLEANUP_EPHEMERAL:-0}" == "1" ]]; then
  trap 'rm -f "${PROJECT_DIR}/${ENTRY_FILE}"' EXIT
fi

# ffmpeg-static: resolve version dynamically instead of hardcoding it.
FFMPEG_REL="$(node -e '
try {
  const path = require("path");
  console.log(path.relative(process.cwd(), path.dirname(require.resolve("ffmpeg-static/package.json"))));
} catch (e) { process.exit(1); }
' 2>/dev/null || true)"
if [[ -n "${FFMPEG_REL}" ]]; then
  if ! docker exec "${CONTAINER_NAME}" test -f "/workspace/${FFMPEG_REL}/ffmpeg" 2>/dev/null; then
    echo "render.sh: installing ffmpeg-static binary..."
    docker exec -w /workspace "${CONTAINER_NAME}" \
      node "/workspace/${FFMPEG_REL}/install.js"
  fi
fi

# Fonts: one-time apt install, stamped in the container.
if ! docker exec "${CONTAINER_NAME}" test -f /root/.rendiv-fonts-done 2>/dev/null; then
  docker exec "${CONTAINER_NAME}" sh -c \
    "apt-get update -qq && apt-get install -y -qq fonts-inter fonts-liberation fontconfig" 2>&1 | tail -n 2 || true
  docker exec "${CONTAINER_NAME}" touch /root/.rendiv-fonts-done 2>/dev/null || true
fi

# Chromium system libraries: only if genuinely missing (e.g. freshly created
# container). playwright's own install-deps knows the exact package list.
if ! docker exec "${CONTAINER_NAME}" test -f /root/.rendiv-playwright-deps-done 2>/dev/null; then
  if ! docker exec "${CONTAINER_NAME}" sh -c 'ldconfig -p 2>/dev/null | grep -q "libgtk-3.so.0"'; then
    echo "render.sh: installing Chromium system libraries (one-time)..."
    docker exec "${CONTAINER_NAME}" node /workspace/node_modules/playwright/cli.js install-deps chromium || true
    docker exec "${CONTAINER_NAME}" touch /root/.rendiv-playwright-deps-done 2>/dev/null || true
  else
    docker exec "${CONTAINER_NAME}" touch /root/.rendiv-playwright-deps-done 2>/dev/null || true
  fi
fi

# Browsers: for every playwright-core copy in node_modules, check the exact
# executable its browsers.json pins and download it if missing.
ensure_browsers

# --- render (with one self-healing retry) -------------------------------------
CMD="node /workspace/node_modules/@rendiv/cli/dist/cli.js ${MODE} ${ENTRY} ${COMPOSITION} ${OUTPUT}${EXTRA_ARGS}"
LOG="$(mktemp)"
RENDER_OK=0
for _attempt in 1 2 3; do
  if docker exec -w /workspace "${CONTAINER_NAME}" sh -c "${CMD}" 2>&1 | tee "${LOG}"; then
    RENDER_OK=1
    break
  fi
  if grep -q "Executable doesn't exist" "${LOG}"; then
    echo "render.sh: stale Playwright browser cache — reinstalling pinned browsers..."
    if ! docker exec "${CONTAINER_NAME}" test -f /root/.rendiv-playwright-deps-done 2>/dev/null; then
      docker exec "${CONTAINER_NAME}" node /workspace/node_modules/playwright/cli.js install-deps chromium || true
      docker exec "${CONTAINER_NAME}" touch /root/.rendiv-playwright-deps-done 2>/dev/null || true
    fi
    ensure_browsers
  elif grep -q "Host system is missing dependencies" "${LOG}"; then
    echo "render.sh: missing system libraries — installing Chromium deps..."
    docker exec "${CONTAINER_NAME}" node /workspace/node_modules/playwright/cli.js install-deps chromium || true
    docker exec "${CONTAINER_NAME}" touch /root/.rendiv-playwright-deps-done 2>/dev/null || true
  else
    break  # unrelated failure — don't mask it with retries
  fi
done
rm -f "${LOG}"
if [[ "${RENDER_OK}" != "1" ]]; then
  echo "Render failed after ${_attempt} attempt(s)."
  exit 1
fi

echo "Output written to: ${PROJECT_DIR}/${OUTPUT}"

if [[ "${STOP}" == "1" || "${STOP_CONTAINER:-0}" == "1" ]]; then
  echo "Stopping ${CONTAINER_NAME} container..."
  docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
fi
