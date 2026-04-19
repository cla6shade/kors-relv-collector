"""Selenium-driven HWP downloader for data.go.kr OpenAPI spec pages."""

from __future__ import annotations

import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional


def download_and_convert(
    *,
    spec_url: str,
    out_prefix: str,
    repo_root: Path,
    download_timeout_sec: int = 120,
) -> Path:
    """Open spec_url in headless Chromium, download the HWP, convert to Markdown.

    Returns the absolute path of the written .md file.
    """
    from selenium import webdriver
    from selenium.common.exceptions import NoSuchElementException
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from webdriver_manager.chrome import ChromeDriverManager

    download_dir = repo_root / "scripts" / ".downloads"
    download_dir.mkdir(parents=True, exist_ok=True)
    _clear_dir(download_dir)

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_experimental_option(
        "prefs",
        {
            "download.default_directory": str(download_dir),
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True,
        },
    )

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    try:
        driver.get(spec_url)
        time.sleep(2)
        hwp_link = _find_hwp_link(driver, By, NoSuchElementException)
        if hwp_link is None:
            raise RuntimeError(f"No HWP download link found on {spec_url}")
        driver.execute_script("arguments[0].scrollIntoView(true); arguments[0].click();", hwp_link)
        hwp_path = _wait_for_hwp(download_dir, download_timeout_sec)
    finally:
        driver.quit()

    from scripts.lib.hwp_to_md import hwp_to_md

    ts = datetime.now().strftime("%Y%m%d-%H%M")
    out_md = (repo_root / f"{out_prefix}__{ts}.md").resolve()
    hwp_to_md(hwp_path, out_md)
    _clear_dir(download_dir)
    return out_md


def _find_hwp_link(driver, By, NoSuchElementException) -> Optional[object]:
    for link in driver.find_elements(By.TAG_NAME, "a"):
        title = link.get_attribute("title") or ""
        if "참고문서 다운로드" in title:
            return link
    return None


def _wait_for_hwp(download_dir: Path, timeout_sec: int) -> Path:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        partials = list(download_dir.glob("*.crdownload"))
        files = [p for p in download_dir.iterdir() if p.is_file() and p.suffix.lower() in {".hwp", ".hwpx"}]
        if files and not partials:
            return files[0]
        time.sleep(1)
    raise TimeoutError(f"HWP download did not complete within {timeout_sec}s (dir: {download_dir})")


def _clear_dir(d: Path) -> None:
    for p in d.iterdir():
        if p.is_file():
            p.unlink()


def run_and_print(out_md: Path) -> None:
    print(str(out_md))
    sys.stdout.flush()
