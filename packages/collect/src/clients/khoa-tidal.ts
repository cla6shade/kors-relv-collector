import { config } from "../config.js";

const ENDPOINT =
  "https://apis.data.go.kr/1192136/tideObsRecent/getSurveyTideLevelApi";

export interface KhoaTidalItem {
  obsvtrNm?: string;
  lat?: string;
  lot?: string;
  obsrvnDt?: string;
  bscTdlvHgt?: string;
  tdlvHgt?: string;
}

export interface KhoaTidalResponse {
  items: KhoaTidalItem[];
}

export async function fetchTidal(obsCode: string, reqDate?: string): Promise<KhoaTidalResponse> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("serviceKey", config.requireKhoa());
  url.searchParams.set("obsCode", obsCode);
  url.searchParams.set("type", "json");
  if (reqDate) url.searchParams.set("reqDate", reqDate);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`KHOA tidal ${res.status}`);
  const json = (await res.json()) as { response?: { body?: { items?: { item?: KhoaTidalItem[] } } } };
  const items = json.response?.body?.items?.item ?? [];
  return { items };
}
