/**
 * Smoke-test public CMS + catalog endpoints (no admin auth).
 * Validates response shapes for Supabase-only CMS (no WordPress).
 *
 * Usage:
 *   SMOKE_BASE=https://your-domain.com node scripts/smoke-cms-endpoints.mjs
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

function assertShape(path, j) {
  if (path.includes("health")) {
    if (j?.ok !== true) return "health: expected ok=true";
    if (j.wordpress !== false) return "health: expected wordpress=false (Supabase-only CMS)";
    if (j.mode !== "supabase") return `health: expected mode=supabase, got ${j.mode}`;
  }
  if (path.includes("/home") && path.includes("cms")) {
    if (!("data" in j)) return "home: missing data key";
    if (j.data !== null) return "home: expected data=null (base from client defaults + page_edits)";
    if (!j.meta?.hint) return "home: expected meta.hint for editors";
  }
  if (path.includes("/shadow") && path.includes("cms")) {
    if (!("data" in j)) return "shadow: missing data key";
    if (j.data !== null) return "shadow: expected data=null";
  }
  if (path.includes("pricing")) {
    const d = j?.data;
    if (!d || typeof d !== "object") return "pricing: missing data object";
    if (!["shadow", "live"].includes(d.selectedMode)) return `pricing: bad selectedMode=${d.selectedMode}`;
    if (!Array.isArray(d.plans)) return "pricing: plans must be array";
    if (typeof d.selectedPrices !== "object" || d.selectedPrices === null)
      return "pricing: selectedPrices must be object";
  }
  if (path.includes("page-overrides")) {
    if (!Array.isArray(j?.data)) return "page-overrides: data must be array";
    if (typeof j.pageId !== "string") return "page-overrides: pageId must be string";
  }
  if (path === "/api/products") {
    if (!Array.isArray(j?.data)) return "products: expected { data: array }";
  }
  return null;
}

async function main() {
  let failed = 0;
  for (const p of paths) {
    const url = `${BASE}${p}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      const okHttp = res.ok;
      let hint = `${res.status}`;
      let shapeErr = null;

      if (okHttp) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json().catch(() => null);
          if (j) shapeErr = assertShape(p, j);
          if (p.includes("health")) hint += j?.ok === false ? " (health:ok=false)" : " (health+shape)";
          if (p.includes("shadow") && j && "data" in j && j.data == null) hint += " (null base + page_edits)";
          if (shapeErr) hint += ` SHAPE:${shapeErr}`;
        }
      } else {
        failed++;
      }
      if (shapeErr) failed++;
      console.log(`${okHttp && !shapeErr ? "OK " : "FAIL"} ${hint}  ${url}`);
    } catch (e) {
      failed++;
      console.log(`FAIL error  ${url}  ${e?.message || e}`);
    }
  }
  if (failed) {
    console.error(`\n${failed} check(s) failed. Deploy worker with Supabase-only CMS or set SMOKE_BASE to a current host.`);
  }
  process.exit(failed ? 1 : 0);
}

main();
