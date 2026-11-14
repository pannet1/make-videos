# The Bathroom Pattern: Voiceover Production Script & Delivery Guide

> **Voice Engine:** Microsoft Edge Neural TTS (`en-IN-PrabhatNeural`)  
> **Source Directory:** `videos/bathroom-pattern/vo/*.txt`  
> **Synthesized Audio:** `public/bathroom-pattern/vo/{00..04}.mp3` + `pad.mp3`  
> **Total Runtime:** 4,284 frames @ 30 FPS (142.80 seconds / 2m 22.8s)  
> **Language / Accent:** Indian English (`en-IN`), professional architectural & electrical engineering tone.

---

## Technical Pronunciation & Audio Delivery Guidelines

| Term | Phonetic Guide | Context & Delivery Note |
|---|---|---|
| **mmWave** | *millimeter wave* / *em-em-wave* | Emphasize 24 GHz high-frequency radar physics. |
| **PIR** | *P-I-R* (individual letters) | Passive Infrared optical detection. |
| **MC-38** | *em-see thirty-eight* | Standard surface-mount magnetic reed switch. |
| **Tinxy** | *tink-see* | Indian modular in-wall smart switchplate brand. |
| **ESP8266** | *E-S-P eight-two-six-six* | In-wall Wi-Fi microcontroller silicon. |
| **S2 Input** | *S-two* | Decoupled switch input used as in-wall dummy channel. |
| **Reed switch** | *reed switch* | Hermetically sealed glass capsule dry contact. |
| **Jamb** | *jam* (silent 'b') | Exterior structural door frame. |

---

## Chapter 1: Why Smart Bathrooms Fail (00:00 – 00:25)
- **Sub-Composition:** `BathroomScene1Problem`
- **Frame Range:** `0 – 765` (766 frames / 25.53s)
- **Audio File:** `00.mp3` (22.25s) + silence padding
- **Tone:** Analytical, problem-focused, addressing ubiquitous frustration.

```text
[Cue 01 | 00:00] Most smart bathrooms fail for one simple reason: sensors hate steam.
[Cue 02 | 00:07] PIR motion sensors can't see through glass shower cabins, mmWave radars suffer from reflection noise, and battery-powered sensors die in high humidity.
[Cue 03 | 00:17] Even worse, naive rules like "turn light on when door closes" leave you stepping into pitch darkness.
```

**TTS Generation Command:**
```bash
edge-tts --voice en-IN-PrabhatNeural --rate=+0% \
  --text "Most smart bathrooms fail for one simple reason: sensors hate steam. PIR motion sensors can't see through glass shower cabins, mmWave radars suffer from reflection noise, and battery-powered sensors die in high humidity. Even worse, naive rules like \"turn light on when door closes\" leave you stepping into pitch darkness." \
  --write-media public/bathroom-pattern/vo/00.mp3
```

---

## Chapter 2: Physical Boundary Determinism (00:25 – 00:54)
- **Sub-Composition:** `BathroomScene2Sensor`
- **Frame Range:** `766 – 1633` (868 frames / 28.93s)
- **Audio File:** `01.mp3` (26.33s) + silence padding
- **Tone:** Pragmatic, decisive, highlighting low-cost mechanical elegance.

```text
[Cue 04 | 00:25] The Apartment Thread bathroom pattern solves this with physical boundary determinism.
[Cue 05 | 00:34] Because every bathroom has a door, we use a simple, passive MC-38 magnetic reed switch.
[Cue 06 | 00:42] Sourced for under sixty rupees, the magnet mounts on the moving door leaf, while the sensor body mounts on the exterior door jamb, completely isolated from hot shower steam and condensation.
```

**TTS Generation Command:**
```bash
edge-tts --voice en-IN-PrabhatNeural --rate=+0% \
  --text "The Apartment Thread bathroom pattern solves this with physical boundary determinism. Because every bathroom has a door, we use a simple, passive MC-38 magnetic reed switch. Sourced for under sixty rupees, the magnet mounts on the moving door leaf, while the sensor body mounts on the exterior door jamb, completely isolated from hot shower steam and condensation." \
  --write-media public/bathroom-pattern/vo/01.mp3
```

---

## Chapter 3: In-Wall Dummy Channel Wiring (00:54 – 01:20)
- **Sub-Composition:** `BathroomScene3Wiring`
- **Frame Range:** `1634 – 2410` (777 frames / 25.90s)
- **Audio File:** `02.mp3` (22.25s) + silence padding
- **Tone:** Practical retrofit, focused on standard Indian modular switchboard installations.

```text
[Cue 07 | 00:54] In Indian apartments, the switchboard is directly adjacent to the door frame.
[Cue 08 | 01:03] Instead of adding a wireless transmitter with batteries, we pull a thin, mains-insulated two-core wire straight into the switchboard.
[Cue 09 | 01:11] Connected to switch input S2 of an in-wall Tinxy module as a dummy channel, the dry contact triggers the onboard microcontroller directly.
```

**TTS Generation Command:**
```bash
edge-tts --voice en-IN-PrabhatNeural --rate=+0% \
  --text "In Indian apartments, the switchboard is directly adjacent to the door frame. Instead of adding a wireless transmitter with batteries, we pull a thin, mains-insulated two-core wire straight into the switchboard. Connected to switch input S2 of an in-wall Tinxy module as a dummy channel, the dry contact triggers the onboard microcontroller directly." \
  --write-media public/bathroom-pattern/vo/02.mp3
```

---

## Chapter 4: The 4-State Presence Engine (01:20 – 01:56)
- **Sub-Composition:** `BathroomScene4StateMachine`
- **Frame Range:** `2411 – 3483` (1,073 frames / 35.77s)
- **Audio File:** `03.mp3` (33.19s) + silence padding
- **Tone:** Logical, authoritative, walking step-by-step through the self-correcting cycle.

```text
[Cue 10 | 01:20] A sub-five-millisecond state machine runs directly on chip silicon.
[Cue 11 | 01:28] When the door opens from outside with the light off, the light turns on instantly before you step inside, starting a sixty-second entry timer.
[Cue 12 | 01:38] When you pull the door shut, occupancy latches: lights and exhaust fan stay locked on continuously, even if you are standing completely still in the shower.
[Cue 13 | 01:48] When you finish and open the door, a sixty-second exit timer begins, turning everything off once vacant.
```

**TTS Generation Command:**
```bash
edge-tts --voice en-IN-PrabhatNeural --rate=+0% \
  --text "A sub-five-millisecond state machine runs directly on chip silicon. When the door opens from outside with the light off, the light turns on instantly before you step inside, starting a sixty-second entry timer. When you pull the door shut, occupancy latches: lights and exhaust fan stay locked on continuously, even if you are standing completely still in the shower. When you finish and open the door, a sixty-second exit timer begins, turning everything off once vacant." \
  --write-media public/bathroom-pattern/vo/03.mp3
```

---

## Chapter 5: 100% Local-First Architecture (01:56 – 02:22)
- **Sub-Composition:** `BathroomScene5LocalFirst`
- **Frame Range:** `3484 – 4283` (800 frames / 26.67s)
- **Audio File:** `04.mp3` (24.19s) + silence padding
- **Tone:** Confident, inspiring, underscoring privacy, durability, and cost-effectiveness.

```text
[Cue 14 | 01:56] Because this logic runs locally on the switchboard's microcontroller, it works with zero cloud and zero hub dependency.
[Cue 15 | 02:05] Even if Wi-Fi, Thread, or Home Assistant goes offline, the bathroom automates seamlessly.
[Cue 16 | 02:13] And the physical wall switches retain complete mechanical override at all times. Reliable, shower-proof, and battery-free.
```

**TTS Generation Command:**
```bash
edge-tts --voice en-IN-PrabhatNeural --rate=+0% \
  --text "Because this logic runs locally on the switchboard's microcontroller, it works with zero cloud and zero hub dependency. Even if Wi-Fi, Thread, or Home Assistant goes offline, the bathroom automates seamlessly. And the physical wall switches retain complete mechanical override at all times. Reliable, shower-proof, and battery-free." \
  --write-media public/bathroom-pattern/vo/04.mp3
```

---

## Audio Loudness & Broadcast Quality Control (EBU R128)

To inspect integrated loudness (LUFS), True Peak, and Loudness Range (LRA) across all synthesized voiceover tracks:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run qc:bathroom
```

### Verified Loudness Compliance Baseline

| Scene | Duration | Integrated Loudness | True Peak | Loudness Range (LRA) | YouTube / Broadcast Status |
|---|---|---|---|---|---|
| **Scene 1** | 25.25s | -16.7 LUFS | -2.0 dBFS | 3.1 LU | Passed (Complies with -14 LUFS target) |
| **Scene 2** | 28.66s | -16.7 LUFS | -2.1 dBFS | 2.1 LU | Passed (Complies with -14 LUFS target) |
| **Scene 3** | 25.63s | -16.7 LUFS | -1.9 dBFS | 2.3 LU | Passed (Complies with -14 LUFS target) |
| **Scene 4** | 35.50s | -16.7 LUFS | -2.0 dBFS | 1.9 LU | Passed (Complies with -14 LUFS target) |
| **Scene 5** | 26.38s | -16.7 LUFS | -1.7 dBFS | 2.3 LU | Passed (Complies with -14 LUFS target) |

---

## Voiceover Audio Manifest & Cryptographic Integrity

All synthesized audio tracks are cataloged in `videos/bathroom-pattern/vo/manifest.json` with exact duration bounds, frame allocations, EBU R128 loudness metrics, and SHA-256 cryptographic hashes:

| File | Scene | Duration | Allocated Frames | Audio Frames | Safety Buffer | SHA-256 Hash (Prefix) |
|---|---|---|---|---|---|---|
| `00.mp3` | Scene 1 | 25.25s | 766 frames | 757.44 frames | 8.56 frames | `0595b891...` |
| `01.mp3` | Scene 2 | 28.66s | 868 frames | 859.68 frames | 8.32 frames | `c4914032...` |
| `02.mp3` | Scene 3 | 25.63s | 777 frames | 768.96 frames | 8.04 frames | `16a83cca...` |
| `03.mp3` | Scene 4 | 35.50s | 1,073 frames | 1,064.88 frames | 8.12 frames | `0a91b143...` |
| `04.mp3` | Scene 5 | 26.38s | 800 frames | 791.28 frames | 8.72 frames | `ec14f61f...` |
| `pad.mp3` | Background | 147.05s | — | — | — | `f0fac7aa...` |

The manifest is verified automatically by `pnpm run verify:bathroom` and bundled into `dist/bathroom-pattern-youtube/04-audio-manifest.json` during packaging.

---

## Automated Verification & Packaging

To run the standard pre-flight test suite (verification + QC loudness audit):
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm test
# (Or: pnpm run check:bathroom)
# (Or strict QC inspection requiring video presence: pnpm run qc:bathroom:strict)
```

To run the complete end-to-end build and staging pipeline:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run build:bathroom
```

To verify script synchronization, audio file presence, captions, and composition builds, run:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run verify:bathroom
```

To stage all publication assets (metadata, thumbnail, subtitles, slide stills) for YouTube Studio:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run package:bathroom
```

To recalculate and verify 30fps frame timings across all scenes:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run timings:bathroom
```

To re-generate the cryptographic manifest and EDL after audio revisions:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run manifest:bathroom
# (Or verify without re-generating: pnpm run manifest:bathroom:check)
```

To stage or verify the distribution bundle:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run package:bathroom
# (Or verify staged bundle non-destructively: pnpm run package:bathroom:check)
```

To halt the background render container when finished:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run stop:bathroom
```

To batch synthesize all 5 voiceover tracks from `vo/*.txt`:
```bash
cd /home/pannet1/programs/github.com/pannet1/make-videos && pnpm run vo:bathroom
```
