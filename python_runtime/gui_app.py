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
        QFrame,
        QGridLayout,
        QHBoxLayout,
        QLabel,
        QLineEdit,
        QListWidget,
        QListWidgetItem,
        QMainWindow,
        QMessageBox,
        QPushButton,
        QStackedWidget,
        QTextEdit,
        QVBoxLayout,
        QWidget,
    )
except ImportError:  # pragma: no cover - depende del entorno de ejecución.
    from PyQt6.QtCore import QTimer
    from PyQt6.QtWidgets import (
        QApplication,
        QFrame,
        QGridLayout,
        QHBoxLayout,
        QLabel,
        QLineEdit,
        QListWidget,
        QListWidgetItem,
        QMainWindow,
        QMessageBox,
        QPushButton,
        QStackedWidget,
        QTextEdit,
        QVBoxLayout,
        QWidget,
    )


APP_STYLE = """
QMainWindow {
    background-color: #f5f6f7;
}
QFrame#Sidebar {
    background-color: #1f2329;
    border-right: 1px solid #2f343a;
}
QFrame#Topbar {
    background-color: #ffffff;
    border: 1px solid #e2e6ea;
    border-radius: 10px;
}
QFrame#Card {
    background-color: #ffffff;
    border-radius: 10px;
    border: 1px solid #e2e6ea;
}
QLabel#Title {
    color: #ff6c37;
    font-size: 16px;
    font-weight: 700;
}
QLabel#SectionTitle {
    color: #20242a;
    font-size: 14px;
    font-weight: 700;
}
QLabel {
    color: #2d333b;
}
QListWidget#Nav {
    background: transparent;
    color: #c6ccd3;
    border: none;
    outline: none;
}
QListWidget#Nav::item {
    padding: 10px;
    border-radius: 8px;
    margin: 4px 8px;
}
QListWidget#Nav::item:selected {
    background-color: #ff6c37;
    color: white;
}
QPushButton {
    background-color: #ff6c37;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    font-weight: 600;
}
QPushButton:hover {
    background-color: #e85d2c;
}
QLineEdit, QTextEdit, QListWidget {
    background-color: #ffffff;
    border: 1px solid #d8dde3;
    border-radius: 8px;
    padding: 6px;
    color: #1f2329;
}
"""


class RuntimeWindow(QMainWindow):
    def __init__(self, repo_root: Path) -> None:
        super().__init__()
        self.setWindowTitle("Pilot Runtime (Postman Style)")
        self.resize(1180, 780)
        self.setStyleSheet(APP_STYLE)

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
        self.timer.start(300)

    def _build_ui(self) -> None:
        root = QWidget(self)
        self.setCentralWidget(root)
        outer = QHBoxLayout(root)
        outer.setContentsMargins(18, 18, 18, 18)
        outer.setSpacing(14)

        # Sidebar estilo panel izquierdo del ejemplo.
        sidebar = QFrame()
        sidebar.setObjectName("Sidebar")
        sidebar.setFixedWidth(240)
        side_layout = QVBoxLayout(sidebar)
        side_layout.setContentsMargins(12, 12, 12, 12)

        title = QLabel("Postman Runtime")
        title.setObjectName("Title")
        side_layout.addWidget(title)

        self.nav = QListWidget()
        self.nav.setObjectName("Nav")
        for item_text in ["Collections", "Runner", "Tokens", "Settings"]:
            QListWidgetItem(item_text, self.nav)
        self.nav.setCurrentRow(0)
        self.nav.currentRowChanged.connect(self._switch_page)
        side_layout.addWidget(self.nav, stretch=1)

        self.logout_btn = QPushButton("Cerrar")
        self.logout_btn.clicked.connect(self.close)
        side_layout.addWidget(self.logout_btn)

        outer.addWidget(sidebar)

        # Panel principal
        main_col = QVBoxLayout()
        topbar = QFrame()
        topbar.setObjectName("Topbar")
        topbar_l = QHBoxLayout(topbar)
        topbar_l.addWidget(QLabel("Runtime de Integración PILOT"))
        topbar_l.addStretch(1)
        self.stats_label = QLabel("seen=0 matched=0 archived=0")
        topbar_l.addWidget(self.stats_label)
        main_col.addWidget(topbar)

        self.stack = QStackedWidget()
        self.stack.addWidget(self._build_dashboard_page())
        self.stack.addWidget(self._build_events_page())
        self.stack.addWidget(self._build_tokens_page())
        self.stack.addWidget(self._build_config_page())

        main_col.addWidget(self.stack, stretch=1)
        outer.addLayout(main_col, stretch=1)

    def _card(self) -> QFrame:
        card = QFrame()
        card.setObjectName("Card")
        return card

    def _build_dashboard_page(self) -> QWidget:
        page = QWidget()
        l = QVBoxLayout(page)

        card = self._card()
        card_l = QVBoxLayout(card)
        t = QLabel("Runner Control")
        t.setObjectName("SectionTitle")
        card_l.addWidget(t)

        row = QHBoxLayout()
        self.btn_start = QPushButton("Iniciar envíos")
        self.btn_start.clicked.connect(self.start_runner)
        self.btn_stop = QPushButton("Detener envíos")
        self.btn_stop.clicked.connect(self.stop_runner)
        self.btn_save_cfg = QPushButton("Guardar configuración")
        self.btn_save_cfg.clicked.connect(self.save_config)
        row.addWidget(self.btn_start)
        row.addWidget(self.btn_stop)
        row.addWidget(self.btn_save_cfg)
        row.addStretch(1)
        card_l.addLayout(row)

        l.addWidget(card)
        l.addStretch(1)
        return page

    def _build_events_page(self) -> QWidget:
        page = QWidget()
        l = QVBoxLayout(page)

        card = self._card()
        card_l = QVBoxLayout(card)
        t = QLabel("Console / Events")
        t.setObjectName("SectionTitle")
        card_l.addWidget(t)

        self.events_box = QTextEdit()
        self.events_box.setReadOnly(True)
        self.events_box.setPlaceholderText("Aquí se muestran los envíos y respaldos...")
        card_l.addWidget(self.events_box)

        l.addWidget(card)
        return page

    def _build_tokens_page(self) -> QWidget:
        page = QWidget()
        l = QVBoxLayout(page)

        card = self._card()
        grid = QGridLayout(card)
        title = QLabel("Authorization Tokens")
        title.setObjectName("SectionTitle")
        grid.addWidget(title, 0, 0, 1, 2)

        self.tokens_list = QListWidget()
        grid.addWidget(self.tokens_list, 1, 0, 5, 1)

        self.token_name = QLineEdit()
        self.token_name.setPlaceholderText("Nombre token")
        self.token_value = QLineEdit()
        self.token_value.setPlaceholderText("Valor token")
        self.btn_add_token = QPushButton("Agregar token")
        self.btn_add_token.clicked.connect(self.add_token)
        self.btn_remove_token = QPushButton("Eliminar token")
        self.btn_remove_token.clicked.connect(self.remove_token)
        self.btn_save_tokens = QPushButton("Guardar tokens")
        self.btn_save_tokens.clicked.connect(self.save_tokens_ui)

        grid.addWidget(self.token_name, 1, 1)
        grid.addWidget(self.token_value, 2, 1)
        grid.addWidget(self.btn_add_token, 3, 1)
        grid.addWidget(self.btn_remove_token, 4, 1)
        grid.addWidget(self.btn_save_tokens, 5, 1)

        l.addWidget(card)
        return page

    def _build_config_page(self) -> QWidget:
        page = QWidget()
        l = QVBoxLayout(page)

        card = self._card()
        grid = QGridLayout(card)
        title = QLabel("Environment Settings")
        title.setObjectName("SectionTitle")
        grid.addWidget(title, 0, 0, 1, 2)

        self.input_dir = QLineEdit(self.runtime_config.directory_to_check)
        self.log_dir = QLineEdit(self.runtime_config.directory_to_log)
        self.interval = QLineEdit(str(self.runtime_config.poll_interval_seconds))

        grid.addWidget(QLabel("Carpeta entrada"), 1, 0)
        grid.addWidget(self.input_dir, 1, 1)
        grid.addWidget(QLabel("Carpeta log"), 2, 0)
        grid.addWidget(self.log_dir, 2, 1)
        grid.addWidget(QLabel("Intervalo (s)"), 3, 0)
        grid.addWidget(self.interval, 3, 1)

        l.addWidget(card)
        l.addStretch(1)
        return page

    def _switch_page(self, index: int) -> None:
        self.stack.setCurrentIndex(index)

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
        self.nav.setCurrentRow(1)

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
