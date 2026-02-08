/**
 * Build-time: generate static location-pages.json for sitemap + /l/ meta fallback.
 * Ensures 25K URLs and meta exist even when DB seed hasn't run.
 * Output: dist/location-pages.json (array of { path, t, d, h })
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { getSeedRows } from "./seed-25k-location-pages";

function main() {
  const outDir = resolve(process.cwd(), "dist");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "location-pages.json");

  const rows = getSeedRows();
  const list = rows.map((r) => {
    const country = (r.country || "usa").toLowerCase();
    const pageType = r.page_type || "iptv";
    const slug = r.slug || "";
    const path = `/l/${country}/${pageType}/${slug}`;
    const title = (r.title || r.h1 || "IPTV & Fire Stick").replace(/\[LOCATION\]/g, r.location || r.region || slug);
    const desc = (r.meta_description || r.p1_snippet || "").substring(0, 160);
    const h1 = (r.h1 || title).replace(/\[LOCATION\]/g, r.location || r.region || slug);
    return { path, t: title, d: desc, h: h1 };
  });

  writeFileSync(outPath, JSON.stringify(list), "utf8");
  console.log(`Wrote ${list.length} location pages to ${outPath}`);
}

main();
