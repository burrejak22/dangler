#!/usr/bin/env node
// dangler — find the subdomains you forgot about before someone else does.

const fs = require("fs");
const { analyze } = require("./analyzer");
const { printReport } = require("./reporter");

const BANDS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function usage() {
  console.log(`
dangler <domain> [options]

  domain            the domain to scan (only scan what you own or may test)

options:
  --max <n>            max subdomains to check (default 200)
  --json               machine-readable output
  --fail-on <band>     exit 1 if risk is band or worse (for scheduled scans)
  --out <file>         write the report (json) to a file
  -h, --help           this
`.trim());
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes("-h") || args.includes("--help")) {
    usage();
    process.exit(args.length ? 0 : 1);
  }

  let domain = null, json = false, failOn = null, out = null, max = 200;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--json") json = true;
    else if (a === "--fail-on") failOn = (args[++i] || "").toUpperCase();
    else if (a === "--out") out = args[++i];
    else if (a === "--max") max = parseInt(args[++i], 10) || 200;
    else if (!domain) domain = a;
    else { console.error(`unexpected arg: ${a}`); process.exit(1); }
  }
  if (failOn && !BANDS.includes(failOn)) {
    console.error(`--fail-on must be one of ${BANDS.join("|")}`);
    process.exit(1);
  }
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
    console.error(`doesn't look like a domain: ${domain}`);
    process.exit(1);
  }

  console.error(`enumerating subdomains of ${domain}...`);
  let result;
  try {
    result = await analyze(domain, { maxSubs: max });
  } catch (e) {
    console.error(`scan failed: ${e.message}`);
    process.exit(1);
  }

  if (out) {
    fs.writeFileSync(out, JSON.stringify(result, null, 2));
    console.error(`wrote ${out}`);
  }
  printReport(result, { json });

  if (failOn && BANDS.indexOf(result.band) >= BANDS.indexOf(failOn)) process.exit(1);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
