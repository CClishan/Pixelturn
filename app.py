from __future__ import annotations

import threading
from pathlib import Path

import tkinter as tk
from tkinter import filedialog, messagebox, ttk

from PIL import UnidentifiedImageError

from converter_core import OUTPUT_FORMATS, collect_supported_files, convert_image_file, resolve_output_format


class BatchImageConverterApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Batch Image Converter")
        self.root.geometry("1024x720")
        self.root.minsize(920, 640)
        self.root.configure(bg="#0a0e14")

        self.input_dir = tk.StringVar()
        self.output_dir = tk.StringVar()
        self.output_format = tk.StringVar(value="WEBP")
        self.quality = tk.IntVar(value=90)
        self.recursive = tk.BooleanVar(value=True)
        self.keep_structure = tk.BooleanVar(value=True)
        self.overwrite = tk.BooleanVar(value=False)
        self.running = False

        self._configure_styles()
        self._build_layout()

    def _configure_styles(self) -> None:
        style = ttk.Style()
        style.theme_use("clam")

        style.configure(
            "Panel.TFrame",
            background="#111827",
            relief="flat",
        )
        style.configure(
            "Card.TFrame",
            background="#161d2b",
            relief="flat",
        )
        style.configure(
            "Title.TLabel",
            background="#0a0e14",
            foreground="#f8fafc",
            font=("Avenir Next", 28, "bold"),
        )
        style.configure(
            "Muted.TLabel",
            background="#0a0e14",
            foreground="#94a3b8",
            font=("Avenir Next", 11),
        )
        style.configure(
            "Section.TLabel",
            background="#161d2b",
            foreground="#f8fafc",
            font=("Avenir Next", 14, "bold"),
        )
        style.configure(
            "Body.TLabel",
            background="#161d2b",
            foreground="#cbd5e1",
            font=("Avenir Next", 11),
        )
        style.configure(
            "Path.TEntry",
            fieldbackground="#0f172a",
            foreground="#f8fafc",
            bordercolor="#233044",
            lightcolor="#233044",
            darkcolor="#233044",
            insertcolor="#f8fafc",
            padding=8,
        )
        style.configure(
            "Primary.TButton",
            background="#f97316",
            foreground="#fff7ed",
            borderwidth=0,
            focusthickness=0,
            font=("Avenir Next", 11, "bold"),
            padding=(16, 10),
        )
        style.map(
            "Primary.TButton",
            background=[("active", "#fb923c"), ("disabled", "#334155")],
            foreground=[("disabled", "#94a3b8")],
        )
        style.configure(
            "Secondary.TButton",
            background="#1f2937",
            foreground="#e2e8f0",
            borderwidth=0,
            focusthickness=0,
            font=("Avenir Next", 10, "bold"),
            padding=(14, 9),
        )
        style.map(
            "Secondary.TButton",
            background=[("active", "#334155")],
        )
        style.configure(
            "App.TCheckbutton",
            background="#161d2b",
            foreground="#cbd5e1",
            indicatorcolor="#0f172a",
            indicatormargin=6,
            padding=4,
            font=("Avenir Next", 11),
        )
        style.map(
            "App.TCheckbutton",
            background=[("active", "#161d2b")],
            foreground=[("active", "#f8fafc")],
        )
        style.configure(
            "App.TCombobox",
            fieldbackground="#0f172a",
            background="#0f172a",
            foreground="#f8fafc",
            arrowcolor="#f97316",
            bordercolor="#233044",
            lightcolor="#233044",
            darkcolor="#233044",
            padding=6,
        )
        style.configure(
            "App.Horizontal.TScale",
            background="#161d2b",
            troughcolor="#0f172a",
        )
        style.configure(
            "App.Horizontal.TProgressbar",
            troughcolor="#0f172a",
            background="#f97316",
            bordercolor="#0f172a",
            lightcolor="#f97316",
            darkcolor="#f97316",
        )

    def _build_layout(self) -> None:
        container = tk.Frame(self.root, bg="#0a0e14")
        container.pack(fill="both", expand=True, padx=24, pady=24)

        header = tk.Frame(container, bg="#0a0e14")
        header.pack(fill="x", pady=(0, 18))

        ttk.Label(header, text="Batch Image Converter", style="Title.TLabel").pack(anchor="w")
        ttk.Label(
            header,
            text="Bulk convert folders of images into JPG, PNG, WEBP, BMP, or TIFF.",
            style="Muted.TLabel",
        ).pack(anchor="w", pady=(6, 0))

        body = tk.Frame(container, bg="#0a0e14")
        body.pack(fill="both", expand=True)
        body.grid_columnconfigure(0, weight=3)
        body.grid_columnconfigure(1, weight=2)
        body.grid_rowconfigure(0, weight=1)

        left = ttk.Frame(body, style="Panel.TFrame", padding=18)
        left.grid(row=0, column=0, sticky="nsew", padx=(0, 12))
        right = ttk.Frame(body, style="Panel.TFrame", padding=18)
        right.grid(row=0, column=1, sticky="nsew")

        self._build_source_card(left)
        self._build_options_card(left)
        self._build_actions_card(left)
        self._build_status_card(right)

    def _build_source_card(self, parent: ttk.Frame) -> None:
        card = ttk.Frame(parent, style="Card.TFrame", padding=18)
        card.pack(fill="x", pady=(0, 14))

        ttk.Label(card, text="Folders", style="Section.TLabel").pack(anchor="w")
        ttk.Label(card, text="Choose where images come from and where converted files should go.", style="Body.TLabel").pack(anchor="w", pady=(6, 12))

        self._path_field(card, "Input folder", self.input_dir, self.pick_input_dir)
        self._path_field(card, "Output folder", self.output_dir, self.pick_output_dir)

    def _path_field(self, parent: ttk.Frame, label: str, variable: tk.StringVar, command) -> None:
        ttk.Label(parent, text=label, style="Body.TLabel").pack(anchor="w", pady=(8, 6))
        row = tk.Frame(parent, bg="#161d2b")
        row.pack(fill="x")
        entry = ttk.Entry(row, textvariable=variable, style="Path.TEntry")
        entry.pack(side="left", fill="x", expand=True)
        ttk.Button(row, text="Browse", style="Secondary.TButton", command=command).pack(side="left", padx=(10, 0))

    def _build_options_card(self, parent: ttk.Frame) -> None:
        card = ttk.Frame(parent, style="Card.TFrame", padding=18)
        card.pack(fill="x", pady=(0, 14))

        ttk.Label(card, text="Conversion", style="Section.TLabel").pack(anchor="w")
        ttk.Label(card, text="Set output format, quality, and how folders are handled.", style="Body.TLabel").pack(anchor="w", pady=(6, 14))

        format_row = tk.Frame(card, bg="#161d2b")
        format_row.pack(fill="x")
        ttk.Label(format_row, text="Format", style="Body.TLabel").pack(side="left")
        combo = ttk.Combobox(
            format_row,
            values=list(OUTPUT_FORMATS.keys()),
            textvariable=self.output_format,
            state="readonly",
            width=10,
            style="App.TCombobox",
        )
        combo.pack(side="right")

        quality_row = tk.Frame(card, bg="#161d2b")
        quality_row.pack(fill="x", pady=(16, 0))
        ttk.Label(quality_row, text="Quality", style="Body.TLabel").pack(side="left")
        self.quality_label = ttk.Label(quality_row, text=f"{self.quality.get()}%", style="Body.TLabel")
        self.quality_label.pack(side="right")

        scale = ttk.Scale(
            card,
            from_=10,
            to=100,
            variable=self.quality,
            command=self._on_quality_change,
            style="App.Horizontal.TScale",
        )
        scale.pack(fill="x", pady=(10, 14))

        ttk.Checkbutton(card, text="Scan subfolders recursively", variable=self.recursive, style="App.TCheckbutton").pack(anchor="w")
        ttk.Checkbutton(card, text="Keep folder structure in output", variable=self.keep_structure, style="App.TCheckbutton").pack(anchor="w")
        ttk.Checkbutton(card, text="Overwrite existing files", variable=self.overwrite, style="App.TCheckbutton").pack(anchor="w")

    def _build_actions_card(self, parent: ttk.Frame) -> None:
        card = ttk.Frame(parent, style="Card.TFrame", padding=18)
        card.pack(fill="x")

        ttk.Label(card, text="Run", style="Section.TLabel").pack(anchor="w")
        ttk.Label(card, text="The tool keeps going if one file fails and writes every result to the log.", style="Body.TLabel").pack(anchor="w", pady=(6, 14))

        self.progress = ttk.Progressbar(card, mode="determinate", style="App.Horizontal.TProgressbar")
        self.progress.pack(fill="x")

        self.progress_text = ttk.Label(card, text="Ready", style="Body.TLabel")
        self.progress_text.pack(anchor="w", pady=(10, 16))

        buttons = tk.Frame(card, bg="#161d2b")
        buttons.pack(fill="x")
        self.start_button = ttk.Button(buttons, text="Start Conversion", style="Primary.TButton", command=self.start_conversion)
        self.start_button.pack(side="left")
        ttk.Button(buttons, text="Clear Log", style="Secondary.TButton", command=self.clear_log).pack(side="left", padx=(10, 0))

    def _build_status_card(self, parent: ttk.Frame) -> None:
        card = ttk.Frame(parent, style="Card.TFrame", padding=18)
        card.pack(fill="both", expand=True)

        ttk.Label(card, text="Activity", style="Section.TLabel").pack(anchor="w")
        ttk.Label(card, text="Each converted file is listed here with success or error details.", style="Body.TLabel").pack(anchor="w", pady=(6, 12))

        text_frame = tk.Frame(card, bg="#161d2b")
        text_frame.pack(fill="both", expand=True)

        scrollbar = tk.Scrollbar(text_frame, bg="#0f172a", troughcolor="#0f172a", activebackground="#334155")
        scrollbar.pack(side="right", fill="y")

        self.log = tk.Text(
            text_frame,
            wrap="word",
            bg="#0b1220",
            fg="#e2e8f0",
            insertbackground="#f8fafc",
            selectbackground="#1d4ed8",
            relief="flat",
            font=("SF Mono", 11),
            yscrollcommand=scrollbar.set,
            padx=12,
            pady=12,
        )
        self.log.pack(side="left", fill="both", expand=True)
        scrollbar.config(command=self.log.yview)

    def pick_input_dir(self) -> None:
        path = filedialog.askdirectory(title="Select input folder")
        if path:
            self.input_dir.set(path)

    def pick_output_dir(self) -> None:
        path = filedialog.askdirectory(title="Select output folder")
        if path:
            self.output_dir.set(path)

    def _on_quality_change(self, value: str) -> None:
        self.quality_label.config(text=f"{int(float(value))}%")

    def clear_log(self) -> None:
        self.log.delete("1.0", tk.END)

    def write_log(self, message: str) -> None:
        self.log.insert(tk.END, message + "\n")
        self.log.see(tk.END)

    def set_progress(self, current: int, total: int, text: str) -> None:
        self.progress["maximum"] = max(total, 1)
        self.progress["value"] = current
        self.progress_text.config(text=text)

    def start_conversion(self) -> None:
        if self.running:
            return

        input_path = Path(self.input_dir.get()).expanduser()
        output_path = Path(self.output_dir.get()).expanduser()

        if not input_path.is_dir():
            messagebox.showerror("Invalid input", "Please choose a valid input folder.")
            return

        if not output_path.is_dir():
            messagebox.showerror("Invalid output", "Please choose a valid output folder.")
            return

        self.running = True
        self.start_button.state(["disabled"])
        self.write_log("--- Starting conversion ---")
        worker = threading.Thread(target=self.convert_batch, daemon=True)
        worker.start()

    def _collect_files(self, input_dir: Path) -> list[Path]:
        return collect_supported_files(input_dir, recursive=self.recursive.get())

    def convert_batch(self) -> None:
        input_dir = Path(self.input_dir.get()).expanduser()
        output_dir = Path(self.output_dir.get()).expanduser()
        target_key = self.output_format.get()
        target_format, target_suffix = resolve_output_format(target_key)
        quality = int(self.quality.get())
        overwrite = self.overwrite.get()

        files = self._collect_files(input_dir)
        total = len(files)

        if total == 0:
            self.root.after(0, self.finish_conversion, "No supported image files found.")
            return

        success_count = 0
        error_count = 0

        for index, source in enumerate(files, start=1):
            if self.keep_structure.get():
                relative_parent = source.parent.relative_to(input_dir)
                target_parent = output_dir / relative_parent
            else:
                target_parent = output_dir

            destination = target_parent / f"{source.stem}{target_suffix}"

            if destination.exists() and not overwrite:
                error_count += 1
                self.root.after(0, self.write_log, f"SKIP  {source.name} -> already exists")
                self.root.after(0, self.set_progress, index, total, f"{index}/{total} processed")
                continue

            try:
                target_parent.mkdir(parents=True, exist_ok=True)
                self._convert_image(source, destination, target_format, quality)
                success_count += 1
                self.root.after(0, self.write_log, f"DONE  {source.name} -> {destination.name}")
            except (OSError, UnidentifiedImageError, ValueError) as exc:
                error_count += 1
                self.root.after(0, self.write_log, f"FAIL  {source.name} -> {exc}")

            self.root.after(0, self.set_progress, index, total, f"{index}/{total} processed")

        message = f"Finished. Success: {success_count}, Failed/Skipped: {error_count}."
        self.root.after(0, self.finish_conversion, message)

    def _convert_image(self, source: Path, destination: Path, target_format: str, quality: int) -> None:
        convert_image_file(source, destination, target_format, quality)

    def finish_conversion(self, message: str) -> None:
        self.running = False
        self.start_button.state(["!disabled"])
        self.write_log(message)
        self.progress_text.config(text=message)


def main() -> None:
    root = tk.Tk()
    app = BatchImageConverterApp(root)
    app.write_log("Select an input folder and an output folder to begin.")
    root.mainloop()


if __name__ == "__main__":
    main()
