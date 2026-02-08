/**
 * Generate a SQL file you can run in Supabase SQL Editor to insert location pages.
 * Use when CI seed fails and you don't have DATABASE_URL locally.
 *
 * Run: npx tsx scripts/generate-25k-seed-sql.ts [maxRows] [batchSize]
 * Default: 1000 rows, 200 per INSERT. File: docs/seed-25k-inserts.sql
 *
 * In Supabase: SQL Editor → paste or run the file. Increase timeout if needed:
 *   SET statement_timeout = '300s';
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import { getSeedRows } from "./seed-25k-location-pages";

function escapeSql(s: string | null | undefined): string {
  if (s == null) return "NULL";
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function jsonbSql(val: unknown): string {
  if (val == null) return "NULL";
  return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
}

function main() {
  const maxRows = Math.min(parseInt(process.argv[2] || "1000", 10) || 1000, 25000);
  const batchSize = Math.min(parseInt(process.argv[3] || "200", 10) || 200, 500);
  const outPath = resolve(process.cwd(), "docs", "seed-25k-inserts.sql");

  const rows = getSeedRows().slice(0, maxRows);
  const lines: string[] = [
    "-- Run in Supabase SQL Editor. For full 25K use CI seed or: npx tsx scripts/seed-25k-via-database-url.ts",
    "SET statement_timeout = '300s';",
    "",
  ];

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values = batch
      .map(
        (r) =>
          `(${escapeSql(r.page_type)}, ${escapeSql(r.country)}, ${escapeSql(r.region ?? null)}, ${escapeSql(r.location)}, ${escapeSql(r.slug)}, ${escapeSql(r.target_keyword ?? null)}, ${escapeSql(r.title ?? null)}, ${escapeSql(r.meta_description ?? null)}, ${escapeSql(r.h1 ?? null)}, ${escapeSql(r.p1_snippet ?? null)}, ${escapeSql(r.pillar_url ?? null)}, ${jsonbSql(r.internal_links ?? [])}, ${jsonbSql(r.content_blocks ?? {})}, ${jsonbSql(r.faq_json ?? [])}, ${r.published !== false})`
      )
      .join(",\n  ");
    lines.push(
      `INSERT INTO seo_architecture (page_type, country, region, location, slug, target_keyword, title, meta_description, h1, p1_snippet, pillar_url, internal_links, content_blocks, faq_json, published)`,
      `VALUES\n  ${values}`,
      `ON CONFLICT (page_type, country, slug) DO NOTHING;`,
      ""
    );
  }

  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${rows.length} rows (batches of ${batchSize}) to ${outPath}`);
  console.log("Run this file in Supabase → SQL Editor. For full 25K use npm run seed:25k:db or CI.");
}

main();
