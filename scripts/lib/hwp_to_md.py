"""HWP to Markdown converter.

Backends (pick via HWP_TO_MD_BACKEND env var):
- "pyhwp" (default): pyhwp's hwp5html -> HTML -> markdownify.
- "libreoffice": soffice --headless --convert-to html -> markdownify.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def hwp_to_md(hwp_path: Path, out_md_path: Path) -> Path:
    hwp_path = Path(hwp_path).resolve()
    out_md_path = Path(out_md_path).resolve()
    if not hwp_path.is_file():
        raise FileNotFoundError(f"HWP not found: {hwp_path}")

    backend = os.environ.get("HWP_TO_MD_BACKEND", "pyhwp").lower()
    out_md_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        html_path = _convert_to_html(hwp_path, tmp_dir, backend)
        md_text = _html_file_to_md(html_path)
        out_md_path.write_text(md_text, encoding="utf-8")

    return out_md_path


def _convert_to_html(hwp_path: Path, tmp_dir: Path, backend: str) -> Path:
    if backend == "pyhwp":
        return _convert_with_pyhwp(hwp_path, tmp_dir)
    if backend == "libreoffice":
        return _convert_with_libreoffice(hwp_path, tmp_dir)
    raise ValueError(f"Unknown HWP_TO_MD_BACKEND: {backend}")


def _convert_with_pyhwp(hwp_path: Path, tmp_dir: Path) -> Path:
    out_dir = tmp_dir / "hwp5html_out"
    out_dir.mkdir()
    cmd = ["hwp5html", "--output", str(out_dir), str(hwp_path)]
    _run(cmd, "hwp5html")
    index = out_dir / "index.xhtml"
    if not index.is_file():
        index = next(out_dir.glob("*.xhtml"), None) or next(out_dir.glob("*.html"), None)
    if index is None or not index.is_file():
        raise RuntimeError("hwp5html produced no HTML output")
    return index


def _convert_with_libreoffice(hwp_path: Path, tmp_dir: Path) -> Path:
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        raise RuntimeError("libreoffice/soffice not found on PATH")
    cmd = [soffice, "--headless", "--convert-to", "html", "--outdir", str(tmp_dir), str(hwp_path)]
    _run(cmd, "libreoffice")
    html = next(tmp_dir.glob("*.html"), None)
    if html is None:
        raise RuntimeError("libreoffice produced no HTML output")
    return html


def _html_file_to_md(html_path: Path) -> str:
    try:
        from markdownify import markdownify
    except ImportError as e:
        raise RuntimeError("markdownify not installed; run: pip install -r scripts/requirements.txt") from e
    html = html_path.read_text(encoding="utf-8", errors="replace")
    return markdownify(html, heading_style="ATX", strip=["script", "style"])


def _run(cmd: list[str], name: str) -> None:
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except FileNotFoundError as e:
        raise RuntimeError(f"{name} not found: {cmd[0]}") from e
    if result.returncode != 0:
        raise RuntimeError(f"{name} failed (exit {result.returncode}): {result.stderr.strip()}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python -m scripts.lib.hwp_to_md <in.hwp> <out.md>", file=sys.stderr)
        sys.exit(2)
    try:
        path = hwp_to_md(Path(sys.argv[1]), Path(sys.argv[2]))
    except Exception as e:
        print(f"hwp_to_md failed: {e}", file=sys.stderr)
        sys.exit(1)
    print(str(path))
