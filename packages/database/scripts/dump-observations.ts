// observation_data 의 raw SQL 결과를 타입 파싱 없이(모든 컬럼 raw 문자열) 콘솔에 출력한다.
// 실행: pnpm tsx packages/database/scripts/dump-observations.ts [--prod] [--stn=KHOA:DT_0001] [--obs=수온] [--limit=50]
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 환경변수는 packages/database/.env 에서 로드한다.
dotenv.config({ path: resolve(__dirname, "../.env") });

const isProd = process.argv.includes("--prod");
const urlVar = isProd ? "DATABASE_URL_PRODUCTION" : "DATABASE_URL";
const databaseUrl = process.env[urlVar];
if (!databaseUrl) throw new Error(`missing env var: ${urlVar}`);

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

const stnId = arg("stn");
const obsCd = arg("obs");
const limit = Number(arg("limit") ?? 50);

async function main() {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  const conds: string[] = [];
  const params: unknown[] = [];
  if (stnId) conds.push(`stn_id = $${params.push(stnId)}`);
  if (obsCd) conds.push(`obs_cd = $${params.push(obsCd)}`);
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  const sql = `SELECT * FROM observation_data ${where} ORDER BY obs_time DESC LIMIT $${params.push(limit)}`;

  // 모든 컬럼을 파싱하지 않고 Postgres 가 보낸 raw 문자열 그대로 반환한다.
  const result = await client.query({
    text: sql,
    values: params,
    types: { getTypeParser: () => (val: string) => val },
  });

  console.dir(result.rows, { depth: null, maxArrayLength: null });

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
