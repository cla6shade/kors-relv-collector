import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StationType } from "../src/generated/prisma/index.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const databaseUrl = process.env.DATABASE_URL_PRODUCTION;
if (!databaseUrl) throw new Error("missing env var: DATABASE_URL_PRODUCTION");

const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });

// sea_obs 조회로 확인한 실제 TP 기반 교정 대상.
// (probe-station-tp.ts 결과: 22473=C, 22523=B, 33002=F, 22605=D)
const FIXES: { stn_id: string; name: string; type: StationType }[] = [
  { stn_id: "22473", name: "서천", type: StationType.BUOY },        // C 파고부이
  { stn_id: "22523", name: "죽변", type: StationType.BUOY },        // B 해양기상부이
  { stn_id: "33002", name: "죽도", type: StationType.FISHING },     // F 연안방재 (변경 없음)
  { stn_id: "22605", name: "표류25020", type: StationType.DRIFT_BUOY }, // D 표류부이
];

async function main(): Promise<void> {
  for (const f of FIXES) {
    const before = await prisma.station.findUnique({
      where: { stn_id: f.stn_id },
      select: { stn_type: true },
    });
    if (!before) {
      console.log(`${f.stn_id} ${f.name}: DB에 없음 — 건너뜀`);
      continue;
    }
    if (before.stn_type === f.type) {
      console.log(`${f.stn_id} ${f.name}: 이미 ${f.type} — 변경 없음`);
      continue;
    }
    await prisma.station.update({
      where: { stn_id: f.stn_id },
      data: { stn_type: f.type },
    });
    console.log(`${f.stn_id} ${f.name}: ${before.stn_type} → ${f.type}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
