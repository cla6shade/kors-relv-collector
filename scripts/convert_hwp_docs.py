"""Convert HWP API docs in docs/ to AI-readable Markdown.

HWP 파일의 테이블 본문까지 보존하기 위해 hwp5html 로 HTML 을 뽑은 뒤
BeautifulSoup + markdownify 로 마크다운으로 변환한다.

Usage:
    .venv/bin/python scripts/convert_hwp_docs.py

Requires: pyhwp, six, beautifulsoup4, markdownify (installed in .venv).
"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from bs4 import BeautifulSoup
from markdownify import markdownify

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
HWP5HTML = ROOT / ".venv" / "bin" / "hwp5html"


def extract_html(hwp_path: Path, workdir: Path) -> str:
    out_html = workdir / "index.xhtml"
    subprocess.run(
        [str(HWP5HTML), "--html", "--output", str(out_html), str(hwp_path)],
        check=True,
        capture_output=True,
    )
    return out_html.read_text(encoding="utf-8")


def html_to_markdown(title: str, html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    body = soup.body or soup
    # 스타일/스크립트 제거.
    for tag in body.find_all(["style", "script"]):
        tag.decompose()
    md = markdownify(str(body), heading_style="ATX", bullets="-")
    # 공백 정리.
    md = md.replace("\u00a0", " ")
    md = re.sub(r"[ \t]+\n", "\n", md)
    md = re.sub(r"\n{3,}", "\n\n", md).strip()
    return f"# {title}\n\n{md}\n"


def convert_one(hwp_path: Path) -> Path:
    md_path = hwp_path.with_suffix(".md")
    with tempfile.TemporaryDirectory() as td:
        workdir = Path(td)
        try:
            html = extract_html(hwp_path, workdir)
        except subprocess.CalledProcessError as e:
            print(f"[fail] {hwp_path.name}: {e.stderr.decode(errors='replace')}", file=sys.stderr)
            raise
    md_path.write_text(html_to_markdown(hwp_path.stem, html), encoding="utf-8")
    return md_path


def main() -> int:
    hwp_files = sorted(DOCS_DIR.glob("*.hwp"))
    if not hwp_files:
        print("no .hwp files under docs/", file=sys.stderr)
        return 1
    for p in hwp_files:
        out = convert_one(p)
        print(f"{p.name} -> {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
