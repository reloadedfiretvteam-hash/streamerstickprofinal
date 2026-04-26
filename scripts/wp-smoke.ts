/**
 * Live end-to-end smoke for the WordPress headless integration.
 * Tests both sides: the deployed Cloudflare Worker (/api/cms/*) and the
 * WordPress plugin REST routes (/wp-json/streamstickpro/v1/*).
 *
 * Run:
 *   WP_SMOKE_BASE=https://streamstickpro.com \
 *   WP_SMOKE_WP_ORIGIN=https://your-wp-host \
 *   tsx scripts/wp-smoke.ts
 *
 * Optional shadow check:
 *   WP_SMOKE_SHADOW_BASE=https://secure.streamstickpro.com tsx scripts/wp-smoke.ts
 *
 * Read-only — never sends auth, never writes. Safe to run after every deploy.
 */

const base = (process.env.WP_SMOKE_BASE || process.env.SMOKE_LIVE_BASE || "https://streamstickpro.com").replace(/\/$/, "");
const wpOrigin = (process.env.WP_SMOKE_WP_ORIGIN || process.env.WP_ORIGIN || "").replace(/\/$/, "");
const shadowBase = (process.env.WP_SMOKE_SHADOW_BASE || "").replace(/\/$/, "");

let pass = 0;
let fail = 0;

function ok(name: string, detail = "") {
  pass++;
  console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function bad(name: string, detail = "") {
  fail++;
  console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function getJson(url: string): Promise<{ status: number; json: any; text: string }> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, json, text };
}

async function checkWorkerSide() {
  console.log(`\nWorker  ${base}`);

  const health = await getJson(`${base}/api/cms/health`);
  if (health.status === 200 && health.json?.ok) {
    ok("/api/cms/health ok",
      `home=#${health.json.pages?.home?.id} pricing=#${health.json.pages?.pricing?.id} auth=${health.json.authConfigured}`);
  } else {
    bad("/api/cms/health", `${health.status} ${JSON.stringify(health.json || health.text).slice(0, 200)}`);
  }

  const home = await getJson(`${base}/api/cms/home`);
  if (home.status === 200 && home.json?.data) {
    const d = home.json.data;
    ok("/api/cms/home returns data",
      `hero.title="${(d.hero?.title || "").slice(0, 40)}" cards=${Array.isArray(d.productCards) ? d.productCards.length : 0}`);
  } else {
    bad("/api/cms/home", `${home.status} data=${!!home.json?.data}`);
  }

  const pricing = await getJson(`${base}/api/cms/pricing`);
  if (pricing.status === 200 && pricing.json?.data) {
    const d = pricing.json.data;
    ok("/api/cms/pricing returns data",
      `mode=${d.selectedMode} plans=${Array.isArray(d.plans) ? d.plans.length : 0} faq=${Array.isArray(d.faq?.items) ? d.faq.items.length : 0}`);
    if (d.selectedMode !== "shadow") ok("public host uses LIVE price map", `keys=${Object.keys(d.selectedPrices || {}).length}`);
    else bad("public host wrongly resolved to shadow map");
  } else {
    bad("/api/cms/pricing", `${pricing.status}`);
  }

  if (shadowBase) {
    console.log(`\nShadow  ${shadowBase}`);
    const sp = await getJson(`${shadowBase}/api/cms/pricing`);
    if (sp.status === 200 && sp.json?.data) {
      const mode = sp.json.data.selectedMode;
      if (mode === "shadow") ok("shadow host uses SHADOW price map");
      else bad("shadow host did not resolve to shadow", `mode=${mode}`);
    } else {
      bad("shadow /api/cms/pricing", `${sp.status}`);
    }
  }
}

async function checkWordPressSide() {
  if (!wpOrigin) {
    console.log("\nWordPress plugin check: skipped (set WP_SMOKE_WP_ORIGIN to enable)");
    return;
  }
  console.log(`\nWordPress  ${wpOrigin}`);

  const wpHealth = await getJson(`${wpOrigin}/wp-json/streamstickpro/v1/health`);
  if (wpHealth.status === 200 && wpHealth.json?.plugin === "streamstickpro-controls") {
    const homeId = wpHealth.json.pages?.home?.id;
    const pricingId = wpHealth.json.pages?.pricing?.id;
    if (homeId && pricingId) {
      ok("plugin v" + wpHealth.json.version + " active",
        `home=#${homeId} (${wpHealth.json.pages.home.status}) pricing=#${pricingId} (${wpHealth.json.pages.pricing.status})`);
    } else {
      bad("plugin active but pages missing", `home=${homeId} pricing=${pricingId}`);
    }
  } else if (wpHealth.status === 404) {
    bad("plugin REST route 404", "is streamstickpro-controls activated in wp-admin?");
  } else {
    bad(`/wp-json/streamstickpro/v1/health`, `${wpHealth.status}`);
  }

  const wpJson = await getJson(`${wpOrigin}/wp-json/`);
  if (wpJson.status === 200 && wpJson.json?.namespaces) {
    const hasOurs = (wpJson.json.namespaces as string[]).includes("streamstickpro/v1");
    if (hasOurs) ok("namespaces list includes streamstickpro/v1");
    else bad("namespaces list missing streamstickpro/v1");
  } else {
    bad(`${wpOrigin}/wp-json/ unreachable`, `${wpJson.status}`);
  }
}

async function main() {
  console.log("=".repeat(70));
  console.log(" StreamStickPro WordPress integration smoke");
  console.log("=".repeat(70));

  await checkWorkerSide();
  await checkWordPressSide();

  console.log("\n" + "=".repeat(70));
  console.log(` Result: ${pass} passed, ${fail} failed`);
  console.log("=".repeat(70));
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error("FATAL:", e instanceof Error ? e.message : e);
  process.exit(2);
});
