from __future__ import annotations

import os
import threading
from typing import Any, Dict

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from .Handler import (
    SUPPORTED_EXTENSIONS,
    CreateTextFromAudioHandler,
    load_transcription_config,
)
import logging

logger = logging.getLogger(__name__)


class _EventHandler(FileSystemEventHandler):
    def __init__(self, controller: CreateTextFromAudioController) -> None:
        super().__init__()
        self._controller = controller

    def on_created(self, event) -> None:
        if not event.is_directory:
            self._controller.on_file_created(event.src_path)

    def on_modified(self, event) -> None:
        if not event.is_directory:
            self._controller.on_file_created(event.src_path)


class CreateTextFromAudioController:
    def __init__(self) -> None:
        self._handler = CreateTextFromAudioHandler()
        self._observer: Observer | None = None
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
        logger.info("Started watching %s for new audio files", data_dir)
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
        if ext not in SUPPORTED_EXTENSIONS:
            return

        if self._converting:
            logger.info("Ignoring %s because transcription in progress", file_path)
            return

        with self._conversion_lock:
            if self._converting:
                return
            self._converting = True

        try:
            result = self._handler.transcribe(file_path)
            if result.get("success"):
                self._processed_count += 1
            logger.info("Result for %s: %s", file_path, result)
        finally:
            self._converting = False

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
