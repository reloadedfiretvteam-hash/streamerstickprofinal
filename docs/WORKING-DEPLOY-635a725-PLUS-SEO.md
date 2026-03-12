# Working deploy (635a725) + SEO and homepage only

**Working deployment:** commit **635a725** — deploy URL **4a86d30c.streamerstickpro-live.pages.dev** (checkout and free trials worked).

**What was done:** Restored the **workflow** and **worker** to exactly 635a725 (no sync step, no health smoke test — same pipeline that worked). The **client** keeps the SEO and homepage changes only:
- **client/index.html:** og:image:alt, og:image width/height, twitter:image:alt, BreadcrumbList, static H1 for crawlers.
- **client/src/pages/MainStore.tsx:** Homepage overhaul (bright gradient hero, white “Perfect Streaming Guaranteed” section, emerald “Ready to Cut the Cord?” band).

So: **same working deploy (635a725)** for pipeline and Worker; **only** SEO and front/homepage added on the client. Checkout and free trials rely on the same Cloudflare Pages env (Dashboard) that made 4a86d30c work.
