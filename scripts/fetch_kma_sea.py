"""Fetch KMA apihub 해양관측 response header (spec) and emit timestamped Markdown.

The KMA apihub sea_obs API returns the spec inline as `#`-prefixed header lines
when called with help=1. We fetch that and render those lines as the spec doc.

Prints the absolute path of the generated .md on the last stdout line.
"""

from __future__ import annotations

import os
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

SPEC_URL = "https://apihub.kma.go.kr/api/typ01/url/sea_obs.php?tm=202301241200&stn=0&help=1"
OUT_PREFIX = "docs/apihub_sea_obs"


def main() -> int:
    if not SPEC_URL:
        print("fetch_kma_sea failed: SPEC_URL is empty.", file=sys.stderr)
        return 1

    try:
        text = _fetch_text(SPEC_URL)
        header, body = _split_header(text)
        if not header:
            raise RuntimeError("no '#'-prefixed header lines found in response")
        md = _render_md(SPEC_URL, header, body)
    except Exception as e:
        print(f"fetch_kma_sea failed: {e}", file=sys.stderr)
        return 1

    ts = datetime.now().strftime("%Y%m%d-%H%M")
    out_md = (REPO_ROOT / f"{OUT_PREFIX}__{ts}.md").resolve()
    out_md.parent.mkdir(parents=True, exist_ok=True)
    out_md.write_text(md, encoding="utf-8")

    print(str(out_md))
    sys.stdout.flush()
    return 0


def _fetch_text(url: str) -> str:
    import requests

    _load_env()
    auth_key = os.environ.get("KMA_API_KEY") or os.environ.get("KMA_AUTH_KEY")

    parsed = urlparse(url)
    q = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if auth_key and "authKey" not in q:
        q["authKey"] = auth_key
    full_url = urlunparse(parsed._replace(query=urlencode(q)))

    r = requests.get(full_url, timeout=30)
    r.raise_for_status()
    r.encoding = r.encoding or "utf-8"
    return r.text


def _load_env() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    for candidate in [REPO_ROOT / "packages" / "collect" / ".env", REPO_ROOT / ".env"]:
        if candidate.is_file():
            load_dotenv(candidate, override=False)


def _split_header(text: str) -> tuple[str, str]:
    header_lines: list[str] = []
    body_lines: list[str] = []
    for raw in text.splitlines():
        line = raw.rstrip()
        if line.startswith("#"):
            header_lines.append(line)
        elif line.strip():
            body_lines.append(line)
    return "\n".join(header_lines), "\n".join(body_lines)


def _render_md(source_url: str, header: str, body: str) -> str:
    fetched_at = datetime.now().isoformat(timespec="seconds")
    sanitized = _strip_auth(source_url)
    sample = "\n".join(body.splitlines()[:5]) if body else "(none)"
    parts = [
        "# KMA apihub 해양관측 명세",
        f"- Source: {sanitized}",
        f"- Fetched: {fetched_at}",
        "",
        "## 응답 헤더 (명세)",
        "",
        "응답 CSV의 `#`-prefixed 주석 라인이 곧 필드·관측소 명세입니다.",
        "",
        "```",
        header,
        "```",
        "",
        "## 샘플 데이터 행 (상위 5)",
        "",
        "```",
        sample,
        "```",
        "",
    ]
    return "\n".join(parts)


def _strip_auth(url: str) -> str:
    p = urlparse(url)
    q = [(k, v) for (k, v) in parse_qsl(p.query) if k.lower() != "authkey"]
    return urlunparse(p._replace(query=urlencode(q)))


if __name__ == "__main__":
    raise SystemExit(main())
