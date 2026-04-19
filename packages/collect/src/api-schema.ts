export const ENDPOINTS = {
  khoaBuoy: "https://apis.data.go.kr/1192136/twRecent/GetTWRecentApiService",
  khoaTidal: "https://apis.data.go.kr/1192136/dtRecent/GetDTRecentApiService",
  kmaSea: "https://apihub.kma.go.kr/api/typ01/url/sea_obs.php",
} as const;

export interface KhoaBuoyItem {
  obsvtrNm?: string;
  lot?: string;
  lat?: string;
  obsrvnDt?: string;
  [field: string]: string | undefined;
}

export interface KhoaTidalItem {
  obsvtrNm?: string;
  lat?: string;
  lot?: string;
  obsrvnDt?: string;
  bscTdlvHgt?: string;
  tdlvHgt?: string;
}

type KhoaEnvelope<T> = {
  body?: { items?: { item?: T[] } };
  response?: { body?: { items?: { item?: T[] } } };
};

export function unwrapKhoa<T>(json: unknown): T[] {
  const env = json as KhoaEnvelope<T>;
  return env.body?.items?.item ?? env.response?.body?.items?.item ?? [];
}

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

const KMA_SEA_NUMERIC_FIELDS: Array<keyof KmaSeaRow> = [
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
 * KMA 응답은 CSV 형식:
 * - `#`으로 시작하는 줄은 메타/헤더
 * - 데이터 줄: `TP, TM, STN_ID, STN_KO, LON, LAT, WH, WD, WS, WS_GST, TW, TA, PA, HM, ..., =`
 * - 결측값: `-9`, `-99`
 */
export function parseKmaSea(text: string): KmaSeaRow[] {
  const lines = text.split(/\r?\n/);
  const rows: KmaSeaRow[] = [];

  const COL_MAP = [
    "TP", "TM", "STN_ID", "STN_KO", "LON", "LAT",
    "WH", "WD", "WS", "WS_GST", "TW", "TA", "PA", "HM",
  ];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const cells = line.split(",").map((c) => c.trim());
    if (cells.length < COL_MAP.length) continue;

    const map: Record<string, string> = {};
    COL_MAP.forEach((col, i) => {
      map[col] = cells[i] ?? "";
    });

    if (!map["STN_ID"] || !map["TM"]) continue;

    const row: Partial<KmaSeaRow> = {
      STN_ID: map["STN_ID"],
      STN_KO: map["STN_KO"] || undefined,
      TM: map["TM"],
    };

    for (const field of KMA_SEA_NUMERIC_FIELDS) {
      const val = map[field];
      if (val === undefined || val === "" || val === "-9" || val === "-99") continue;
      const n = Number(val);
      if (Number.isFinite(n)) (row as Record<string, number>)[field] = n;
    }

    rows.push(row as KmaSeaRow);
  }

  return rows;
}
