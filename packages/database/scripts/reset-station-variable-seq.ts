import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

// .env 를 읽지 않고 오직 process.env.DATABASE_URL_PRODUCTION 만 사용한다.
const databaseUrl = process.env.DATABASE_URL_PRODUCTION;
if (!databaseUrl) {
  throw new Error("missing env var: DATABASE_URL_PRODUCTION");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });

async function main(): Promise<void> {
  // 기존 행의 id 를 1..N 으로 재부여한다. id 를 직접 줄이면 PK 유일성 검사에
  // 걸리므로(예: 5→2 인데 2 가 아직 존재), 먼저 음수로 옮긴 뒤 양수로 뒤집어
  // 어느 시점에도 두 행이 같은 id 를 갖지 않게 한다. 트랜잭션으로 묶는다.
  const next_id = await prisma.$transaction(async (tx) => {
    // 1) ROW_NUMBER 순서대로 음수 id 부여 (양수 기존 id 와 절대 충돌하지 않음)
    await tx.$executeRawUnsafe(`
      WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM station_variable
      )
      UPDATE station_variable sv
      SET id = -ordered.rn
      FROM ordered
      WHERE sv.id = ordered.id
    `);
    // 2) 양수로 뒤집기 → 결과적으로 1..N
    await tx.$executeRawUnsafe(`UPDATE station_variable SET id = -id`);
    // 3) 시퀀스 정렬: 행이 있으면 다음 값이 N+1, 비어 있으면 1 이 되도록.
    const [{ max }] = await tx.$queryRawUnsafe<{ max: number }[]>(
      `SELECT COALESCE(MAX(id), 0)::int AS max FROM station_variable`,
    );
    const seq = `pg_get_serial_sequence('station_variable', 'id')`;
    if (max > 0) {
      await tx.$executeRawUnsafe(`SELECT setval(${seq}, ${max}, true)`);
    } else {
      await tx.$executeRawUnsafe(`SELECT setval(${seq}, 1, false)`);
    }
    return max + 1;
  });
  console.log(`station_variable.id renumbered from 1 — next id: ${next_id}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
