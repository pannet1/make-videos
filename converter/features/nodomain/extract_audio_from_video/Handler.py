from __future__ import annotations

import glob
import os
import subprocess
from typing import Any, Dict

import logging

logger = logging.getLogger(__name__)

VIDEO_EXTENSIONS = {".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm", ".m4v"}
AUDIO_CODEC_EXT_MAP = {
    "aac": ".m4a",
    "mp3": ".mp3",
    "opus": ".opus",
    "vorbis": ".ogg",
    "flac": ".flac",
    "wav": ".wav",
    "ac3": ".ac3",
    "eac3": ".eac3",
    "pcm_s16le": ".wav",
}
AUDIO_EXTENSIONS = {ext for ext in AUDIO_CODEC_EXT_MAP.values()}


class ExtractAudioFromVideoHandler:

    def extract_audio(self, video_path: str, data_dir: str) -> Dict[str, Any]:
        if not os.path.isfile(video_path):
            logger.error(f"Video file not found: {video_path}")
            return {"success": False, "message": f"Video file not found: {video_path}"}

        if not self._is_video(video_path):
            logger.warning(f"Not a video file: {video_path}")
            return {"success": False, "message": "Not a video file"}

        audio_codec = self._get_audio_codec(video_path)
        if audio_codec is None:
            logger.error(f"Cannot determine audio codec for {video_path}")
            return {"success": False, "message": "Cannot determine audio codec"}

        output_ext = AUDIO_CODEC_EXT_MAP.get(audio_codec, f".{audio_codec}")
        stem = os.path.splitext(os.path.basename(video_path))[0]
        output_path = os.path.join(data_dir, f"{stem}{output_ext}")

        if self._audio_file_exists(stem, data_dir):
            logger.info(f"Audio file already exists for {video_path}, skipping")
            return {"success": False, "message": "Audio file already exists", "output_path": output_path}

        logger.info("Extracting audio from %s to %s", video_path, output_path)
        logger.info("This may take a while — ffmpeg is running (timeout: 3600s)")
        try:
            proc = subprocess.Popen(
                ["ffmpeg", "-y", "-i", video_path, "-vn", "-acodec", "copy", output_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            # Periodically log heartbeat while ffmpeg runs
            import threading as _thr
            _heartbeat_stop = _thr.Event()
            def _heartbeat() -> None:
                elapsed = 0
                while not _heartbeat_stop.wait(30):
                    elapsed += 30
                    logger.info("Still converting %s ... (%ds elapsed)", os.path.basename(video_path), elapsed)
            _hb = _thr.Thread(target=_heartbeat, daemon=True)
            _hb.start()
            try:
                stdout_data, stderr_data = proc.communicate(timeout=3600)
            finally:
                _heartbeat_stop.set()
            result = subprocess.CompletedProcess(proc.args, proc.returncode, stdout_data, stderr_data)
        except FileNotFoundError:
            logger.error("ffmpeg not found")
            return {"success": False, "message": "ffmpeg not found"}
        except subprocess.TimeoutExpired:
            logger.error(f"ffmpeg timed out for {video_path}")
            return {"success": False, "message": "ffmpeg timed out"}

        if result.returncode != 0:
            logger.error("ffmpeg failed for %s: %s", video_path, result.stderr)
            return {"success": False, "message": f"ffmpeg failed: {result.stderr}"}

        logger.info(f"Successfully extracted audio to {output_path}")
        return {"success": True, "message": "Audio extracted successfully", "output_path": output_path}

    def _is_video(self, file_path: str) -> bool:
        ext = os.path.splitext(file_path)[1].lower()
        return ext in VIDEO_EXTENSIONS

    def _audio_file_exists(self, stem: str, data_dir: str) -> bool:
        pattern = os.path.join(data_dir, f"{stem}.*")
        matches = glob.glob(pattern)
        for match in matches:
            ext = os.path.splitext(match)[1].lower()
            if ext in AUDIO_EXTENSIONS:
                return True
        return False

    def _get_audio_codec(self, video_path: str) -> str | None:
        try:
            result = subprocess.run(
                ["ffprobe", "-v", "error", "-select_streams", "a:0",
                 "-show_entries", "stream=codec_name",
                 "-of", "default=noprint_wrappers=1:nokey=1", video_path],
                capture_output=True,
                text=True,
                timeout=30,
            )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return None
        if result.returncode != 0:
            return None
        codec = result.stdout.strip()
        if not codec:
            return None
        return codec.lower()

