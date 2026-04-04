/**
 * Offline smoke checks: Zod schemas + pricing helpers (no DB / no secrets).
 * Run: npm run smoke:flows
 */
import { checkoutRequestSchema, effectiveRealProductChargeCents } from "../shared/schema";

function assert(name: string, ok: boolean, detail?: string) {
  if (!ok) throw new Error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
}

function main() {
  assert("effective: regular only", effectiveRealProductChargeCents({ price: 1000, salePrice: null }) === 1000);
  assert("effective: valid sale", effectiveRealProductChargeCents({ price: 1000, salePrice: 799 }) === 799);
  assert("effective: invalid sale (>= list) ignored", effectiveRealProductChargeCents({ price: 1000, salePrice: 1000 }) === 1000);

  const validCheckout = checkoutRequestSchema.safeParse({
    items: [{ productId: "fs-4k", quantity: 1 }, { productId: "iptv-1mo-1d", quantity: 2, applySitePromotion: true }],
    customerEmail: "buyer@example.com",
    customerName: "Test",
  });
  assert("checkout schema valid", validCheckout.success, validCheckout.success ? "" : String(validCheckout.error));

  const bad = checkoutRequestSchema.safeParse({
    items: [],
    customerEmail: "not-an-email",
  });
  assert("checkout schema rejects empty items", !bad.success);

  console.log("smoke-flows: OK");
}

main();
