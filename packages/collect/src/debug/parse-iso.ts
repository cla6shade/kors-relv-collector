import { fetchBuoy } from "../clients/khoa-buoy.js";
import { fetchTidal } from "../clients/khoa-tidal.js";
import { fetchKmaSea } from "../clients/kma-sea.js";
import { KHOA_BUOY_STATIONS, KHOA_TIDAL_STATIONS } from "../stations.js";

// collect-latest.ts 와 동일한 파싱 로직(원본 KST → 절대시각 Date).
function parseKhoaTime(s: string): Date {
  return new Date(`${s.replace(" ", "T")}:00+09:00`);
}
function parseKmaTime(s: string): Date {
  const y = s.slice(0, 4), mo = s.slice(4, 6), d = s.slice(6, 8);
  const h = s.slice(8, 10), mi = s.slice(10, 12) || "00";
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00+09:00`);
}

async function main() {
  console.log("source      stn      | API 원본(KST)       | parse*Time → ISO");

  const b = (await fetchBuoy(KHOA_BUOY_STATIONS[0]!)).items[0];
  if (b?.obsrvnDt)
    console.log(`KHOA-buoy   ${KHOA_BUOY_STATIONS[0]} | ${b.obsrvnDt.padEnd(16)} | ${parseKhoaTime(b.obsrvnDt).toISOString()}`);

  const t = (await fetchTidal(KHOA_TIDAL_STATIONS[0]!)).items[0];
  if (t?.obsrvnDt)
    console.log(`KHOA-tidal  ${KHOA_TIDAL_STATIONS[0]} | ${t.obsrvnDt.padEnd(16)} | ${parseKhoaTime(t.obsrvnDt).toISOString()}`);

  const kma = (await fetchKmaSea()).filter((r) => r.TM);
  for (const r of kma.slice(0, 2)) {
    console.log(`KMA-sea     ${r.STN_ID.padEnd(8)} | ${r.TM.padEnd(16)} | ${parseKmaTime(r.TM).toISOString()}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
