import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`missing env var: ${name}`);
  return v;
}

export const config = {
  khoaServiceKey: process.env.KHOA_SERVICE_KEY ?? "",
  kmaAuthKey: process.env.KMA_AUTH_KEY ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  requireKhoa: () => required("KHOA_SERVICE_KEY"),
  requireKma: () => required("KMA_AUTH_KEY"),
};
