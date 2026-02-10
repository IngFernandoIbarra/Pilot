from __future__ import annotations

import argparse
from pathlib import Path
import time

from python_runtime.production_runtime import run_once
from python_runtime.settings import load_runtime_config


def main() -> None:
    parser = argparse.ArgumentParser(description="Runtime Python de producción para integración Pilot")
    parser.add_argument("--repo-root", default=".", help="Ruta raíz del repo (default: .)")
    parser.add_argument("--config", default="python_runtime/config/runtime_config.json", help="Archivo JSON de configuración")
    parser.add_argument("--once", action="store_true", help="Ejecuta una sola pasada")
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    config = load_runtime_config(repo_root / args.config)

    if args.once:
        print(run_once(config))
        return

    while True:
        print(run_once(config))
        time.sleep(max(1, config.poll_interval_seconds))


if __name__ == "__main__":
    main()
