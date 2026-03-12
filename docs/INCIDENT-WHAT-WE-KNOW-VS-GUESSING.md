# The Incident: What We Know vs Where I'm Guessing

**Incident:** When you roll back (e.g. to 20fb10e), checkout and trials work. When you add SEO or UI updates and deploy, they stop working.

---

## What we know (not guessing)

1. **Code for code:** The SEO and UI changes are only:
   - `client/index.html` (e.g. og:image:alt)
   - `client/src/index.css` (CTA sizes, focus-visible)
   - `client/src/pages/MainStore.tsx` (hero, benefits section, CTA section)
   None of these files touch the Worker, `/api/checkout`, `/api/free-trial`, or any Stripe/Resend logic. Checkout and trial run in the **Worker**; the client only calls `/api/checkout` and `/api/free-trial`. So the SEO/UI code **cannot by itself** cause "checkout stopped working."

2. **Observed state when it was broken:** Live `GET https://streamstickpro.com/api/health` returned:
   - `stripe: false`, `resend: false`, `supabase: true`
   So the Worker at runtime **did not have** STRIPE_SECRET_KEY or RESEND_API_KEY. That is why checkout and trials failed.

3. **Timeline:** Rollback deploy = works. Deploy with SEO/UI = broken. So the **deployment** that goes live when you add SEO/UI does not have those secrets (or they’re not in the env that serves the request).

---

## Where / when / why — what I'm inferring (guessing)

- **Where:** I infer the secrets are missing in the **Cloudflare Pages environment** that actually serves `streamstickpro.com` (e.g. the deployment for branch clean-main). I have **not** verified in the Dashboard which deployment is live and which env vars that deployment has. So "where" = inferred from health + how Pages works.

- **When:** I infer that when you **add SEO/UI** you **push a new commit** → a **new** deployment runs → that new deployment is what goes live, and it doesn’t get the secrets (e.g. because at 20fb10e there was no sync step and secrets were only in the Dashboard for an *older* deployment; or because the new deploy is Preview and we only synced to Production). I have **not** traced one push (20fb10e) vs one push (SEO/UI) through the same pipeline and confirmed "this deploy had secrets, that one didn’t." So "when" = inferred from correlation (new code → new deploy → broken).

- **Why:** I infer that the **cause** is "the deployment that ends up live doesn’t have Stripe/Resend in its environment" (either sync didn’t run for that env, or sync wasn’t there at 20fb10e and only Dashboard had secrets for whatever was live before). So "why" = inferred from (no secrets at runtime + no code path that could remove them).

---

## Summary

| | Known | Guessing |
|---|--------|----------|
| **What** | Checkout/trials fail because Worker has no Stripe/Resend at runtime (health proved it). | — |
| **Code** | SEO/UI changes don’t touch Worker or checkout/trial logic; they can’t directly cause this. | — |
| **Where** | — | Which exact Cloudflare env/deployment is missing secrets (inferred from health + Pages model). |
| **When** | — | That a *new* deploy (from the SEO/UI push) is the one that goes live and that deploy doesn’t get secrets (inferred from correlation). |
| **Why** | — | That the root cause is "secrets not attached to the deployment that serves the site" (inferred). |

So: we know **what** the incident is (Worker missing Stripe/Resend) and that the **SEO/UI code isn’t the cause**. The **where**, **when**, and **why** in terms of exact deployment/env and sequence are inferred, not proven with one-to-one pipeline traces.
