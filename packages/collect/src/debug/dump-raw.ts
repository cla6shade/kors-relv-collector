import { config } from "../config.js";
import { ENDPOINTS, parseKmaSea, unwrapKhoa, type KhoaBuoyItem, type KhoaTidalItem, type KmaSeaRow } from "../api-schema.js";
import { KHOA_BUOY_FIELDS, KHOA_TIDAL_FIELDS, KMA_SEA_FIELDS, type ObsSpec } from "../obs-codes.js";

const BUOY_STN = "TW_0089";
const TIDAL_STN = "DT_0018";
const KMA_STN = "22101";

function explodePreview(
  stn_id: string,
  obs_time: string,
  source: Record<string, unknown>,
  fields: Record<string, ObsSpec>,
) {
  const out: Array<Record<string, unknown>> = [];
  for (const [key, spec] of Object.entries(fields)) {
    const raw = source[key];
    if (raw === undefined || raw === null || raw === "") continue;
    const value = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(value)) continue;
    out.push({ stn_id, obs_time, obs_cd: spec.obs_cd, value, unit: spec.unit });
  }
  return out;
}

function section(title: string) {
  console.log("\n================================================================");
  console.log(title);
  console.log("================================================================");
}

async function dumpKhoaBuoy() {
  section(`KHOA BUOY — obsCode=${BUOY_STN}`);
  const url = `${ENDPOINTS.khoaBuoy}?serviceKey=${config.requireKhoa()}&type=json&obsCode=${BUOY_STN}`;
  console.log(`GET ${ENDPOINTS.khoaBuoy}?type=json&obsCode=${BUOY_STN}&serviceKey=<redacted>`);
  const res = await fetch(url);
  const json = await res.json();
  console.log("\n-- raw JSON --");
  console.log(JSON.stringify(json, null, 2));

  const items = unwrapKhoa<KhoaBuoyItem>(json);
  const first = items[0];
  console.log("\n-- DB projection (Observation rows from explode) --");
  if (!first || !first.obsrvnDt) {
    console.log("(no items)");
    return;
  }
  const rows = explodePreview(BUOY_STN, first.obsrvnDt, first as Record<string, unknown>, KHOA_BUOY_FIELDS);
  console.log(JSON.stringify(rows, null, 2));
  console.log("\n-- Station upsert --");
  console.log(JSON.stringify({
    stn_id: BUOY_STN,
    name: first.obsvtrNm,
    stn_type: "BUOY",
    lat: first.lat != null ? Number(first.lat) : null,
    lot: first.lot != null ? Number(first.lot) : null,
  }, null, 2));
}

async function dumpKhoaTidal() {
  section(`KHOA TIDAL — obsCode=${TIDAL_STN}`);
  const url = `${ENDPOINTS.khoaTidal}?serviceKey=${config.requireKhoa()}&type=json&obsCode=${TIDAL_STN}`;
  console.log(`GET ${ENDPOINTS.khoaTidal}?type=json&obsCode=${TIDAL_STN}&serviceKey=<redacted>`);
  const res = await fetch(url);
  const json = await res.json();
  console.log("\n-- raw JSON --");
  console.log(JSON.stringify(json, null, 2));

  const items = unwrapKhoa<KhoaTidalItem>(json);
  const first = items[0];
  console.log("\n-- DB projection (Observation rows from explode) --");
  if (!first || !first.obsrvnDt) {
    console.log("(no items)");
    return;
  }
  const rows = explodePreview(TIDAL_STN, first.obsrvnDt, first as Record<string, unknown>, KHOA_TIDAL_FIELDS);
  console.log(JSON.stringify(rows, null, 2));
  console.log("\n-- Station upsert --");
  console.log(JSON.stringify({
    stn_id: TIDAL_STN,
    name: first.obsvtrNm,
    stn_type: "TIDAL",
    lat: first.lat != null ? Number(first.lat) : null,
    lot: first.lot != null ? Number(first.lot) : null,
  }, null, 2));
}

async function dumpKmaSea() {
  section(`KMA SEA — stn=${KMA_STN}`);
  const url = new URL(ENDPOINTS.kmaSea);
  url.searchParams.set("authKey", config.requireKma());
  url.searchParams.set("stn", KMA_STN);
  url.searchParams.set("help", "1");
  const display = new URL(ENDPOINTS.kmaSea);
  display.searchParams.set("authKey", "<redacted>");
  display.searchParams.set("stn", KMA_STN);
  display.searchParams.set("help", "1");
  console.log(`GET ${display.toString()}`);
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const text = new TextDecoder("euc-kr").decode(buf);
  console.log("\n-- raw text --");
  console.log(text);

  const rows: KmaSeaRow[] = parseKmaSea(text);
  console.log("\n-- parsed rows --");
  console.log(JSON.stringify(rows, null, 2));

  console.log("\n-- DB projection (Observation rows from explode) --");
  const obs = rows.flatMap((r) =>
    explodePreview(r.STN_ID, r.TM, r as unknown as Record<string, unknown>, KMA_SEA_FIELDS),
  );
  console.log(JSON.stringify(obs, null, 2));
}

async function main() {
  try { await dumpKhoaBuoy(); } catch (e) { console.error("buoy failed:", e instanceof Error ? e.message : e); }
  try { await dumpKhoaTidal(); } catch (e) { console.error("tidal failed:", e instanceof Error ? e.message : e); }
  try { await dumpKmaSea(); } catch (e) { console.error("kma failed:", e instanceof Error ? e.message : e); }
}

main();
