/**
 * Quick health check for public pricing-related APIs (no admin login).
 * Run: node scripts/smoke-pricing-public.mjs
 * Or:  SMOKE_BASE=https://your-domain.com node scripts/smoke-pricing-public.mjs
 */
const BASE = (process.env.SMOKE_BASE || "https://streamstickpro.com").replace(/\/+$/, "");

async function getJson(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { url, ok: res.ok, status: res.status, json };
}

async function main() {
  let failed = 0;
  const checks = [
    ["/api/products", (j) => Array.isArray(j?.data), "returns { data: array }"],
    ["/api/cms/pricing", (j) => j?.data && typeof j.data === "object", "returns pricing payload"],
    ["/api/site-promotion-public", (j) => "promotion" in j, "returns { promotion }"],
  ];

  console.log("smoke-pricing-public —", BASE, "\n");

  for (const [path, validate, note] of checks) {
    const { ok, status, json, url } = await getJson(path);
    const pass = ok && json && validate(json);
    if (!pass) failed++;
    const extra =
      path.includes("promotion") && json?.promotion
        ? ` (active offer: "${String(json.promotion.headline || "").slice(0, 40)}…")`
        : path.includes("promotion") && json && json.promotion === null
          ? " (no active promotion — OK)"
          : "";
    console.log(`${pass ? "OK " : "FAIL"} ${status}  ${path}  ${note}${extra}`);
    if (!pass) console.log(`      ${url}`);
  }

  if (failed) {
    console.error(`\n${failed} check(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll public pricing checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
