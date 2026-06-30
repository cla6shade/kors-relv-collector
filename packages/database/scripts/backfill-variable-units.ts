// kors-variable-units.csv(진실원본)를 읽어 production DB station_variable 의 빈 unit 만 채운다.
// 추론은 다시 하지 않고 CSV 의 unit 값을 그대로 반영한다.
// 실행: pnpm tsx scripts/backfill-variable-units.ts [--dry-run]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });
const CSV_PATH = join(__dirname, "kors-variable-units.csv");

const dryRun = process.argv.includes("--dry-run");

const databaseUrl = process.env.DATABASE_URL_PRODUCTION;
if (!databaseUrl) throw new Error("missing env var: DATABASE_URL_PRODUCTION");

const adapter = new PrismaPg(databaseUrl);
const prisma = new PrismaClient({ adapter });

type Row = { stn_id: string; obs_cd: string; unit: string };

function loadRows(): Row[] {
  const records = parse(readFileSync(CSV_PATH), {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const rows: Row[] = [];
  for (const rec of records) {
    const stn_id = rec["Station ID"] ?? "";
    const obs_cd = rec["obs_cd"] ?? "";
    const unit = rec["unit"] ?? "";
    if (!stn_id || !obs_cd || !unit) continue; // unit 이 빈 행은 채울 게 없으므로 스킵
    rows.push({ stn_id, obs_cd, unit });
  }
  return rows;
}

async function main() {
  const rows = loadRows();
  const dist: Record<string, number> = {};
  for (const r of rows) dist[r.unit] = (dist[r.unit] ?? 0) + 1;

  const emptyInDb = await prisma.stationVariable.count({ where: { unit: "" } });
  console.log(`[backfill] csv rows with unit=${rows.length}, station_variable rows with empty unit in DB=${emptyInDb}`);
  console.log(`[backfill] unit distribution (csv):`, Object.fromEntries(Object.entries(dist).sort((a, b) => b[1] - a[1])));

  if (dryRun) {
    console.log(`[backfill] dry-run: no writes performed.`);
    return;
  }

  let updated = 0;
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(({ stn_id, obs_cd, unit }) =>
        // 빈 unit 인 행만 갱신 (idempotent)
        prisma.stationVariable.updateMany({
          where: { stn_id, obs_cd, unit: "" },
          data: { unit },
        }),
      ),
    );
    updated += results.reduce((a, r) => a + r.count, 0);
    console.log(`[backfill] processed ${Math.min(i + BATCH, rows.length)}/${rows.length}, updated so far=${updated}`);
  }

  const remaining = await prisma.stationVariable.count({ where: { unit: "" } });
  console.log(`[backfill] done. updated=${updated}, remaining empty unit in DB=${remaining}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
