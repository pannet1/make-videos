# navaratri-sadhana — The Ultimate Navaratri Sadhana (Tamil, 10:30)

10:30 · 1920×1080 · 30fps · 18,900 frames. Tamil voiceover, symbolic visuals, no on-screen text.

## Layout

- Scenes: `src/scenes/` (HookIntro, Foundation, Phase1, Phase2, Phase3, Outro)
- Shared visuals: `src/components/`, `src/theme.ts`
- Master timeline: `src/NavaratriSadhana.tsx` (VO lives inside each scene)
- Thumbnail still: `src/Thumbnail.tsx` (Kalaratri, Day 7 Navadurga, public domain)
- VO source: `videos/navaratri-sadhana/vo/*.txt`
- VO audio: `public/navaratri-sadhana/vo/*.mp3` (edge-tts `ta-IN-ValluvarNeural`)
- Subtitles: `videos/navaratri-sadhana/captions.srt` (Tamil, upload in YouTube Studio)
- Script: `videos/navaratri-sadhana/VOICEOVER_SCRIPT.md`
- Photos: `public/navaratri-sadhana/photos/` (slideshow stills, slow Ken Burns drift)

## Photo credits (paste into YouTube description)

- Sunrise: Basile Morin, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Mountains_clouds_Mekong_and_dwellings_from_Mount_Phou_Si_at_sunrise_in_Luang_Prabang_Laos.jpg
- Diyas: Sneha G Gupta, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Rows_of_diyas.jpg
- Journal: Thought Catalog (Unsplash), CC0 — https://commons.wikimedia.org/wiki/File:Journaling_over_coffee_(Unsplash).jpg
- Meditating yogi: Vyacheslav Argenberg, CC BY 4.0 — https://commons.wikimedia.org/wiki/File:Banyan_tree_in_meditation,_Yogi_in_meditation,_Paliem,_Goa,_India.jpg
- Seed: Amada44, public domain — https://commons.wikimedia.org/wiki/File:Date_Seed_sprouting.jpg
- Devotees: DesiBoy101, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Devotees_praying_at_the_Panchmukhi_Maruti_Temple,_Pune.jpg
- Big Temple sunrise: MADHURANTHAKAN JAGADEESAN, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:N-TN-C192_Sunrise-Perspective-of-BigTemple.jpg
- Thanjavur temple: KARTY JazZ, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:1000_years_Old_Thanjavur_Brihadeeshwara_Temple_View_at_Sunrise.jpg
- Kalaratri: early 19th century, via British Museum, public domain — https://commons.wikimedia.org/wiki/File:Kalaratri.jpg

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
./render.sh NavaratriThumbnail --still   # verify still
./render.sh NavaratriSadhana --draft     # rough draft (960x540, fast)
./render.sh NavaratriSadhana             # production master (1920x1080)
```

Act spot-checks (visual + VO, minutes each):

```bash
./render.sh NavaratriHook
./render.sh NavaratriFoundation
./render.sh NavaratriPhase1
./render.sh NavaratriPhase2
./render.sh NavaratriPhase3
./render.sh NavaratriOutro
```
