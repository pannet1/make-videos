#!/usr/bin/env bash
set -euo pipefail

# QC a cut before publishing: duration vs EDL, loudness summary, visual
# jump inspection (stills around every cut boundary for the agent to view),
# dead-air scan. Warnings print; duration mismatch fails the build.
#
# Usage:
#   ./scripts/qc.sh <video-id> <cut.mp4> [edl.json]
# Example:
#   ./scripts/qc.sh launch-day videos/launch-day/edit/cut.mp4 videos/launch-day/edit/edl.json

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: qc.sh <video-id> <cut.mp4> [edl.json]}"
CUT="${2:?usage: qc.sh <video-id> <cut.mp4> [edl.json]}"
EDL="${3:-}"
[[ "${CUT}" = /* ]] || CUT="${PROJECT_DIR}/${CUT}"
[[ -f "${CUT}" ]] || { echo "ERROR: not found: ${CUT}" >&2; exit 1; }

QC_DIR="${PROJECT_DIR}/videos/${VIDEO_ID}/edit/qc"
mkdir -p "${QC_DIR}"

actual="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${CUT}")"
echo "duration: ${actual}s"
if [[ -n "${EDL}" ]]; then
  expected="$(python3 - "${EDL}" <<'PY'
import json, sys
cuts = json.load(open(sys.argv[1])).get("cuts", [])
print(f"{sum((float(c['to']) - float(c['ss'])) / float(c.get('speed', 1.0)) for c in cuts):.3f}")
PY
)"
  diff="$(python3 -c "print(f'{abs(float('${actual}') - float('${expected}')):.3f}')")"
  echo "expected: ${expected}s (diff ${diff}s)"
  python3 -c "import sys; sys.exit(0 if float('${diff}') <= 0.4 else 1)" \
    || { echo "ERROR: duration mismatch > 0.4s" >&2; exit 1; }
  # boundary stills: 0.1s before/after each joint (skip 0 and end)
  python3 - "${EDL}" "${CUT}" "${QC_DIR}" <<'PY'
import json, subprocess, sys
edl, cut, qc = sys.argv[1:4]
cuts = json.load(open(edl)).get("cuts", [])
t = 0.0
for i, c in enumerate(cuts[1:], 1):
    t += (float(cuts[i - 1]["to"]) - float(cuts[i - 1]["ss"])) / float(cuts[i - 1].get("speed", 1.0))
    for tag, tt in (("a", max(0.0, t - 0.1)), ("b", t + 0.1)):
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-ss", f"{tt:.3f}", "-i", cut,
             "-frames:v", "1", f"{qc}/b{i:02d}{tag}.png"], check=True)
    print(f"joint {i} @ {t:.2f}s -> {qc}/b{i:02d}a.png b{i:02d}b.png")
PY
else
  for frac in 25 50 75; do
    t="$(python3 -c "print(float('${actual}') * ${frac} / 100)")"
    ffmpeg -y -v error -ss "${t}" -i "${CUT}" -frames:v 1 "${QC_DIR}/spot-${frac}.png"
  done
  echo "spot stills (no EDL): ${QC_DIR}/spot-*.png"
fi

echo "--- loudness (speech usually sits near -26 LUFS mean; integrated -20..-12 ok) ---"
ffmpeg -i "${CUT}" -af "ebur128=peak=true" -f null - 2>&1 | grep -E "I:|LRA:|Peak:" | tail -n 4 || true

echo "--- dead-air scan (black > 0.2s) ---"
black="$(ffmpeg -i "${CUT}" -vf "blackdetect=d=0.2:pix_th=0.10" -an -f null - 2>&1 | grep black_start || true)"
[[ -z "${black}" ]] && echo "none" || echo "${black}"
echo "QC done: ${QC_DIR}/"
