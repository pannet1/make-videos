from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

from faster_whisper import WhisperModel
import logging

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = frozenset({
    ".mp3", ".wav", ".m4a", ".flac", ".ogg", ".opus", ".aac", ".wma", ".webm", ".mpeg", ".mp4", ".m4v",
})
CONFIG_PATH = Path("config.json")


def load_transcription_config() -> Dict[str, Any]:
    """Load transcription settings from config.json."""
    if not CONFIG_PATH.is_file():
        logger.warning("config.json not found, using defaults")
        return {"engine": "fast-whisper", "model_size": "base", "device": "auto", "compute_type": "default"}
    try:
        data = json.loads(CONFIG_PATH.read_text())
        return data.get("transcription", {})
    except (json.JSONDecodeError, OSError) as e:
        logger.warning("Failed to read config.json: %s", e)
        return {"engine": "fast-whisper", "model_size": "base", "device": "auto", "compute_type": "default"}


class CreateTextFromAudioHandler:
    _model_cache: Dict[str, WhisperModel] = {}

    def transcribe(self, audio_file_path: str) -> Dict[str, Any]:
        audio_path = Path(audio_file_path)
        if not audio_path.is_file():
            logger.error("Audio file not found: %s", audio_file_path)
            return {"success": False, "message": f"Audio file not found: {audio_file_path}"}
        ext = audio_path.suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            return {"success": False, "message": f"Unsupported audio format: {ext}"}

        config = load_transcription_config()
        model_name = config.get("model_size", "base")
        model = self._load_model(model_name, config)
        if model is None:
            return {"success": False, "message": f"Failed to load transcription model: {model_name}"}

        try:
            segments, info = model.transcribe(
                str(audio_path),
                task="translate",
                beam_size=config.get("beam_size", 3),
                vad_filter=config.get("vad_filter", False),
            )
            if info and info.duration and info.duration > 1800:
                logger.warning(
                    "Long audio file detected (%.1f min). Transcription may use significant memory.",
                    info.duration / 60,
                )
        except Exception as e:
            logger.exception("Transcription failed")
            return {"success": False, "message": f"Transcription process failed: {e}"}

        text_list = [segment.text.strip() for segment in segments if segment.text.strip()]
        text = " ".join(text_list)
        if not text:
            return {"success": False, "message": "Transcription produced empty result."}

        output_path = audio_path.with_suffix(".txt")
        try:
            output_path.write_text(text, encoding="utf-8")
        except OSError as e:
            return {"success": False, "message": f"Could not write output file: {output_path}"}

        logger.info("Transcription saved to %s", output_path)
        return {"success": True, "message": "Transcription completed", "output_file": str(output_path)}

    def _load_model(self, model_name: str, config: Dict[str, Any]) -> WhisperModel | None:
        if model_name in self._model_cache:
            return self._model_cache[model_name]
        try:
            device = config.get("device", "auto")
            compute_type = config.get("compute_type", "default")
            model = WhisperModel(model_name, device=device, compute_type=compute_type)
            self._model_cache[model_name] = model
            return model
        except Exception as e:
            logger.error("Model load failed: %s", e)
            return None
