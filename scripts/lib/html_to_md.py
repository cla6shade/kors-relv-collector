"""HTML to Markdown helpers for the KMA apihub spec fetcher."""

from __future__ import annotations

from typing import Iterable


def html_fragments_to_md(fragments: Iterable[str]) -> str:
    try:
        from markdownify import markdownify
    except ImportError as e:
        raise RuntimeError("markdownify not installed; run: pip install -r scripts/requirements.txt") from e
    parts = [markdownify(f, heading_style="ATX", strip=["script", "style"]) for f in fragments if f]
    return "\n\n".join(p.strip() for p in parts if p and p.strip()) + "\n"


def render_spec_md(
    *,
    title: str,
    source_url: str,
    fetched_at: str,
    endpoint_html: str = "",
    params_html: str = "",
    fields_html: str = "",
    stations_html: str = "",
    example_html: str = "",
) -> str:
    sections: list[str] = [f"# {title}", f"- Source: {source_url}", f"- Fetched: {fetched_at}", ""]
    section_map = [
        ("엔드포인트", endpoint_html),
        ("파라미터", params_html),
        ("응답 필드", fields_html),
        ("관측소 목록", stations_html),
        ("예시 응답", example_html),
    ]
    for heading, html in section_map:
        sections.append(f"## {heading}")
        if html and html.strip():
            sections.append(html_fragments_to_md([html]).rstrip())
        else:
            sections.append("_(not detected)_")
        sections.append("")
    return "\n".join(sections)
