import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/index.js";

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
};

const adapter = new PrismaPg(process.env.DATABASE_URL!);
export const prisma: PrismaClient =
  globalForPrisma.__prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
