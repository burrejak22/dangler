const { matchService } = require("./services");

// findings for one subdomain, given its CNAME targets and whether each resolves.
// targets: [{ target, alive }]
function analyzeHost(host, targets) {
  const out = [];
  const seen = new Set();
  for (const { target, alive } of targets) {
    const service = matchService(target);
    if (!service || seen.has(service)) continue;
    seen.add(service);
    if (!alive) {
      out.push({
        code: "TAKEOVER_LIKELY",
        score: 45,
        host,
        detail: `${host} → ${target} (${service}) doesn't resolve — likely claimable right now`,
      });
    } else {
      out.push({
        code: "TAKEOVER_POSSIBLE",
        score: 15,
        host,
        detail: `${host} → ${target} (${service}) — target resolves, verify it's actually yours`,
      });
    }
  }
  return out;
}

function bandFor(score) {
  if (score >= 70) return "CRITICAL";
  if (score >= 45) return "HIGH";
  if (score >= 20) return "MEDIUM";
  return "LOW";
}

module.exports = { analyzeHost, bandFor };
