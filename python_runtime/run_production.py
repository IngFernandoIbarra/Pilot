from __future__ import annotations

import argparse
from pathlib import Path

from python_runtime.production_runtime import load_runtime_config, run_forever, run_once


def main() -> None:
    parser = argparse.ArgumentParser(description="Runtime Python de producción para integración Pilot")
    parser.add_argument("--repo-root", default=".", help="Ruta raíz del repo (default: .)")
    parser.add_argument("--once", action="store_true", help="Ejecuta una sola pasada")
    parser.add_argument("--interval", type=int, default=15, help="Intervalo en segundos para modo servicio")
    args = parser.parse_args()

    config = load_runtime_config(Path(args.repo_root).resolve())

    if args.once:
        print(run_once(config))
        return

    run_forever(config, interval_seconds=args.interval)


if __name__ == "__main__":
    main()
