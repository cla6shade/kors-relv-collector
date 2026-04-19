import { config } from "../config.js";
import { ENDPOINTS, type KhoaBuoyItem, unwrapKhoa } from "../api-schema.js";

export interface KhoaBuoyResponse {
  items: KhoaBuoyItem[];
}

export async function fetchBuoy(obsCode: string, reqDate?: string): Promise<KhoaBuoyResponse> {
  const params = new URLSearchParams();
  params.set("obsCode", obsCode);
  params.set("type", "json");
  params.set("min", "60");
  params.set("numOfRows", "1");
  params.set("pageNo", "1");
  if (reqDate) params.set("reqDate", reqDate);

  const res = await fetch(
    `${ENDPOINTS.khoaBuoy}?serviceKey=${config.requireKhoa()}&${params}`,
  );
  if (!res.ok) throw new Error(`KHOA buoy ${res.status}`);
  return { items: unwrapKhoa<KhoaBuoyItem>(await res.json()) };
}
