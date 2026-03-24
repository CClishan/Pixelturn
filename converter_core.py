from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import BinaryIO

from PIL import Image


SUPPORTED_INPUTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".gif"}
OUTPUT_FORMATS = {
    "JPG": ("JPEG", ".jpg"),
    "PNG": ("PNG", ".png"),
    "WEBP": ("WEBP", ".webp"),
    "BMP": ("BMP", ".bmp"),
    "TIFF": ("TIFF", ".tiff"),
}


def resolve_output_format(format_key: str) -> tuple[str, str]:
    normalized = format_key.upper()
    if normalized not in OUTPUT_FORMATS:
        raise ValueError(f"Unsupported output format: {format_key}")
    return OUTPUT_FORMATS[normalized]


def collect_supported_files(input_dir: Path, recursive: bool) -> list[Path]:
    files = input_dir.rglob("*") if recursive else input_dir.iterdir()
    return sorted(path for path in files if path.is_file() and path.suffix.lower() in SUPPORTED_INPUTS)


def normalize_quality(quality: int) -> int:
    return max(1, min(100, quality))


def convert_image_bytes(source_bytes: bytes, target_format: str, quality: int) -> bytes:
    with Image.open(BytesIO(source_bytes)) as image:
        output = BytesIO()
        save_converted_image(image, output, target_format, quality)
        return output.getvalue()


def convert_image_file(source: Path, destination: Path, target_format: str, quality: int) -> None:
    with Image.open(source) as image:
        save_converted_image(image, destination, target_format, quality)


def save_converted_image(
    image: Image.Image,
    destination: str | Path | BinaryIO,
    target_format: str,
    quality: int,
) -> None:
    converted = _prepare_image(image, target_format)
    save_kwargs = _build_save_kwargs(target_format, quality)
    converted.save(destination, **save_kwargs)


def _prepare_image(image: Image.Image, target_format: str) -> Image.Image:
    if target_format == "JPEG":
        if image.mode not in ("RGB", "L"):
            background = Image.new("RGB", image.size, (255, 255, 255))
            rgba = image.convert("RGBA")
            background.paste(rgba, mask=rgba.getchannel("A"))
            return background
        if image.mode != "RGB":
            return image.convert("RGB")
    elif image.mode == "P":
        return image.convert("RGBA")

    return image


def _build_save_kwargs(target_format: str, quality: int) -> dict[str, object]:
    save_kwargs: dict[str, object] = {"format": target_format}
    normalized_quality = normalize_quality(quality)

    if target_format in {"JPEG", "WEBP"}:
        save_kwargs["quality"] = normalized_quality
        save_kwargs["optimize"] = True
    if target_format == "PNG":
        save_kwargs["optimize"] = True

    return save_kwargs
