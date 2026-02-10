import json
import tempfile
import unittest
from pathlib import Path

from stock.log_processor import build_inventory_record, save_stock_logs


class LogProcessorTests(unittest.TestCase):
    def setUp(self):
        self.payload = [
            {"nameFile": "ABC123"},
            {"bid": "BID01"},
            {"ok": True},
            {
                "stockResult": {
                    "result": {
                        "entitydata": {
                            "integration_reference_code": "INV-900",
                            "id": "PILOT-1",
                            "vin": "VIN-001",
                            "owner_branch_code": {"code": "BID01"},
                            "business_channel": "NEW",
                            "availability_status": {"name": "Disponible"},
                            "status": {"name": "Activo"},
                        }
                    }
                }
            },
        ]

    def test_build_inventory_record_for_create_uses_integration_reference_code(self):
        record = build_inventory_record(self.payload, "create")
        self.assertEqual(record.num_inv, "INV-900")

    def test_build_inventory_record_for_update_uses_name_file(self):
        record = build_inventory_record(self.payload, "update")
        self.assertEqual(record.num_inv, "ABC123")

    def test_save_stock_logs_creates_both_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            save_stock_logs(base, self.payload, "state")

            response_file = base / "BID01" / "Unidades" / "enviados" / "ABC123" / "ABC123_estado_actualizado.json"
            sent_file = base / "BID01" / "Unidades" / "ABC123" / "ABC123_estado_actualizado.json"

            self.assertTrue(response_file.exists())
            self.assertTrue(sent_file.exists())

            self.assertEqual(json.loads(response_file.read_text(encoding="utf-8")), self.payload[2])
            self.assertEqual(json.loads(sent_file.read_text(encoding="utf-8")), self.payload[3])


if __name__ == "__main__":
    unittest.main()
