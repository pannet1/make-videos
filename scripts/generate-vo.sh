#!/usr/bin/env bash
set -euo pipefail

# Generate AI voiceover mp3s for one video.
#   - source scripts:    videos/<video-id>/vo/NN-name.txt
#   - output mp3s:       public/<video-id>/vo/NN.mp3
#   - silence pad:       public/<video-id>/vo/pad.mp3  (covers whole video)
#   - assets synced:     videos/<video-id>/assets/ -> public/<video-id>/assets/
# Uses edge-tts (Microsoft neural voices, free, no API key).
#
# Usage:
#   ./scripts/generate-vo.sh <video-id> [VOICE]
# Example:
#   ./scripts/generate-vo.sh auction-explainer en-IN-PrabhatNeural
#
# Requires uv (recommended) or python3 + pip on PATH, plus ffprobe.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: generate-vo.sh <video-id> [VOICE]}"
VOICE="${2:-en-IN-PrabhatNeural}"

SRC_DIR="${PROJECT_DIR}/videos/${VIDEO_ID}/vo"
ASSET_SRC="${PROJECT_DIR}/videos/${VIDEO_ID}/assets"
OUT_DIR="${PROJECT_DIR}/public/${VIDEO_ID}/vo"
ASSET_DST="${PROJECT_DIR}/public/${VIDEO_ID}/assets"

if [[ ! -d "${SRC_DIR}" ]]; then
  echo "ERROR: no scripts at ${SRC_DIR}" >&2
  exit 1
fi
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
total_s=0
for file in "${files[@]}"; do
  base="$(basename "${file}" .txt)"
  index="${base%%-*}"
  out="${OUT_DIR}/${index}.mp3"
  echo "Generating ${out} (${base})..."
  run_edge_tts "$(cat "${file}")" "${out}"
  dur="$(ffprobe -v error -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "${out}")"
  total_s="$(python3 -c "print(${total_s} + ${dur})")"
done

if [[ -d "${ASSET_SRC}" ]]; then
  echo "Syncing assets ${ASSET_SRC} -> ${ASSET_DST}"
  mkdir -p "${ASSET_DST}"
  cp -r "${ASSET_SRC}/." "${ASSET_DST}/"
fi

pad_s="$(python3 -c "import math; print(math.ceil(float('${total_s}') + 5))")"
echo "Generating ${OUT_DIR}/pad.mp3 (${pad_s}s silence)..."
ffmpeg -y -f lavfi -i "anullsrc=r=24000:cl=mono" -t "${pad_s}" -q:a 9 \
  "${OUT_DIR}/pad.mp3" >/dev/null 2>&1

echo ""
echo "Voiceover generated into ${OUT_DIR}"
echo "Total narration: ${total_s}s"
echo "Run ./scripts/timings.sh ${VIDEO_ID} to get VO_START/VO_LEN."