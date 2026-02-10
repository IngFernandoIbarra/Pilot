import json
import tempfile
import unittest
from pathlib import Path

from sales.log_processor import save_sales_logs


class SalesLogProcessorTests(unittest.TestCase):
    def test_order_creates_expected_files(self):
        payload = [
            {"nameFile": "INV001"},
            {"bid": "BID99"},
            {"r2": True},
            {"r3": True},
            {"r4": True},
            {"r5": True},
            {"r6": True},
            {"r7": True},
            {"r8": True},
            {"s9": True},
            {"s10": True},
            {"s11": True},
            {"s12": True},
            {"s13": True},
            {"s14": True},
            {"s15": True},
        ]
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            save_sales_logs(base, payload, "order")

            response_file = base / "BID99" / "Ventas" / "enviados" / "INV001" / "INV001_orden_venta_creada.json"
            sent_file = base / "BID99" / "Ventas" / "INV001" / "INV001_orden_venta_creada.json"

            self.assertTrue(response_file.exists())
            self.assertTrue(sent_file.exists())
            self.assertEqual(json.loads(response_file.read_text(encoding="utf-8")), payload[2])
            self.assertEqual(json.loads(sent_file.read_text(encoding="utf-8")), payload[9])

    def test_sale_error_uses_flat_sales_paths(self):
        payload = [
            {"nameFile": "ID-ERR"},
            {"bid": "BIDX"},
            {"resp": "A"},
            {"resp": "B"},
            {"sent": "C"},
            {"sent": "D"},
        ]

        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            save_sales_logs(base, payload, "sale_error")

            response_file = base / "BIDX" / "Ventas" / "enviados" / "ID-ERR_error_integration.json"
            sent_file = base / "BIDX" / "Ventas" / "ID-ERR_error_integration.json"

            self.assertTrue(response_file.exists())
            self.assertTrue(sent_file.exists())
            self.assertEqual(json.loads(response_file.read_text(encoding="utf-8")), payload[2])
            self.assertEqual(json.loads(sent_file.read_text(encoding="utf-8")), payload[4])


if __name__ == "__main__":
    unittest.main()
