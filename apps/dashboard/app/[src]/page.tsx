import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  OBS_LABELS,
  KHOA_BUOY_FIELDS,
  KHOA_TIDAL_FIELDS,
  KMA_SEA_FIELDS,
  type ObsCode,
} from "@kors-relv/collect/obs-codes";
import { TimeSeriesChart } from "../components/time-series-chart";

export const dynamic = "force-dynamic";

const OBS_COLORS: Record<ObsCode, string> = {
  wtem: "oklch(0.58 0.18 28)",
  atmp: "oklch(0.66 0.16 50)",
  atmpr: "oklch(0.55 0.13 305)",
  humi: "oklch(0.62 0.12 220)",
  slnty: "oklch(0.55 0.10 178)",
  wndrct: "oklch(0.50 0.02 230)",
  wspd: "oklch(0.50 0.13 245)",
  wspd_gst: "oklch(0.42 0.16 250)",
  wvhgt: "oklch(0.55 0.13 220)",
  wvpd: "oklch(0.50 0.10 200)",
  crdir: "oklch(0.50 0.13 290)",
  crsp: "oklch(0.55 0.13 280)",
  tdlv_obs: "oklch(0.55 0.14 165)",
};

type Source = "khoa-buoy" | "khoa-tidal" | "khoa-ors" | "kma-sea";

const SOURCES: Array<{
  key: Source;
  org: string;
  type?: string;
  agency: string;
  series: string;
  short: string;
}> = [
  {
    key: "khoa-buoy",
    org: "KHOA",
    type: "BUOY",
    agency: "해양조사원",
    series: "해양관측부이",
    short: "BUOY",
  },
  {
    key: "khoa-tidal",
    org: "KHOA",
    type: "TIDAL",
    agency: "해양조사원",
    series: "조위관측소",
    short: "TIDAL",
  },
  {
    key: "khoa-ors",
    org: "KHOA",
    type: "ORS",
    agency: "해양조사원",
    series: "해양과학기지",
    short: "ORS",
  },
  { key: "kma-sea", org: "KMA", agency: "기상청", series: "해양종합관측", short: "MARINE" },
];

const ORG_LABELS: Record<string, string> = {
  KHOA: "해양조사원",
  KMA: "기상청",
};

const SOURCE_FIELDS: Record<Source, Record<string, { obs_cd: ObsCode; unit: string }>> = {
  "khoa-buoy": KHOA_BUOY_FIELDS,
  "khoa-tidal": KHOA_TIDAL_FIELDS,
  "khoa-ors": KHOA_TIDAL_FIELDS,
  "kma-sea": KMA_SEA_FIELDS,
};

interface Row {
  stn_id: string;
  name: string;
  obs_cd: string;
  obs_time: Date;
  value: number;
  unit: string;
}

interface StationBucket {
  stn_id: string;
  name: string;
  byObs: Map<string, { unit: string; points: { t: number; v: number }[] }>;
  latest: number;
}

async function loadSource(src: Source, hours: number): Promise<StationBucket[]> {
  const since = new Date(Date.now() - hours * 3600 * 1000);
  const cfg = SOURCES.find((s) => s.key === src)!;

  const rows = cfg.type
    ? await prisma.$queryRaw<Row[]>`
        SELECT s.stn_id, s.name, o.obs_cd, o.obs_time, o.value, o.unit
        FROM observation o
        JOIN station s ON s.stn_id = o.stn_id
        WHERE o.obs_time >= ${since}
          AND s.organization_cd::text = ${cfg.org}
          AND s.stn_type::text = ${cfg.type}
        ORDER BY s.stn_id, o.obs_cd, o.obs_time ASC
      `
    : await prisma.$queryRaw<Row[]>`
        SELECT s.stn_id, s.name, o.obs_cd, o.obs_time, o.value, o.unit
        FROM observation o
        JOIN station s ON s.stn_id = o.stn_id
        WHERE o.obs_time >= ${since}
          AND s.organization_cd::text = ${cfg.org}
        ORDER BY s.stn_id, o.obs_cd, o.obs_time ASC
      `;

  const map = new Map<string, StationBucket>();
  for (const r of rows) {
    let st = map.get(r.stn_id);
    if (!st) {
      st = { stn_id: r.stn_id, name: r.name, byObs: new Map(), latest: 0 };
      map.set(r.stn_id, st);
    }
    let series = st.byObs.get(r.obs_cd);
    if (!series) {
      series = { unit: r.unit, points: [] };
      st.byObs.set(r.obs_cd, series);
    }
    const t = r.obs_time.getTime();
    series.points.push({ t, v: r.value });
    if (t > st.latest) st.latest = t;
  }
  return [...map.values()].sort((a, b) => b.latest - a.latest);
}

async function loadTotals() {
  const [stations, observations, latest, byOrg, sizeRows] = await Promise.all([
    prisma.station.count(),
    prisma.observation.count(),
    prisma.observation.findFirst({ orderBy: { obs_time: "desc" }, select: { obs_time: true } }),
    prisma.$queryRaw<Array<{ organization_cd: string; count: bigint }>>`
      SELECT s.organization_cd::text AS organization_cd, COUNT(*)::bigint AS count
      FROM observation o
      JOIN station s ON s.stn_id = o.stn_id
      GROUP BY s.organization_cd
      ORDER BY s.organization_cd
    `,
    prisma.$queryRaw<Array<{ db_bytes: bigint; obs_bytes: bigint }>>`
      SELECT
        pg_database_size(current_database())::bigint AS db_bytes,
        pg_total_relation_size('observation')::bigint AS obs_bytes
    `,
  ]);
  const dbBytes = Number(sizeRows[0]?.db_bytes ?? 0n);
  const obsBytes = Number(sizeRows[0]?.obs_bytes ?? 0n);
  return {
    stations,
    observations,
    latest: latest?.obs_time ?? null,
    byOrg,
    dbBytes,
    obsBytes,
  };
}

function formatBytes(bytes: number): { value: string; unit: string } {
  if (!bytes || bytes < 1024) return { value: bytes.toString(), unit: "B" };
  const units = ["KB", "MB", "GB", "TB"] as const;
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const value = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return { value, unit: units[i]! };
}

function isSource(v: string): v is Source {
  return v === "khoa-buoy" || v === "khoa-tidal" || v === "khoa-ors" || v === "kma-sea";
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ src: string }>;
  searchParams: Promise<{ hours?: string }>;
}) {
  const { src: rawSrc } = await params;
  if (!isSource(rawSrc)) notFound();
  const src: Source = rawSrc;
  const sp = await searchParams;
  const hours = Math.min(Math.max(parseInt(sp.hours ?? "24", 10) || 24, 1), 720);

  let totals: Awaited<ReturnType<typeof loadTotals>> | null = null;
  let stations: StationBucket[] = [];
  let error: string | null = null;

  try {
    [totals, stations] = await Promise.all([loadTotals(), loadSource(src, hours)]);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const cfg = SOURCES.find((s) => s.key === src)!;
  const knownObsCds = new Set<ObsCode>(
    Object.values(SOURCE_FIELDS[src]).map((f) => f.obs_cd),
  );
  const hoursQS = hours === 24 ? "" : `?hours=${hours}`;

  return (
    <main className="mx-auto max-w-page px-6 py-10 sm:px-10 lg:px-14">
      <header className="mb-10">
        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink">
              해양 관측 실시간 수집 현황
            </h1>
            <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">
              {cfg.agency}의 <span className="text-ink">{cfg.series}</span> 데이터를 KST
              기준으로 정렬하여 정시·근사치 시계열로 표시합니다.
            </p>
          </div>
          {totals?.latest && (
            <div className="text-right">
              <div className="eyebrow mb-1">latest observation</div>
              <div className="font-mono text-base text-ink tabular">
                {formatKst(totals.latest)}
              </div>
            </div>
          )}
        </div>
        <div className="rule-editorial mt-10" />
      </header>

      {error && (
        <div className="mb-10 border border-warn/50 bg-warn-soft px-5 py-4 text-sm text-ink">
          <span className="eyebrow mr-3 text-[oklch(0.45_0.13_55)]">db error</span>
          <code className="font-mono text-ink-soft">{error}</code>
        </div>
      )}

      {totals && (() => {
        const dbSize = formatBytes(totals.dbBytes);
        const obsSize = formatBytes(totals.obsBytes);
        return (
          <section className="mb-12">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3 lg:grid-cols-5 md:divide-x md:divide-rule">
              <Figure label="관측소" value={totals.stations.toLocaleString()} />
              <Figure
                label="관측 레코드"
                value={totals.observations.toLocaleString()}
                indent
              />
              {totals.byOrg.map((r) => (
                <Figure
                  key={r.organization_cd}
                  label={ORG_LABELS[r.organization_cd] ?? r.organization_cd}
                  value={Number(r.count).toLocaleString()}
                  indent
                />
              ))}
              <Figure
                label="데이터 용량"
                value={dbSize.value}
                unit={dbSize.unit}
                sub={`obs ${obsSize.value} ${obsSize.unit}`}
                indent
              />
            </div>
          </section>
        );
      })()}

      <section className="mb-10">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">관측기관</span>
            <nav
              role="tablist"
              aria-label="관측기관"
              className="flex flex-wrap items-stretch border border-rule bg-surface"
            >
              {SOURCES.map((s, i) => {
                const active = s.key === src;
                return (
                  <Link
                    key={s.key}
                    href={`/${s.key}${hoursQS}`}
                    role="tab"
                    aria-selected={active}
                    prefetch
                    className={`flex flex-col gap-0.5 px-4 py-2.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${
                      i > 0 ? "border-l border-rule" : ""
                    } ${
                      active
                        ? "bg-ink text-surface"
                        : "text-ink hover:bg-accent-soft"
                    }`}
                  >
                    <span className="leading-tight">{s.agency}</span>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.16em] ${
                        active ? "text-surface/60" : "text-muted"
                      }`}
                    >
                      {s.short} · {s.series}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <form method="get" className="flex items-end gap-3">
            <label className="flex flex-col gap-2">
              <span className="eyebrow">조회 기간</span>
              <div className="flex items-stretch border border-rule bg-surface focus-within:border-ink">
                <input
                  name="hours"
                  type="number"
                  min={1}
                  max={720}
                  defaultValue={hours}
                  className="w-20 appearance-none bg-transparent px-3 py-2.5 text-center font-mono text-sm tabular text-ink focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="flex items-center border-l border-rule px-3 text-xs text-muted">
                  시간
                </span>
              </div>
            </label>
            <button
              type="submit"
              className="border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-surface transition hover:bg-accent hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              조회
            </button>
          </form>

          <div className="ml-auto flex items-baseline gap-2 self-end pb-3 text-sm">
            <span className="font-mono tabular text-ink">{stations.length}</span>
            <span className="text-muted">stations</span>
          </div>
        </div>
      </section>

      {stations.length === 0 ? (
        <div className="border border-dashed border-rule bg-surface px-8 py-20 text-center">
          <div className="eyebrow mb-3">no data</div>
          <p className="text-sm text-ink-soft">선택한 기간에 관측 데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {stations.map((st, idx) => (
            <StationBlock
              key={st.stn_id}
              station={st}
              index={idx + 1}
              hours={hours}
              knownObsCds={knownObsCds}
            />
          ))}
        </div>
      )}

      <footer className="mt-20 flex items-center justify-between border-t border-rule pt-6">
        <div className="eyebrow">end of log · {formatKstDate(new Date())}</div>
        <div className="font-mono text-xs text-muted">kors-relv-collector</div>
      </footer>
    </main>
  );
}

function StationBlock({
  station,
  index,
  hours,
  knownObsCds,
}: {
  station: StationBucket;
  index: number;
  hours: number;
  knownObsCds: Set<ObsCode>;
}) {
  const obsEntries = [...station.byObs.entries()].sort(([a], [b]) => a.localeCompare(b));
  const totalPoints = obsEntries.reduce((acc, [, s]) => acc + s.points.length, 0);
  return (
    <article>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-y-2 gap-x-6 border-b border-rule-strong pb-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-muted tabular">
            № {String(index).padStart(2, "0")}
          </span>
          <h3 className="text-lg font-semibold leading-none text-ink">{station.name}</h3>
          <span className="font-mono text-xs text-muted tabular">{station.stn_id}</span>
        </div>
        <div className="flex items-baseline gap-5 text-xs text-muted">
          <span>
            <span className="eyebrow mr-1.5">obs</span>
            <span className="font-mono tabular text-ink-soft">{obsEntries.length}</span>
          </span>
          <span>
            <span className="eyebrow mr-1.5">pts</span>
            <span className="font-mono tabular text-ink-soft">
              {totalPoints.toLocaleString()}
            </span>
          </span>
          <span>
            <span className="eyebrow mr-1.5">latest</span>
            <span className="font-mono tabular text-ink-soft">
              {formatKst(new Date(station.latest))}
            </span>
          </span>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {obsEntries.map(([obsCd, series]) => {
          const known = knownObsCds.has(obsCd as ObsCode);
          const label = known ? OBS_LABELS[obsCd as ObsCode] : obsCd;
          const color = known ? OBS_COLORS[obsCd as ObsCode] : "oklch(0.30 0.02 240)";
          return (
            <TimeSeriesChart
              key={obsCd}
              obsCd={obsCd}
              label={label}
              unit={series.unit}
              color={color}
              points={series.points}
              rangeMs={hours * 3600 * 1000}
            />
          );
        })}
      </div>
    </article>
  );
}

function Figure({
  label,
  value,
  unit,
  sub,
  indent = false,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  indent?: boolean;
}) {
  return (
    <div className={indent ? "md:pl-8" : ""}>
      <div className="eyebrow mb-2">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[2.6rem] leading-none tracking-tight text-ink tabular">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted tabular">
          {sub}
        </div>
      )}
    </div>
  );
}

function formatKst(d: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

function formatKstDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}
