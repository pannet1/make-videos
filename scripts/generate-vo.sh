#!/usr/bin/env bash
set -euo pipefail

# Generate AI voiceover mp3s from scripts/vo/*.txt into public/vo/NN.mp3.
# Uses edge-tts (Microsoft neural voices, free, no API key).
#
# Usage:
#   ./scripts/generate-vo.sh [VOICE]
# Default voice: en-IN-PrabhatNeural (friendly Indian English).
#
# Requires uv (recommended) or python3 + pip on PATH.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="${PROJECT_DIR}/scripts/vo"
OUT_DIR="${PROJECT_DIR}/public/vo"
VOICE="${1:-en-IN-PrabhatNeural}"

mkdir -p "${OUT_DIR}"

run_edge_tts() {
  local text="$1" out="$2"
  if command -v uv >/dev/null 2>&1; then
    uv tool run --from edge-tts edge-tts \
      --voice "${VOICE}" --text "${text}" --write-media "${out}" >/dev/null 2>&1
  elif command -v edge-tts >/dev/null 2>&1; then
    edge-tts --voice "${VOICE}" --text "${text}" --write-media "${out}"
  else
    echo "ERROR: no uv or edge-tts found on PATH." >&2
    exit 1
  fi
}

shopt -s nullglob
files=("${SRC_DIR}"/*.txt)
for file in "${files[@]}"; do
  base="$(basename "${file}" .txt)"
  index="${base%%-*}"
  out="${OUT_DIR}/${index}.mp3"
  echo "Generating ${out} (${base})..."
  run_edge_tts "$(cat "${file}")" "${out}"
done

echo "Voiceover generated into ${OUT_DIR}"