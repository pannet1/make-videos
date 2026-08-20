# make-videos

A small video studio for EcomSense explainer videos. Built on
[rendiv](https://opencode.ai) (React compositions) with edge-tts voiceovers
and FFmpeg stitching. Rendering runs inside a Docker container because
Playwright Chromium only works in that environment on this machine.

## Prerequisites

Before you can create videos you need the following installed on your machine.
The `./install-docker.sh` script handles Docker (section 1 below); the rest are
quick one-liners.

### 0. rendiv-video agent skill

If you are using an agent (pi / Claude Code / Codex) to author rendiv
compositions, load the **`rendiv-video`** skill first. It is already bundled at
`.opencode/skill/` in this repo and provides frame-driven animation guidance,
package import rules, and the rendiv CLI workflow.

### 1. Docker

Rendering happens inside a `node:20-bookworm` Docker container (Playwright
Chromium doesn't run natively on this host). Install Docker with the helper
script:

```bash
./install-docker.sh        # runs sudo apt-get … ; you execute it
sudo usermod -aG docker $USER && newgrp $USER  # or log out / back in
```

Verify:

```bash
docker run --rm hello-world
```

### 2. Node.js dependencies (one-time)

Dependencies are already vendored in `node_modules`. After cloning on a fresh
machine:

```bash
npm ci
```

### 3. Audio tooling

Voiceover generation requires:

- **`ffmpeg` + `ffprobe`** — for audio muxing and duration probing.
- **`uv`** (recommended) or **`edge-tts`** — Microsoft neural TTS voices,
  free and no API key needed.

```bash
sudo apt-get install -y ffmpeg
pip install uv            # or: pip install edge-tts
```

### 4. Python 3

Used by `timings.sh` and `new-video.sh` for quick array maths. Should already
be present on most Linux setups (`python3 --version`).

---

## Layout

One folder per video. All user-authored content lives under `videos/` and
`src/videos/`; everything under `public/<video-id>/` is generated.

```
make-videos/
├── install-docker.sh             # one-time Docker installer (needs sudo)
├── render.sh                     # ./render.sh COMPOSITION_ID [OUTPUT]
├── scripts/
│   ├── generate-vo.sh            # ./scripts/generate-vo.sh <video-id> [VOICE]
│   ├── timings.sh                # ./scripts/timings.sh <video-id>
│   └── new-video.sh              # ./scripts/new-video.sh <video-id> <Name>
├── videos/<video-id>/            # per-video source (committed)
│   ├── spec.md                   # narration/chapter spec (source of truth)
│   ├── vo/NN-name.txt            # one narration script per chapter
│   └── assets/                   # images, music (committed)
├── src/
│   ├── index.tsx                 # registers all compositions
│   ├── shared/theme.tsx          # brand + reusable UI (NavBar, tiles, colors)
│   └── videos/<video-id>/        # composition code, one file per video
├── public/<video-id>/            # generated (gitignored)
│   ├── vo/NN.mp3, pad.mp3        # produced by generate-vo.sh
│   └── assets/                   # synced from videos/<video-id>/assets
└── out/                          # rendered mp4s (gitignored)
```

## Making a new video

1. **Scaffold:** `./scripts/new-video.sh <video-id> <CompositionName>`
   (e.g. `./scripts/new-video.sh how-bidding-works HowBiddingWorks`). Creates
   `videos/<video-id>/` (spec stub + vo + assets) and a registered
   composition in `src/videos/<video-id>/`.
2. **Write the spec:** fill in `videos/<video-id>/spec.md` with the chapters.
3. **Write narration:** one file per chapter in `videos/<video-id>/vo/`,
   numbered `NN-name.txt` in order.
4. **Drop assets:** put images/music into `videos/<video-id>/assets/`.
5. **Generate voiceover:** `./scripts/generate-vo.sh <video-id>` produces the
   mp3s, a silence `pad.mp3`, and syncs assets into `public/<video-id>/`.
6. **Get timings:** `./scripts/timings.sh <video-id>` prints
   `VO_START`/`VO_LEN` (30fps, 8-frame scene pad). Paste these into the
   composition.
7. **Build the scenes:** edit the composition in `src/videos/<video-id>/`.
   Reference assets as `staticFile(\`${VIDEO_ID}/assets/...\`)` and VO as
   `staticFile(\`${VIDEO_ID}/vo/NN.mp3\`)`.
8. **Preview:** render a still with the published CLI inside Docker to
   sanity-check a frame, then hand the full render to the user:
   `./render.sh <CompositionName> out/<video-id>.mp4`.

## Voiceover voice

Default `en-IN-PrabhatNeural` (friendly Indian English). Override per video:
`./scripts/generate-vo.sh <video-id> en-US-GuyNeural`.

## Notes

- `VO_START`/`VO_LEN` are authoritative for scene lengths — the composition
  total and the Series durations are derived from them, so keep the arrays in
  sync with `./scripts/timings.sh`.
- Scene animation timing inside each scene is relative to the scene start
  (`useFrame`), so scenes are reusable across videos.
- `public/*/` is gitignored — generated assets never enter the repo.
