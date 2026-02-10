"""Procesador de eventos de stock en Python.

Este módulo adapta la lógica repetida de los endpoints PHP de:
- stock/create/log.php
- stock/load/log.php
- stock/update/log.php
- stock/state/log.php

Objetivos:
1) Eliminar redundancias con una sola función reutilizable.
2) Mantener la misma idea de negocio (guardar bitácoras y actualizar inventario).
3) Documentar el flujo con comentarios claros en español.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path
from typing import Any, Mapping


# Sufijo de archivo por tipo de operación para evitar if/else repetitivos.
OPERATION_SUFFIX = {
    "create": "unidad_creada",
    "load": "unidad_creada",
    "update": "unidad_actualizada",
    "state": "estado_actualizado",
}


@dataclass(frozen=True)
class InventoryRecord:
    """Estructura normalizada del inventario que se guarda en BD."""

    num_inv: str
    id_pilot: str
    bid: str
    vin: str
    type_code: str
    availability_status: str
    status_code: str
    fecha: str


def create_folder(path: Path) -> None:
    """Crea una carpeta (y padres) solo si no existe."""
    path.mkdir(parents=True, exist_ok=True)


def create_log(path: Path, payload: Any) -> None:
    """Serializa JSON de forma legible y con UTF-8."""
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def _extract_entity_data(array_json: list[dict[str, Any]]) -> Mapping[str, Any]:
    """Obtiene el bloque entitydata del payload de PILOT."""
    return array_json[3]["stockResult"]["result"]["entitydata"]


def build_inventory_record(array_json: list[dict[str, Any]], operation: str) -> InventoryRecord:
    """Construye un registro de inventario desde el payload entrante.

    Para `create`/`load` toma `integration_reference_code`.
    Para `update`/`state` usa `nameFile` (comportamiento de los PHP originales).
    """
    entity = _extract_entity_data(array_json)

    name_file = array_json[0]["nameFile"]
    if operation in {"create", "load"}:
        num_inv = entity["integration_reference_code"]
    else:
        num_inv = name_file

    return InventoryRecord(
        num_inv=str(num_inv),
        id_pilot=str(entity["id"]),
        bid=str(entity["owner_branch_code"]["code"]),
        vin=str(entity["vin"]),
        type_code=str(entity["business_channel"]),
        availability_status=str(entity["availability_status"]["name"]),
        status_code=str(entity["status"]["name"]),
        fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )


def save_stock_logs(base_log_dir: Path, array_json: list[dict[str, Any]], operation: str) -> InventoryRecord:
    """Guarda archivos de log (enviado + respuesta) y devuelve el inventario extraído."""
    if operation not in OPERATION_SUFFIX:
        raise ValueError(f"Operación no soportada: {operation}")

    suffix = OPERATION_SUFFIX[operation]
    name_file = array_json[0]["nameFile"]
    bid_file = array_json[1]["bid"]

    # Rutas base equivalentes a las usadas en PHP.
    sent_dir = base_log_dir / bid_file / "Unidades" / name_file
    response_dir = base_log_dir / bid_file / "Unidades" / "enviados" / name_file

    create_folder(sent_dir)
    create_folder(response_dir)

    # Respuesta de PILOT.
    create_log(response_dir / f"{name_file}_{suffix}.json", array_json[2])
    # Información enviada a PILOT.
    create_log(sent_dir / f"{name_file}_{suffix}.json", array_json[3])

    return build_inventory_record(array_json, operation)


def _safe_identifier(identifier: str) -> str:
    """Valida nombres de tabla/identificador para evitar SQL injection en f-strings."""
    if not identifier.replace("_", "").isalnum():
        raise ValueError(f"Identificador SQL inválido: {identifier}")
    return identifier


def upsert_inventory(db_conn: Any, table_name: str, record: InventoryRecord) -> None:
    """Inserta o actualiza inventario usando una conexión DB-API 2.0.

    Nota: Se usa SQL parametrizado para evitar inyección.
    """
    table_name = _safe_identifier(table_name)

    with db_conn.cursor() as cursor:
        cursor.execute(f"SELECT 1 FROM {table_name} WHERE id_pilot = %s", (record.id_pilot,))
        exists = cursor.fetchone() is not None

        if exists:
            cursor.execute(
                f"""
                UPDATE {table_name}
                SET num_inv = %s,
                    bid = %s,
                    vin = %s,
                    type_code = %s,
                    availability_status = %s,
                    status_code = %s
                WHERE id_pilot = %s
                """,
                (
                    record.num_inv,
                    record.bid,
                    record.vin,
                    record.type_code,
                    record.availability_status,
                    record.status_code,
                    record.id_pilot,
                ),
            )
        else:
            cursor.execute(
                f"""
                INSERT INTO {table_name}
                (num_inv, id_pilot, bid, vin, type_code, availability_status, status_code, fecha)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    record.num_inv,
                    record.id_pilot,
                    record.bid,
                    record.vin,
                    record.type_code,
                    record.availability_status,
                    record.status_code,
                    record.fecha,
                ),
            )

    db_conn.commit()


__all__ = [
    "InventoryRecord",
    "create_folder",
    "create_log",
    "save_stock_logs",
    "build_inventory_record",
    "upsert_inventory",
]
