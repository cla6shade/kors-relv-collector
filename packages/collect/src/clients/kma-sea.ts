import { config } from "../config.js";
import { ENDPOINTS, type KmaSeaRow, parseKmaSea } from "../api-schema.js";

export async function fetchKmaSea(tm?: string, stn = "0"): Promise<KmaSeaRow[]> {
  const url = new URL(ENDPOINTS.kmaSea);
  url.searchParams.set("authKey", config.requireKma());
  url.searchParams.set("stn", stn);
  url.searchParams.set("help", "1");
  if (tm) url.searchParams.set("tm", tm);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`KMA sea_obs ${res.status}`);
  const buf = await res.arrayBuffer();
  const text = new TextDecoder("euc-kr").decode(buf);
  return parseKmaSea(text);
}
