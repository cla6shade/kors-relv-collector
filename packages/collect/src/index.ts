import { collectKhoaBuoy, collectKhoaTidal, collectKmaSea } from "./jobs/collect-latest.js";

const HELP = `kors-relv-collect

Usage:
  collect khoa-buoy     # all buoy stations
  collect khoa-tidal    # all tidal stations
  collect kma-sea       # all KMA sea stations
  collect --help
`;

async function main(): Promise<void> {
  const [cmd] = process.argv.slice(2);
  if (cmd === "--help" || cmd === "-h") {
    process.stdout.write(HELP);
    return;
  }

  switch (cmd) {
    case "khoa-buoy": {
      const n = await collectKhoaBuoy();
      console.log(`khoa-buoy total: ${n} rows`);
      return;
    }
    case "khoa-tidal": {
      const n = await collectKhoaTidal();
      console.log(`khoa-tidal total: ${n} rows`);
      return;
    }
    case "kma-sea": {
      const n = await collectKmaSea();
      console.log(`kma-sea: ${n} rows`);
      return;
    }
    case undefined: {
      const buoy = await collectKhoaBuoy();
      console.log(`khoa-buoy total: ${buoy} rows`);
      const tidal = await collectKhoaTidal();
      console.log(`khoa-tidal total: ${tidal} rows`);
      const kma = await collectKmaSea();
      console.log(`kma-sea: ${kma} rows`);
      console.log(`total: ${buoy + tidal + kma} rows`);
      return;
    }
    default:
      process.stderr.write(`unknown command: ${cmd}\n${HELP}`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
