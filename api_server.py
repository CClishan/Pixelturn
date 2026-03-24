from __future__ import annotations

import os
from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from flask import Flask, jsonify, request, send_file
from PIL import UnidentifiedImageError

from converter_core import OUTPUT_FORMATS, convert_image_bytes, normalize_quality, resolve_output_format

app = Flask(__name__)
ALLOWED_ORIGINS = {origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "").split(",") if origin.strip()}


def _safe_name(filename: str) -> str:
    return Path(filename).name or "image"


def _resolve_cors_origin() -> str | None:
    origin = request.headers.get("Origin")
    if not origin:
        return None
    if not ALLOWED_ORIGINS:
        return "*"
    if origin in ALLOWED_ORIGINS:
        return origin
    return None


@app.after_request
def add_cors_headers(response):
    allowed_origin = _resolve_cors_origin()
    if allowed_origin:
        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Vary"] = "Origin"
    return response


@app.get("/")
def root() -> tuple[object, int]:
    return jsonify({"name": "batch-image-converter-api", "ok": True}), 200


@app.post("/api/convert")
def convert_batch() -> tuple[object, int] | object:
    files = request.files.getlist("files")
    format_key = (request.form.get("format") or "").upper()
    quality_raw = request.form.get("quality", "85")

    if not files:
        return jsonify({"error": "No files uploaded."}), 400

    if format_key not in OUTPUT_FORMATS:
        return jsonify({"error": "Unsupported output format."}), 400

    try:
        quality = int(quality_raw)
    except ValueError:
        return jsonify({"error": "Quality must be an integer."}), 400

    quality = normalize_quality(quality)
    target_format, target_suffix = resolve_output_format(format_key)

    zip_buffer = BytesIO()
    used_names: set[str] = set()

    try:
        with ZipFile(zip_buffer, "w", compression=ZIP_DEFLATED) as archive:
            for uploaded in files:
                safe_name = _safe_name(uploaded.filename or "image")
                source_stem = Path(safe_name).stem or "image"

                output_name = f"{source_stem}{target_suffix}"
                duplicate = 1
                while output_name in used_names:
                    output_name = f"{source_stem}_{duplicate}{target_suffix}"
                    duplicate += 1
                used_names.add(output_name)

                converted_bytes = convert_image_bytes(uploaded.read(), target_format, quality)
                archive.writestr(output_name, converted_bytes)
    except (OSError, UnidentifiedImageError, ValueError) as exc:
        return jsonify({"error": f"Conversion failed: {exc}"}), 400

    zip_buffer.seek(0)
    return send_file(
        zip_buffer,
        mimetype="application/zip",
        as_attachment=True,
        download_name=f"converted_{format_key.lower()}.zip",
    )


@app.get("/api/health")
def healthcheck() -> tuple[object, int]:
    return jsonify({"ok": True}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
