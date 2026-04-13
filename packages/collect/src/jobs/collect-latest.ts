import { prisma, type Prisma } from "@kors-relv/database";
import { fetchBuoy, type KhoaBuoyItem } from "../clients/khoa-buoy.js";
import { fetchTidal, type KhoaTidalItem } from "../clients/khoa-tidal.js";
import { fetchKmaSea, type KmaSeaRow } from "../clients/kma-sea.js";
import {
  KHOA_BUOY_FIELDS,
  KHOA_TIDAL_FIELDS,
  KMA_SEA_FIELDS,
  type ObsSpec,
} from "../obs-codes.js";

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

function explode(
  stn_id: string,
  organization_cd: string,
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
      organization_cd,
      obs_time,
      obs_cd: spec.obs_cd,
      unit: spec.unit,
      value,
    });
  }
  return out;
}

export async function collectKhoaBuoy(obsCode: string): Promise<number> {
  const { items } = await fetchBuoy(obsCode);
  const stn_id = `KHOA:${obsCode}`;
  const rows = items.flatMap((it: KhoaBuoyItem) =>
    it.obsrvnDt
      ? explode(stn_id, "KHOA", parseKhoaTime(it.obsrvnDt), it as Record<string, unknown>, KHOA_BUOY_FIELDS)
      : [],
  );
  if (!rows.length) return 0;
  await prisma.observation.createMany({ data: rows, skipDuplicates: true });
  return rows.length;
}

export async function collectKhoaTidal(obsCode: string): Promise<number> {
  const { items } = await fetchTidal(obsCode);
  const stn_id = `KHOA:${obsCode}`;
  const rows = items.flatMap((it: KhoaTidalItem) =>
    it.obsrvnDt
      ? explode(stn_id, "KHOA", parseKhoaTime(it.obsrvnDt), it as Record<string, unknown>, KHOA_TIDAL_FIELDS)
      : [],
  );
  if (!rows.length) return 0;
  await prisma.observation.createMany({ data: rows, skipDuplicates: true });
  return rows.length;
}

export async function collectKmaSea(): Promise<number> {
  const rows = await fetchKmaSea();
  const obs = rows.flatMap((r: KmaSeaRow) =>
    explode(`KMA:${r.STN_ID}`, "KMA", parseKmaTime(r.TM), r as unknown as Record<string, unknown>, KMA_SEA_FIELDS),
  );
  if (!obs.length) return 0;
  await prisma.observation.createMany({ data: obs, skipDuplicates: true });
  return obs.length;
}
