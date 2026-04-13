import { config } from "../config.js";

const ENDPOINT =
  "https://apis.data.go.kr/1192136/twRecent/GetTWRecentApiService/getTWRecentApi";

export interface KhoaBuoyItem {
  obsvtrNm?: string;
  lot?: string;
  lat?: string;
  obsrvnDt?: string;
  [field: string]: string | undefined;
}

export interface KhoaBuoyResponse {
  items: KhoaBuoyItem[];
}

export async function fetchBuoy(obsCode: string, reqDate?: string): Promise<KhoaBuoyResponse> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("serviceKey", config.requireKhoa());
  url.searchParams.set("obsCode", obsCode);
  url.searchParams.set("type", "json");
  if (reqDate) url.searchParams.set("reqDate", reqDate);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`KHOA buoy ${res.status}`);
  const json = (await res.json()) as { response?: { body?: { items?: { item?: KhoaBuoyItem[] } } } };
  const items = json.response?.body?.items?.item ?? [];
  return { items };
}
