# Finding More SEO Images (So You Don’t Have Too Many of the Same)

Use these sources and search terms to add **new** images similar to the ones you already have (Fire Stick, jailbroken, IPTV, Onn, TiviMate, etc.). Name them as below and put them in **client/public/images/** (or upload to Supabase `imiges` and add the URL to `client/src/data/seo-images.ts`).

---

## Free stock / royalty-free sources

- **Unsplash** – https://unsplash.com (free, high quality)  
- **Pexels** – https://pexels.com (free)  
- **Pixabay** – https://pixabay.com (free)

---

## Search terms by niche (use these so each image is different)

| Use case | Search terms | Suggested filename(s) |
|----------|--------------|------------------------|
| **Fire Stick / streaming device** | "fire tv stick", "amazon fire stick", "streaming stick", "smart tv remote" | `fire-stick-streaming-1.jpg`, `fire-tv-remote-2.jpg` |
| **IPTV / live TV** | "live tv", "tv channels", "streaming tv", "smart tv screen" | `live-tv-streaming.png`, `iptv-channels-hero.jpg` |
| **Jailbreak / freedom** | "streaming", "entertainment", "home cinema", "tv box" | `home-cinema-streaming.jpg` |
| **Onn / Google TV** | "google tv", "android tv", "streaming box", "chromecast" | `google-tv-device.jpg`, `android-tv-box.png` |
| **Apps (Smarters / TiviMate)** | "iptv app", "streaming app", "smart tv menu", "tv guide" | `iptv-app-screen.jpg`, `tv-guide-epg.png` |
| **USA / geo** | "american flag", "usa map", "streaming america" | `usa-streaming.png` (avoid reusing the same flags graphic) |

---

## Naming rule so you don’t repeat

- **One concept = one filename.** Don’t use the same file in 10 places.
- In code we **rotate** by section: section 0 → image A, section 1 → image B, etc. So add 2–3 different images per category (e.g. 2–3 different “Fire Stick” shots, 2–3 different “IPTV” shots).
- After adding a new file, add it to the right **group** in `client/src/data/seo-images.ts` (e.g. `JAILBREAK_IMAGES`, `IPTV_IMAGES`, `ONN_IMAGES`, `APP_IMAGES`, or `HERO_AND_DEVICE_IMAGES`).

---

## Where each group is used

| Group | Used on |
|-------|--------|
| `JAILBREAK_IMAGES` | Jailbroken Fire Sticks page (each section gets a different image) |
| `IPTV_IMAGES` | IPTV Services page, location pages (iptv type) |
| `ONN_IMAGES` | Onn Google TV page |
| `APP_IMAGES` | IPTV Smarters Pro & TiviMate pages |
| `HERO_AND_DEVICE_IMAGES` | Homepage hero / device section (variety) |
| `LOCATION_PAGE_IMAGES` | One image per location page by type (iptv / jailbreak / google) |

Adding 1–2 new images per group from the search terms above will give you enough variety so you don’t have too many of the same image.

---

## Other places to find images like yours

- **Unsplash**: Search “fire tv stick”, “streaming device”, “smart tv”, “iptv”, “android tv box”.
- **Pexels**: Same terms; also try “amazon fire”, “streaming stick”, “live tv”.
- **Pixabay**: “fire stick”, “streaming”, “tv remote”, “entertainment”.
- Use **different angles or styles** (e.g. device on table, remote close-up, app on screen) so each image is clearly different and the rotation stays varied.
