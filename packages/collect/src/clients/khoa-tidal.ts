import { config } from "../config.js";
import { ENDPOINTS, type KhoaTidalItem, unwrapKhoa } from "../api-schema.js";

export interface KhoaTidalResponse {
  items: KhoaTidalItem[];
}

export async function fetchTidal(obsCode: string, reqDate?: string): Promise<KhoaTidalResponse> {
  const params = new URLSearchParams();
  params.set("obsCode", obsCode);
  params.set("type", "json");
  if (reqDate) params.set("reqDate", reqDate);

  const res = await fetch(
    `${ENDPOINTS.khoaTidal}?serviceKey=${config.requireKhoa()}&${params}`,
  );
  if (!res.ok) throw new Error(`KHOA tidal ${res.status}`);
  return { items: unwrapKhoa<KhoaTidalItem>(await res.json()) };
}
