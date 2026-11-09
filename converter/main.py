"""Application entry point — watches the configured data dir and converts files sequentially."""
import json
import os
import signal
import sys
from pathlib import Path
from toolkit.async_logger import AsyncLogger
import logging

# Initialize async logging system early so all downstream loggers use it
async_logger = AsyncLogger(show=True)
async_logger.start()

CONFIG_PATH = Path(__file__).parent / "config.json"


def load_data_dir() -> Path:
    """Return the configured watch directory, resolving relative paths against the project root."""
    try:
        data = json.loads(CONFIG_PATH.read_text())
        raw = data.get("data_dir", "data")
    except (json.JSONDecodeError, OSError) as e:
        logger.warning("Failed to read config.json: %s, using default data/", e)
        raw = "data"
    path = Path(raw)
    if path.is_absolute():
        return path
    return (Path(__file__).parent / path).resolve()


def prompt_data_dir() -> Path:
    """On first install, ask for a watch folder (or use the default); remember the choice."""
    marker = Path(__file__).parent / ".data_dir"
    if marker.is_file():
        return Path(marker.read_text().strip())

    print("=== open-converter first-time setup ===")
    print("Choose the folder open-converter should watch for new media files.")
    print("  [Enter] / 'data' -> default data/ folder")
    print("  <path>           -> custom folder (created if it doesn't exist)")
    answer = input("Watch folder [data]: ").strip()
    chosen = answer if answer else "data"

    p = Path(chosen)
    if not p.is_absolute():
        p = (Path(__file__).parent / p).resolve()
    p.mkdir(parents=True, exist_ok=True)

    marker.write_text(str(p) + "\n")
    try:
        config = json.loads(CONFIG_PATH.read_text())
        config["data_dir"] = str(p)
        CONFIG_PATH.write_text(json.dumps(config, indent=2))
    except Exception:
        pass
    return p

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from features.nodomain.extract_audio_from_video.Handler import (
    AUDIO_EXTENSIONS,
    ExtractAudioFromVideoHandler,
    VIDEO_EXTENSIONS,
)
from features.nodomain.create_text_from_audio.Handler import (
    CreateTextFromAudioHandler,
    SUPPORTED_EXTENSIONS as AUDIO_INPUT_EXTS,
)
logger = logging.getLogger(__name__)


_video_handler = ExtractAudioFromVideoHandler()
_audio_handler = CreateTextFromAudioHandler()
_observer: Observer | None = None
_running = False
_processing = False


class _EventHandler(FileSystemEventHandler):
    def on_created(self, event) -> None:
        if not event.is_directory:
            _process_file(event.src_path)

    def on_modified(self, event) -> None:
        if not event.is_directory:
            _process_file(event.src_path)


def _find_audio_file(stem: str, data_dir: str) -> str | None:
    """Return the path of an existing audio file for the given stem, or None."""
    import glob
    pattern = os.path.join(data_dir, f"{stem}.*")
    for match in glob.glob(pattern):
        ext = os.path.splitext(match)[1].lower()
        if ext in AUDIO_EXTENSIONS:
            return match
    return None


def _process_file(file_path: str) -> None:
    global _processing
    if not _running or _processing:
        return

    ext = os.path.splitext(file_path)[1].lower()
    data_dir = os.path.dirname(file_path) or "."

    _processing = True
    try:
        if ext in VIDEO_EXTENSIONS:
            stem = os.path.splitext(os.path.basename(file_path))[0]
            txt_path = Path(data_dir) / f"{stem}.txt"
            if txt_path.is_file():
                logger.info("Text already exists for %s, skipping", file_path)
                return

            # Text doesn't exist — check if audio was already extracted
            audio_path = _find_audio_file(stem, data_dir)
            if audio_path:
                logger.info("Audio already extracted for %s, transcribing", file_path)
            else:
                logger.info("Extracting audio from %s", file_path)
                result = _video_handler.extract_audio(file_path, data_dir)
                if not result.get("success"):
                    logger.warning("Extraction failed: %s", result.get("message"))
                    return
                audio_path = result.get("output_path", "")

            if audio_path and os.path.isfile(audio_path):
                logger.info("Transcribing audio for %s", file_path)
                _audio_handler.transcribe(audio_path)

        elif ext in AUDIO_INPUT_EXTS:
            txt_path = Path(file_path).with_suffix(".txt")
            if txt_path.is_file():
                return
            logger.info("Found audio file creating text from audio")
            result = _audio_handler.transcribe(file_path)
            if result.get("success"):
                logger.info("Transcription complete")
            else:
                logger.warning("Transcription failed: %s", result.get("message"))
    finally:
        _processing = False


def start_watching(data_dir: str = "data") -> None:
    global _observer, _running
    if not os.path.isdir(data_dir):
        os.makedirs(data_dir, exist_ok=True)
    _running = True
    event_handler = _EventHandler()
    _observer = Observer()
    _observer.schedule(event_handler, data_dir, recursive=False)
    _observer.start()
    logger.info("Started watching data folder")
    # Process any files already present in data/
    for fname in sorted(os.listdir(data_dir)):
        fpath = os.path.join(data_dir, fname)
        if os.path.isfile(fpath):
            _process_file(fpath)


def stop_watching() -> None:
    global _observer, _running
    if _observer is not None:
        _observer.stop()
        _observer.join()
        _observer = None
    _running = False


def main() -> None:
    logger.info("Starting %s", Path.cwd().name)
    data_dir = prompt_data_dir()
    logger.info("Watching %s", data_dir)
    start_watching(str(data_dir))

    signal.signal(signal.SIGINT, lambda s, f: (stop_watching(), sys.exit(0)))
    signal.signal(signal.SIGTERM, lambda s, f: (stop_watching(), sys.exit(0)))

    logger.info("Watching data/ for new files. Press Ctrl+C to stop.")
    if _observer is not None:
        _observer.join()


if __name__ == "__main__":
    main()
