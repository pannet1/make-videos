#!/usr/bin/env bash
set -euo pipefail

# Watch a folder for video/audio files and automatically transcribe them using converter (faster-whisper).
# Usage:
#   ./scripts/watch-folder.sh [path-to-folder]

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WATCH_DIR="${1:-${PROJECT_DIR}/videos}"

echo "Starting media watcher on: ${WATCH_DIR}"
cd "${PROJECT_DIR}/converter"
exec uv run main.py
