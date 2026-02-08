/**
 * Seed 25K location pages using DATABASE_URL (same secret as migrations).
 * Use this when SUPABASE_SERVICE_KEY is not set in CI.
 *
 * Run: npx tsx scripts/seed-25k-via-database-url.ts
 * Requires: SUPABASE_DATABASE_URL or DATABASE_URL
 */

import postgres from "postgres";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { getSeedRows } from "./seed-25k-location-pages";

function loadEnvLocal() {
  const paths = [resolve(process.cwd(), ".env.local"), resolve(process.cwd(), ".env")];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    try {
      const content = readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.replace(/#.*/, "").trim();
        const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m) {
          const val = m[2].trim().replace(/^["'`]|["'`]$/g, "");
          if (val) process.env[m[1]] = val;
        }
      }
      break;
    } catch {
      /* ignore */
    }
  }
}
loadEnvLocal();

const DATABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
const BATCH = 200;

async function main() {
  if (!DATABASE_URL) {
    console.error("❌ Missing SUPABASE_DATABASE_URL or DATABASE_URL.");
    process.exit(1);
  }

  const sql = postgres(DATABASE_URL, { ssl: "require", max: 1, idle_timeout: 30 });

  try {
    const existing = await sql`SELECT count(*)::int as n FROM seo_architecture`;
    console.log("   Existing rows before seed:", existing[0]?.n ?? 0);

    const allRows = getSeedRows();
    console.log("   Rows to upsert:", allRows.length);

    for (let i = 0; i < allRows.length; i += BATCH) {
      const batch = allRows.slice(i, i + BATCH).map((row) => ({
        page_type: row.page_type,
        country: row.country,
        region: row.region ?? null,
        location: row.location,
        slug: row.slug,
        target_keyword: row.target_keyword ?? null,
        title: row.title ?? null,
        meta_description: row.meta_description ?? null,
        h1: row.h1 ?? null,
        p1_snippet: row.p1_snippet ?? null,
        pillar_url: row.pillar_url ?? null,
        internal_links: row.internal_links ?? [],
        content_blocks: row.content_blocks ?? {},
        faq_json: row.faq_json ?? [],
        published: row.published ?? true,
      }));
      await sql`
        INSERT INTO seo_architecture ${sql(batch)}
        ON CONFLICT (page_type, country, slug) DO NOTHING
      `;
      process.stdout.write(`\r  Upserted ${Math.min(i + BATCH, allRows.length)}/${allRows.length}`);
    }

    const after = await sql`SELECT count(*)::int as n FROM seo_architecture`;
    console.log("\n   Total rows after seed:", after[0]?.n ?? 0);
    console.log("\n✅ Done (via DATABASE_URL).");
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
