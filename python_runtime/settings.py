from __future__ import annotations

from dataclasses import asdict, dataclass
import json
from pathlib import Path


@dataclass
class RuntimeConfig:
    directory_to_check: str = "U:/VENTAS/Pilot"
    directory_to_log: str = "U:/VENTAS/Log"
    db_host: str = ""
    db_user: str = ""
    db_password: str = ""
    db_name: str = ""
    table_customers: str = "Customer"
    table_stock: str = "Stock"
    table_webhook: str = "Erp"
    poll_interval_seconds: int = 15


@dataclass
class TokenItem:
    name: str
    value: str


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def load_runtime_config(config_path: Path) -> RuntimeConfig:
    if not config_path.exists():
        save_runtime_config(config_path, RuntimeConfig())
    data = json.loads(config_path.read_text(encoding="utf-8"))
    return RuntimeConfig(**data)


def save_runtime_config(config_path: Path, config: RuntimeConfig) -> None:
    ensure_parent(config_path)
    config_path.write_text(json.dumps(asdict(config), ensure_ascii=False, indent=2), encoding="utf-8")


def load_tokens(tokens_path: Path) -> list[TokenItem]:
    if not tokens_path.exists():
        save_tokens(tokens_path, [])
    data = json.loads(tokens_path.read_text(encoding="utf-8"))
    return [TokenItem(**item) for item in data]


def save_tokens(tokens_path: Path, tokens: list[TokenItem]) -> None:
    ensure_parent(tokens_path)
    data = [asdict(token) for token in tokens]
    tokens_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
