// common subdomain names — used when crt.sh is unreachable.
// not as thorough as cert transparency, but it works with just DNS.
const WORDLIST = [
  "www", "mail", "ftp", "blog", "api", "dev", "staging", "stage", "test",
  "admin", "portal", "app", "web", "beta", "demo", "shop", "store", "support",
  "help", "docs", "wiki", "forum", "community", "cdn", "static", "assets",
  "img", "images", "media", "files", "download", "git", "ci", "jenkins",
  "jira", "vpn", "remote", "secure", "login", "auth", "sso", "account",
  "billing", "pay", "status", "monitor", "metrics", "db", "database",
  "search", "cache", "queue", "worker", "cron", "backup", "old", "new",
  "m", "mobile", "tv", "shop", "news", "events", "careers", "jobs", "press",
  "legal", "privacy", "terms", "go", "link", "s", "api-v2", "internal",
];

module.exports = { WORDLIST };
