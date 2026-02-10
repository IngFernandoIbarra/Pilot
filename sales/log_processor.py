"""Procesador de logs de Ventas en Python.

Este módulo adapta y centraliza la lógica repetida de los endpoints PHP de ventas,
por ejemplo:
- sales/order/log.php
- sales/release/log.php
- sales/invoice/log.php
- sales/delivery/log.php
- sales/rebilling/log.php
- sales/customer_new/log_customer.php
- sales/customer_new/log_assignment.php
- sales/customer_update/log.php
- sales/sale/log.php

Objetivo: eliminar redundancias en creación de carpetas y escritura de logs,
manteniendo el comportamiento de los payloads actuales.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path
import shutil
from typing import Any


@dataclass(frozen=True)
class LogPair:
    """Define un archivo lógico y de qué índices del array JSON leer datos."""

    suffix: str
    response_index: int
    sent_index: int


# Configuración por tipo de operación de ventas.
# Cada entrada indica qué archivos generar y desde qué índice tomar los datos:
# - response_index: respuesta de PILOT (carpeta enviados)
# - sent_index: información enviada a PILOT (carpeta principal)
SALES_LOG_CONFIG: dict[str, list[LogPair]] = {
    "order": [
        LogPair("orden_venta_creada", 2, 9),
        LogPair("numero_orden_venta", 3, 10),
        LogPair("nota_orden_venta", 4, 11),
        LogPair("unidad_asignada", 5, 12),
        LogPair("nota_unidad_asignada", 6, 13),
        LogPair("unidad_pedida", 7, 14),
        LogPair("nota_unidad_pedida", 8, 15),
    ],
    "release": [
        LogPair("anular_venta", 2, 6),
        LogPair("nota_venta_anulada", 3, 7),
        LogPair("estado_inventario", 4, 8),
        LogPair("nota_estado_inventario", 5, 9),
    ],
    "invoice": [
        LogPair("unidad_facturada", 2, 7),
        LogPair("datos_venta", 3, 8),
        LogPair("nota_venta_unidad", 4, 9),
        LogPair("estado_facturada", 5, 10),
        LogPair("nota_estado_facturada", 6, 11),
    ],
    "delivery": [
        LogPair("unidad_entregada", 2, 7),
        LogPair("nota_entrega", 3, 8),
        LogPair("fecha_entrega_unidad", 4, 9),
        LogPair("estado_entregada", 5, 10),
        LogPair("nota_estado_entregada", 6, 11),
    ],
    # Mantiene el comportamiento de sales/rebilling/log.php
    # donde el primer "response" se lee desde índice 1.
    "rebilling": [
        LogPair("refacturar_venta", 1, 5),
        LogPair("nota_refacturacion_venta", 2, 6),
        LogPair("unidad_pedida", 3, 7),
        LogPair("nota_unidad_pedida", 4, 8),
    ],
    "customer_new": [
        LogPair("nuevo_cliente", 2, 4),
        LogPair("nota_nuevo_cliente", 3, 5),
    ],
    "customer_assignment": [
        LogPair("asignar_cliente", 2, 4),
        LogPair("nota_asignar_cliente", 3, 5),
    ],
    "customer_update": [
        LogPair("actualizacion_cliente", 2, 4),
        LogPair("nota_actualizacion_cliente", 3, 5),
    ],
    # Este flujo en PHP guarda directamente en Ventas sin subcarpeta nameFile.
    "sale_error": [
        LogPair("error_integration", 2, 4),
        LogPair("nota_error_integration", 3, 5),
    ],
}


def create_folder(path: Path) -> None:
    """Crea carpeta y padres (equivalente a mkdir -p)."""
    path.mkdir(parents=True, exist_ok=True)


def create_log(path: Path, payload: Any) -> None:
    """Escribe JSON con formato legible y UTF-8."""
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")




def archive_input_file(source_path: Path, base_input_dir: Path) -> Path:
    """Mueve un archivo de entrada a Respaldo/YYYYmmdd preservando ruta relativa."""
    source_path = source_path.resolve()
    base_input_dir = base_input_dir.resolve()

    if not source_path.exists():
        raise FileNotFoundError(f"No existe el archivo a respaldar: {source_path}")

    relative = source_path.relative_to(base_input_dir)
    backup_path = base_input_dir / "Respaldo" / datetime.now().strftime("%Y%m%d") / relative
    backup_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        source_path.rename(backup_path)
    except OSError:
        shutil.copy2(source_path, backup_path)
        source_path.unlink()

    return backup_path


def _get_log_roots(base_log_dir: Path, bid_file: str, name_file: str, operation: str) -> tuple[Path, Path]:
    """Devuelve (response_dir, sent_dir) según convención del endpoint."""
    if operation == "sale_error":
        # sales/sale/log.php no usa subcarpeta por nameFile.
        response_dir = base_log_dir / bid_file / "Ventas" / "enviados"
        sent_dir = base_log_dir / bid_file / "Ventas"
    else:
        response_dir = base_log_dir / bid_file / "Ventas" / "enviados" / name_file
        sent_dir = base_log_dir / bid_file / "Ventas" / name_file

    return response_dir, sent_dir


def save_sales_logs(base_log_dir: Path, array_json: list[dict[str, Any]], operation: str) -> None:
    """Guarda logs de ventas para una operación dada."""
    if operation not in SALES_LOG_CONFIG:
        raise ValueError(f"Operación de ventas no soportada: {operation}")

    name_file = array_json[0]["nameFile"]
    bid_file = array_json[1]["bid"]
    response_dir, sent_dir = _get_log_roots(base_log_dir, bid_file, name_file, operation)

    create_folder(response_dir)
    create_folder(sent_dir)

    # Recorre reglas declarativas para evitar repetir create_log muchas veces.
    for pair in SALES_LOG_CONFIG[operation]:
        filename = f"{name_file}_{pair.suffix}.json"
        create_log(response_dir / filename, array_json[pair.response_index])
        create_log(sent_dir / filename, array_json[pair.sent_index])


__all__ = [
    "LogPair",
    "SALES_LOG_CONFIG",
    "create_folder",
    "create_log",
    "archive_input_file",
    "save_sales_logs",
]
