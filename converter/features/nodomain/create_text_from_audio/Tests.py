from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from .Handler import CreateTextFromAudioHandler
class TestCreateTextFromAudioHandler:
    def test_transcribe_success(self, tmp_path):
        audio_file = tmp_path / "test.wav"
        audio_file.write_text("fake audio content")
        handler = CreateTextFromAudioHandler()
        with patch.object(handler, '_load_model') as mock_load:
            mock_model = MagicMock()
            segment1 = MagicMock(text=" Hello ")
            segment2 = MagicMock(text=" world ")
            mock_model.transcribe.return_value = (iter([segment1, segment2]), None)
            mock_load.return_value = mock_model
            result = handler.transcribe(str(audio_file))
        assert result["success"] is True
        assert result["message"] == "Transcription completed"
        output_file = audio_file.with_suffix(".txt")
        assert output_file.exists()
        assert output_file.read_text() == "Hello world"

    def test_transcribe_file_not_found(self, tmp_path):
        handler = CreateTextFromAudioHandler()
        result = handler.transcribe(str(tmp_path / "nonexistent.wav"))
        assert result["success"] is False
        assert "not found" in result["message"]

    def test_transcribe_unsupported_format(self, tmp_path):
        audio_file = tmp_path / "test.xyz"
        audio_file.write_text("dummy")
        handler = CreateTextFromAudioHandler()
        result = handler.transcribe(str(audio_file))
        assert result["success"] is False
        assert "Unsupported audio format" in result["message"]

    def test_transcribe_empty_result(self, tmp_path):
        audio_file = tmp_path / "test.wav"
        audio_file.write_text("dummy")
        handler = CreateTextFromAudioHandler()
        with patch.object(handler, '_load_model') as mock_load:
            mock_model = MagicMock()
            mock_model.transcribe.return_value = (iter([]), None)
            mock_load.return_value = mock_model
            result = handler.transcribe(str(audio_file))
        assert result["success"] is False
        assert "empty result" in result["message"]

    def test_transcribe_model_load_failure(self, tmp_path):
        audio_file = tmp_path / "test.wav"
        audio_file.write_text("dummy")
        handler = CreateTextFromAudioHandler()
        with patch.object(handler, '_load_model') as mock_load:
            mock_load.return_value = None
            result = handler.transcribe(str(audio_file))
        assert result["success"] is False
        assert "Failed to load transcription model" in result["message"]

    def test_transcribe_output_write_failure(self, tmp_path):
        audio_file = tmp_path / "test.wav"
        audio_file.write_text("dummy")
        handler = CreateTextFromAudioHandler()
        with patch.object(handler, '_load_model') as mock_load:
            mock_model = MagicMock()
            segment = MagicMock(text=" hello ")
            mock_model.transcribe.return_value = (iter([segment]), None)
            mock_load.return_value = mock_model
            with patch.object(Path, 'write_text', side_effect=OSError("Permission denied")):
                result = handler.transcribe(str(audio_file))
        assert result["success"] is False
        assert "Could not write output file" in result["message"]
