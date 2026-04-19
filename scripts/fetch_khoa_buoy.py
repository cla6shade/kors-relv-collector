"""Download KHOA buoy OpenAPI spec HWP and emit a timestamped Markdown.

Prints the absolute path of the generated .md on the last stdout line.
Non-zero exit on any failure, with the cause on stderr.
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

SPEC_URL = "https://www.data.go.kr/data/15155516/openapi.do"
OUT_PREFIX = "docs/openapi_buoy"


def main() -> int:
    from scripts.lib.khoa_downloader import download_and_convert, run_and_print

    try:
        out_md = download_and_convert(
            spec_url=SPEC_URL,
            out_prefix=OUT_PREFIX,
            repo_root=REPO_ROOT,
        )
    except Exception as e:
        print(f"fetch_khoa_buoy failed: {e}", file=sys.stderr)
        return 1
    run_and_print(out_md)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
