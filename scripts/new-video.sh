#!/usr/bin/env bash
set -euo pipefail

# Scaffold a new video: source folders, spec stub, and a composition stub
# registered in src/index.tsx.
#
# Usage:
#   ./scripts/new-video.sh <video-id> <CompositionName>
# Example:
#   ./scripts/new-video.sh how-bidding-works HowBiddingWorks

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: new-video.sh <video-id> <CompositionName>}"
NAME="${2:?usage: new-video.sh <video-id> <CompositionName>}"

VIDEO_DIR="${PROJECT_DIR}/videos/${VIDEO_ID}"
SRC_DIR="${PROJECT_DIR}/src/videos/${VIDEO_ID}"
INDEX="${PROJECT_DIR}/src/index.tsx"

mkdir -p "${VIDEO_DIR}/vo" "${VIDEO_DIR}/assets" "${SRC_DIR}"

if [[ ! -f "${VIDEO_DIR}/spec.md" ]]; then
  cat > "${VIDEO_DIR}/spec.md" <<EOF
# ${VIDEO_ID}

## Chapters

1. **Title** (00:00-00:XX) — what the viewer learns.

## Voiceover

Copy the narration for each chapter into \`vo/NN-name.txt\` (one file per
chapter, numbered). Then run:

\`\`\`
./scripts/generate-vo.sh ${VIDEO_ID}
./scripts/timings.sh ${VIDEO_ID}
\`\`\`

Paste the printed VO_START/VO_LEN into the composition.
EOF
fi

if [[ ! -f "${SRC_DIR}/${NAME}.tsx" ]]; then
  cat > "${SRC_DIR}/${NAME}.tsx" <<EOF
import React from 'react';
import { CanvasElement, Fill } from '@rendiv/core';
import { Brand, NavBar, SectionHeader, SLATE_950 } from '../../shared/theme';

const VIDEO_ID = '${VIDEO_ID}';

export const ${NAME}: React.FC = () => (
  <CanvasElement id="${NAME}">
    <Fill style={{ backgroundColor: SLATE_950 }}>
      <NavBar />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 24,
        }}
      >
        <Brand size={64} />
        <SectionHeader title="${VIDEO_ID}" />
      </div>
    </Fill>
  </CanvasElement>
);
EOF
fi

if ! grep -q "import { ${NAME} } from './videos/${VIDEO_ID}/${NAME}';" "${INDEX}"; then
  sed -i "1i import { ${NAME} } from './videos/${VIDEO_ID}/${NAME}';" "${INDEX}"
  python3 - "${INDEX}" "${NAME}" <<'PY'
import sys
path, name = sys.argv[1], sys.argv[2]
src = open(path).read()
block = f"""    <Composition
      id="{name}"
      component={{{name}}}
      durationInFrames={{{150}}}
      fps={{{30}}}
      width={{{1920}}}
      height={{{1080}}}
    />
"""
src = src.replace("</>", block + "</>")
open(path, "w").write(src)
PY
fi

echo "Scaffolded ${VIDEO_ID} (${NAME})"
echo "  videos/${VIDEO_ID}/  spec.md, vo/, assets/"
echo "  src/videos/${VIDEO_ID}/${NAME}.tsx  registered in src/index.tsx"
echo "Next: write narration into videos/${VIDEO_ID}/vo/, drop assets into"
echo "  videos/${VIDEO_ID}/assets/, then run ./scripts/generate-vo.sh ${VIDEO_ID}"