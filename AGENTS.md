# AGENTS.md — Video Generation Guidelines

## Human-in-the-Loop Render Rule
- **NEVER** run `./render.sh` or any long-running video rendering commands directly from the agent.
- Video rendering is heavy and long-running. Always assemble the composition, verify with single-frame stills (`./still.sh`), and **hand over the final render command for the user to run**.
