/**
 * Static audit: site promotion wiring (admin → Supabase → /api/promotion → MainStore → checkout).
 * Run: npm run audit:promotion
 */
import { readFile } from "fs/promises";
import path from "path";

const root = process.cwd();

async function mustInclude(file: string, needles: string[]) {
  const abs = path.join(root, file);
  const text = await readFile(abs, "utf8");
  for (const n of needles) {
    if (!text.includes(n)) {
      throw new Error(`[audit-site-promotion] Missing "${n.slice(0, 80)}..." in ${file}`);
    }
  }
}

async function main() {
  await mustInclude("worker/index.ts", [
    "sitePromotionPublicHandler",
    "/api/site-promotion-public",
    "getSitePromotionRow",
  ]);
  await mustInclude("worker/routes/checkout.ts", ["getActiveSitePromotion", "applySitePromotion", "promoShadowPriceId"]);
  await mustInclude("worker/routes/admin.ts", ["app.get('/site-promotion'", "create-stripe-price"]);
  await mustInclude("worker/storage.ts", ["site_promotion", "getActiveSitePromotion", "upsertSitePromotionRow"]);
  await mustInclude("client/src/pages/MainStore.tsx", ["SitePromotionBanner", 'variant="live"', "sitePromotion: true"]);
  await mustInclude("client/src/components/SitePromotionBanner.tsx", ["/api/promotion", 'variant: "live"']);
  await mustInclude("client/src/pages/AdminPanel.tsx", [
    "site-promotion",
    "nav-site-promotion",
    "card-promotion-settings",
    "/api/admin/site-promotion",
  ]);
  await mustInclude("client/src/pages/Checkout.tsx", ["applySitePromotion"]);
  await mustInclude("shared/schema.ts", ["applySitePromotion", "checkoutItemSchema"]);
  await mustInclude("supabase/migrations/20260404120000_site_promotion.sql", ["site_promotion", "promo_shadow_price_id"]);
  console.log("audit-site-promotion: OK (static wiring checks passed)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
