import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/index.js";

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
};

// 서버 전역 timezone(Asia/Seoul)은 건드리지 않고, 이 앱이 여는 커넥션의 세션 tz만
// UTC 로 고정한다. PrismaPg(formatDateTime)가 Date 를 오프셋 없는 UTC 숫자 문자열로
// 보내기 때문에, 세션 tz 가 KST 면 UTC 숫자가 KST 로 오해되어 9시간 일찍 저장된다.
// 세션을 UTC 로 두면 그 UTC 숫자가 UTC 로 해석되어 정확한 instant 로 저장된다.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  options: "-c timezone=UTC",
});
export const prisma: PrismaClient =
  globalForPrisma.__prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
