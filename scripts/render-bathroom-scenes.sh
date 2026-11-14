#!/usr/bin/env bash
set -euo pipefail

# Render all 5 scene stills and the master thumbnail for BathroomPattern.
# Each still captures a high-resolution 1920x1080 PNG preview for documentation and social distribution.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export PROJECT_DIR
cd "${PROJECT_DIR}"

IMG_DIR="${PROJECT_DIR}/videos/bathroom-pattern/images"
mkdir -p "${IMG_DIR}"

echo "=== Rendering Bathroom Pattern Scene Stills & Thumbnail ==="

echo "1/6 Rendering Scene 1 (Problem & Sensor Limitations)..."
./render.sh BathroomScene1Problem --still --frame 50 -o "${IMG_DIR}/scene-01-problem.png"

echo "2/6 Rendering Scene 2 (Physical Boundary Determinism)..."
./render.sh BathroomScene2Sensor --still --frame 50 -o "${IMG_DIR}/scene-02-sensor.png"

echo "3/6 Rendering Scene 3 (In-Wall Dummy Channel Wiring)..."
./render.sh BathroomScene3Wiring --still --frame 50 -o "${IMG_DIR}/scene-03-wiring.png"

echo "4/6 Rendering Scene 4 (4-State Presence Engine)..."
./render.sh BathroomScene4StateMachine --still --frame 50 -o "${IMG_DIR}/scene-04-state-machine.png"

echo "5/6 Rendering Scene 5 (100% Local-First Network Topology)..."
./render.sh BathroomScene5LocalFirst --still --frame 50 -o "${IMG_DIR}/scene-05-local-first.png"

echo "6/6 Rendering Master 1080p Thumbnail Still..."
./render.sh BathroomThumbnail --still -o "${IMG_DIR}/thumbnail.png"

echo "=== All Stills Rendered Successfully ==="
ls -lh "${IMG_DIR}"/scene-*.png "${IMG_DIR}/thumbnail.png"

python3 - <<'PY'
import os, struct

base = os.environ.get("PROJECT_DIR", os.getcwd())
img_dir = f"{base}/videos/bathroom-pattern/images"

for f in ["thumbnail.png", "scene-01-problem.png", "scene-02-sensor.png", "scene-03-wiring.png", "scene-04-state-machine.png", "scene-05-local-first.png"]:
    p = os.path.join(img_dir, f)
    assert os.path.exists(p), f"Missing rendered still: {p}"
    with open(p, "rb") as bf:
        bf.seek(16)
        w, h = struct.unpack(">II", bf.read(8))
        assert w == 1920 and h == 1080, f"Resolution mismatch in {f}: {w}x{h}"
print("   [✓] All 6 exported stills verified at 1920x1080 (16:9).")
PY

STOP=0
for arg in "$@"; do
  if [[ "$arg" == "--stop" || "$arg" == "-s" ]]; then
    STOP=1
  fi
done

if [[ "${STOP}" == "1" || "${STOP_CONTAINER:-0}" == "1" ]]; then
  echo "Stopping rendiv container..."
  docker stop rendiv >/dev/null 2>&1 || true
fi
