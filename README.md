# dangler

Find dangling DNS records and subdomain takeover risks before attackers do.
Give it a domain, it enumerates subdomains via certificate transparency logs,
checks each one for CNAMEs pointing at claimable cloud services, and tells
you which ones are probably takeoverable right now.

## Why

Subdomain takeover is one of the oldest tricks that still works: a company
points `blog.example.com` at a Heroku app, deletes the app, forgets the DNS
record. Now anyone can claim that Heroku hostname and serve whatever they
want from *your* subdomain — phishing pages, malware, cookie theft on the
parent domain. The classic tool for this (subjack) has been unmaintained for
years. dangler is the modern, dependency-free replacement.

Security teams run it on a schedule against their own domains. It's also a
staple of bug bounty recon — which is exactly why you should run it on your
domains before someone else does.

## Responsible use

Only scan domains you own or are explicitly authorized to test. Enumerating
someone else's subdomains without permission is, at best, rude.

## Install

```bash
npm install -g dangler
```

Or run from source (no dependencies, just node):

```bash
git clone https://github.com/burrejak22/dangler
cd dangler
```

## Usage

```bash
# scan a domain
dangler example.com

# check more subdomains (default 200)
dangler example.com --max 500

# machine-readable output
dangler example.com --json --out report.json
```

### Scheduled scans

```bash
# fail CI / alert when something looks takeoverable
dangler example.com --fail-on HIGH
```

## Example output

```
example.com  (143 subdomains found, 143 checked)
[HIGH] risk score: 60/100 ████████████░░░░░░░░

  ▸ +45  TAKEOVER_LIKELY
     blog.example.com → example-blog.herokuapp.com (Heroku) doesn't resolve — likely claimable right now
  ▸ +15  TAKEOVER_POSSIBLE
     docs.example.com → example-docs.github.io (GitHub Pages) — target resolves, verify it's actually yours
```

## How it works

1. **Enumeration** — pulls subdomains from crt.sh (certificate transparency
   logs, free, no API key), falling back to a DNS wordlist when crt.sh is
   unreachable. Anything with a TLS cert is listed there.
2. **CNAME inspection** — resolves each subdomain, looking for CNAMEs
   pointing at ~25 known-claimable services (Heroku, GitHub Pages, S3,
   Azure, Netlify, Vercel, ...).
3. **Liveness check** — if the CNAME target doesn't resolve (NXDOMAIN),
   nobody's home and the hostname is probably claimable: HIGH. If it
   resolves, it's flagged as worth verifying manually: MEDIUM.

## Scoring

| Band     | Score  | Meaning                              |
|----------|--------|--------------------------------------|
| LOW      | 0–19   | nothing dangling found               |
| MEDIUM   | 20–44  | dangling records worth verifying     |
| HIGH     | 45–69  | likely takeoverable, act on it       |
| CRITICAL | 70–100 | multiple likely takeovers            |

## Limitations

- DNS-only. Some takeovers need service-specific checks (response
  fingerprinting) that this doesn't do — a LIKELY finding means "go verify
  now", not "definitely pwned".
- Only covers CNAME-based takeovers against fingerprinted services. A
  records pointing at dead IPs and NS takeovers aren't checked (yet).
- crt.sh can be slow or rate-limited; results depend on cert transparency
  coverage.

## Contributing

Issues and PRs welcome — especially new service fingerprints with a reliable
"not claimed" signal. Keep it dependency-free.
