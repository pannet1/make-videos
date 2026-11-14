#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export PROJECT_DIR
cd "${PROJECT_DIR}"

CHECK_MODE=0
CUSTOM_VIDEO=""
for arg in "$@"; do
  if [[ "$arg" == "--check" || "$arg" == "-c" ]]; then
    CHECK_MODE=1
  elif [[ "$arg" != "--pre-stage" && "$arg" != "--" && -z "${CUSTOM_VIDEO}" ]]; then
    CUSTOM_VIDEO="$arg"
  fi
done

DIST_DIR="${PROJECT_DIR}/dist/bathroom-pattern-youtube"
export DIST_DIR

if [[ "${CHECK_MODE}" == "1" ]]; then
  echo "=== Verifying Staged Bathroom Pattern YouTube Publication Bundle ==="
  if [[ ! -d "${DIST_DIR}" ]]; then
    echo "ERROR: Staged directory ${DIST_DIR} does not exist. Run 'pnpm run package:bathroom' first." >&2
    exit 1
  fi
else
  echo "=== Staging Bathroom Pattern YouTube Publication Bundle ==="

  # 1. Run pipeline verification first (pre-stage mode)
  ./scripts/verify-bathroom-pattern.sh --pre-stage

  mkdir -p "${DIST_DIR}"

  echo "Staging upload assets into ${DIST_DIR}..."

  # 2. Copy thumbnail, subtitles, audio manifest, publishing guide, social copy, and scene stills
  cp "${PROJECT_DIR}/videos/bathroom-pattern/images/thumbnail.png" "${DIST_DIR}/01-thumbnail-1920x1080.png"
  cp "${PROJECT_DIR}/videos/bathroom-pattern/captions.srt" "${DIST_DIR}/02-subtitles-en-IN.srt"
  cp "${PROJECT_DIR}/videos/bathroom-pattern/captions.vtt" "${DIST_DIR}/02-subtitles-en-IN.vtt"
  cp "${PROJECT_DIR}/videos/bathroom-pattern/vo/manifest.json" "${DIST_DIR}/04-audio-manifest.json"
  cp "${PROJECT_DIR}/videos/bathroom-pattern/edit/edl.json" "${DIST_DIR}/04-edit-decision-list.json"
  cp "${PROJECT_DIR}/videos/bathroom-pattern/PUBLISHING.md" "${DIST_DIR}/05-publishing-guide.md"
  cp "${PROJECT_DIR}/videos/bathroom-pattern/SOCIAL_COPY.md" "${DIST_DIR}/06-social-copy.txt"
  cp "${PROJECT_DIR}/videos/bathroom-pattern/VOICEOVER_SCRIPT.md" "${DIST_DIR}/07-voiceover-script.md"
  mkdir -p "${DIST_DIR}/scene-stills"
  cp "${PROJECT_DIR}/videos/bathroom-pattern/images"/scene-*.png "${DIST_DIR}/scene-stills/"

  # 3. Generate clean YouTube metadata text file
  cat <<'EOF' > "${DIST_DIR}/00-youtube-metadata.txt"
=== YOUTUBE VIDEO TITLE ===
How to Automate Bathroom Lighting without Motion Sensors | Apartment Thread

=== CATEGORY ===
Science & Technology

=== TAGS (COPY & PASTE INTO YOUTUBE TAGS BOX) ===
smart home, home automation, apartment thread, matter over thread, esphome, tinxy, door sensor, reed switch, mc38, local first, zero cloud, home assistant, indian apartments, switchboard retrofit

=== DESCRIPTION ===
Why do smart bathrooms fail?
PIR motion sensors can't see through glass shower cabins, 24GHz mmWave radar suffers from tile reflection noise and water droplet vibration, and naive "door closed = ON" rules leave you stepping into pitch darkness.

In this video, we break down the Apartment Thread Bathroom Pattern (BA-01):
1. Physical Boundary Determinism: Using the bathroom door as an absolute physical boundary with a ₹57 passive MC-38 magnetic reed switch.
2. Steam & Moisture Isolation: Mounting the dry contact on the exterior door jamb away from shower condensation.
3. The In-Wall Dummy Channel: Wiring the sensor directly into switch input S2 of an adjacent Tinxy modular smart switchboard.
4. The Sub-5ms 4-State Machine: Evaluating entry, occupied latch, exit grace period, and auto-off locally on silicon.
5. 100% Local-First Architecture: Zero cloud, zero hub dependency, zero batteries, with full mechanical wall switch override.

TIMESTAMPS:
00:00 - Why Smart Bathrooms Fail (PIR & mmWave Trap)
00:25 - Physical Boundary Determinism (MC-38 Reed Switch)
00:54 - In-Wall Dummy Channel Wiring (Tinxy S2 Decoupling)
01:20 - The 4-State Presence Engine (Sub-5ms Local Logic)
01:56 - 100% Local-First & Fail-Safe Architecture

Full documentation & wiring schematics:
https://github.com/pannet1/ApartmentThread

TECHNICAL SPECS:
- Preset: YouTube 16:9 Full HD (1920x1080) @ 30 FPS
- Runtime: 4,284 frames (~142.8 seconds / 2m 22.8s)
- Audio Voiceover: Microsoft Edge Neural TTS (en-IN-PrabhatNeural)
- Loudness: -16.7 LUFS Integrated, -2.0 dBFS Peak (EBU R128 Compliant)
- Framework: rendiv (React 19 + TypeScript in Docker)
- Subtitles: English (India) Closed Captions (16 timed cues)
- Audio Manifest: 04-audio-manifest.json (SHA-256 Verified Integrity)
- Edit Decision List: 04-edit-decision-list.json (5 Scene Cuts, 4 Joint Checks)
- Release Checksums: 08-checksums.sha256 (SHA-256 Bundle Integrity)
- Visual Artwork: 1080p Master Thumbnail & 5 Scene Stills (1920x1080)
EOF

# 4. Check video render status
CUSTOM_VIDEO=""
for arg in "$@"; do
  if [[ "$arg" != "--pre-stage" && "$arg" != "--" && -z "${CUSTOM_VIDEO}" ]]; then
    CUSTOM_VIDEO="$arg"
  fi
done

rm -f "${DIST_DIR}/03-master-video.mp4" "${DIST_DIR}/03-draft-video.mp4"
if [[ -n "${CUSTOM_VIDEO}" ]]; then
  [[ "${CUSTOM_VIDEO}" = /* ]] || CUSTOM_VIDEO="${PROJECT_DIR}/${CUSTOM_VIDEO}"
  if [[ -f "${CUSTOM_VIDEO}" ]]; then
    echo "   [✓] Custom master video provided: ${CUSTOM_VIDEO}"
    ln -sf "${CUSTOM_VIDEO}" "${DIST_DIR}/03-master-video.mp4"
  else
    echo "   [ERROR] Specified video file not found: ${CUSTOM_VIDEO}" >&2
    exit 1
  fi
elif [[ -f "${PROJECT_DIR}/out/bathroom-pattern.mp4" ]]; then
  echo "   [✓] Master video found: ${PROJECT_DIR}/out/bathroom-pattern.mp4"
  ln -sf "${PROJECT_DIR}/out/bathroom-pattern.mp4" "${DIST_DIR}/03-master-video.mp4"
elif [[ -f "${PROJECT_DIR}/out/bathroom-pattern-draft.mp4" ]]; then
  echo "   [i] Master video not yet rendered, but Draft video found: ${PROJECT_DIR}/out/bathroom-pattern-draft.mp4"
  ln -sf "${PROJECT_DIR}/out/bathroom-pattern-draft.mp4" "${DIST_DIR}/03-draft-video.mp4"
else
  echo "   [!] Master video out/bathroom-pattern.mp4 not yet rendered."
  echo "       To render the master video, execute:"
  echo "       cd ${PROJECT_DIR} && ./render.sh BathroomPattern out/bathroom-pattern.mp4"
fi

# 5. Generate 08-checksums.sha256 release checksum manifest
python3 -c '
import os, hashlib

base = os.environ.get("PROJECT_DIR", os.getcwd())
dist = os.environ.get("DIST_DIR", os.path.join(base, "dist/bathroom-pattern-youtube"))

entries = []
for root, dirs, files in os.walk(dist):
    for f in sorted(files):
        if f in ["08-checksums.sha256", "checksums.sha256"] or f.startswith("."):
            continue
        rel = os.path.relpath(os.path.join(root, f), dist)
        full = os.path.join(root, f)
        with open(full, "rb") as bf:
            h = hashlib.sha256(bf.read()).hexdigest()
        entries.append(f"{h}  {rel}")

entries.sort(key=lambda x: x.split("  ")[1])
manifest_path = os.path.join(dist, "08-checksums.sha256")
with open(manifest_path, "w") as cf:
    cf.write("\n".join(entries) + "\n")
print(f"   [✓] Release checksums manifest generated: 08-checksums.sha256 ({len(entries)} files cataloged).")
'
fi

# 6. Validate staged bundle integrity
python3 -c '
import os, hashlib, struct, subprocess
base = os.environ.get("PROJECT_DIR", os.getcwd())
dist = os.environ.get("DIST_DIR", os.path.join(base, "dist/bathroom-pattern-youtube"))
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

with open(orig_manifest, "rb") as f1, open(os.path.join(dist, "04-audio-manifest.json"), "rb") as f2:
    assert hashlib.sha256(f1.read()).hexdigest() == hashlib.sha256(f2.read()).hexdigest(), "Staged manifest SHA-256 parity mismatch"

with open(orig_edl, "rb") as f1, open(os.path.join(dist, "04-edit-decision-list.json"), "rb") as f2:
    assert hashlib.sha256(f1.read()).hexdigest() == hashlib.sha256(f2.read()).hexdigest(), "Staged EDL SHA-256 parity mismatch"

with open(os.path.join(dist, "04-edit-decision-list.json")) as ef:
    import json
    staged_edl = json.load(ef)
    assert len(staged_edl.get("cuts", [])) == 5, "Staged EDL cuts count invalid"
    assert staged_edl.get("total_frames") == 4284, "Staged EDL total frames mismatch"

import re
srt_pattern = re.compile(r"(\d+)\n(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\n(.*?)(?=\n\d+\n|\n*$)", re.DOTALL)
vtt_pattern = re.compile(r"(\d+)\n(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\n(.*?)(?=\n\d+\n|\n*$)", re.DOTALL)
staged_srt = list(srt_pattern.finditer(open(os.path.join(dist, "02-subtitles-en-IN.srt")).read().strip()))
staged_vtt = list(vtt_pattern.finditer(open(os.path.join(dist, "02-subtitles-en-IN.vtt")).read().strip()))
assert len(staged_srt) == 16, "Staged SRT cue count mismatch"
assert len(staged_vtt) == 16, "Staged VTT cue count mismatch"
for i in range(16):
    assert staged_srt[i].group(4).strip() == staged_vtt[i].group(4).strip(), f"Staged subtitle text mismatch at cue {i+1}"

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

# Execute sha256sum verification across all staged bundle files
subprocess.run(["sha256sum", "-c", "08-checksums.sha256"], cwd=dist, check=True, stdout=subprocess.DEVNULL)

print("   [✓] All staged distribution assets verified (>0 bytes, 5 scene stills, manifest SHA-256 parity, subtitle cues, 08-checksums.sha256 OK).")
'

if [[ "${CHECK_MODE}" == "1" ]]; then
  echo "=== Staged Bundle Verification Passed ==="
  exit 0
fi

echo "=== Staging Complete ==="
ls -lh "${DIST_DIR}"
