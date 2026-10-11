#!/usr/bin/env bash
set -euo pipefail

# Assemble the publishable file: cut + edge-tts voiceover (same layout as
# generate-vo.sh: public/<video-id>/vo/NN.mp3) mixed with the cut audio
# ducked under the VO, final loudnorm, optional burned-in captions, thumbnail.
#
# Usage:
#   ./scripts/assemble.sh <video-id> [cut.mp4] [--burn] [--no-vo] [out.mp4]
# Example:
#   ./scripts/assemble.sh launch-day
#   ./scripts/assemble.sh launch-day videos/launch-day/edit/cut.mp4 --burn
#
# --burn renders edit/captions.srt into the picture (needs that file, e.g.
# from transcribe.sh; uses DejaVu Sans). Without it, video is stream-copied.
# Default out: videos/<video-id>/edit/final.mp4 (+ edit/thumb.png).

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: assemble.sh <video-id> [cut.mp4] [--burn] [--no-vo] [out.mp4]}"
shift
CUT="videos/${VIDEO_ID}/edit/cut.mp4"
BURN=0
VO=1
OUT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --burn) BURN=1; shift ;;
    --no-vo) VO=0; shift ;;
    *.mp4) if [[ -f "$1" ]]; then CUT="$1"; else OUT="$1"; fi; shift ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done
[[ "${CUT}" = /* ]] || CUT="${PROJECT_DIR}/${CUT}"
[[ -f "${CUT}" ]] || { echo "ERROR: cut not found: ${CUT} (run cut.sh first)" >&2; exit 1; }

EDIT_DIR="${PROJECT_DIR}/videos/${VIDEO_ID}/edit"
OUT="${OUT:-${EDIT_DIR}/final.mp4}"

if [[ "${VO}" == "1" ]]; then
  shopt -s nullglob
  vomp3s=("${PROJECT_DIR}"/public/"${VIDEO_ID}"/vo/[0-9]*.mp3)
  [[ ${#vomp3s[@]} -ge 1 ]] || { echo "ERROR: no VO mp3s in public/${VIDEO_ID}/vo/ (run generate-vo.sh) or pass --no-vo" >&2; exit 1; }
  : > "${EDIT_DIR}/vo-list.txt"
  for m in "${vomp3s[@]}"; do echo "file '${m}'" >> "${EDIT_DIR}/vo-list.txt"; done
  ffmpeg -y -v error -f concat -safe 0 -i "${EDIT_DIR}/vo-list.txt" -c:a aac \
    "${EDIT_DIR}/vo-full.m4a"
  # Duck the cut audio under the voiceover, then mix + master loudness.
  AFF="[sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[dk];[dk][vo]amix=inputs=2:normalize=0,alimiter=limit=0.95,loudnorm=I=-16:TP=-1.5:LRA=11[a]"
  AINPUTS=(-i "${EDIT_DIR}/vo-full.m4a")
  AMAP=(-map "[a]")
else
  AFF="alimiter=limit=0.95,loudnorm=I=-16:TP=-1.5:LRA=11[a]"
  AINPUTS=()
  AMAP=(-map "[a]")
fi

if [[ "${BURN}" == "1" ]]; then
  SRT="${EDIT_DIR}/captions.srt"
  [[ -f "${SRT}" ]] || { echo "ERROR: ${SRT} missing (run transcribe.sh)" >&2; exit 1; }
  ffmpeg -y -v error -i "${CUT}" "${AINPUTS[@]}" \
    -filter_complex "[0:v]subtitles='${SRT}':force_style='FontName=DejaVu Sans,FontSize=18,PrimaryColour=&HFFFFFF,OutlineColour=&H80000000,BorderStyle=1,Outline=1,Shadow=0,MarginV=45'[v];[0:a]${AFF}" \
    -map "[v]" "${AMAP[@]}" -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 160k \
    "${OUT}"
else
  ffmpeg -y -v error -i "${CUT}" "${AINPUTS[@]}" \
    -filter_complex "[0:a]${AFF}" \
    -map 0:v "${AMAP[@]}" -c:v copy -c:a aac -b:a 160k \
    "${OUT}"
fi

dur="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${OUT}")"
mid="$(python3 -c "print(float('${dur}') * 0.25)")"
ffmpeg -y -v error -ss "${mid}" -i "${OUT}" -frames:v 1 "${EDIT_DIR}/thumb.png"
echo "final: ${OUT} (${dur}s) + ${EDIT_DIR}/thumb.png"
