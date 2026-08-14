# make-videos

A small video studio for EcomSense explainer videos. Built on
[rendiv](https://opencode.ai) (React compositions) with edge-tts voiceovers
and FFmpeg stitching. Rendering runs inside a Docker container because
Playwright Chromium only works in that environment on this machine.

## Layout

One folder per video. All user-authored content lives under `videos/` and
`src/videos/`; everything under `public/<video-id>/` is generated.

```
make-videos/
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