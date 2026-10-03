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
# Set WRITE_SUBTITLES=1 to also emit word-timed <index>.srt files next to the
# mp3s (same synthesis call, so timings align exactly). Used for caption tracks.
WRITE_SUBTITLES="${WRITE_SUBTITLES:-0}"

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
  local text="$1" out="$2" sub="$3"
  local sub_args=()
  if [[ "${WRITE_SUBTITLES}" == "1" && -n "${sub:-}" ]]; then
    sub_args=(--write-subtitles "${sub}")
  fi
  if command -v uv >/dev/null 2>&1; then
    uv tool run --from edge-tts edge-tts \
      --voice "${VOICE}" --text "${text}" --write-media "${out}" \
      "${sub_args[@]}" >/dev/null 2>&1
  elif command -v edge-tts >/dev/null 2>&1; then
    edge-tts --voice "${VOICE}" --text "${text}" --write-media "${out}" \
      "${sub_args[@]}"
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
  sub="${OUT_DIR}/${index}.srt"
  echo "Generating ${out} (${base})..."
  attempt=1
  dur=""
  while true; do
    if run_edge_tts "$(cat "${file}")" "${out}" "${sub}" && [[ -s "${out}" ]] && \
       dur="$(ffprobe -v error -show_entries format=duration \
         -of default=noprint_wrappers=1:nokey=1 "${out}" 2>/dev/null)" && \
       [[ -n "${dur}" ]]; then
      break
    fi
    if [[ ${attempt} -ge 3 ]]; then
      echo "ERROR: failed to generate valid audio for ${file} after 3 attempts." >&2
      echo "Check network access to the edge-tts service, then rerun: $0 ${VIDEO_ID} ${VOICE}" >&2
      exit 1
    fi
    echo "Retrying ${base} (attempt $((attempt + 1)))..." >&2
    attempt=$((attempt + 1))
  done
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