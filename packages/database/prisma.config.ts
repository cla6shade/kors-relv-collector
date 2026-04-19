import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const isDeploy = process.argv.includes("deploy");
const urlVar = isDeploy ? "DATABASE_URL_PRODUCTION" : "DATABASE_URL";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env(urlVar),
  },
});
