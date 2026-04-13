import { config } from "../config.js";

const ENDPOINT = "https://apihub.kma.go.kr/api/typ01/url/sea_obs.php";

export interface KmaSeaRow {
  STN_ID: string;
  STN_KO?: string;
  TM: string;
  WH?: number;
  WD?: number;
  WS?: number;
  WS_GST?: number;
  TW?: number;
  TA?: number;
  PA?: number;
  HM?: number;
}

const NUMERIC_FIELDS: Array<keyof KmaSeaRow> = [
  "WH",
  "WD",
  "WS",
  "WS_GST",
  "TW",
  "TA",
  "PA",
  "HM",
];

/**
 * KMA API허브는 fixed-width / 헤더 라인이 포함된 plain text를 반환한다.
 * `#`로 시작하는 라인은 메타/헤더, 데이터 라인은 공백 분리.
 * 컬럼 순서는 `help=1`로 받은 헤더에서 추출해 매핑한다.
 */
export async function fetchKmaSea(tm?: string, stn = "0"): Promise<KmaSeaRow[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("authKey", config.requireKma());
  url.searchParams.set("stn", stn);
  url.searchParams.set("help", "1");
  if (tm) url.searchParams.set("tm", tm);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`KMA sea_obs ${res.status}`);
  const text = await res.text();
  return parseKmaSea(text);
}

export function parseKmaSea(text: string): KmaSeaRow[] {
  const lines = text.split(/\r?\n/);
  let header: string[] | null = null;
  const rows: KmaSeaRow[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) {
      // 마지막 # 라인을 헤더로 가정 (보통 컬럼명 라인).
      const cols = line.replace(/^#+/, "").trim().split(/\s+/);
      if (cols.includes("STN_ID") || cols.includes("TM")) header = cols;
      continue;
    }
    if (!header) continue;

    const cells = line.split(/\s+/);
    const row: Partial<KmaSeaRow> = {};
    header.forEach((col, i) => {
      const cell = cells[i];
      if (cell === undefined || cell === "" || cell === "-9" || cell === "-99") return;
      if (col === "STN_ID" || col === "STN_KO" || col === "TM") {
        (row as Record<string, string>)[col] = cell;
      } else if ((NUMERIC_FIELDS as string[]).includes(col)) {
        const n = Number(cell);
        if (Number.isFinite(n)) (row as Record<string, number>)[col] = n;
      }
    });
    if (row.STN_ID && row.TM) rows.push(row as KmaSeaRow);
  }

  return rows;
}
