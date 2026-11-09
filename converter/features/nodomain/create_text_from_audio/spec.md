# create_text_from_audio — nodomain Feature

## Overview
Convert any audio file, including multilingual audio (Tamil and English mixed), to English text. The output is saved to a file named `<audio_filename>.txt` in the same directory as the input. The transcription model is selected via a configuration file; currently, **fast-whisper** is specified. This feature will be implemented by main.py sequentially only after the audio file is completely written. The main.py is already watching the data/ folder for changes in its contents.

## Input / Output
| Direction | Format | Description |
|-----------|--------|-------------|
| Input | Audio file (e.g., WAV, MP3) | The audio to transcribe. Must be accessible by the handler (file path or uploaded bytes). |
| Output | Text file (`<input_filename>.txt`) | Contains the English transcription of the audio. |

## Business Logic Constraints
* Use `fast-whisper` (Whisper model) for transcription.
* The model path/name must be read from a configuration file (e.g., `config.yaml`) under a key like `transcription.model`.
* Support mixed-language audio (Tamil and English) and produce an English-only transcript.
* Output file must be named `<original_audio_filename_without_extension>.txt` and written to the same directory as the input audio.
* If the input audio file is provided as an uploaded file, save it temporarily, process, then delete the temporary copy.

## Error Cases
| Condition | Error | Message |
|-----------|-------|-------------|
| Input audio file does not exist or is inaccessible | `FileNotFoundError` | "Audio file not found: {file_path}" |
| Audio format is unsupported by fast-whisper | `ValueError` | "Unsupported audio format: {format}" |
| Model configuration missing or empty | `ConfigurationError` | "Transcription model not specified in configuration." |
| fast-whisper model fails to load | `RuntimeError` | "Failed to load transcription model: {detail}" |
| Transcription process returns no text | `ValueError` | "Transcription produced empty result." |
| Output file cannot be written | `IOError` | "Could not write output file: {file_path}" |

## Dependencies
* **fast-whisper** (for transcription — must be installed in the project environment)
* Configuration file reader (e.g., `shared/config.py` or similar utility to load YAML/JSON)
* Standard libraries: `os`, `pathlib`, `logging`

## Code Standards
All code must use type annotations per PEP 484.
