#!/usr/bin/env bash
set -euo pipefail

# Transcribe footage audio to word-level timing for edit-by-prompt.
# Cutting on word boundaries (filler words, false starts, dead space) is
# what makes transcript-driven edits cheap: the agent reads text, not video.
#
# Usage:
#   ./scripts/transcribe.sh <video-id> [audio.wav] [--srt captions.srt] [--model base]
# Examples:
#   ./scripts/transcribe.sh launch-day
#   ./scripts/transcribe.sh launch-day videos/launch-day/edit/audio-take1.wav --model small
#   ./scripts/transcribe.sh launch-day --srt ~/Downloads/auto-captions.srt
#
# Outputs (videos/<video-id>/edit/):
#   words.json      {"words":[{w,start,end}], "segments":[{text,start,end}]}
#   transcript.txt  plain text, one segment per line
#   captions.srt    segment-level subtitles (uploadable + burnable)
#
# Engine: faster-whisper on CPU via uv (no API key; base model ~150MB
# downloads once on first run). --srt imports existing captions instead and
# splits each cue's words evenly across its span (no download, less precise).

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: transcribe.sh <video-id> [audio.wav] [--srt file] [--model name]}"
shift
WAV=""
SRT=""
MODEL="base"
while [ $# -gt 0 ]; do
  case "$1" in
    --srt) SRT="$2"; shift 2 ;;
    --model) MODEL="$2"; shift 2 ;;
    *) WAV="$1"; shift ;;
  esac
done

EDIT_DIR="${PROJECT_DIR}/videos/${VIDEO_ID}/edit"
mkdir -p "${EDIT_DIR}"
if [[ -z "${WAV}" && -z "${SRT}" ]]; then
  shopt -s nullglob
  wavs=("${EDIT_DIR}"/audio-*.wav)
  [[ ${#wavs[@]} -ge 1 ]] || { echo "ERROR: no wav given and none in ${EDIT_DIR}/ (run ingest.sh first)" >&2; exit 1; }
  WAV="${wavs[0]}"
  echo "Using ${WAV}"
fi

python3 - "${VIDEO_ID}" "${WAV}" "${SRT}" "${MODEL}" "${EDIT_DIR}" <<'PY'
import json, re, subprocess, sys

video_id, wav, srt, model, edit = sys.argv[1:6]

def srt_time(s):
    s = s.strip().replace(",", ".")
    hms, _, ms = s.partition(".")
    h, m, sec = hms.split(":")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int((ms + "000")[:3]) / 1000.0

def fmt(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{(ms // 60000) % 60:02d}:{(ms // 1000) % 60:02d},{ms % 1000:03d}"

words, segments = [], []
if srt:
    raw = open(srt, encoding="utf-8-sig").read()
    cues = re.findall(
        r"(\d\d:\d\d:\d\d[,.]\d+)\s*-->\s*(\d\d:\d\d:\d\d[,.]\d+)\s*\n(.*?)(?=\n\n|\Z)",
        raw, re.S)
    if not cues:
        sys.exit("ERROR: no cues parsed from " + srt)
    for s, e, text in cues:
        s, e = srt_time(s), srt_time(e)
        text = re.sub(r"<[^>]+>", "", text).replace("\n", " ").strip()
        if not text:
            continue
        segments.append({"text": text, "start": s, "end": e})
        toks = text.split()
        for i, w in enumerate(toks):
            ws = s + (e - s) * i / len(toks)
            we = s + (e - s) * (i + 1) / len(toks)
            words.append({"w": w, "start": round(ws, 3), "end": round(we, 3)})
else:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("ERROR: faster-whisper not installed. Run with network once:\n"
                 "  uv run --with faster-whisper python3 -c 'import faster_whisper'\n"
                 "or pass --srt <captions.srt> to skip transcription.")
    print(f"Loading faster-whisper '{model}' (first run downloads ~150MB)...",
          flush=True)
    fw = WhisperModel(model, device="cpu", compute_type="int8")
    segs, _ = fw.transcribe(wav, word_timestamps=True, vad_filter=True)
    for sg in segs:
        segments.append({"text": sg.text.strip(),
                         "start": round(sg.start, 3), "end": round(sg.end, 3)})
        for w in (sg.words or []):
            words.append({"w": w.word.strip(),
                          "start": round(w.start, 3), "end": round(w.end, 3)})

with open(f"{edit}/words.json", "w") as f:
    json.dump({"words": words, "segments": segments}, f)
with open(f"{edit}/transcript.txt", "w") as f:
    f.write("\n".join(s["text"] for s in segments) + "\n")
with open(f"{edit}/captions.srt", "w") as f:
    for i, s in enumerate(segments, 1):
        f.write(f"{i}\n{fmt(s['start'])} --> {fmt(s['end'])}\n{s['text']}\n\n")

print(f"{len(words)} words, {len(segments)} segments -> {edit}/words.json")
PY
