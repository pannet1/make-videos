from __future__ import annotations

from pydantic import BaseModel


class StartWatchingRequest(BaseModel):
    data_dir: str = "data"


class StartWatchingResponse(BaseModel):
    success: bool
    message: str
    processed_count: int = 0

