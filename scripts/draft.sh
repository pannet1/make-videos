#!/usr/bin/env bash
#
# Fast ROUGH draft of the Navaratri video for spotting inconsistencies.
# Same 10:30 timeline + Tamil VO, rendered at 960x540 with the cheapest
# encode settings — roughly 3-4x quicker than a full-res draft.
#
# Usage:
#   ./scripts/draft.sh [OUTPUT]
# Example:
#   ./scripts/draft.sh out/navaratri-draft.mp4
#
# For spot-checking one act only, render its standalone composition
# (NOTE: --frames on the master does NOT work — this renderer numbers files
# by absolute frame, so stitching finds nothing. Per-scene comps start at 0.)
#   Hook        ./render.sh NavaratriHook out/hook.mp4 --concurrency 10 --preset ultrafast --crf 30
#   Foundation  ./render.sh NavaratriFoundation out/foundation.mp4 --concurrency 10 --preset ultrafast --crf 30
#   Phase 1     ./render.sh NavaratriPhase1 out/phase1.mp4 --concurrency 10 --preset ultrafast --crf 30
#   Phase 2     ./render.sh NavaratriPhase2 out/phase2.mp4 --concurrency 10 --preset ultrafast --crf 30
#   Phase 3     ./render.sh NavaratriPhase3 out/phase3.mp4 --concurrency 10 --preset ultrafast --crf 30
#   Outro       ./render.sh NavaratriOutro out/outro.mp4 --concurrency 10 --preset ultrafast --crf 30
# (Spot-checks are visual-only: VO <Audio> lives on the master timeline.)
#
set -euo pipefail
cd "$(dirname "$0")/.."

ENTRY_FILE="src/__ephemeral__.tsx"
trap 'rm -f "${PROJECT_DIR}/${ENTRY_FILE}"' EXIT
PROJECT_DIR="$(pwd)"

node -e "
const fs = require('fs');
const lines = [
  \"import React from 'react';\",
  \"import { setRootComponent, Composition } from '@rendiv/core';\",
  \"import { TOTAL_FRAMES } from './theme';\",
  \"import { NavaratriSadhana } from './NavaratriSadhana';\",
  '',
  'const Draft: React.FC = () => (',
  '  <div style={{ width: 1920, height: 1080, transform: \\'scale(0.5)\\', transformOrigin: \\'top left\\' }}>',
  '    <NavaratriSadhana />',
  '  </div>',
  ');',
  '',
  'const Root: React.FC = () => (',
  '  <Composition id=\"NavaratriDraft\" component={Draft}',
  '    durationInFrames={TOTAL_FRAMES} fps={30} width={960} height={540} />',
  ');',
  '',
  'setRootComponent(Root);',
  '',
];
fs.writeFileSync('$ENTRY_FILE', lines.join('\n'));
console.log('draft entry: $ENTRY_FILE (960x540, removed on exit)');
"

OUTPUT="${1:-out/navaratri-draft.mp4}"
ENTRY="${ENTRY_FILE}" ./render.sh NavaratriDraft "${OUTPUT}" \
  --concurrency 10 --image-format jpeg --preset ultrafast --crf 30
