const { fetchSubdomains, bruteSubdomains, resolveCnames, hostResolves } = require("./dns");
const { analyzeHost, bandFor } = require("./checks");

async function mapPool(items, size, fn) {
  // poor man's worker pool — polite concurrency instead of 300 parallel lookups
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function analyze(domain, { maxSubs = 200 } = {}) {
  let subs, source;
  try {
    subs = await fetchSubdomains(domain);
    source = "crt.sh";
  } catch (e) {
    // crt.sh is flaky — fall back to asking DNS about the usual suspects
    console.error(`crt.sh unavailable (${e.message}), falling back to wordlist`);
    subs = await bruteSubdomains(domain);
    source = "wordlist";
  }
  const targets = subs.slice(0, maxSubs);

  const perHost = await mapPool(targets, 10, async (host) => {
    const cnames = await resolveCnames(host);
    const resolved = [];
    for (const target of cnames) {
      resolved.push({ target, alive: await hostResolves(target) });
    }
    return analyzeHost(host, resolved);
  });

  const findings = perHost.flat();
  findings.sort((a, b) => b.score - a.score);
  const score = Math.min(100, findings.reduce((s, f) => s + f.score, 0));

  return {
    domain,
    source,
    subdomainsFound: subs.length,
    subdomainsChecked: targets.length,
    truncated: subs.length > targets.length,
    score,
    band: bandFor(score),
    findings,
  };
}

module.exports = { analyze };
