# navaratri-sadhana — The Ultimate Navaratri Sadhana (Tamil, 10:30)

10:30 · 1920×1080 · 30fps · 18,900 frames. Tamil voiceover, English on-screen text.

## Layout

- Scenes: `src/scenes/` (HookIntro, Foundation, Phase1, Phase2, Phase3, Outro)
- Shared visuals: `src/components/`, `src/theme.ts`
- Master timeline: `src/NavaratriSadhana.tsx` (one `<Audio>` per act)
- Thumbnail still: `src/Thumbnail.tsx` (Kalaratri, Day 7 Navadurga, public domain)
- VO source: `videos/navaratri-sadhana/vo/*.txt`
- VO audio: `public/navaratri-sadhana/vo/*.mp3` (edge-tts `ta-IN-ValluvarNeural`)
- Subtitles: `videos/navaratri-sadhana/captions.srt` (Tamil, upload in YouTube Studio)
- Script: `videos/navaratri-sadhana/VOICEOVER_SCRIPT.md`

## Regenerate voiceover

```bash
for n in 01-hook 02-foundation 03-phase1 04-phase2 05-phase3 06-outro; do
  i="${n%%-*}"
  uv tool run --from edge-tts edge-tts --voice ta-IN-ValluvarNeural \
    --text "$(cat videos/navaratri-sadhana/vo/${n}.txt)" \
    --write-media public/navaratri-sadhana/vo/${i}.mp3
done
```

Durations must stay under scene budgets: 90 / 90 / 150 / 120 / 120 / 60s.

## Render (Docker — never run long renders from an agent)

```bash
./render.sh Thumbnail out/thumbnail.png --still   # verify still
./render.sh NavaratriSadhana out/navaratri-draft.mp4 --concurrency 8 --preset ultrafast --crf 28   # rough draft
./render.sh NavaratriSadhana out/navaratri-sadhana.mp4 --concurrency 8 --preset medium --crf 16    # production master
```
