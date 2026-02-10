from __future__ import annotations

import tkinter as tk
from tkinter import ttk, messagebox
from tkinter.scrolledtext import ScrolledText
from pathlib import Path

from python_runtime.production_runtime import RuntimeRunner
from python_runtime.settings import (
    RuntimeConfig,
    TokenItem,
    load_runtime_config,
    load_tokens,
    save_runtime_config,
    save_tokens,
)


class App(tk.Tk):
    def __init__(self, repo_root: Path) -> None:
        super().__init__()
        self.title("Pilot Python Runtime")
        self.geometry("920x680")

        self.repo_root = repo_root
        self.config_path = repo_root / "python_runtime" / "config" / "runtime_config.json"
        self.tokens_path = repo_root / "python_runtime" / "config" / "tokens.json"

        self.runtime_config: RuntimeConfig = load_runtime_config(self.config_path)
        self.tokens: list[TokenItem] = load_tokens(self.tokens_path)
        self.runner = RuntimeRunner(self.runtime_config, event_cb=self.push_event)

        self._build_ui()
        self._render_tokens()
        self.after(500, self._refresh_stats)

    def _build_ui(self) -> None:
        top = ttk.Frame(self)
        top.pack(fill="x", padx=10, pady=8)

        ttk.Button(top, text="Iniciar envíos", command=self.start_runner).pack(side="left", padx=4)
        ttk.Button(top, text="Detener envíos", command=self.stop_runner).pack(side="left", padx=4)
        ttk.Button(top, text="Guardar configuración", command=self.save_config).pack(side="left", padx=4)

        cfg = ttk.LabelFrame(self, text="Configuración runtime (sin PHP)")
        cfg.pack(fill="x", padx=10, pady=6)

        self.dir_check_var = tk.StringVar(value=self.runtime_config.directory_to_check)
        self.dir_log_var = tk.StringVar(value=self.runtime_config.directory_to_log)
        self.interval_var = tk.StringVar(value=str(self.runtime_config.poll_interval_seconds))

        self._row(cfg, "Carpeta entrada", self.dir_check_var, 0)
        self._row(cfg, "Carpeta log", self.dir_log_var, 1)
        self._row(cfg, "Intervalo (s)", self.interval_var, 2)

        stats = ttk.LabelFrame(self, text="Estado en tiempo real")
        stats.pack(fill="x", padx=10, pady=6)
        self.stats_var = tk.StringVar(value="seen=0 matched=0 archived=0")
        ttk.Label(stats, textvariable=self.stats_var).pack(anchor="w", padx=8, pady=6)

        events = ttk.LabelFrame(self, text="Eventos de envío")
        events.pack(fill="both", expand=True, padx=10, pady=6)
        self.events_box = ScrolledText(events, height=14)
        self.events_box.pack(fill="both", expand=True, padx=6, pady=6)

        tkgrid = ttk.LabelFrame(self, text="Tokens (agregar manualmente fuera del código)")
        tkgrid.pack(fill="both", expand=False, padx=10, pady=6)

        self.tokens_list = tk.Listbox(tkgrid, height=6)
        self.tokens_list.grid(row=0, column=0, rowspan=4, sticky="nsew", padx=6, pady=6)

        tkgrid.columnconfigure(0, weight=1)
        tkgrid.columnconfigure(1, weight=2)

        self.token_name = tk.StringVar()
        self.token_value = tk.StringVar()
        ttk.Entry(tkgrid, textvariable=self.token_name).grid(row=0, column=1, sticky="ew", padx=4, pady=2)
        ttk.Entry(tkgrid, textvariable=self.token_value).grid(row=1, column=1, sticky="ew", padx=4, pady=2)

        ttk.Button(tkgrid, text="Agregar token", command=self.add_token).grid(row=2, column=1, sticky="ew", padx=4, pady=2)
        ttk.Button(tkgrid, text="Eliminar token seleccionado", command=self.remove_token).grid(row=3, column=1, sticky="ew", padx=4, pady=2)
        ttk.Button(tkgrid, text="Guardar tokens", command=self.save_tokens_ui).grid(row=4, column=0, columnspan=2, sticky="ew", padx=6, pady=6)

    def _row(self, parent: ttk.Frame, label: str, var: tk.StringVar, row: int) -> None:
        ttk.Label(parent, text=label).grid(row=row, column=0, sticky="w", padx=6, pady=3)
        ttk.Entry(parent, textvariable=var).grid(row=row, column=1, sticky="ew", padx=6, pady=3)
        parent.columnconfigure(1, weight=1)

    def push_event(self, text: str) -> None:
        self.events_box.insert("end", text + "\n")
        self.events_box.see("end")

    def _refresh_stats(self) -> None:
        s = self.runner.last_stats
        self.stats_var.set(f"seen={s['seen']} matched={s['matched']} archived={s['archived']}")
        self.after(500, self._refresh_stats)

    def start_runner(self) -> None:
        self.save_config(silent=True)
        self.runner = RuntimeRunner(self.runtime_config, event_cb=self.push_event)
        self.runner.start()

    def stop_runner(self) -> None:
        self.runner.stop()

    def save_config(self, silent: bool = False) -> None:
        self.runtime_config = RuntimeConfig(
            directory_to_check=self.dir_check_var.get().strip(),
            directory_to_log=self.dir_log_var.get().strip(),
            poll_interval_seconds=int(self.interval_var.get().strip() or "15"),
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
            messagebox.showinfo("Configuración", "Configuración guardada")

    def _render_tokens(self) -> None:
        self.tokens_list.delete(0, "end")
        for token in self.tokens:
            self.tokens_list.insert("end", token.name)

    def add_token(self) -> None:
        name = self.token_name.get().strip()
        value = self.token_value.get().strip()
        if not name or not value:
            messagebox.showwarning("Tokens", "Nombre y valor son requeridos")
            return
        self.tokens.append(TokenItem(name=name, value=value))
        self._render_tokens()
        self.token_name.set("")
        self.token_value.set("")

    def remove_token(self) -> None:
        idx = self.tokens_list.curselection()
        if not idx:
            return
        del self.tokens[idx[0]]
        self._render_tokens()

    def save_tokens_ui(self) -> None:
        save_tokens(self.tokens_path, self.tokens)
        messagebox.showinfo("Tokens", "Tokens guardados")


def main() -> None:
    app = App(Path('.').resolve())
    app.mainloop()


if __name__ == "__main__":
    main()
