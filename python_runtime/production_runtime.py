"""Runtime de producción en Python para igualar la operación actual de PHP.

Incluye:
- Carga de configuración desde `connection/` y `token/`.
- Mapeo de patrones de archivos equivalente a `functions/selection_module.php`.
- Escaneo de carpeta de entrada y respaldo de archivos procesados.

Este módulo no sustituye automáticamente los endpoints PHP; provee una base
operativa para ejecutar la misma lógica en producción con Python.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path
import re
import shutil
import time
from typing import Callable, Iterable


ASSIGN_RE = re.compile(r"\$(\w+)\s*=\s*'([^']*)';")


@dataclass(frozen=True)
class RuntimeConfig:
    directory_to_check: Path
    directory_to_log: Path
    db_host: str
    db_user: str
    db_password: str
    db_name: str
    table_customers: str
    table_stock: str
    table_webhook: str
    auth_bearer: str


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


def _parse_php_vars(path: Path) -> dict[str, str]:
    content = path.read_text(encoding="utf-8")
    return {k: v for k, v in ASSIGN_RE.findall(content)}


def load_runtime_config(repo_root: Path) -> RuntimeConfig:
    """Carga configuración desde `connection/*.php` y `token/AuthorizationBearer.txt`."""
    routes = _parse_php_vars(repo_root / "connection" / "routes.php")
    conn = _parse_php_vars(repo_root / "connection" / "connection.php")
    tables = _parse_php_vars(repo_root / "connection" / "tables.php")

    bearer = (repo_root / "token" / "AuthorizationBearer.txt").read_text(encoding="utf-8").strip()

    return RuntimeConfig(
        directory_to_check=Path(routes["directoryToCheck"]),
        directory_to_log=Path(routes["directoryToLog"]),
        db_host=conn["host"],
        db_user=conn["usuariodb"],
        db_password=conn["passwdb"],
        db_name=conn["nombredb"],
        table_customers=tables["Clientes"],
        table_stock=tables["Inventario"],
        table_webhook=tables["Webhook"],
        auth_bearer=bearer,
    )


def archive_input_file(source_path: Path, base_input_dir: Path) -> Path:
    """Mueve el archivo a `Respaldo/YYYYmmdd` preservando ruta relativa."""
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
    return (p for p in directory.rglob("*") if p.is_file())


def detect_route(file_path: Path) -> str | None:
    for rule in ROUTE_RULES:
        if rule.matches(file_path):
            return rule.name
    return None


def run_once(config: RuntimeConfig, handlers: dict[str, Callable[[Path, RuntimeConfig], None]] | None = None) -> dict[str, int]:
    """Ejecuta una pasada de detección/procesamiento (equivale al ciclo de selección PHP)."""
    handlers = handlers or {}
    stats = {"seen": 0, "matched": 0, "archived": 0}

    for file_path in iter_input_files(config.directory_to_check):
        stats["seen"] += 1
        route = detect_route(file_path)
        if route is None:
            continue

        stats["matched"] += 1
        handler = handlers.get(route)
        if handler is not None:
            handler(file_path, config)

        archive_input_file(file_path, config.directory_to_check)
        stats["archived"] += 1

    return stats


def run_forever(config: RuntimeConfig, interval_seconds: int = 15) -> None:
    """Modo servicio para producción: sondeo periódico de entrada."""
    while True:
        stats = run_once(config)
        print(json.dumps(stats, ensure_ascii=False), flush=True)
        time.sleep(interval_seconds)


__all__ = [
    "RuntimeConfig",
    "RouteRule",
    "ROUTE_RULES",
    "load_runtime_config",
    "archive_input_file",
    "iter_input_files",
    "detect_route",
    "run_once",
    "run_forever",
]
