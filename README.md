# make-videos

Two ways to make a video. Everything else in this repo serves one of them.

- **A. From a prompt** — you describe the video; scenes are React code rendered
  by Chromium in Docker (rendiv). Tamil/English AI voiceover included.
- **B. From raw footage** — you drop camera clips in a folder; an agent cuts
  them by reading the transcript. No API keys, all local FFmpeg.

## Prereqs (once)

```bash
./install-docker.sh        # Docker; you run it (needs sudo)
npm ci                     # node deps
sudo apt-get install -y ffmpeg
pip install uv             # for edge-tts voiceover + faster-whisper transcription
docker exec rendiv sh -c "cd /workspace && ./node_modules/.bin/playwright install chromium"  # browsers, once
```

## A. Video from a prompt

```bash
./scripts/new-video.sh <video-id> <CompositionName>   # scaffold
# 1. write narration: videos/<video-id>/vo/NN-name.txt (one file per chapter)
# 2. drop images/music: videos/<video-id>/assets/
./scripts/generate-vo.sh <video-id>                   # Tamil/English AI voiceover → public/<video-id>/vo/
./scripts/timings.sh <video-id>                       # prints VO_START/VO_LEN → paste into composition
# 3. build scenes: src/videos/<video-id>/<CompositionName>.tsx (load the rendiv-video skill first)
./render.sh <CompositionName> --still                 # verify a frame (fast)
./render.sh <CompositionName> --draft                 # rough draft, 960x540 (NavaratriSadhana only)
./render.sh <CompositionName>                         # production master, 1920x1080 (you run it)
```

## B. Video from raw footage

```bash
./scripts/ingest.sh <video-id> <clip>...              # normalize to 1080p30, wav, contact sheets
./scripts/transcribe.sh <video-id>                    # word-level transcript (or --srt file to skip)
# 1. agent writes videos/<video-id>/edit/edl.json from the transcript — YOU approve it
./scripts/cut.sh <video-id> videos/<video-id>/edit/edl.json        # trims, speed, pop-free joints
./scripts/qc.sh <video-id> videos/<video-id>/edit/cut.mp4 videos/<video-id>/edit/edl.json  # checks + joint stills
./scripts/generate-vo.sh <video-id>                   # optional narration (same as mode A)
./scripts/assemble.sh <video-id> --burn               # VO mix, captions, final.mp4 + thumb.png
```

`edit/edl.json` format: `{"cuts": [{"src": "edit/norm-take1.mp4", "ss": 1.2, "to": 10.5, "speed": 1.0}]}` — times in seconds, `speed` optional (0.25–4.0).

## Cheat sheet

| Want | Command |
|---|---|
| New prompt-made video | `./scripts/new-video.sh <id> <Name>` |
| Voiceover (Tamil default `ta-IN-ValluvarNeural`) | `./scripts/generate-vo.sh <id> [VOICE]` |
| Scene timings from VO | `./scripts/timings.sh <id>` |
| Verify one frame | `./render.sh <Composition> --still [--frame N]` |
| Rough draft | `./render.sh <Composition> --draft` |
| Production master | `./render.sh <Composition>` |
| Ingest footage | `./scripts/ingest.sh <id> <clips...>` |
| Transcribe | `./scripts/transcribe.sh <id> [--srt file]` |
| Cut approved EDL | `./scripts/cut.sh <id> edit/edl.json` |
| Check a cut | `./scripts/qc.sh <id> edit/cut.mp4 edit/edl.json` |
| Final file + thumbnail | `./scripts/assemble.sh <id> [--burn] [--no-vo]` |

## Layout

```
videos/<video-id>/   sources/ (raw clips) · vo/NN-*.txt (narration source)
                     assets/ (images/music) · spec.md · edit/ (transcripts,
                     EDL, cuts, qc stills, final.mp4 — all local work files)
src/                 index.tsx (registers compositions) · shared/ ·
                     videos/<id>/ (prompt-made scene code) · scenes/, components/
public/<video-id>/   generated: vo/*.mp3, photos, assets (gitignored, regenerable)
out/                 renders (gitignored)
```

## Rules

- `out/` and `public/*/` are generated — never commit them (Navaratri media was force-added once as an exception; don't repeat it).
- The EDL and the full render are human-approved steps: agent proposes, you run.
- Photo/music credits go in `videos/<video-id>/README.md` and the YouTube description (most Commons files are CC BY-SA, attribution required).
- Transcription downloads a ~150MB model on first use; everything else is offline.
