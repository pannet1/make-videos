#!/usr/bin/env bash
set -euo pipefail

# Cut raw footage from an edit decision list: trims, speed ramps, pop-free
# joints (10ms fades), concat to one review cut. The agent proposes the EDL
# from words.json/transcript.txt; the human OKs it; this script executes it.
#
# Usage:
#   ./scripts/cut.sh <video-id> <edl.json> [out.mp4]
# Example:
#   ./scripts/cut.sh launch-day videos/launch-day/edit/edl.json
#
# EDL format (times in seconds, src relative to videos/<video-id>/):
#   {"cuts": [
#     {"src": "edit/norm-take1.mp4", "ss": 1.2, "to": 10.5},
#     {"src": "edit/norm-take2.mp4", "ss": 0.0, "to": 6.0, "speed": 1.5, "label": "demo"},
#   ]}
# speed uses atempo (0.25–4.0). Default out: videos/<video-id>/edit/cut.mp4.
#
# Requires: ffmpeg + ffprobe + python3.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: cut.sh <video-id> <edl.json> [out.mp4]}"
EDL="${2:?usage: cut.sh <video-id> <edl.json> [out.mp4]}"
OUT="${3:-videos/${VIDEO_ID}/edit/cut.mp4}"

python3 - "${PROJECT_DIR}" "${VIDEO_ID}" "${EDL}" "${OUT}" <<'PY'
import json, os, subprocess, sys

proj, vid, edl_path, out = sys.argv[1:5]
base = os.path.join(proj, "videos", vid)
edl = json.load(open(edl_path))
cuts = edl.get("cuts", [])
if not cuts:
    sys.exit("ERROR: no cuts in " + edl_path)

def atempo(speed):
    if not 0.25 <= speed <= 4.0:
        sys.exit(f"ERROR: speed {speed} outside 0.25-4.0")
    chain, s = [], speed
    while s > 2.0:
        chain.append("atempo=2.0")
        s /= 2.0
    while s < 0.5:
        chain.append("atempo=0.5")
        s /= 0.5
    chain.append(f"atempo={s:.4f}")
    return ",".join(chain)

parts, total = [], 0.0
os.makedirs(os.path.join(base, "edit"), exist_ok=True)
for i, c in enumerate(cuts):
    src = os.path.join(base, c["src"])
    if not os.path.isfile(src):
        sys.exit(f"ERROR: cut {i} src not found: {src}")
    ss, to = float(c["ss"]), float(c["to"])
    speed = float(c.get("speed", 1.0))
    if to <= ss:
        sys.exit(f"ERROR: cut {i} has to <= ss")
    dur = (to - ss) / speed
    part = os.path.join(base, "edit", f"cut-{i:02d}.mp4")
    vf = (f"setpts=PTS/{speed},scale=1920:1080:force_original_aspect_ratio=decrease,"
          f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p")
    af = (f"{atempo(speed)},afade=t=in:st=0:d=0.01,"
          f"afade=t=out:st={max(0.0, dur - 0.01):.3f}:d=0.01")
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-ss", str(ss), "-to", str(to),
         "-i", src, "-map", "0:v:0", "-map", "0:a:0",
         "-vf", vf, "-af", af,
         "-c:v", "libx264", "-preset", "fast", "-crf", "18",
         "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2", part],
        check=True)
    parts.append(part)
    total += dur
    print(f"cut {i} [{c.get('label', '')}] {dur:.2f}s"
          + (f" @ {speed}x" if speed != 1.0 else ""))

lst = os.path.join(base, "edit", "concat.txt")
with open(lst, "w") as f:
    for p in parts:
        f.write(f"file '{p}'\n")
subprocess.run(
    ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
     "-i", lst, "-c", "copy", os.path.join(proj, out) if not os.path.isabs(out) else out],
    check=True)
print(f"cut.mp4: {total:.2f}s -> {out}")
PY
