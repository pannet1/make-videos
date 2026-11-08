# Competitive Evaluation — `make-videos`

*Audit date: 2026-11-08. Method: local code review (src/ compositional code + docs and the two workflow docs) compared against live public projects via web research.*

## What it is

Two half-projects in one repo:

- **Mode A — from a prompt:** React scenes in the `rendiv` framework, rendered headless by Chromium in Docker; prompt → scene scaffolding → VO timing → SD storyboard batch (shared style/negative prompts) → still/draft/master render ladder; Tamil/English AI voiceover.
- **Mode B — from raw footage:** word-level transcript → agent proposes `edl.json` cuts → human approval → QC joint stills → local ffmpeg assemble. No API keys. Documented EDL format, approval rules, cheat sheet — genuinely good docs.

## Competitive landscape (as of Nov 2026)

| Competitor | Scale | Idea |
|---|---|---|
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | ~71k★ | The dominant React-make-video framework; AI agents writing Remotion scenes is a standard workflow |
| [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | high (140k★-class) | Keyword → finished short video (LLM script, stock, TTS, captions), one-click web UI |
| [FujiwaraChoki/MoneyPrinter](https://github.com/FujiwaraChoki/MoneyPrinter) | ~14k★ | Automated YouTube Shorts via MoviePy |
| [FireRedTeam/FireRed-OpenStoryline](https://github.com/FireRedTeam/FireRed-OpenStoryline) | ~3.6k★ | AI editing agent: natural language → edits on real footage |
| [Cassette-Editor/oh-my-cassette](https://github.com/Cassette-Editor/oh-my-cassette) | ~216★ | Video-editing MCP server for Claude Code/OpenCode — same premise from the tool side |
| [midrender/revideo](https://github.com/midrender/revideo) | ~4.2k★ | Open-source "create videos with code" alternative |

## Where we win

- **Mode B is the real asset:** transcript → `edl.json` → human approval → QC stills → assemble is more careful than most rivals' autonomous cuts, fully local, zero API keys — and the EDL file + approval gate is the publishable, well-documented idea.
- **Tamil voiceover** edge (`ta-IN-ValluvarNeural`) — rare in every rival.
- Mode A is a well-oiled personal pipeline (scaffolds, timing, storyboard batch) — works, but as personal tooling.

## Where we lose

- **Prompt→scene-code is not unique**: Remotion + Claude/Xcode-style agents is the mainstream pattern (e.g. noelpuig/claude-explains); MoneyPrinterTurbo covers prompt→video far more accessibly.
- Mode A is locked to `rendiv` — a niche, less-documented private-framework Remotion clone (node_modules-bound, not public). Machine-specific (`render.sh`, `install-docker.sh`), no CI.
- Mode B's agent-cuts-from-transcript is covered by FireRed-OpenStoryline and oh-my-cassette; the differentiator is local-only + approval-humane + EDL-as-schema, not the concept.

## Verdict

**Keep private / split.** Mode A: "use Remotion instead" is the correct call. If anything publishes, it is **Mode B as a standalone "agent EDL cutter" toolkit**, with the EDL schema documented as the interface other agents can plug into.

## Top improvements

1. **Make rendiv optional** (migrate Mode A to Remotion) — hired-by-community docs, huge ecosystem, anyone can run it; removes the private-framework hostage problem.
2. **Publish Mode B alone** with the `edl.json` schema as the official interface — other agents/editors producing EDLs make it a hub, not a one-off script.
