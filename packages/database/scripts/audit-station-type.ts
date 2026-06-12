import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StationType } from "../src/generated/prisma/index.js";

// .env 파일을 직접 읽지 않고 dotenv 로 로드한다.
// - DATABASE_URL_PRODUCTION : packages/database/.env
// - KMA_AUTH_KEY            : packages/collect/.env
const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(here, "../.env") });
dotenv.config({ path: resolve(here, "../../collect/.env") });

const databaseUrl = process.env.DATABASE_URL_PRODUCTION;
if (!databaseUrl) throw new Error("missing env var: DATABASE_URL_PRODUCTION");
const kmaKey = process.env.KMA_AUTH_KEY;
if (!kmaKey) throw new Error("missing env var: KMA_AUTH_KEY");

const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });

// KMA sea_obs 의 TP(관측종류) → 우리 StationType 매핑.
// (collect-latest.ts 의 kmaStationType 와 동일하게 유지)
//   B:해양기상부이, C:파고부이 → BUOY / D:표류부이 → DRIFT_BUOY
//   L:등표 → LIGHTHOUSE / N:조위 → TIDAL / F:연안방재 → FISHING / J:기상1호 → SPECIAL
function tpToStationType(tp: string): StationType | null {
  switch (tp) {
    case "B":
    case "C":
      return StationType.BUOY;
    case "D":
      return StationType.DRIFT_BUOY;
    case "L":
      return StationType.LIGHTHOUSE;
    case "N":
      return StationType.TIDAL;
    case "F":
      return StationType.FISHING;
    case "J":
      return StationType.SPECIAL;
    default:
      return null;
  }
}

const TP_LABEL: Record<string, string> = {
  B: "해양기상부이",
  C: "파고부이",
  D: "표류부이",
  L: "등표",
  N: "조위관측소",
  F: "연안방재",
  J: "기상1호",
  G: "파랑계",
};

// sea_obs 에서 STN_ID → TP 를 수집. stn=0 으로 전체 지점, 최근 시간 창의 자료를 받아
// 각 데이터 라인의 첫 컬럼(TP)을 읽는다. (CSV, euc-kr, '#' 주석 라인 제외)
async function fetchKmaTpMap(): Promise<Map<string, string>> {
  const url = new URL("https://apihub.kma.go.kr/api/typ01/url/sea_obs.php");
  url.searchParams.set("authKey", kmaKey!);
  url.searchParams.set("stn", "0");
  url.searchParams.set("help", "1");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`KMA sea_obs ${res.status}`);
  const text = new TextDecoder("euc-kr").decode(await res.arrayBuffer());

  const map = new Map<string, string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const cells = line.split(",").map((c) => c.trim());
    // TP, TM, STN_ID, STN_KO, ...
    const tp = cells[0];
    const stnId = cells[2];
    if (!tp || !stnId || !/^\d+$/.test(stnId)) continue;
    if (!map.has(stnId)) map.set(stnId, tp);
  }
  return map;
}

async function main(): Promise<void> {
  const [stations, tpMap] = await Promise.all([
    prisma.station.findMany({
      where: { organization_cd: "KMA" },
      select: { stn_id: true, name: true, stn_type: true },
      orderBy: [{ stn_type: "asc" }, { stn_id: "asc" }],
    }),
    fetchKmaTpMap(),
  ]);

  console.log(`KMA stations in DB: ${stations.length}`);
  console.log(`KMA sea_obs 에서 TP 확인된 지점: ${tpMap.size}\n`);

  const mismatches: { stn_id: string; name: string; current: string; tp: string; expected: string }[] = [];
  const noTp: { stn_id: string; name: string; current: string }[] = [];

  for (const s of stations) {
    const tp = tpMap.get(s.stn_id);
    if (!tp) {
      noTp.push({ stn_id: s.stn_id, name: s.name, current: s.stn_type });
      continue;
    }
    const expected = tpToStationType(tp);
    if (expected && expected !== s.stn_type) {
      mismatches.push({ stn_id: s.stn_id, name: s.name, current: s.stn_type, tp, expected });
    }
  }

  console.log(`== 잘못 분류된 지점 (${mismatches.length}) ==`);
  console.log("  현재 → 올바른값 | TP | stn_id | 이름");
  for (const m of mismatches.sort((a, b) => `${a.current}${a.expected}`.localeCompare(`${b.current}${b.expected}`))) {
    const tpLabel = TP_LABEL[m.tp] ?? m.tp;
    console.log(`  ${m.current.padEnd(10)} → ${m.expected.padEnd(11)} | ${m.tp}(${tpLabel}) | ${m.stn_id.padEnd(8)} ${m.name}`);
  }

  // 잘못 분류 집계
  const grouped = new Map<string, number>();
  for (const m of mismatches) {
    const k = `${m.current} → ${m.expected}`;
    grouped.set(k, (grouped.get(k) ?? 0) + 1);
  }
  console.log("\n  -- 변경 유형별 집계 --");
  for (const [k, n] of [...grouped.entries()].sort()) console.log(`     ${k.padEnd(28)} ${n}`);

  if (noTp.length) {
    console.log(`\n== 이번 sea_obs 응답에 없어 TP 미확인 (${noTp.length}) ==`);
    for (const s of noTp) console.log(`  ${s.current.padEnd(10)} ${s.stn_id.padEnd(8)} ${s.name}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
