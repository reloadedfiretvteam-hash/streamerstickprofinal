/**
 * One-off: replace pasted Supabase-style JWTs in docs/scripts with a placeholder.
 * Run: node scripts/redact-embedded-jwts.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const EXT = /\.(md|txt|ps1|html|bat)$/i;
// Typical Supabase HS256 JWT (anon or service_role shape)
const JWT =
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const STRIPE_SECRET = /\bsk_(live|test)_[A-Za-z0-9]+\b/g;
const GITHUB_PAT = /\bghp_[A-Za-z0-9]+\b/g;
/** https://TOKEN@github.com/... */
const GIT_URL_WITH_TOKEN =
  /https:\/\/ghp_[A-Za-z0-9]+@github\.com(\/[^'")\s]+)/g;

function allowRel(rel) {
  const n = rel.replace(/\\/g, "/");
  if (n.startsWith("node_modules/") || n.startsWith("dist/") || n.startsWith(".git/"))
    return false;
  if (
    n.startsWith("client/") ||
    n.startsWith("worker/") ||
    n.startsWith("shared/") ||
    n.startsWith("server/")
  )
    return false;
  if (n.startsWith(".local/")) return false;
  return true;
}

function walk(dir, out = []) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === ".git") continue;
      walk(p, out);
    } else if (EXT.test(name)) {
      out.push(p);
    }
  }
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  if (!allowRel(rel)) continue;
  let s = readFileSync(file, "utf8");
  let next = s.replace(
    JWT,
    "[REDACTED — use Supabase Dashboard → Settings → API → Project API keys]",
  );
  next = next.replace(STRIPE_SECRET, "[REDACTED — Stripe Dashboard → Developers → API keys]");
  next = next.replace(GITHUB_PAT, "[REDACTED — GitHub PAT; use gh auth login or SSH]");
  next = next.replace(
    GIT_URL_WITH_TOKEN,
    "https://github.com$1",
  );
  if (next !== s) {
    writeFileSync(file, next, "utf8");
    console.log("redacted:", rel);
    changed++;
  }
}
console.log(`Done. Files updated: ${changed}`);
