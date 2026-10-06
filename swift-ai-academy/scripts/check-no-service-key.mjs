// CI guard: the service-role key must never reach the build output.
// CI builds with SUPABASE_SERVICE_ROLE_KEY set to a canary, then this script greps .next for it.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const canary = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!canary || canary.length < 20) { console.error("Set SUPABASE_SERVICE_ROLE_KEY (the canary) before running."); process.exit(2); }

const hits = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (f === "cache") continue;
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (readFileSync(p).includes(canary)) hits.push(p);
  }
};
walk(".next");
if (hits.length) { console.error("Service-role key found in build output:\n" + hits.join("\n")); process.exit(1); }

// Also: no NEXT_PUBLIC_ variable may carry the service key name.
const src = readFileSync(".env.example", "utf8");
if (/NEXT_PUBLIC_[A-Z_]*SERVICE/.test(src)) { console.error("A NEXT_PUBLIC_ variable names the service key."); process.exit(1); }
console.log("OK: service-role key not in build output.");
