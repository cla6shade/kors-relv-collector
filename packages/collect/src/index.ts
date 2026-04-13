import { collectKhoaBuoy, collectKhoaTidal, collectKmaSea } from "./jobs/collect-latest.js";

const HELP = `kors-relv-collect

Usage:
  collect khoa-buoy <obsCode>     # e.g. TW_0089
  collect khoa-tidal <obsCode>    # e.g. DT_0001
  collect kma-sea                 # all stations, latest tm
  collect --help
`;

async function main(): Promise<void> {
  const [cmd, arg] = process.argv.slice(2);
  if (!cmd || cmd === "--help" || cmd === "-h") {
    process.stdout.write(HELP);
    return;
  }

  switch (cmd) {
    case "khoa-buoy": {
      if (!arg) throw new Error("khoa-buoy requires <obsCode>");
      const n = await collectKhoaBuoy(arg);
      console.log(`khoa-buoy ${arg}: ${n} rows`);
      return;
    }
    case "khoa-tidal": {
      if (!arg) throw new Error("khoa-tidal requires <obsCode>");
      const n = await collectKhoaTidal(arg);
      console.log(`khoa-tidal ${arg}: ${n} rows`);
      return;
    }
    case "kma-sea": {
      const n = await collectKmaSea();
      console.log(`kma-sea: ${n} rows`);
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
