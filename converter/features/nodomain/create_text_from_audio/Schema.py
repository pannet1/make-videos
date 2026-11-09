from __future__ import annotations

from pydantic import BaseModel


class TranscribeRequest(BaseModel):
    audio_file_path: str


class TranscribeResponse(BaseModel):
    success: bool
    message: str
    output_file: str | None = None
