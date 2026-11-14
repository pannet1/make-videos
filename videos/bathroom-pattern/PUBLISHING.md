# YouTube Publishing & Distribution Guide

Step-by-step release runbook for the **ApartmentThread Bathroom Pattern (BA-01)** explainer video (`BathroomPattern`).

## 1. Pre-Publishing Checklist & Local Verification

Before uploading to YouTube Studio, ensure all automated verification gates pass:
```bash
# Optional: Regenerate neural voiceovers from text or update/verify the cryptographic manifest & timings
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run vo:bathroom
pnpm run timings:bathroom
pnpm run manifest:bathroom
# (Or verify without regenerating: pnpm run manifest:bathroom:check)

# Standard Pre-Flight Test Suite (Verification + QC Audit):
pnpm test
# (Or: pnpm run check:bathroom)

# Full End-to-End Build & Stage (Manifest + Staging + Verification + QC):
pnpm run build:bathroom

# Or step-by-step:
# 1. Audit pipeline assets, TypeScript, and Remotion bindings
pnpm run verify:bathroom

# 2. Verify broadcast loudness compliance (EBU R128 & video inspection)
pnpm run qc:bathroom
# (Or strict inspection requiring video existence: pnpm run qc:bathroom:strict)
# (Or audit a specific render: ./scripts/qc-bathroom.sh path/to/video.mp4)

# 3. Assemble and stage upload package
pnpm run package:bathroom
# (Or verify staged bundle without re-staging: pnpm run package:bathroom:check)
# (Or stage a specific render: ./scripts/stage-bathroom-package.sh path/to/video.mp4)

# 4. Clean build and staging artifacts (and stop background container):
pnpm run clean:bathroom

# (Or stop background container directly without cleaning: pnpm run stop:bathroom)
```

## 2. Rendering the Production Master or Fast Draft

The master video should be rendered at native 1080p 30 FPS:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && ./render.sh BathroomPattern out/bathroom-pattern.mp4
# Add --stop (or run via npm: pnpm run render:bathroom:stop) to automatically halt the background Docker container upon completion:
./render.sh BathroomPattern out/bathroom-pattern.mp4 --stop
```
*Note:* Rendering 4,284 frames takes approximately 2–4 minutes depending on CPU/GPU hardware.
Once rendered, run `pnpm run package:bathroom` to link `out/bathroom-pattern.mp4` as `03-master-video.mp4` in `dist/bathroom-pattern-youtube/`.

For a quick full-length preview encode, render a 540p draft (0.5x scaling, ultrafast preset):
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && ./render.sh BathroomPattern --draft
# Or render draft and halt container:
pnpm run render:bathroom-draft:stop
```
Running `pnpm run package:bathroom` will link `out/bathroom-pattern-draft.mp4` as `03-draft-video.mp4`, and `pnpm run qc:bathroom` will automatically inspect the draft video when the master is not yet available.

## 3. Staged Upload Package Structure

The staging folder `dist/bathroom-pattern-youtube/` contains all assets ready for browser drag-and-drop:

| File | Type | Target in YouTube Studio |
|---|---|---|
| `00-youtube-metadata.txt` | Metadata | Copy title, description, tags, and category into video upload form |
| `01-thumbnail-1920x1080.png` | Thumbnail | Set as custom video thumbnail |
| `02-subtitles-en-IN.srt` | Subtitles (SRT) | Upload under Subtitles → English (India) with timing |
| `02-subtitles-en-IN.vtt` | Subtitles (VTT) | Alternative WebVTT format for web players & social video |
| `03-master-video.mp4` | Video Master | Drag and drop into YouTube Studio video uploader (or `03-draft-video.mp4` for review) |
| `04-audio-manifest.json` | Audio Manifest | Cryptographic verification archive (SHA-256, duration, loudness) |
| `04-edit-decision-list.json` | Edit Decision List (EDL) | Timeline cut boundaries (5 scenes, 4 joint cut checks) |
| `05-publishing-guide.md` | Release Guide | This step-by-step release runbook |
| `06-social-copy.txt` | Social Copy | Pre-formatted copy-paste posts for YouTube Community, Twitter/X, LinkedIn, Reddit |
| `07-voiceover-script.md` | Voiceover Script | Phonetic delivery guide, cue mappings, and Edge TTS synthesis commands |
| `08-checksums.sha256` | Checksum Manifest | Cryptographic SHA-256 verification archive for all staged bundle files |
| `scene-stills/` | Slide Deck | High-resolution 1080p PNG stills for Twitter/X threads and LinkedIn |

## 4. YouTube Studio Step-by-Step Upload Procedure

1. **Upload File:**
   - Navigate to [YouTube Studio](https://studio.youtube.com).
   - Click **Create → Upload videos** and select `dist/bathroom-pattern-youtube/03-master-video.mp4`.

2. **Basic Details:**
   - **Title:** `How to Automate Bathroom Lighting without Motion Sensors | Apartment Thread`
   - **Description:** Copy the complete description from `00-youtube-metadata.txt` including timestamps (00:00 to 01:56) and the GitHub link.
   - **Thumbnail:** Upload `01-thumbnail-1920x1080.png`.
   - **Playlists:** Select or create `Smart Home & Home Automation` / `Apartment Thread`.
   - **Audience:** Select *No, it's not made for kids*.

3. **Tags & Category:**
   - Expand **Show more**.
   - **Tags:** Paste the comma-separated tag string from `00-youtube-metadata.txt`.
   - **Video Language:** English (India).
   - **Caption Certification:** *None*.
   - **Category:** Science & Technology.

4. **Video Elements:**
   - **Subtitles:** Click **Add** next to Subtitles, select **Upload file → With timing**, and choose `02-subtitles-en-IN.srt`.
   - **End Screen:** Add video link to related project walkthroughs and a subscribe card.
   - **Cards:** Add an info card pointing to the ApartmentThread repository.

5. **Checks & Monetization:**
   - Verify Content ID checks pass with zero copyright flags (all visual graphics and edge-tts neural voiceovers are original assets).

6. **Visibility:**
   - Choose **Public** (or **Schedule** for peak tech audience viewing, typically 18:00–21:00 IST on weekdays).

## 5. Multi-Platform Syndication & Social Promotion

Ready-to-paste social post copy is provided in `dist/bathroom-pattern-youtube/06-social-copy.txt` (and source `videos/bathroom-pattern/SOCIAL_COPY.md`), paired with the pre-rendered 1080p slide deck in `dist/bathroom-pattern-youtube/scene-stills/`:
- **YouTube Community Post:** Hook, bulleted feature breakdown, thumbnail attachment, and call-to-action.
- **Twitter/X Technical Thread:** 5-tweet engineering thread, each paired with `scene-01-problem.png` through `scene-05-local-first.png`.
- **LinkedIn Engineering Post:** Professional embedded systems & edge IoT case study.
- **Reddit (r/homeassistant & r/esp8266):** Technical write-up highlighting GPIO debounce logic, 1100V mains-insulated conduit wiring, and local ESP8266 silicon state machine rules.
  - Attach `scene-stills/` and link the YouTube video in ApartmentThread releases.
