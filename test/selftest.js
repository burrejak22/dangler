// offline sanity checks — fingerprints and scoring logic, no network.

const { matchService } = require("../src/services");
const { analyzeHost, bandFor } = require("../src/checks");

let failed = 0;
function check(label, cond) {
  console.log(`${cond ? "PASS" : "FAIL"} — ${label}`);
  if (!cond) failed++;
}

// fingerprint matching
check("herokuapp matched", matchService("myapp.herokuapp.com") === "Heroku");
check("herokudns matched", matchService("x.herokudns.com") === "Heroku");
check("github.io matched", matchService("user.github.io") === "GitHub Pages");
check("s3 website matched", matchService("bucket.s3-website.us-east-1.amazonaws.com") === "AWS S3 website");
check("netlify matched", matchService("site.netlify.app") === "Netlify");
check("trailing dot tolerated", matchService("myapp.herokuapp.com.") === "Heroku");
check("case insensitive", matchService("MyApp.HerokuApp.COM") === "Heroku");
check("random domain not matched", matchService("cdn.example.com") === null);
check("empty not matched", matchService("") === null);

// scoring logic
const likely = analyzeHost("blog.example.com", [{ target: "blog.herokuapp.com", alive: false }]);
check("dead target -> TAKEOVER_LIKELY",
  likely.length === 1 && likely[0].code === "TAKEOVER_LIKELY" && likely[0].score === 45);

const possible = analyzeHost("docs.example.com", [{ target: "docs.github.io", alive: true }]);
check("live target -> TAKEOVER_POSSIBLE",
  possible.length === 1 && possible[0].code === "TAKEOVER_POSSIBLE" && possible[0].score === 15);

check("unknown service -> no findings",
  analyzeHost("x.example.com", [{ target: "cdn.fastly.example.net", alive: false }]).length === 0);

check("no cnames -> no findings", analyzeHost("x.example.com", []).length === 0);

// bands
check("band thresholds", bandFor(0) === "LOW" && bandFor(30) === "MEDIUM" && bandFor(50) === "HIGH" && bandFor(90) === "CRITICAL");

process.exit(failed ? 1 : 0);
