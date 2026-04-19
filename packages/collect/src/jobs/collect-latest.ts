import { prisma, StationType, type Prisma } from "@kors-relv/database";
import { fetchBuoy } from "../clients/khoa-buoy.js";
import { fetchTidal } from "../clients/khoa-tidal.js";
import { fetchKmaSea } from "../clients/kma-sea.js";
import type { KhoaBuoyItem, KhoaTidalItem, KmaSeaRow } from "../api-schema.js";
import {
  KHOA_BUOY_FIELDS,
  KHOA_TIDAL_FIELDS,
  KMA_SEA_FIELDS,
  type ObsSpec,
} from "../obs-codes.js";
import { KHOA_BUOY_STATIONS, KHOA_TIDAL_STATIONS } from "../stations.js";

type ObservationRow = Prisma.ObservationCreateManyInput;

function parseKhoaTime(s: string): Date {
  // "2025-07-30 14:35" → ISO with KST offset.
  return new Date(`${s.replace(" ", "T")}:00+09:00`);
}

function parseKmaTime(s: string): Date {
  // "YYYYMMDDHHmm" KST.
  const y = s.slice(0, 4);
  const mo = s.slice(4, 6);
  const d = s.slice(6, 8);
  const h = s.slice(8, 10);
  const mi = s.slice(10, 12) || "00";
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00+09:00`);
}

async function ensureStation(
  stn_id: string,
  name: string,
  stn_type: StationType,
  lat?: number | null,
  lot?: number | null,
): Promise<void> {
  await prisma.station.upsert({
    where: { stn_id },
    update: { name, stn_type, lat: lat ?? null, lot: lot ?? null },
    create: { stn_id, name, stn_type, lat: lat ?? null, lot: lot ?? null },
  });
}

function explode(
  stn_id: string,
  obs_time: Date,
  source: Record<string, unknown>,
  fields: Record<string, ObsSpec>,
): ObservationRow[] {
  const out: ObservationRow[] = [];
  for (const [key, spec] of Object.entries(fields)) {
    const raw = source[key];
    if (raw === undefined || raw === null || raw === "") continue;
    const value = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(value)) continue;
    out.push({
      stn_id,
      obs_time,
      obs_cd: spec.obs_cd,
      unit: spec.unit,
      value,
    });
  }
  return out;
}

export async function collectKhoaBuoy(): Promise<number> {
  let total = 0;
  for (const obsCode of KHOA_BUOY_STATIONS) {
    try {
      const { items } = await fetchBuoy(obsCode);
      if (items.length) {
        const first = items[0]!;
        await ensureStation(
          obsCode,
          first.obsvtrNm ?? obsCode,
          StationType.BUOY,
          first.lat != null ? Number(first.lat) : null,
          first.lot != null ? Number(first.lot) : null,
        );
      }
      const rows = items.flatMap((it: KhoaBuoyItem) =>
        it.obsrvnDt
          ? explode(obsCode, parseKhoaTime(it.obsrvnDt), it as Record<string, unknown>, KHOA_BUOY_FIELDS)
          : [],
      );
      if (rows.length) {
        await prisma.observation.createMany({ data: rows, skipDuplicates: true });
        total += rows.length;
      }
      console.log(`  ${obsCode}: ${rows.length} rows`);
    } catch (err) {
      console.error(`  ${obsCode}: failed -`, err instanceof Error ? err.message : err);
    }
  }
  return total;
}

export async function collectKhoaTidal(): Promise<number> {
  let total = 0;
  for (const obsCode of KHOA_TIDAL_STATIONS) {
    try {
      const { items } = await fetchTidal(obsCode);
      if (items.length) {
        const first = items[0]!;
        await ensureStation(
          obsCode,
          first.obsvtrNm ?? obsCode,
          StationType.TIDAL,
          first.lat != null ? Number(first.lat) : null,
          first.lot != null ? Number(first.lot) : null,
        );
      }
      const rows = items.flatMap((it: KhoaTidalItem) =>
        it.obsrvnDt
          ? explode(obsCode, parseKhoaTime(it.obsrvnDt), it as Record<string, unknown>, KHOA_TIDAL_FIELDS)
          : [],
      );
      if (rows.length) {
        await prisma.observation.createMany({ data: rows, skipDuplicates: true });
        total += rows.length;
      }
      console.log(`  ${obsCode}: ${rows.length} rows`);
    } catch (err) {
      console.error(`  ${obsCode}: failed -`, err instanceof Error ? err.message : err);
    }
  }
  return total;
}

function kmaStationType(stnId: string): StationType {
  const n = Number(stnId);
  if (n >= 22100 && n < 22200) return StationType.BUOY;    // B
  if (n >= 22400 && n < 22600) return StationType.COASTAL;  // C (파고부이)
  if (n >= 33000 && n < 34000) return StationType.FISHING;  // F
  if (stnId === "22003") return StationType.SPECIAL;         // J
  if (n >= 950 && n < 1000) return StationType.LIGHTHOUSE;   // L
  return StationType.MARINE;                                  // N
}

export async function collectKmaSea(): Promise<number> {
  const rows = await fetchKmaSea();

  // Ensure stations exist
  const seen = new Set<string>();
  for (const r of rows) {
    if (seen.has(r.STN_ID)) continue;
    seen.add(r.STN_ID);
    await ensureStation(
      r.STN_ID,
      r.STN_KO ?? r.STN_ID,
      kmaStationType(r.STN_ID),
    );
  }

  const obs = rows.flatMap((r: KmaSeaRow) =>
    explode(r.STN_ID, parseKmaTime(r.TM), r as unknown as Record<string, unknown>, KMA_SEA_FIELDS),
  );
  if (!obs.length) return 0;
  await prisma.observation.createMany({ data: obs, skipDuplicates: true });
  return obs.length;
}
