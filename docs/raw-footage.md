# Raw-footage workflow: edit by prompt, without watching video

For talking heads, tutorials, screen recordings — anything shot on a camera.
The agent **reads** (transcript + contact sheets + joint stills) instead of
watching, so edits stay cheap. No API keys anywhere in this path.

## Pipeline

```
sources/  → ingest.sh → transcribe.sh → (agent proposes EDL, human OKs)
          → cut.sh → qc.sh → assemble.sh → final.mp4
```

1. **Ingest** — copy clips in, normalize to house format, preview cheaply:
   ```bash
   ./scripts/ingest.sh launch-day ~/Videos/take1.mp4 ~/Videos/take2.mp4
   ```
   Produces `videos/launch-day/edit/`: `norm-*.mp4` (1080p30),
   `audio-*.wav` (16k mono), `contact-*.jpg` (12-frame sheets), `probe.tsv`.
   Look at the contact sheets + probe table, not the footage.
2. **Transcribe** — word-level timing for word-boundary cuts:
   ```bash
   ./scripts/transcribe.sh launch-day            # faster-whisper, CPU, ~150MB model DL once
   ./scripts/transcribe.sh launch-day --srt auto-captions.srt   # offline fallback
   ```
   Produces `words.json`, `transcript.txt`, `captions.srt` in `edit/`.
3. **Propose cuts** — agent reads `transcript.txt` (+ `words.json` times) and
   writes `edit/edl.json`:
   ```json
   {"cuts": [
     {"src": "edit/norm-take1.mp4", "ss": 1.2, "to": 10.5},
     {"src": "edit/norm-take2.mp4", "ss": 0.0, "to": 6.0, "speed": 1.5, "label": "demo"}
   ]}
   ```
   Cut filler (`umm`, `uh`), false starts, dead space. **Human approves the
   EDL before cutting** — it is the edit, in text form.
4. **Cut** — trims, speed ramps, 10ms pop-free joints, concat:
   ```bash
   ./scripts/cut.sh launch-day videos/launch-day/edit/edl.json
   ```
5. **QC** — duration assert, loudness summary, joint stills, dead-air scan:
   ```bash
   ./scripts/qc.sh launch-day videos/launch-day/edit/cut.mp4 videos/launch-day/edit/edl.json
   ```
   View `edit/qc/b*.png` (0.1s each side of every joint) for jump cuts.
6. **Assemble** — VO mixed under ducked cut-audio, loudnorm master,
   optional burned captions, thumbnail:
   ```bash
   ./scripts/generate-vo.sh launch-day          # same VO layout as prompt-made videos
   ./scripts/assemble.sh launch-day --burn
   ```
   Output: `edit/final.mp4` + `edit/thumb.png`. `--no-vo` skips voiceover.

## Prompt-made vs raw footage (dedupe note)

Prompt-made videos (rendiv compositions) and raw edits share: the `videos/<id>/`
layout, `generate-vo.sh` voiceovers, `captions.srt` subtitles, sidecar/thumbnail
conventions, and `render.sh` vs `assemble.sh` as the final step. Don't rebuild
either side's tooling for the other — stills narration uses PhotoSlide-style
Ken Burns; raw footage uses ffmpeg trim/concat. Different engines, same project
shape on purpose.
