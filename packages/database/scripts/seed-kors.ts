import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, "kors-variables.csv");

const isProd = process.argv.includes("--prod");
const urlVar = isProd ? "DATABASE_URL_PRODUCTION" : "DATABASE_URL";
const databaseUrl = process.env[urlVar];

if (!databaseUrl) {
  throw new Error(`missing env var: ${urlVar}`);
}

type Row = { stn_id: string; obs_cd: string; label: string };

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

    if (!stn_id || !obs_cd) {
      skipped++;
      continue;
    }

    rows.push({ stn_id, obs_cd, label });
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

  let processed = 0;
  const BATCH = 50;
  try {
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
