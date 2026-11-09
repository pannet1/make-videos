# ExtractAudioFromVideo

Monitor the `data/` folder for new video files. For each new video, extract its audio stream via ffmpeg using stream copy (fastest method — no re-encode). Skip if an audio file for that video already exists. Process one video at a time — no parallel conversions.

## Input / Output
| Role | Detail |
|------|--------|
| Input | Video file placed in `data/` (any format ffmpeg can read: `.mp4`, `.avi`, `.mkv`, `.mov`, etc.) |
| Output | Audio file in `data/` named `<video_stem>.<ext>` where `<ext>` is the container extension matching the source audio codec (e.g. `.aac`, `.mp3`, `.opus`, `.wav`) |

## Business Logic
1. Watch `data/` for new files using `watchdog` (inotify-style).
2. On new file: check if it's a video. If yes and no `<stem>.*` audio file exists in `data/`, extract audio via ffmpeg.
3. ffmpeg command: `ffmpeg -i <input> -vn -acodec copy <output>` — stream copy only, zero re-encode. This is the fastest possible method.
4. If stream copy fails (codec unsupported in output container), log error and skip. No fallback to re-encoding — extraction must be lossless.
5. The output container/extension is chosen to match the source audio codec (e.g. AAC → `.m4a`, MP3 → `.mp3`, Opus → `.opus`).
6. Only one ffmpeg subprocess runs at a time. New videos arriving during conversion are ignored — not queued.

## Edge Cases
- Audio file already exists → skip silently.
- File has no video stream → skip.
- ffmpeg not installed → log error, exit.
- ffmpeg stream copy fails → log error, skip (no re-encode fallback).
- Corrupt/incomplete video → ffmpeg fails, log error, move on.
- Multiple files arrive during conversion → only the current one is processed, rest ignored.
## File Watching
- Watchdog reacts to `on_created` / `IN_CLOSE_WRITE` events.
- Filter by video extensions: `.mp4`, `.mkv`, `.avi`, `.mov`, `.wmv`, `.flv`, `.webm`, `.m4v`.

## Dependencies
- `ffmpeg` (system binary)
- `watchdog` (Python package)
