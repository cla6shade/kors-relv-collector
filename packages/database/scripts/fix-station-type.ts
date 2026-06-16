import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StationType } from "../src/generated/prisma/index.js";

// 환경변수 로드
//   DATABASE_URL_PRODUCTION : packages/database/.env
//   KMA_AUTH_KEY            : packages/collect/.env
const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(here, "../.env") });
dotenv.config({ path: resolve(here, "../../collect/.env") });

const databaseUrl = process.env.DATABASE_URL_PRODUCTION;
if (!databaseUrl) throw new Error("missing env var: DATABASE_URL_PRODUCTION");
const kmaKey = process.env.KMA_AUTH_KEY;
if (!kmaKey) throw new Error("missing env var: KMA_AUTH_KEY");

// --apply 가 있을 때만 실제 UPDATE. 기본은 dry-run(변경 미리보기만).
const APPLY = process.argv.includes("--apply");
// 조회할 최근 시간대(시간) 개수. 단일 응답은 해당 창에 보고한 지점만 포함하므로
// 여러 창을 합쳐 TP 커버리지를 넓힌다. 보고 주기가 긴 지점(예: 죽변·죽도)은
// 기본 24시간으로도 안 잡힐 수 있으니 --hours=N 로 더 넓힐 수 있다.
const HOURS = (() => {
  const arg = process.argv.find((a) => a.startsWith("--hours="));
  const n = arg ? Number(arg.split("=")[1]) : 24;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 24;
})();

// 동시 요청 수. 창이 많아질 수 있으므로 배치로 병렬화한다. --concurrency=N.
const CONCURRENCY = (() => {
  const arg = process.argv.find((a) => a.startsWith("--concurrency="));
  const n = arg ? Number(arg.split("=")[1]) : 6;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 6;
})();

const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
const KMA_SEA_ENDPOINT = "https://apihub.kma.go.kr/api/typ01/url/sea_obs.php";

const TP_LABEL: Record<string, string> = {
  B: "해양기상부이", C: "파고부이", D: "표류부이", L: "등표",
  N: "조위관측소", F: "연안방재", G: "파랑계", J: "기상1호",
};

// collect-latest.ts 의 kmaStationType 와 동일하게 유지한다.
function kmaStationType(tp: string | undefined, stnId: string): StationType {
  switch (tp) {
    case "B": return StationType.BUOY;
    case "C": return StationType.WAVE_BUOY;
    case "D": return StationType.DRIFT_BUOY;
    case "L": return StationType.LIGHTHOUSE;
    case "N": return StationType.TIDAL;
    case "F": return StationType.COASTAL;
    case "G": return StationType.WAVE_GAUGE;
    case "J": return StationType.WEATHER_SHIP;
  }
  const n = Number(stnId);
  if (n >= 22100 && n < 22200) return StationType.BUOY;
  if (n >= 22400 && n < 22600) return StationType.WAVE_BUOY;
  if (n >= 33000 && n < 34000) return StationType.COASTAL;
  if (stnId === "22003") return StationType.WEATHER_SHIP;
  if (n >= 950 && n < 1000) return StationType.LIGHTHOUSE;
  return StationType.MARINE;
}

// 현재시각(KST) 기준으로 정시 tm(YYYYMMDDHH00) 문자열을 i 시간 전까지 생성.
function recentTms(hours: number): string[] {
  const out: string[] = [];
  const nowKst = new Date(Date.now() + 9 * 3600 * 1000);
  nowKst.setUTCMinutes(0, 0, 0);
  for (let i = 0; i < hours; i++) {
    const t = new Date(nowKst.getTime() - i * 3600 * 1000);
    const y = t.getUTCFullYear();
    const mo = String(t.getUTCMonth() + 1).padStart(2, "0");
    const d = String(t.getUTCDate()).padStart(2, "0");
    const h = String(t.getUTCHours()).padStart(2, "0");
    out.push(`${y}${mo}${d}${h}00`);
  }
  return out;
}

async function fetchTpForTm(tm: string): Promise<Map<string, string>> {
  const url = new URL(KMA_SEA_ENDPOINT);
  url.searchParams.set("authKey", kmaKey!);
  url.searchParams.set("stn", "0");
  url.searchParams.set("help", "1");
  url.searchParams.set("tm", tm);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`KMA sea_obs ${tm}: ${res.status}`);
  const text = new TextDecoder("euc-kr").decode(await res.arrayBuffer());

  const map = new Map<string, string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const cells = line.split(",").map((c) => c.trim());
    const tp = cells[0];
    const stnId = cells[2];
    if (!tp || !stnId || !/^\d+$/.test(stnId)) continue;
    if (!map.has(stnId)) map.set(stnId, tp);
  }
  return map;
}

// 최근 HOURS 개 시간대를 합쳐 STN_ID → TP 맵을 만든다(먼저 본 값 유지).
// 창이 많을 수 있으므로 CONCURRENCY 개씩 배치로 병렬 조회한다.
async function buildTpMap(): Promise<Map<string, string>> {
  const tms = recentTms(HOURS);
  const merged = new Map<string, string>();
  for (let i = 0; i < tms.length; i += CONCURRENCY) {
    const batch = tms.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (tm) => {
        try {
          return { tm, map: await fetchTpForTm(tm) };
        } catch (err) {
          console.error(`  tm=${tm}: 실패 -`, err instanceof Error ? err.message : err);
          return { tm, map: new Map<string, string>() };
        }
      }),
    );
    for (const { tm, map } of results) {
      for (const [stn, tp] of map) if (!merged.has(stn)) merged.set(stn, tp);
      console.log(`  tm=${tm}: ${map.size}개 지점 (누적 ${merged.size})`);
    }
  }
  return merged;
}

async function main(): Promise<void> {
  console.log(`모드: ${APPLY ? "APPLY (실제 UPDATE)" : "DRY-RUN (미리보기)"} / 조회 시간대: 최근 ${HOURS}개\n`);

  const [stations, tpMap] = await Promise.all([
    prisma.station.findMany({
      where: { organization_cd: "KMA" },
      select: { stn_id: true, name: true, stn_type: true },
      orderBy: [{ stn_type: "asc" }, { stn_id: "asc" }],
    }),
    buildTpMap(),
  ]);

  console.log(`\nDB의 KMA station: ${stations.length}곳 / TP 확인된 지점: ${tpMap.size}곳\n`);

  const fixes: { stn_id: string; name: string; from: StationType; to: StationType; tp: string }[] = [];
  const noTp: { stn_id: string; name: string; type: StationType }[] = [];

  for (const s of stations) {
    const tp = tpMap.get(s.stn_id);
    if (!tp) { noTp.push({ stn_id: s.stn_id, name: s.name, type: s.stn_type }); continue; }
    const expected = kmaStationType(tp, s.stn_id);
    if (expected !== s.stn_type) {
      fixes.push({ stn_id: s.stn_id, name: s.name, from: s.stn_type, to: expected, tp });
    }
  }

  console.log(`== 교정 대상 (${fixes.length}) ==`);
  if (fixes.length) {
    console.log("  현재 → 교정값 | TP | stn_id | 이름");
    for (const f of fixes.sort((a, b) => `${a.from}${a.to}`.localeCompare(`${b.from}${b.to}`))) {
      console.log(`  ${f.from.padEnd(11)} → ${f.to.padEnd(11)} | ${f.tp}(${TP_LABEL[f.tp] ?? "?"}) | ${f.stn_id.padEnd(8)} ${f.name}`);
    }
    const grouped = new Map<string, number>();
    for (const f of fixes) {
      const k = `${f.from} → ${f.to}`;
      grouped.set(k, (grouped.get(k) ?? 0) + 1);
    }
    console.log("\n  -- 변경 유형별 집계 --");
    for (const [k, n] of [...grouped.entries()].sort()) console.log(`     ${k.padEnd(28)} ${n}`);
  } else {
    console.log("  (없음 — 모두 현재 기준과 일치)");
  }

  if (noTp.length) {
    console.log(`\n== TP 미확인(조회 시간대에 미보고) — 변경하지 않음 (${noTp.length}) ==`);
    for (const s of noTp) console.log(`  ${s.type.padEnd(11)} ${s.stn_id.padEnd(8)} ${s.name}`);
  }

  if (!fixes.length) return;

  if (!APPLY) {
    console.log("\n※ DRY-RUN 입니다. 실제 반영하려면 --apply 를 붙여 다시 실행하세요.");
    return;
  }

  console.log("\n실제 UPDATE 적용 중...");
  let updated = 0;
  for (const f of fixes) {
    await prisma.station.update({
      where: { stn_id: f.stn_id },
      data: { stn_type: f.to },
    });
    updated++;
  }
  console.log(`완료: ${updated}건 교정.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
