from __future__ import annotations

from pathlib import Path
from queue import Empty, Queue
import sys

from python_runtime.production_runtime import RuntimeRunner
from python_runtime.settings import (
    RuntimeConfig,
    TokenItem,
    load_runtime_config,
    load_tokens,
    save_runtime_config,
    save_tokens,
)

# Compatibilidad: primero PySide6, luego PyQt6.
try:
    from PySide6.QtCore import QTimer
    from PySide6.QtWidgets import (
        QApplication,
        QGridLayout,
        QHBoxLayout,
        QLabel,
        QLineEdit,
        QListWidget,
        QMainWindow,
        QMessageBox,
        QPushButton,
        QTextEdit,
        QVBoxLayout,
        QWidget,
    )
except ImportError:  # pragma: no cover - depende del entorno de ejecución.
    from PyQt6.QtCore import QTimer
    from PyQt6.QtWidgets import (
        QApplication,
        QGridLayout,
        QHBoxLayout,
        QLabel,
        QLineEdit,
        QListWidget,
        QMainWindow,
        QMessageBox,
        QPushButton,
        QTextEdit,
        QVBoxLayout,
        QWidget,
    )


class RuntimeWindow(QMainWindow):
    def __init__(self, repo_root: Path) -> None:
        super().__init__()
        self.setWindowTitle("Pilot Runtime (Qt)")
        self.resize(1100, 760)

        self.repo_root = repo_root
        self.config_path = repo_root / "python_runtime" / "config" / "runtime_config.json"
        self.tokens_path = repo_root / "python_runtime" / "config" / "tokens.json"

        self.runtime_config: RuntimeConfig = load_runtime_config(self.config_path)
        self.tokens: list[TokenItem] = load_tokens(self.tokens_path)
        self.event_queue: Queue[str] = Queue()
        self.runner = RuntimeRunner(self.runtime_config, event_cb=self._push_event)

        self._build_ui()
        self._render_tokens()

        self.timer = QTimer(self)
        self.timer.timeout.connect(self._refresh_ui)
        self.timer.start(350)

    def _build_ui(self) -> None:
        root = QWidget(self)
        self.setCentralWidget(root)
        layout = QVBoxLayout(root)

        # Controles principales
        top = QHBoxLayout()
        self.btn_start = QPushButton("Iniciar envíos")
        self.btn_start.clicked.connect(self.start_runner)
        self.btn_stop = QPushButton("Detener envíos")
        self.btn_stop.clicked.connect(self.stop_runner)
        self.btn_save_cfg = QPushButton("Guardar configuración")
        self.btn_save_cfg.clicked.connect(self.save_config)

        top.addWidget(self.btn_start)
        top.addWidget(self.btn_stop)
        top.addWidget(self.btn_save_cfg)
        top.addStretch(1)
        layout.addLayout(top)

        # Configuración
        cfg_grid = QGridLayout()
        self.input_dir = QLineEdit(self.runtime_config.directory_to_check)
        self.log_dir = QLineEdit(self.runtime_config.directory_to_log)
        self.interval = QLineEdit(str(self.runtime_config.poll_interval_seconds))

        cfg_grid.addWidget(QLabel("Carpeta entrada"), 0, 0)
        cfg_grid.addWidget(self.input_dir, 0, 1)
        cfg_grid.addWidget(QLabel("Carpeta log"), 1, 0)
        cfg_grid.addWidget(self.log_dir, 1, 1)
        cfg_grid.addWidget(QLabel("Intervalo (s)"), 2, 0)
        cfg_grid.addWidget(self.interval, 2, 1)
        layout.addLayout(cfg_grid)

        # Estado + eventos
        self.stats_label = QLabel("seen=0 matched=0 archived=0")
        layout.addWidget(self.stats_label)

        self.events_box = QTextEdit()
        self.events_box.setReadOnly(True)
        self.events_box.setPlaceholderText("Eventos de envío en tiempo real...")
        layout.addWidget(self.events_box, stretch=1)

        # Tokens
        tk_grid = QGridLayout()
        self.tokens_list = QListWidget()
        tk_grid.addWidget(self.tokens_list, 0, 0, 5, 1)

        self.token_name = QLineEdit()
        self.token_name.setPlaceholderText("Nombre token (ej. Ags)")
        self.token_value = QLineEdit()
        self.token_value.setPlaceholderText("Valor token")
        self.btn_add_token = QPushButton("Agregar token")
        self.btn_add_token.clicked.connect(self.add_token)
        self.btn_remove_token = QPushButton("Eliminar token")
        self.btn_remove_token.clicked.connect(self.remove_token)
        self.btn_save_tokens = QPushButton("Guardar tokens")
        self.btn_save_tokens.clicked.connect(self.save_tokens_ui)

        tk_grid.addWidget(self.token_name, 0, 1)
        tk_grid.addWidget(self.token_value, 1, 1)
        tk_grid.addWidget(self.btn_add_token, 2, 1)
        tk_grid.addWidget(self.btn_remove_token, 3, 1)
        tk_grid.addWidget(self.btn_save_tokens, 4, 1)

        layout.addWidget(QLabel("Tokens manuales (fuera de código)"))
        layout.addLayout(tk_grid)

    def _push_event(self, text: str) -> None:
        self.event_queue.put(text)

    def _refresh_ui(self) -> None:
        stats = self.runner.last_stats
        self.stats_label.setText(f"seen={stats['seen']} matched={stats['matched']} archived={stats['archived']}")

        while True:
            try:
                msg = self.event_queue.get_nowait()
            except Empty:
                break
            self.events_box.append(msg)

    def start_runner(self) -> None:
        self.save_config(silent=True)
        self.runner = RuntimeRunner(self.runtime_config, event_cb=self._push_event)
        self.runner.start()

    def stop_runner(self) -> None:
        self.runner.stop()

    def save_config(self, silent: bool = False) -> None:
        try:
            interval = int(self.interval.text().strip() or "15")
        except ValueError:
            QMessageBox.warning(self, "Configuración", "Intervalo inválido")
            return

        self.runtime_config = RuntimeConfig(
            directory_to_check=self.input_dir.text().strip(),
            directory_to_log=self.log_dir.text().strip(),
            poll_interval_seconds=interval,
            db_host=self.runtime_config.db_host,
            db_user=self.runtime_config.db_user,
            db_password=self.runtime_config.db_password,
            db_name=self.runtime_config.db_name,
            table_customers=self.runtime_config.table_customers,
            table_stock=self.runtime_config.table_stock,
            table_webhook=self.runtime_config.table_webhook,
        )
        save_runtime_config(self.config_path, self.runtime_config)
        if not silent:
            QMessageBox.information(self, "Configuración", "Configuración guardada")

    def _render_tokens(self) -> None:
        self.tokens_list.clear()
        for token in self.tokens:
            self.tokens_list.addItem(token.name)

    def add_token(self) -> None:
        name = self.token_name.text().strip()
        value = self.token_value.text().strip()
        if not name or not value:
            QMessageBox.warning(self, "Tokens", "Nombre y valor son requeridos")
            return
        self.tokens.append(TokenItem(name=name, value=value))
        self._render_tokens()
        self.token_name.clear()
        self.token_value.clear()

    def remove_token(self) -> None:
        row = self.tokens_list.currentRow()
        if row < 0:
            return
        del self.tokens[row]
        self._render_tokens()

    def save_tokens_ui(self) -> None:
        save_tokens(self.tokens_path, self.tokens)
        QMessageBox.information(self, "Tokens", "Tokens guardados")


def main() -> None:
    app = QApplication(sys.argv)
    window = RuntimeWindow(Path(".").resolve())
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
