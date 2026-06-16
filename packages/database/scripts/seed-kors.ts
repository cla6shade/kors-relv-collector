import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Organization,
  StationType,
} from "../src/generated/prisma/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 환경변수는 packages/database/.env 에서 로드한다.
dotenv.config({ path: resolve(__dirname, "../.env") });
const CSV_PATH = join(__dirname, "kors-variables.csv");

const isProd = process.argv.includes("--prod");
const urlVar = isProd ? "DATABASE_URL_PRODUCTION" : "DATABASE_URL";
const databaseUrl = process.env[urlVar];

if (!databaseUrl) {
  throw new Error(`missing env var: ${urlVar}`);
}

type Row = { stn_id: string; obs_cd: string; label: string; name: string };

function loadRows(): { rows: Row[]; skipped: number } {
  const records = parse(readFileSync(CSV_PATH), {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const rows: Row[] = [];
  let skipped = 0;

  for (const rec of records) {
    const stn_id = rec["Station ID"] ?? "";
    const obs_cd = rec["관측변수(OPENSEARCH tagId)"] ?? "";
    const label = rec["의미(측정항목)"] ?? "";
    const name = rec["관측소"] ?? "";

    if (!stn_id || !obs_cd) {
      skipped++;
      continue;
    }

    rows.push({ stn_id, obs_cd, label, name });
  }

  return { rows, skipped };
}

async function main() {
  const { rows, skipped } = loadRows();
  console.log(
    `[seed-kors] target=${urlVar} rows=${rows.length} skipped=${skipped}`,
  );

  const adapter = new PrismaPg(databaseUrl as string);
  const prisma = new PrismaClient({ adapter });

  // station_variable.stn_id와 연결되도록 KIOST 관측소를 station에 먼저 upsert한다.
  const stations = new Map<string, string>();
  for (const { stn_id, name } of rows) {
    if (!stations.has(stn_id)) stations.set(stn_id, name || stn_id);
  }

  let processed = 0;
  const BATCH = 50;
  try {
    await Promise.all(
      [...stations].map(([stn_id, name]) =>
        prisma.station.upsert({
          where: { stn_id },
          update: { name },
          create: {
            stn_id,
            name,
            organization_cd: Organization.KIOST,
            stn_type: StationType.ORS,
          },
        }),
      ),
    );
    console.log(`[seed-kors] upserted ${stations.size} stations`);

    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      await Promise.all(
        batch.map(({ stn_id, obs_cd, label }) =>
          prisma.stationVariable.upsert({
            where: { stn_id_obs_cd: { stn_id, obs_cd } },
            update: { label, unit: "" },
            create: { stn_id, obs_cd, label, unit: "" },
          }),
        ),
      );
      processed += batch.length;
      console.log(`[seed-kors] upserted ${processed}/${rows.length}`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`[seed-kors] done. processed=${processed} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
