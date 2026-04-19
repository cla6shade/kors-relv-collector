import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const isDeploy = process.argv.includes("deploy");
const urlVar = isDeploy ? "DATABASE_URL_PRODUCTION" : "DATABASE_URL";

if (!process.env[urlVar]) {
  throw new Error(`${urlVar} is required (set it in packages/database/.env)`);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env(urlVar),
  },
});
