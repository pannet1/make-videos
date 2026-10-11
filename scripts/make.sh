#!/usr/bin/env bash
set -euo pipefail

# One-command video builder: voiceover -> timings -> patch composition -> render.
#
# Usage:
#   bash scripts/make.sh <video-id> <CompositionId> [OUTPUT] [VOICE]
# Example:
#   bash scripts/make.sh schematics-download SchematicsDownload out/schematics-download.mp4
#
# Environment (all optional):
#   WIDTH / HEIGHT  output resolution, must be 16:9 (default 2560x1440 —
#                   high-res master keeps thin strokes crisp through the
#                   encode; downscale in the player acts as supersampling)
#   CRF             FFmpeg quality 0-51, lower is better (default 16)
#   PRESET          x264 preset (default slow)
#   CONCURRENCY     parallel render tabs (unset by default; try 2-4)
#   VOICE           edge-tts voice (default en-IN-PrabhatNeural)
#
# Composition conventions (required): file contains `const VO_START` /
# `const VO_LEN`, exports the component (named = file basename) plus
# TOTAL_FRAMES, and <CanvasElement id> matches <CompositionId>.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: make.sh <video-id> <CompositionId> [OUTPUT] [VOICE]}"
COMP="${2:?usage: make.sh <video-id> <CompositionId> [OUTPUT] [VOICE]}"
OUTPUT="${3:-out/${VIDEO_ID}.mp4}"
VOICE="${4:-en-IN-PrabhatNeural}"

cd "${PROJECT_DIR}"

./scripts/generate-vo.sh "${VIDEO_ID}" "${VOICE}"

TIMINGS="$(./scripts/timings.sh "${VIDEO_ID}")"
echo "${TIMINGS}"

START_B="$(printf '%s\n' "${TIMINGS}" | grep '^VO_START' | grep -o '\[.*\]')"
LEN_B="$(printf '%s\n' "${TIMINGS}" | grep '^VO_LEN' | grep -o '\[.*\]')"
if [[ -z "${START_B}" || -z "${LEN_B}" ]]; then
  echo "ERROR: could not parse VO_START/VO_LEN from timings.sh output" >&2
  exit 1
fi

TARGET="$(grep -rl 'const VO_START' "src/videos/${VIDEO_ID}" | head -n 1 || true)"
if [[ -z "${TARGET}" ]]; then
  echo "ERROR: no composition file with 'const VO_START' under src/videos/${VIDEO_ID}" >&2
  exit 1
fi

python3 - "${START_B}" "${LEN_B}" "${TARGET}" <<'PY'
import re, sys

start_b, len_b, target = sys.argv[1], sys.argv[2], sys.argv[3]
with open(target) as f:
    src = f.read()
new, n1 = re.subn(r'const VO_START = \[.*?\];',
                  f'const VO_START = {start_b};', src, count=1)
new, n2 = re.subn(r'const VO_LEN = \[.*?\];',
                  f'const VO_LEN = {len_b};', new, count=1)
if n1 == 0 or n2 == 0:
    sys.exit('ERROR: VO_START/VO_LEN pattern did not match ' + target)
with open(target, 'w') as f:
    f.write(new)
print(f'Patched {target}')
PY

WIDTH="${WIDTH:-2560}"
HEIGHT="${HEIGHT:-1440}"
CRF="${CRF:-16}"
PRESET="${PRESET:-slow}"

ENTRY_FILE="src/__ephemeral__.tsx"
trap 'rm -f "${PROJECT_DIR}/${ENTRY_FILE}"' EXIT
python3 - "${COMP}" "${TARGET}" "${PROJECT_DIR}/${ENTRY_FILE}" "${WIDTH}" "${HEIGHT}" <<'PY'
import os, sys

comp, target, entry_path = sys.argv[1], sys.argv[2], sys.argv[3]
width, height = int(sys.argv[4]), int(sys.argv[5])
if abs(height - width * 9 / 16) > 2:
    sys.exit('ERROR: WIDTHxHEIGHT must be 16:9, got '
             + str(width) + 'x' + str(height))
scale = width / 1920
mod = os.path.relpath(target, 'src')[:-len('.tsx')]
name = os.path.basename(mod)
if scale == 1:
    registered = name
    extra = []
else:
    registered = 'Scaled'
    extra = [
        'const Scaled: React.FC = () => (',
        '  <div style={{ width: 1920, height: 1080, transform: \'scale('
        + repr(scale) + ')\', transformOrigin: \'top left\' }}>',
        '    <' + name + ' />',
        '  </div>',
        ');',
    ]
lines = [
    "import React from 'react';",
    "import { setRootComponent, Composition } from '@rendiv/core';",
    'import { ' + name + ", TOTAL_FRAMES as EP_FRAMES } from './" + mod + "';",
] + extra + [
    'const Root: React.FC = () => (',
    '  <Composition id="' + comp + '" component={' + registered
    + '} durationInFrames={EP_FRAMES} fps={30}'
    + ' width={' + str(width) + '} height={' + str(height) + '} />',
    ');',
    'setRootComponent(Root);',
    '',
]
with open(entry_path, 'w') as f:
    f.write('\n'.join(lines))
print('Wrote throwaway entry ' + entry_path
      + ' at ' + str(width) + 'x' + str(height))
PY

CRF="${CRF}" PRESET="${PRESET}" ENTRY="${ENTRY_FILE}" ./render.sh "${COMP}" "${OUTPUT}"
