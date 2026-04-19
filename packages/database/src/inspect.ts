import { prisma } from "./client.js";

async function main() {
  const stationCount = await prisma.station.count();
  const obsCount = await prisma.observation.count();
  console.log("station:", stationCount, "observation:", obsCount);

  const byType = await prisma.station.groupBy({
    by: ["stn_type"],
    _count: { _all: true },
  });
  console.log("\nstation by type:");
  for (const r of byType) console.log(" ", r.stn_type, r._count._all);

  console.log("\nsample stations per type:");
  for (const t of ["BUOY", "TIDAL", "MARINE", "COASTAL", "FISHING", "LIGHTHOUSE", "SPECIAL"] as const) {
    const rows = await prisma.station.findMany({
      where: { stn_type: t as never },
      take: 3,
      orderBy: { stn_id: "asc" },
    });
    for (const s of rows) {
      console.log(" ", t, s.stn_id, "|", JSON.stringify(s.name));
    }
  }

  console.log("\nsample observations (latest 10):");
  const obs = await prisma.observation.findMany({
    take: 10,
    orderBy: { obs_time: "desc" },
  });
  for (const o of obs) {
    console.log(
      " ",
      o.stn_id,
      o.obs_cd,
      o.obs_time.toISOString(),
      o.value,
      o.unit,
    );
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
