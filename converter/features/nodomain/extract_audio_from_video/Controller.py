from __future__ import annotations

import os
import threading
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import APIRouter, Depends, FastAPI, Request
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from .Handler import ExtractAudioFromVideoHandler
from .Schema import StartWatchingRequest, StartWatchingResponse
import logging

logger = logging.getLogger(__name__)

VIDEO_EXTENSIONS = {".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm", ".m4v"}

router = APIRouter(prefix="/extract-audio", tags=["Extract Audio"])


class _EventHandler(FileSystemEventHandler):
    def __init__(self, controller: ExtractAudioFromVideoController) -> None:
        super().__init__()
        self._controller = controller

    def on_created(self, event) -> None:
        if not event.is_directory:
            self._controller.on_file_created(event.src_path)

    def on_modified(self, event) -> None:
        if not event.is_directory:
            self._controller.on_file_created(event.src_path)


class ExtractAudioFromVideoController:
    def __init__(self) -> None:
        self._handler = ExtractAudioFromVideoHandler()
        self._observer: Observer | None = None
        self._watch_thread: threading.Thread | None = None
        self._converting = False
        self._conversion_lock = threading.Lock()
        self._running = False
        self._processed_count = 0

    def start_watching(self, data_dir: str = "data") -> Dict[str, Any]:
        if self._running:
            return {"success": True, "message": "Already watching"}

        if not os.path.isdir(data_dir):
            try:
                os.makedirs(data_dir, exist_ok=True)
            except Exception as e:
                return {"success": False, "message": f"Cannot create data dir: {e}"}

        self._running = True
        self._processed_count = 0
        event_handler = _EventHandler(self)
        self._observer = Observer()
        self._observer.schedule(event_handler, data_dir, recursive=False)
        self._observer.start()
        logger.info(f"Started watching {data_dir} for new video files")
        return {"success": True, "message": f"Started watching {data_dir}"}

    def stop_watching(self) -> Dict[str, Any]:
        if self._observer is not None:
            self._observer.stop()
            self._observer.join()
            self._observer = None
        self._running = False
        return {"success": True, "message": "Stopped watching"}

    def join(self) -> None:
        """Block the calling thread until the watcher stops."""
        if self._observer is not None:
            self._observer.join()

    def on_file_created(self, file_path: str) -> None:
        if not self._running:
            return
        ext = os.path.splitext(file_path)[1].lower()
        if ext not in VIDEO_EXTENSIONS:
            return

        if self._converting:
            logger.info(f"Ignoring {file_path} because conversion in progress")
            return

        with self._conversion_lock:
            if self._converting:
                return
            self._converting = True

        logger.info("Conversion started for %s", file_path)
        try:
            result = self._handler.extract_audio(file_path, data_dir=os.path.dirname(file_path) or ".")
            if result.get("success"):
                self._processed_count += 1
                logger.info("Conversion completed for %s -> %s", file_path, result.get("output_path", "?"))
            else:
                logger.warning("Conversion failed for %s: %s", file_path, result.get("message", "unknown"))
        finally:
            self._converting = False
            logger.info("Watcher ready — listening for new files in data/")

    def get_status(self) -> Dict[str, Any]:
        return {
            "running": self._running,
            "converting": self._converting,
            "processed_count": self._processed_count,
        }

    def handle(self, request: Dict[str, Any]) -> Dict[str, Any]:
        action = request.get("action", "status")
        if action == "start":
            data_dir = request.get("data_dir", "data")
            return self.start_watching(data_dir)
        elif action == "stop":
            return self.stop_watching()
        elif action == "status":
            return self.get_status()
        else:
            return {"success": False, "message": f"Unknown action: {action}"}


def get_controller(request: Request) -> ExtractAudioFromVideoController:
    """FastAPI dependency: return shared controller from app state."""
    return request.app.state.controller


@router.post("/start")
async def start_watching(
    request: StartWatchingRequest,
    controller: ExtractAudioFromVideoController = Depends(get_controller),
) -> StartWatchingResponse:
    result = controller.start_watching(request.data_dir)
    return StartWatchingResponse(**result)


@router.post("/stop")
async def stop_watching(
    controller: ExtractAudioFromVideoController = Depends(get_controller),
) -> StartWatchingResponse:
    result = controller.stop_watching()
    return StartWatchingResponse(**result)


@router.get("/status")
async def status(
    controller: ExtractAudioFromVideoController = Depends(get_controller),
) -> StartWatchingResponse:
    status_data = controller.get_status()
    return StartWatchingResponse(
        success=True,
        message="Status retrieved",
        processed_count=status_data["processed_count"],
    )


def create_app(data_dir: str = "data") -> FastAPI:
    """Build the FastAPI application with lifespan-managed controller."""
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> None:
        controller = ExtractAudioFromVideoController()
        app.state.controller = controller
        controller.start_watching(data_dir)
        yield
        controller.stop_watching()

    app = FastAPI(title="Open Converter", lifespan=lifespan)
    app.include_router(router)
    return app

