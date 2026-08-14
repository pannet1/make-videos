#!/usr/bin/env bash
set -euo pipefail

# Compute VO_START / VO_LEN arrays for a video from its generated mp3s,
# at 30fps with an 8-frame pad per scene. Paste the printed arrays into
# the composition's constants.
#
# Usage:
#   ./scripts/timings.sh <video-id>
# Example:
#   ./scripts/timings.sh auction-explainer

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: timings.sh <video-id>}"
FPS="${2:-30}"
PAD="${3:-8}"

VO_DIR="${PROJECT_DIR}/public/${VIDEO_ID}/vo"
shopt -s nullglob
files=("${VO_DIR}"/*.mp3)
declare -A seen
scenes=()
for file in "${files[@]}"; do
  base="$(basename "${file}" .mp3)"
  [[ "${base}" == "pad" ]] && continue
  index="${base%%-*}"
  [[ -n "${seen[${index}]:-}" ]] && continue
  seen[${index}]=1
  scenes+=("${index}")
done
IFS=$'\n' scenes=($(printf "%s\n" "${scenes[@]}" | sort -n))
unset IFS

python3 - "${VIDEO_ID}" "${FPS}" "${PAD}" "${scenes[@]}" <<'PY'
import math, subprocess, sys

video_id, fps, pad = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
scenes = sys.argv[4:]
base = f"public/{video_id}/vo"
lens, starts, acc = [], [], 0
for i, idx in enumerate(scenes):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", f"{base}/{idx}.mp3"],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    dur = float(out)
    length = math.ceil(dur * fps) + pad
    lens.append(length)
    starts.append(acc)
    acc += length

lens_js = ", ".join(str(x) for x in lens)
starts_js = ", ".join(str(x) for x in starts)
print(f"VO_START = [{starts_js}];")
print(f"VO_LEN   = [{lens_js}];")
print(f"TOTAL    = {acc} frames = {acc / fps:.2f}s")
PY