import tempfile
import unittest
from pathlib import Path

from python_runtime.production_runtime import (
    archive_input_file,
    detect_route,
    load_runtime_config,
    run_once,
)


class ProductionRuntimeTests(unittest.TestCase):
    def test_load_runtime_config_reads_connection_and_token(self):
        config = load_runtime_config(Path('.').resolve())
        self.assertEqual(config.directory_to_check.as_posix(), 'U:/VENTAS/Pilot')
        self.assertEqual(config.directory_to_log.as_posix(), 'U:/VENTAS/Log')
        self.assertTrue(len(config.auth_bearer) > 10)

    def test_detect_route_order(self):
        route = detect_route(Path('U:/VENTAS/Pilot/M2041/Recibido/ABC_OrdenVenta.txt'))
        self.assertEqual(route, 'sales_order')

    def test_run_once_archives_matched_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            incoming = base / 'M2041' / 'Recibido' / 'VIN_OrdenVenta.txt'
            incoming.parent.mkdir(parents=True, exist_ok=True)
            incoming.write_text('demo', encoding='utf-8')

            class Cfg:
                directory_to_check = base
                directory_to_log = base / 'log'

            stats = run_once(Cfg())
            self.assertEqual(stats['matched'], 1)
            self.assertEqual(stats['archived'], 1)

            backups = list((base / 'Respaldo').rglob('VIN_OrdenVenta.txt'))
            self.assertEqual(len(backups), 1)

    def test_archive_input_file_preserves_relative_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            source = base / 'A' / 'B' / 'x.txt'
            source.parent.mkdir(parents=True, exist_ok=True)
            source.write_text('x', encoding='utf-8')

            backup = archive_input_file(source, base)
            self.assertIn('/A/B/x.txt', backup.as_posix())


if __name__ == '__main__':
    unittest.main()
