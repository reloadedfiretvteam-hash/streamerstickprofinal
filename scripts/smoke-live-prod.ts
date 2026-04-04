/**
 * Live HTTP smoke against production (no Cloudflare/GitHub/Supabase tokens).
 * Run: npm run smoke:live
 * Override: SMOKE_LIVE_BASE=https://your-preview.pages.dev npm run smoke:live
 */
const base = (process.env.SMOKE_LIVE_BASE || "https://streamstickpro.com").replace(/\/$/, "");

function assert(name: string, ok: boolean, detail?: string) {
  if (!ok) throw new Error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
}

async function getJson(path: string): Promise<unknown> {
  const url = `${base}${path}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  assert(`${path} status`, res.ok, `${res.status} ${url}`);
  return res.json() as Promise<unknown>;
}

async function getOk(path: string, accept?: string): Promise<void> {
  const url = `${base}${path}`;
  const res = await fetch(url, { headers: accept ? { Accept: accept } : {} });
  assert(`${path} status`, res.ok, `${res.status} ${url}`);
}

async function main() {
  console.log("smoke-live-prod:", base);

  await getOk("/", "text/html");
  await getOk("/sitemap.xml", "application/xml");
  await getJson("/api/site-promotion-public");
  await getJson("/api/promotion");

  const productsJson = (await getJson("/api/products")) as { data?: unknown[] };
  assert("products.data array", Array.isArray(productsJson.data) && productsJson.data!.length > 0);
  const first = productsJson.data![0] as { id?: unknown; price?: unknown; salePrice?: unknown };
  assert("product.id", typeof first.id === "string");
  assert("product.price", typeof first.price === "number");

  const withSale = productsJson.data!.filter(
    (p: any) => p?.salePrice != null && p.salePrice !== "",
  ).length;
  console.log(`   products: ${productsJson.data!.length}, with salePrice: ${withSale}`);
  console.log("smoke-live-prod: OK");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
