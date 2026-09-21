# Stage 5–7 — Payment display decoupling, SEO, hardening

## Stage 5 (done in code)

- `PUT /api/admin/products/:id` creates Stripe prices **only** when `force_stripe_resync` or `sync_payment_price` is true.
- Admin product Save no longer requires shadow sync success; toasts warn that checkout amounts are unchanged.
- Owner Content CMS device/plan Saves never accept Stripe fields; return display-price warnings.
- New product creation still uses `create-with-stripe` (needed for sellable SKUs) — intentional, labeled in UI.

## Stage 6 (done in code)

- Device PDP emits Product/Offer JSON-LD from the same published `cms_device_content` record.
- Public feed: `GET /api/owner-cms/merchant-feed.json` (published Google/ONN devices only; excludes Fire Stick for-sale SKUs; no secrets).
- SEO title/meta fields on device/plan/guide content tables; homepage meta from `cms_homepage.document.meta`.

## Stage 7

### Security finding (Stage 0)

Live `site_settings` previously stored **plaintext Stripe live keys** under `stripe_publishable_key` / `stripe_secret_key`. Worker uses Cloudflare env for Stripe — those DB rows must not exist. Hardening script removes them if still present.

### Restore drills

1. Admin → Owner Content CMS → History (audit log).
2. `GET /api/admin/cms/revisions?entity_type=homepage&entity_id=default`
3. `POST /api/admin/cms/revisions/:id/restore`

### Legacy note

`src/components/custom-admin/*` is not in the Vite build. Prefer `/admin` → **Owner Content CMS**.

### Rollback CMS tables

See [STAGE-1-OWNER-CMS-CONTENT-MODEL.md](./STAGE-1-OWNER-CMS-CONTENT-MODEL.md).
