import tempfile
import unittest
from pathlib import Path

from python_runtime.production_runtime import archive_input_file, detect_route, run_once
from python_runtime.settings import RuntimeConfig, TokenItem, load_runtime_config, load_tokens, save_tokens


class ProductionRuntimeTests(unittest.TestCase):
    def test_load_runtime_config_reads_json(self):
        with tempfile.TemporaryDirectory() as tmp:
            cfg_path = Path(tmp) / "runtime_config.json"
            cfg_path.write_text(
                '{"directory_to_check":"X:/in","directory_to_log":"X:/log","db_host":"h","db_user":"u","db_password":"p","db_name":"d","table_customers":"C","table_stock":"S","table_webhook":"W","poll_interval_seconds":5}',
                encoding="utf-8",
            )
            config = load_runtime_config(cfg_path)
            self.assertEqual(config.directory_to_check, "X:/in")
            self.assertEqual(config.poll_interval_seconds, 5)

    def test_tokens_persist_outside_code(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "tokens.json"
            save_tokens(path, [TokenItem(name="Ags", value="abc")])
            tokens = load_tokens(path)
            self.assertEqual(tokens[0].name, "Ags")
            self.assertEqual(tokens[0].value, "abc")

    def test_detect_route_order(self):
        route = detect_route(Path("U:/VENTAS/Pilot/M2041/Recibido/ABC_OrdenVenta.txt"))
        self.assertEqual(route, "sales_order")

    def test_run_once_archives_matched_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            incoming = base / "M2041" / "Recibido" / "VIN_OrdenVenta.txt"
            incoming.parent.mkdir(parents=True, exist_ok=True)
            incoming.write_text("demo", encoding="utf-8")

            cfg = RuntimeConfig(directory_to_check=str(base), directory_to_log=str(base / "log"))
            stats = run_once(cfg)
            self.assertEqual(stats["matched"], 1)
            self.assertEqual(stats["archived"], 1)

            backups = list((base / "Respaldo").rglob("VIN_OrdenVenta.txt"))
            self.assertEqual(len(backups), 1)

    def test_archive_input_file_preserves_relative_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            source = base / "A" / "B" / "x.txt"
            source.parent.mkdir(parents=True, exist_ok=True)
            source.write_text("x", encoding="utf-8")

            backup = archive_input_file(source, base)
            self.assertIn("/A/B/x.txt", backup.as_posix())


if __name__ == "__main__":
    unittest.main()
