// services where you can claim arbitrary hostnames.
// if a CNAME points at one of these and the target is dead, it's probably takeoverable.

const TAKEOVER_FINGERPRINTS = [
  { service: "Heroku", pattern: /(^|\.)herokuapp\.com$/ },
  { service: "Heroku", pattern: /(^|\.)herokudns\.com$/ },
  { service: "GitHub Pages", pattern: /(^|\.)github\.io$/ },
  { service: "GitLab Pages", pattern: /(^|\.)gitlab\.io$/ },
  { service: "Bitbucket", pattern: /(^|\.)bitbucket\.io$/ },
  { service: "AWS S3", pattern: /(^|\.)s3\.amazonaws\.com$/ },
  { service: "AWS S3 website", pattern: /\.s3-website[.-][a-z0-9-]+\.amazonaws\.com$/ },
  { service: "Azure Web Apps", pattern: /(^|\.)azurewebsites\.net$/ },
  { service: "Azure Cloud", pattern: /(^|\.)cloudapp\.azure\.com$/ },
  { service: "Azure Traffic Manager", pattern: /(^|\.)trafficmanager\.net$/ },
  { service: "Netlify", pattern: /(^|\.)netlify\.(app|com)$/ },
  { service: "Vercel", pattern: /(^|\.)vercel\.app$/ },
  { service: "Surge.sh", pattern: /(^|\.)surge\.sh$/ },
  { service: "Tumblr", pattern: /(^|\.)tumblr\.com$/ },
  { service: "WordPress.com", pattern: /(^|\.)wordpress\.com$/ },
  { service: "Ghost", pattern: /(^|\.)ghost\.io$/ },
  { service: "Shopify", pattern: /(^|\.)myshopify\.com$/ },
  { service: "Fastly", pattern: /(^|\.)fastly\.net$/ },
  { service: "Statuspage", pattern: /(^|\.)statuspage\.io$/ },
  { service: "Helpjuice", pattern: /(^|\.)helpjuice\.com$/ },
  { service: "HelpScout", pattern: /(^|\.)helpscoutdocs\.com$/ },
  { service: "UserVoice", pattern: /(^|\.)uservoice\.com$/ },
  { service: "Cargo Collective", pattern: /(^|\.)cargocollective\.com$/ },
  { service: "Smartling", pattern: /(^|\.)smartling\.com$/ },
  { service: "Wishpond", pattern: /(^|\.)wishpond\.com$/ },
];

function matchService(cnameTarget) {
  const t = String(cnameTarget || "").toLowerCase().replace(/\.$/, "");
  for (const f of TAKEOVER_FINGERPRINTS) {
    if (f.pattern.test(t)) return f.service;
  }
  return null;
}

module.exports = { matchService, TAKEOVER_FINGERPRINTS };
