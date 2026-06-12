import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(here, "../../collect/.env") });

const kmaKey = process.env.KMA_AUTH_KEY;
if (!kmaKey) throw new Error("missing env var: KMA_AUTH_KEY");

const TARGETS = ["22473", "22523", "33002", "22605"];
// 미관측 지점을 잡기 위해 여러 시각(KST, YYYYMMDDHHmm)을 훑는다.
const TIMES = [
  undefined, // 최신
  "202606111200", "202606101200", "202606051200", "202606011200",
  "202605151200", "202605011200", "202604011200", "202603011200",
  "202602011200", "202601011200", "202512011200",
];

const TP_LABEL: Record<string, string> = {
  B: "해양기상부이", C: "파고부이", D: "표류부이", L: "등표",
  N: "조위관측소", F: "연안방재", J: "기상1호", G: "파랑계",
};

async function fetchTp(stn: string, tm?: string): Promise<{ tp: string; name: string } | null> {
  const url = new URL("https://apihub.kma.go.kr/api/typ01/url/sea_obs.php");
  url.searchParams.set("authKey", kmaKey!);
  url.searchParams.set("stn", stn);
  if (tm) url.searchParams.set("tm", tm);
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = new TextDecoder("euc-kr").decode(await res.arrayBuffer());
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const cells = line.split(",").map((c) => c.trim());
    if (cells[2] !== stn) continue;
    if (cells[0]) return { tp: cells[0], name: cells[3] ?? "" };
  }
  return null;
}

async function main(): Promise<void> {
  for (const stn of TARGETS) {
    let found: { tp: string; name: string; tm: string } | null = null;
    for (const tm of TIMES) {
      const r = await fetchTp(stn, tm);
      if (r) {
        found = { ...r, tm: tm ?? "latest" };
        break;
      }
    }
    if (found) {
      console.log(`${stn} ${found.name} → TP=${found.tp}(${TP_LABEL[found.tp] ?? "?"}) [tm=${found.tm}]`);
    } else {
      console.log(`${stn} → 조회된 자료 없음 (모든 시각 미관측)`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
