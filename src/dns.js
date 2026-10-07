const dns = require("dns").promises;
const https = require("https");
const { WORDLIST } = require("./wordlist");

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(label || "timed out")), ms)),
  ]);
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "dangler/0.1.0" } }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`crt.sh said ${res.statusCode}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString()));
          } catch {
            reject(new Error("crt.sh returned garbage"));
          }
        });
      })
      .on("error", reject);
  });
}

async function fetchSubdomains(domain) {
  // certificate transparency logs: anything with a TLS cert shows up here. free, no key.
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  const data = await withTimeout(getJson(url), 30000, "crt.sh timed out");
  const subs = new Set();
  for (const entry of data || []) {
    for (const name of String(entry.name_value || "").split("\n")) {
      const n = name.trim().toLowerCase().replace(/^\*\./, "");
      if (n && (n === domain || n.endsWith("." + domain))) subs.add(n);
    }
  }
  return [...subs].sort();
}

async function resolveCnames(host) {
  try {
    const cnames = await withTimeout(dns.resolveCname(host), 8000, "dns timed out");
    return cnames.map((c) => c.replace(/\.$/, ""));
  } catch {
    return []; // no CNAME, NXDOMAIN, whatever — nothing to check
  }
}

async function hostResolves(host) {
  try {
    await withTimeout(dns.resolve(host), 8000, "dns timed out");
    return true;
  } catch (e) {
    // NXDOMAIN = nobody home. any other error (timeout etc) -> assume it exists,
    // better to under-claim than to cry takeover on a flaky lookup
    return e.code !== "ENOTFOUND";
  }
}

async function bruteSubdomains(domain) {
  // plan B: just ask DNS directly about the usual suspects
  const found = [];
  const check = async (word) => {
    try {
      await withTimeout(dns.resolve(`${word}.${domain}`), 5000, "dns timed out");
      found.push(`${word}.${domain}`);
    } catch {
      // doesn't resolve, not our problem
    }
  };
  const batches = [];
  for (let i = 0; i < WORDLIST.length; i += 20) {
    batches.push(Promise.all(WORDLIST.slice(i, i + 20).map(check)));
  }
  for (const b of batches) await b;
  return found.sort();
}

module.exports = { fetchSubdomains, bruteSubdomains, resolveCnames, hostResolves };
