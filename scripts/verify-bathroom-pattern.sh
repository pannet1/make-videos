#!/usr/bin/env bash
set -euo pipefail

PRE_STAGE=0
for arg in "$@"; do
  if [[ "$arg" == "--pre-stage" ]]; then
    PRE_STAGE=1
  fi
done

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export PROJECT_DIR
cd "${PROJECT_DIR}"

echo "=== Verifying Bathroom Pattern Video Pipeline ==="

echo "1. TypeScript Typecheck..."
pnpm exec tsc --noEmit
echo "   TypeScript OK."

echo "2. Checking Voiceover, Audio Durations, Manifest and Caption Assets..."
python3 -c '
import os, json, hashlib, subprocess

base = os.environ.get("PROJECT_DIR", os.getcwd())
vo_dir = f"{base}/public/bathroom-pattern/vo"
video_dir = f"{base}/videos/bathroom-pattern"

VO_START = [0, 766, 1634, 2411, 3484]
VO_LEN = [766, 868, 777, 1073, 800]
FPS = 30

for i in range(5):
    f = f"{vo_dir}/{i:02d}.mp3"
    assert os.path.exists(f), f"Missing {f}"
    out = subprocess.check_output(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "json", f])
    dur = float(json.loads(out)["format"]["duration"])
    audio_frames = dur * FPS
    assert audio_frames <= VO_LEN[i], f"Scene {i} audio duration ({dur:.2f}s = {audio_frames:.1f} frames) exceeds allocated {VO_LEN[i]} frames"

assert os.path.exists(f"{vo_dir}/pad.mp3"), "Missing pad.mp3"
assert os.path.exists(f"{video_dir}/captions.srt"), "Missing captions.srt"
assert os.path.exists(f"{video_dir}/captions.vtt"), "Missing captions.vtt"
assert os.path.exists(f"{video_dir}/VOICEOVER_SCRIPT.md"), "Missing VOICEOVER_SCRIPT.md"
assert os.path.exists(f"{video_dir}/PUBLISHING.md"), "Missing PUBLISHING.md"
assert os.path.exists(f"{video_dir}/SOCIAL_COPY.md"), "Missing SOCIAL_COPY.md"
assert os.path.exists(f"{video_dir}/vo/manifest.json"), "Missing vo/manifest.json"
assert os.path.exists(f"{video_dir}/edit/edl.json"), "Missing edit/edl.json"
for s in ["stage-bathroom-package.sh", "render-bathroom-scenes.sh", "qc-bathroom.sh", "generate-bathroom-manifest.py", "generate-vo.sh", "timings.sh"]:
    sp = f"{base}/scripts/{s}"
    assert os.path.exists(sp), f"Missing script {sp}"
    assert os.access(sp, os.X_OK), f"Script {sp} not executable"
assert os.access(f"{base}/render.sh", os.X_OK), "render.sh not executable"

# Verify caption cues: structure, monotonicity, duration bounds, and SRT/VTT parity
import re

def parse_time(ts, sep=","):
    h, m, rest = ts.strip().split(":")
    s, ms = rest.split(sep)
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000.0

with open(f"{video_dir}/captions.srt") as f:
    srt_text = f.read().strip()
with open(f"{video_dir}/captions.vtt") as f:
    vtt_text = f.read().strip()

assert vtt_text.startswith("WEBVTT"), "captions.vtt missing WEBVTT header"

srt_pattern = re.compile(r"(\d+)\n(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\n(.*?)(?=\n\d+\n|\n*$)", re.DOTALL)
vtt_pattern = re.compile(r"(\d+)\n(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\n(.*?)(?=\n\d+\n|\n*$)", re.DOTALL)

srt_matches = list(srt_pattern.finditer(srt_text))
vtt_matches = list(vtt_pattern.finditer(vtt_text))

assert len(srt_matches) == 16, f"Expected 16 cues in captions.srt, found {len(srt_matches)}"
assert len(vtt_matches) == 16, f"Expected 16 cues in captions.vtt, found {len(vtt_matches)}"

prev_start = -0.001
for i in range(16):
    s_idx, s_st, s_et, s_txt = int(srt_matches[i].group(1)), srt_matches[i].group(2), srt_matches[i].group(3), srt_matches[i].group(4).strip()
    v_idx, v_st, v_et, v_txt = int(vtt_matches[i].group(1)), vtt_matches[i].group(2), vtt_matches[i].group(3), vtt_matches[i].group(4).strip()
    
    assert s_idx == v_idx == i + 1, f"Cue numbering error at index {i}"
    assert s_txt == v_txt and len(s_txt) > 0, f"Cue text mismatch or empty at cue {i+1}"
    assert s_st.replace(",", ".") == v_st, f"Start timestamp mismatch at cue {i+1}"
    assert s_et.replace(",", ".") == v_et, f"End timestamp mismatch at cue {i+1}"
    
    t_start = parse_time(s_st, ",")
    t_end = parse_time(s_et, ",")
    assert t_start < t_end, f"Cue {i+1} start time >= end time ({t_start} >= {t_end})"
    assert t_start >= prev_start, f"Cue {i+1} is not monotonic (starts before previous cue)"
    assert t_end <= 142.80, f"Cue {i+1} exceeds total composition duration ({t_end} > 142.8s)"
    prev_start = t_start

# Verify voiceover manifest integrity
with open(f"{video_dir}/vo/manifest.json") as f:
    manifest = json.load(f)
assert manifest["total_composition_frames"] == 4284, "Manifest frame count mismatch"
track_count = len(manifest["tracks"])
assert track_count == 6, f"Expected 6 tracks in manifest, found {track_count}"

total_manifest_cues = 0
for t in manifest["tracks"]:
    fpath = os.path.join(vo_dir, t["file"])
    assert os.path.exists(fpath), f"Manifest file missing: {fpath}"
    assert os.path.getsize(fpath) == t["size_bytes"], f"Size mismatch for {t['file']}"
    with open(fpath, "rb") as bf:
        h = hashlib.sha256(bf.read()).hexdigest()
    assert h == t["sha256"], f"SHA256 mismatch for {t['file']}"
    if "scene_index" in t:
        idx = t["scene_index"]
        assert t["start_frame"] == VO_START[idx], f"Start frame mismatch in scene {idx}"
        assert t["allocated_frames"] == VO_LEN[idx], f"Allocated frame mismatch in scene {idx}"
        assert -18.0 <= t["integrated_lufs"] <= -14.0, f"Scene {idx} loudness ({t['integrated_lufs']}) outside broadcast range (-18 to -14 LUFS)"
        assert t["true_peak_dbfs"] <= -1.0, f"Scene {idx} true peak ({t['true_peak_dbfs']}) exceeds -1.0 dBFS ceiling"
        total_manifest_cues += len(t["subtitle_cues"])
assert total_manifest_cues == 16, f"Expected 16 cues in manifest, found {total_manifest_cues}"

# Verify edit decision list (EDL) integrity
with open(f"{video_dir}/edit/edl.json") as ef:
    edl = json.load(ef)
assert edl["total_frames"] == 4284, "EDL total frame count mismatch"
assert len(edl["cuts"]) == 5, f"Expected 5 cuts in EDL, found {len(edl['cuts'])}"
edl_duration = sum((c["to"] - c["ss"]) for c in edl["cuts"])
assert abs(edl_duration - 142.8) < 0.001, f"EDL duration sum mismatch: expected 142.8, got {edl_duration}"

# Verify timings.sh calculation matches composition constants
timings_out = subprocess.check_output([f"{base}/scripts/timings.sh", "bathroom-pattern"], text=True)
assert f"VO_START = {VO_START};" in timings_out, "timings.sh VO_START mismatch"
assert f"VO_LEN   = {VO_LEN};" in timings_out, "timings.sh VO_LEN mismatch"
assert "TOTAL    = 4284 frames = 142.80s" in timings_out, "timings.sh TOTAL frames mismatch"

print("   Voiceover durations, timings calculation, manifest (SHA-256 integrity, EBU R128 compliance), EDL (5 cuts), captions (16 cues) & script verified.")
'

python3 "${PROJECT_DIR}/scripts/generate-bathroom-manifest.py" --check >/dev/null

# Assert voiceover assets are tracked by git (not accidentally ignored)
if git check-ignore -q public/bathroom-pattern/vo/00.mp3 2>/dev/null; then
  echo "ERROR: public/bathroom-pattern/vo/00.mp3 is ignored by git! Check .gitignore." >&2
  exit 1
fi
echo "   Voiceover assets git tracking verified."

echo "3. Verifying Composition Registrations in src/index.tsx..."
grep -q 'id="BathroomPattern"' src/index.tsx || { echo "ERROR: BathroomPattern not registered" >&2; exit 1; }
grep -q 'id="BathroomThumbnail"' src/index.tsx || { echo "ERROR: BathroomThumbnail not registered" >&2; exit 1; }
grep -q 'id="BathroomScene1Problem"' src/index.tsx || { echo "ERROR: BathroomScene1Problem not registered" >&2; exit 1; }
grep -q 'id="BathroomScene2Sensor"' src/index.tsx || { echo "ERROR: BathroomScene2Sensor not registered" >&2; exit 1; }
grep -q 'id="BathroomScene3Wiring"' src/index.tsx || { echo "ERROR: BathroomScene3Wiring not registered" >&2; exit 1; }
grep -q 'id="BathroomScene4StateMachine"' src/index.tsx || { echo "ERROR: BathroomScene4StateMachine not registered" >&2; exit 1; }
grep -q 'id="BathroomScene5LocalFirst"' src/index.tsx || { echo "ERROR: BathroomScene5LocalFirst not registered" >&2; exit 1; }
echo "   All 7 compositions registered OK."

echo "4. Checking package.json Lifecycle Scripts..."
python3 -c '
import json, os
with open("package.json") as f:
    pkg = json.load(f)
scripts = pkg.get("scripts", {})
required_scripts = [
    "verify:bathroom", "package:bathroom", "package:bathroom:check", "manifest:bathroom", "manifest:bathroom:check", "timings:bathroom", "vo:bathroom",
    "check:bathroom", "build:bathroom", "render:bathroom", "render:bathroom:stop", "render:bathroom-draft", "render:bathroom-draft:stop",
    "still:bathroom-thumb", "still:bathroom-thumb:stop", "still:bathroom", "still:bathroom:stop", "still:bathroom-scenes",
    "still:bathroom-scenes:stop", "qc:bathroom", "qc:bathroom:strict", "clean:bathroom", "stop:bathroom", "test"
]
for s in required_scripts:
    assert s in scripts, f"Missing script {s} in package.json"
assert len(required_scripts) == 24, f"Expected 24 scripts in list, got {len(required_scripts)}"
print("   All 24 bathroom package.json lifecycle scripts verified.")
'

echo "5. Checking Rendered Stills and Package Artwork..."
python3 -c '
import os, struct

base = os.environ.get("PROJECT_DIR", os.getcwd())
img_dir = f"{base}/videos/bathroom-pattern/images"

required_images = [
    "thumbnail.png",
    "scene-01-problem.png",
    "scene-02-sensor.png",
    "scene-03-wiring.png",
    "scene-04-state-machine.png",
    "scene-05-local-first.png"
]

for img in required_images:
    p = f"{img_dir}/{img}"
    assert os.path.exists(p), f"Missing image {p}"
    size = os.path.getsize(p)
    assert size > 10000, f"Image {img} too small ({size} bytes)"
    with open(p, "rb") as f:
        sig = f.read(8)
        assert sig == b"\x89PNG\r\n\x1a\n", f"Not a valid PNG file: {p}"
        f.seek(16)
        w, h = struct.unpack(">II", f.read(8))
        assert w == 1920 and h == 1080, f"Image {img} resolution mismatch: expected 1920x1080, got {w}x{h}"
print("   All 6 thumbnail and scene still assets verified (1920x1080 16:9).")
'

if [[ "${PRE_STAGE}" == "0" && -d "${PROJECT_DIR}/dist/bathroom-pattern-youtube" ]]; then
  echo "6. Verifying Staged YouTube Bundle..."
  python3 -c '
import os, json, hashlib, struct
base = os.environ.get("PROJECT_DIR", os.getcwd())
dist = f"{base}/dist/bathroom-pattern-youtube"
orig_manifest = f"{base}/videos/bathroom-pattern/vo/manifest.json"
orig_edl = f"{base}/videos/bathroom-pattern/edit/edl.json"

required = ["00-youtube-metadata.txt", "01-thumbnail-1920x1080.png", "02-subtitles-en-IN.srt", "02-subtitles-en-IN.vtt", "04-audio-manifest.json", "04-edit-decision-list.json", "05-publishing-guide.md", "06-social-copy.txt", "07-voiceover-script.md", "08-checksums.sha256"]
for f in required:
    p = os.path.join(dist, f)
    assert os.path.exists(p) and os.path.getsize(p) > 0, f"Missing or empty staged file {p}"

for s in ["scene-01-problem.png", "scene-02-sensor.png", "scene-03-wiring.png", "scene-04-state-machine.png", "scene-05-local-first.png"]:
    p = os.path.join(dist, "scene-stills", s)
    assert os.path.exists(p) and os.path.getsize(p) > 10000, f"Missing or invalid staged slide {p}"

# Verify staged image resolutions (1920x1080)
for img_path in [os.path.join(dist, "01-thumbnail-1920x1080.png")] + [os.path.join(dist, "scene-stills", s) for s in ["scene-01-problem.png", "scene-02-sensor.png", "scene-03-wiring.png", "scene-04-state-machine.png", "scene-05-local-first.png"]]:
    with open(img_path, "rb") as f:
        f.seek(16)
        w, h = struct.unpack(">II", f.read(8))
        assert w == 1920 and h == 1080, f"Staged image {img_path} resolution mismatch: expected 1920x1080, got {w}x{h}"

for v in ["03-master-video.mp4", "03-draft-video.mp4"]:
    vp = os.path.join(dist, v)
    if os.path.islink(vp):
        assert os.path.exists(vp), f"Broken staged video symlink: {vp}"
        assert os.path.getsize(vp) > 100000, f"Staged video file {vp} unexpectedly small"

with open(os.path.join(dist, "00-youtube-metadata.txt")) as mf:
    mtext = mf.read()
for sec in ["=== YOUTUBE VIDEO TITLE ===", "=== CATEGORY ===", "=== TAGS (COPY & PASTE INTO YOUTUBE TAGS BOX) ===", "=== DESCRIPTION ===", "TIMESTAMPS:", "TECHNICAL SPECS:"]:
    assert sec in mtext, f"Missing {sec} in staged metadata"

with open(os.path.join(dist, "04-audio-manifest.json")) as mf:
    staged_manifest = json.load(mf)
    assert len(staged_manifest.get("tracks", [])) == 6, "Staged audio manifest track count invalid"

with open(orig_edl, "rb") as f1, open(os.path.join(dist, "04-edit-decision-list.json"), "rb") as f2:
    assert hashlib.sha256(f1.read()).hexdigest() == hashlib.sha256(f2.read()).hexdigest(), "Staged EDL SHA-256 parity mismatch"

with open(os.path.join(dist, "04-edit-decision-list.json")) as ef:
    staged_edl = json.load(ef)
    assert len(staged_edl.get("cuts", [])) == 5, "Staged EDL cuts count invalid"
    assert staged_edl.get("total_frames") == 4284, "Staged EDL total frames mismatch"

assert os.path.getsize(os.path.join(dist, "05-publishing-guide.md")) > 1000, "Staged publishing guide too small"
assert os.path.getsize(os.path.join(dist, "07-voiceover-script.md")) > 1000, "Staged voiceover script too small"

with open(os.path.join(dist, "05-publishing-guide.md")) as pf:
    ptext = pf.read()
for sec in ["Pre-Publishing Checklist", "Rendering the Production Master", "Staged Upload Package Structure", "YouTube Studio Step-by-Step", "Multi-Platform Syndication"]:
    assert sec in ptext, f"Missing {sec} in staged publishing guide"

with open(os.path.join(dist, "06-social-copy.txt")) as sf:
    stext = sf.read()
for plat in ["YouTube Community Post", "Twitter / X Technical Thread", "LinkedIn Engineering", "Reddit Post"]:
    assert plat in stext, f"Missing {plat} in staged social copy"

with open(os.path.join(dist, "07-voiceover-script.md")) as vf:
    vtext = vf.read()
for sec in ["Technical Pronunciation", "Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5", "Voiceover Audio Manifest"]:
    assert sec in vtext, f"Missing {sec} in staged voiceover script"

# Verify staged subtitle cue structure and parity
import re
srt_pattern = re.compile(r"(\d+)\n(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\n(.*?)(?=\n\d+\n|\n*$)", re.DOTALL)
vtt_pattern = re.compile(r"(\d+)\n(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\n(.*?)(?=\n\d+\n|\n*$)", re.DOTALL)
staged_srt = list(srt_pattern.finditer(open(os.path.join(dist, "02-subtitles-en-IN.srt")).read().strip()))
staged_vtt = list(vtt_pattern.finditer(open(os.path.join(dist, "02-subtitles-en-IN.vtt")).read().strip()))
assert len(staged_srt) == 16, "Staged SRT cue count mismatch"
assert len(staged_vtt) == 16, "Staged VTT cue count mismatch"
for i in range(16):
    assert staged_srt[i].group(4).strip() == staged_vtt[i].group(4).strip(), f"Staged subtitle text mismatch at cue {i+1}"

# Execute sha256sum verification across all staged bundle files
import subprocess
subprocess.run(["sha256sum", "-c", "08-checksums.sha256"], cwd=dist, check=True, stdout=subprocess.DEVNULL)

# Execute stage-bathroom-package.sh --check to ensure standalone packaging check passes
subprocess.run([f"{base}/scripts/stage-bathroom-package.sh", "--check"], check=True, stdout=subprocess.DEVNULL)

print("   Staged YouTube distribution package verified (metadata headers, checksums manifest, slides, guide, script, subtitle cues).")
'
fi

echo "=== Verification Successful ==="
echo "To render the final master 1080p MP4, execute:"
echo "  cd ${PROJECT_DIR} && ./render.sh BathroomPattern out/bathroom-pattern.mp4"
