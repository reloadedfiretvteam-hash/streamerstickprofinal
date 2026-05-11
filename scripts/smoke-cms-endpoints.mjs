/**
 * Smoke-test public CMS + catalog endpoints (no admin auth).
 * Usage: SMOKE_BASE=https://your-domain.com node scripts/smoke-cms-endpoints.mjs
 */
const BASE = (process.env.SMOKE_BASE || "https://streamstickpro.com").replace(/\/+$/, "");

const paths = [
  "/api/cms/health",
  "/api/cms/home",
  "/api/cms/shadow",
  "/api/cms/pricing",
  "/api/cms/page-overrides?pageId=main",
  "/api/cms/page-overrides?pageId=shadow",
  "/api/products",
];

async function main() {
  let failed = 0;
  for (const p of paths) {
    const url = `${BASE}${p}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      const ok = res.ok;
      let hint = `${res.status}`;
      if (ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json().catch(() => null);
          if (p.includes("health")) hint += j?.ok === false ? " (health:ok=false)" : " (health)";
          if (p.includes("shadow") && j && "data" in j && j.data == null) hint += " (shadow WP optional)";
        }
      } else {
        failed++;
      }
      console.log(`${ok ? "OK " : "FAIL"} ${hint}  ${url}`);
    } catch (e) {
      failed++;
      console.log(`FAIL error  ${url}  ${e?.message || e}`);
    }
  }
  process.exit(failed ? 1 : 0);
}

main();
