# WordPress Self-Serve Cutover

This is the simplest path to manage the WordPress-first setup yourself later without touching app code.

## What Is Already Wired

- The homepage content is read from WordPress through `/api/cms/home`.
- The pricing page content is now read from WordPress through `/api/cms/pricing`.
- Checkout already supports WordPress-managed Stripe Price ID overrides through `/api/cms/pricing`.
- Shadow vs live is controlled by hostname in the worker. Shadow/preview hosts read draft-oriented pricing mode, and live hosts read live mode.
- WooCommerce core pages are assigned in WordPress admin:
  - `Cart` -> page ID `7`
  - `Checkout` -> page ID `8`
  - `My account` -> page ID `9`
- Those WooCommerce pages are already published and wired with standard Woo content:
  - `Cart` uses WooCommerce cart blocks
  - `Checkout` uses WooCommerce checkout blocks
  - `My account` uses the standard `[woocommerce_my_account]` shortcode

## What You Edit In WordPress

### WooCommerce pages

These WordPress pages already exist and are the WordPress-side control surface for account/cart/checkout layout:

- `Cart`
- `Checkout`
- `My account`

For the hybrid path, this means WordPress already owns the WooCommerce page layer even though the current live checkout flow should stay on the existing app path until Stripe and mail are fully proven in WordPress.

### Pricing page content

WordPress page slug:

- `streamstick-pricing-v1`

This page now controls:

- pricing page SEO title
- pricing page SEO description
- page heading
- intro text
- plan cards
- pricing CTA text and link
- pricing FAQ content
- Stripe price override maps for `shadow` and `live`

The JSON structure lives in:

- `ops/cms/streamstick-pricing-v1.json`

Use that file as the source of truth/template when updating the WordPress page content.

### Homepage content

WordPress page slug:

- `streamstick-home-v1`

The JSON structure lives in:

- `ops/cms/streamstick-home-v1.json`

## Where Stripe Keys Go In WordPress

Use the built-in WooCommerce Stripe settings:

- `WooCommerce -> Settings -> Payments -> Stripe`

This is where you can later manage:

- publishable key
- secret key / API key
- test mode
- live mode
- webhook connection/status

For the WordPress takeover path, this is the main self-serve Stripe screen.

Current hybrid status:

- The Stripe gateway plugin is installed and its setup screen is reachable in WordPress.
- WooCommerce Stripe is still waiting for account connection / key setup in WordPress before it should be used for live checkout.
- The current React + Worker checkout remains the live path until that WordPress Stripe setup is completed and tested.

## Safe Order For Future Switch

1. Keep the current app checkout live until WordPress checkout is fully configured.
2. In WordPress, finish SMTP first so receipts/admin mail work.
3. In `WooCommerce -> Settings -> Payments -> Stripe`, enter test keys first.
4. Confirm webhook/connection status in Stripe settings.
5. Populate `prices.shadow` in the pricing JSON with verified Stripe `price_...` IDs.
6. Test the shadow/preview host first.
7. When confirmed, populate or verify `prices.live`.
8. Switch the live site only after test purchases and email flow pass.

## Shadow vs Live Rules

- `shadow` prices are for preview/shadow hosts.
- `live` prices are for the real/live site.
- If a WordPress price override is empty, checkout safely falls back to the current database-backed Stripe price ID.

That fallback is important because it lets you prepare WordPress pricing gradually without breaking live checkout.

## What To Avoid

- Do not paste unverified Stripe price IDs into `live`.
- Do not switch live checkout before SMTP and Stripe webhook status are confirmed.
- Do not mix test keys with live mode.
- Do not assume the pricing page content and Stripe price IDs are the same thing. The page text controls what customers see; the `prices.shadow` and `prices.live` maps control which Stripe price IDs checkout uses.

## Current Remaining Setup

- Finish `FluentSMTP` provider setup. The plugin is installed, but it currently has no active mailer connection configured.
- Connect WooCommerce Stripe using your own Stripe account or keys in WordPress admin.
- Confirm a WordPress-side test purchase and email flow before any checkout switchover.
- Keep the current app-side `Resend` email flow in place for the live hybrid storefront until WordPress mail is proven working.

## Why This Matches The Project Goal

The project goal is not "move everything at once." The safe goal is:

- keep the existing site working
- move control surfaces into WordPress one by one
- preserve shadow/live separation
- make Stripe switchover something you can do yourself from WordPress admin later

That is the path this repo is now following.
