"""Runtime de producción 100% Python (sin dependencia de PHP)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path
import shutil
import threading
import time
from typing import Any, Callable, Iterable

from python_runtime.settings import RuntimeConfig


@dataclass(frozen=True)
class RouteRule:
    name: str
    contains: str
    min_len: int = 0

    def matches(self, file_path: Path) -> bool:
        text = str(file_path)
        return self.contains in text and len(text) > self.min_len


ROUTE_RULES: tuple[RouteRule, ...] = (
    RouteRule("stock_create", "Compras_Nuevos_"),
    RouteRule("stock_state", "Estatus_Nuevos_"),
    RouteRule("stock_load", "Carga_Nuevos"),
    RouteRule("stock_update", "Update_Nuevos_"),
    RouteRule("sales_order", "_OrdenVenta"),
    RouteRule("sales_customer_update", "_ClienteDatos"),
    RouteRule("sales_customer_new", "_ClienteNuevo"),
    RouteRule("sales_invoice", "_DatosFacturacion"),
    RouteRule("sales_rebilling", "_Refacturacion", min_len=65),
    RouteRule("sales_release", "_Liberar", min_len=54),
    RouteRule("sales_delivery", "_FechaEntrega"),
)


EventCallback = Callable[[str], None]
RouteHandler = Callable[[Path, RuntimeConfig], None]


def archive_input_file(source_path: Path, base_input_dir: Path) -> Path:
    source_path = source_path.resolve()
    base_input_dir = base_input_dir.resolve()

    relative = source_path.relative_to(base_input_dir)
    backup_path = base_input_dir / "Respaldo" / datetime.now().strftime("%Y%m%d") / relative
    backup_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        source_path.rename(backup_path)
    except OSError:
        shutil.copy2(source_path, backup_path)
        source_path.unlink()

    return backup_path


def iter_input_files(directory: Path) -> Iterable[Path]:
    if not directory.exists():
        return []
    return (p for p in directory.rglob("*") if p.is_file() and "Respaldo" not in p.parts)


def detect_route(file_path: Path) -> str | None:
    for rule in ROUTE_RULES:
        if rule.matches(file_path):
            return rule.name
    return None


def _read_payload(file_path: Path) -> Any:
    text = file_path.read_text(encoding="utf-8", errors="replace")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Si no es JSON, guardamos muestra de texto para trazabilidad.
        return {"raw_preview": text[:2000], "is_json": False}


def _default_route_handler(route: str) -> RouteHandler:
    def handler(file_path: Path, config: RuntimeConfig) -> None:
        payload = _read_payload(file_path)
        now = datetime.now()
        out_dir = Path(config.directory_to_log) / "Runtime" / route / now.strftime("%Y%m%d")
        out_dir.mkdir(parents=True, exist_ok=True)

        out_name = f"{file_path.stem}_processed_{now.strftime('%H%M%S')}.json"
        out_path = out_dir / out_name

        event = {
            "route": route,
            "timestamp": now.isoformat(),
            "source_file": str(file_path),
            "payload": payload,
        }
        out_path.write_text(json.dumps(event, ensure_ascii=False, indent=2), encoding="utf-8")

    return handler


def create_default_handlers() -> dict[str, RouteHandler]:
    """Crea handlers productivos por ruta para dejar evidencia de procesamiento."""
    return {rule.name: _default_route_handler(rule.name) for rule in ROUTE_RULES}


def run_once(
    config: RuntimeConfig,
    handlers: dict[str, RouteHandler] | None = None,
    event_cb: EventCallback | None = None,
) -> dict[str, int]:
    handlers = handlers or create_default_handlers()
    stats = {"seen": 0, "matched": 0, "archived": 0, "errors": 0}
    input_dir = Path(config.directory_to_check)

    for file_path in iter_input_files(input_dir):
        stats["seen"] += 1
        route = detect_route(file_path)
        if route is None:
            continue

        stats["matched"] += 1
        if event_cb:
            event_cb(f"[MATCH] {route} -> {file_path}")

        handler = handlers.get(route)
        try:
            if handler is not None:
                handler(file_path, config)

            backup = archive_input_file(file_path, input_dir)
            stats["archived"] += 1
            if event_cb:
                event_cb(f"[BACKUP] {backup}")

        except Exception as exc:  # noqa: BLE001
            stats["errors"] += 1
            if event_cb:
                event_cb(f"[ERROR] {route} -> {file_path} :: {exc}")

    return stats


class RuntimeRunner:
    def __init__(
        self,
        config: RuntimeConfig,
        handlers: dict[str, RouteHandler] | None = None,
        event_cb: EventCallback | None = None,
    ) -> None:
        self.config = config
        self.handlers = handlers or create_default_handlers()
        self.event_cb = event_cb
        self._thread: threading.Thread | None = None
        self._stop = threading.Event()
        self.last_stats = {"seen": 0, "matched": 0, "archived": 0, "errors": 0}

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()
        if self.event_cb:
            self.event_cb("[SYSTEM] Envíos iniciados")

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=2)
        if self.event_cb:
            self.event_cb("[SYSTEM] Envíos detenidos")

    def _loop(self) -> None:
        interval = max(1, int(self.config.poll_interval_seconds))
        while not self._stop.is_set():
            self.last_stats = run_once(self.config, self.handlers, self.event_cb)
            time.sleep(interval)


__all__ = [
    "RouteRule",
    "ROUTE_RULES",
    "archive_input_file",
    "iter_input_files",
    "detect_route",
    "create_default_handlers",
    "run_once",
    "RuntimeRunner",
]
