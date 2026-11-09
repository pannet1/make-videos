from __future__ import annotations

import os
import subprocess
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch, mock_open

import pytest

from .Handler import VIDEO_EXTENSIONS, ExtractAudioFromVideoHandler


@pytest.fixture
def handler() -> ExtractAudioFromVideoHandler:
    return ExtractAudioFromVideoHandler()


@pytest.fixture
def temp_dir() -> str:
    with tempfile.TemporaryDirectory() as tmp:
        yield tmp


class TestExtractAudioFromVideoHandler:

    def test_extract_audio_file_not_found(self, handler: ExtractAudioFromVideoHandler) -> None:
        result = handler.extract_audio("/nonexistent/video.mp4", "/tmp")
        assert result["success"] is False
        assert "Video file not found" in result["message"]

    def test_extract_audio_non_video_file(self, handler: ExtractAudioFromVideoHandler, temp_dir: str) -> None:
        non_video = os.path.join(temp_dir, "text.txt")
        Path(non_video).touch()
        result = handler.extract_audio(non_video, temp_dir)
        assert result["success"] is False
        assert result["message"] == "Not a video file"

    @patch("builtins.open", new_callable=mock_open)
    @patch("os.path.isfile", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_is_video", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_get_audio_codec", return_value="aac")
    @patch.object(ExtractAudioFromVideoHandler, "_audio_file_exists", return_value=True)
    def test_extract_audio_already_exists(
        self, mock_exists: MagicMock, mock_codec: MagicMock, mock_is_video: MagicMock,
        mock_isfile: MagicMock, mock_open_file: MagicMock, handler: ExtractAudioFromVideoHandler, temp_dir: str
    ) -> None:
        video_path = os.path.join(temp_dir, "test.mp4")
        result = handler.extract_audio(video_path, temp_dir)
        assert result["success"] is False
        assert result["message"] == "Audio file already exists"

    @patch("builtins.open", new_callable=mock_open)
    @patch("os.path.isfile", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_is_video", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_get_audio_codec", return_value=None)
    def test_extract_audio_cannot_determine_codec(
        self, mock_codec: MagicMock, mock_is_video: MagicMock,
        mock_isfile: MagicMock, mock_open_file: MagicMock, handler: ExtractAudioFromVideoHandler, temp_dir: str
    ) -> None:
        video_path = os.path.join(temp_dir, "test.mp4")
        result = handler.extract_audio(video_path, temp_dir)
        assert result["success"] is False
        assert result["message"] == "Cannot determine audio codec"

    @patch("builtins.open", new_callable=mock_open)
    @patch("os.path.isfile", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_is_video", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_get_audio_codec", return_value="aac")
    @patch.object(ExtractAudioFromVideoHandler, "_audio_file_exists", return_value=False)
    @patch("subprocess.Popen", side_effect=FileNotFoundError)
    def test_extract_audio_ffmpeg_not_found(
        self, mock_subprocess: MagicMock, mock_exists: MagicMock, mock_codec: MagicMock,
        mock_is_video: MagicMock, mock_isfile: MagicMock, mock_open_file: MagicMock,
        handler: ExtractAudioFromVideoHandler, temp_dir: str
    ) -> None:
        video_path = os.path.join(temp_dir, "test.mp4")
        result = handler.extract_audio(video_path, temp_dir)
        assert result["success"] is False
        assert result["message"] == "ffmpeg not found"

    @patch("builtins.open", new_callable=mock_open)
    @patch("os.path.isfile", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_is_video", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_get_audio_codec", return_value="aac")
    @patch.object(ExtractAudioFromVideoHandler, "_audio_file_exists", return_value=False)
    @patch("subprocess.Popen")
    def test_extract_audio_ffmpeg_fails(
        self, mock_popen: MagicMock, mock_exists: MagicMock, mock_codec: MagicMock,
        mock_is_video: MagicMock, mock_isfile: MagicMock, mock_open_file: MagicMock,
        handler: ExtractAudioFromVideoHandler, temp_dir: str
    ) -> None:
        mock_proc = MagicMock()
        mock_proc.communicate.return_value = ("", "error")
        mock_proc.returncode = 1
        mock_proc.args = ["ffmpeg", "-n", "-i", "/ignored", "-vn", "-acodec", "copy", "/ignored"]
        mock_popen.return_value = mock_proc
        video_path = os.path.join(temp_dir, "test.mp4")
        Path(video_path).write_text("fake")
        Path(os.path.join(temp_dir, "test.m4a")).touch()
        result = handler.extract_audio(video_path, temp_dir)
        assert result["success"] is False
        assert "ffmpeg failed" in result["message"]

    @patch("builtins.open", new_callable=mock_open)
    @patch("os.path.isfile", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_is_video", return_value=True)
    @patch.object(ExtractAudioFromVideoHandler, "_get_audio_codec", return_value="aac")
    @patch.object(ExtractAudioFromVideoHandler, "_audio_file_exists", return_value=False)
    @patch("subprocess.Popen")
    def test_extract_audio_success(
        self, mock_popen: MagicMock, mock_exists: MagicMock, mock_codec: MagicMock,
        mock_is_video: MagicMock, mock_isfile: MagicMock, mock_open_file: MagicMock,
        handler: ExtractAudioFromVideoHandler, temp_dir: str
    ) -> None:
        mock_proc = MagicMock()
        mock_proc.communicate.return_value = ("", "")
        mock_proc.returncode = 0
        mock_proc.args = ["ffmpeg", "-n", "-i", "/ignored", "-vn", "-acodec", "copy", "/ignored"]
        mock_popen.return_value = mock_proc
        video_path = os.path.join(temp_dir, "test.mp4")
        result = handler.extract_audio(video_path, temp_dir)
        assert result["success"] is True
        assert result["message"] == "Audio extracted successfully"
        output_path = result["output_path"]
        assert output_path == os.path.join(temp_dir, "test.m4a")

    def test_is_video_with_video_extension(self, handler: ExtractAudioFromVideoHandler) -> None:
        for ext in VIDEO_EXTENSIONS:
            assert handler._is_video(f"video{ext}") is True

    def test_is_video_with_non_video_extension(self, handler: ExtractAudioFromVideoHandler) -> None:
        assert handler._is_video("text.txt") is False

    def test_audio_file_exists_true(self, handler: ExtractAudioFromVideoHandler, temp_dir: str) -> None:
        Path(os.path.join(temp_dir, "test.mp3")).touch()
        assert handler._audio_file_exists("test", temp_dir) is True

    def test_audio_file_exists_false(self, handler: ExtractAudioFromVideoHandler, temp_dir: str) -> None:
        assert handler._audio_file_exists("test", temp_dir) is False

    @patch("subprocess.run", return_value=MagicMock(returncode=0, stdout="aac"))
    def test_get_audio_codec_success(self, mock_subprocess: MagicMock, handler: ExtractAudioFromVideoHandler) -> None:
        codec = handler._get_audio_codec("/fake/video.mp4")
        assert codec == "aac"

    @patch("subprocess.run", side_effect=FileNotFoundError)
    def test_get_audio_codec_ffprobe_not_found(self, mock_subprocess: MagicMock, handler: ExtractAudioFromVideoHandler) -> None:
        codec = handler._get_audio_codec("/fake/video.mp4")
        assert codec is None

    @patch("subprocess.run", return_value=MagicMock(returncode=1, stdout=""))
    def test_get_audio_codec_failure(self, mock_subprocess: MagicMock, handler: ExtractAudioFromVideoHandler) -> None:
        codec = handler._get_audio_codec("/fake/video.mp4")
        assert codec is None
