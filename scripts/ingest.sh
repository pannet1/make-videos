#!/usr/bin/env bash
set -euo pipefail

# Ingest raw footage for edit-by-prompt: copy clips into the project,
# normalize to house format (1080p30, yuv420p, 48k stereo, speech-leveled),
# extract a 16k mono wav for transcription, and build contact sheets so an
# agent can review footage cheaply without watching it.
#
# Usage:
#   ./scripts/ingest.sh <video-id> <clip> [clip...]
# Example:
#   ./scripts/ingest.sh launch-day ~/Videos/take1.mp4 ~/Videos/take2.mp4
#
# Layout (all under videos/<video-id>/, gitignored except sources/ handling
# per repo .gitignore — footage itself stays local):
#   sources/            original copies
#   edit/norm-<base>.mp4   normalized clip (house format)
#   edit/audio-<base>.wav  16k mono transcription audio
#   edit/contact-<base>.jpg 12-frame contact sheet
#   edit/probe.tsv        duration/res/fps/audio table
#
# Requires: ffmpeg + ffprobe. Clips without an audio track get silence.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: ingest.sh <video-id> <clip> [clip...]}"
shift
[[ $# -ge 1 ]] || { echo "usage: ingest.sh <video-id> <clip> [clip...]" >&2; exit 1; }

SRC_DIR="${PROJECT_DIR}/videos/${VIDEO_ID}/sources"
EDIT_DIR="${PROJECT_DIR}/videos/${VIDEO_ID}/edit"
mkdir -p "${SRC_DIR}" "${EDIT_DIR}"
PROBE="${EDIT_DIR}/probe.tsv"
printf 'file\tduration_s\twidth\theight\tfps\taudio\tsize_mb\n' > "${PROBE}"

for clip in "$@"; do
  [[ -f "${clip}" ]] || { echo "ERROR: not found: ${clip}" >&2; exit 1; }
  base="$(basename "${clip}")"
  base="${base%.*}"
  cp -n "${clip}" "${SRC_DIR}/" 2>/dev/null || true
  src="${SRC_DIR}/$(basename "${clip}")"

  dur="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${src}")"
  width="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nw=1:nk=1 "${src}")"
  height="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "${src}")"
  fps="$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=nw=1:nk=1 "${src}")"
  has_audio="$(ffprobe -v error -select_streams a:0 -show_entries stream=index -of default=nw=1:nk=1 "${src}" || true)"
  size_mb="$(stat -c%s "${src}" | awk '{printf "%.1f", $1/1048576}')"

  norm="${EDIT_DIR}/norm-${base}.mp4"
  echo "Normalizing ${base} (${dur}s ${width}x${height} ${fps}fps)..."
  if [[ -n "${has_audio}" ]]; then
    ffmpeg -y -v error -i "${src}" \
      -map 0:v:0 -map 0:a:0 \
      -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p" \
      -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
      -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 128k -ar 48000 -ac 2 \
      "${norm}"
    audio_flag="yes"
  else
    ffmpeg -y -v error -i "${src}" -f lavfi -i "anullsrc=r=48000:cl=stereo" \
      -map 0:v:0 -map 1:a:0 -shortest \
      -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p" \
      -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 128k -ar 48000 -ac 2 \
      "${norm}"
    audio_flag="silent"
  fi

  ffmpeg -y -v error -i "${norm}" -vn -ar 16000 -ac 1 -c:a pcm_s16le \
    "${EDIT_DIR}/audio-${base}.wav"

  step="$(python3 -c "print(max(1, int(float('${dur}') * 30 / 12)))")"
  ffmpeg -y -v error -i "${norm}" \
    -vf "select='not(mod(n\,${step}))',scale=320:-1,tile=4x3" -frames:v 1 \
    "${EDIT_DIR}/contact-${base}.jpg"

  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "${base}" "${dur}" "${width}" "${height}" "${fps}" "${audio_flag}" "${size_mb}" >> "${PROBE}"
done

echo ""
echo "Ingested into videos/${VIDEO_ID}/ — probe table:"
cat "${PROBE}"
