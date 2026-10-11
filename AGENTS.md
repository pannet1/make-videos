# AGENTS.md — Video Generation Guidelines

## Human-in-the-Loop Render Rule
- **NEVER** run `./render.sh` or any long-running video rendering commands directly from the agent.
- Video rendering is heavy and long-running. Always assemble the composition, verify with single-frame stills (`./still.sh`), and **hand over the final render command for the user to run**.

## Raw-footage edits
- Pipeline order: `ingest.sh` → `transcribe.sh` → propose EDL (human approves) → `cut.sh` → `qc.sh` → `assemble.sh`. Full method: `docs/raw-footage.md`.
- The ffmpeg steps (ingest/cut/qc/assemble) are seconds-to-minutes: run them directly and report. Transcription downloads a ~150MB model once — flag it, don't hide it.
- Verify joints visually via `edit/qc/` stills before assembling.
