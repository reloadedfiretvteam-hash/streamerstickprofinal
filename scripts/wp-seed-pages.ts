/**
 * One-shot seeder: ensures the two CMS pages exist in WordPress and
 * populates them with the canonical JSON from ops/cms/*.json.
 *
 * Run (locally or in CI):
 *   WP_ORIGIN=https://your-wp-host \
 *   WP_APPLICATION_USER=your-wp-user \
 *   WP_APPLICATION_PASSWORD='xxxx xxxx xxxx xxxx xxxx xxxx' \
 *   tsx scripts/wp-seed-pages.ts
 *
 * Idempotent: creates the pages only if missing, then overwrites their
 * JSON content with whatever is currently in ops/cms/. Safe to re-run
 * after editing those files. Never reads or rotates secrets.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const wpOrigin = (process.env.WP_ORIGIN || process.env.WORDPRESS_URL || "").replace(/\/$/, "");
const wpUser = (process.env.WP_APPLICATION_USER || process.env.WORDPRESS_APPLICATION_USER || "").trim();
const wpPass = (process.env.WP_APPLICATION_PASSWORD || process.env.WORDPRESS_APPLICATION_PASSWORD || "").trim();
const wpBasic = (process.env.WP_REST_BASIC_AUTH || "").trim();

if (!wpOrigin) {
  console.error("Set WP_ORIGIN (or WORDPRESS_URL).");
  process.exit(2);
}
if (!wpBasic && (!wpUser || !wpPass)) {
  console.error("Set WP_APPLICATION_USER + WP_APPLICATION_PASSWORD, or WP_REST_BASIC_AUTH.");
  process.exit(2);
}

const auth = wpBasic
  ? (wpBasic.startsWith("Basic ") ? wpBasic : `Basic ${wpBasic}`)
  : `Basic ${Buffer.from(`${wpUser}:${wpPass}`).toString("base64")}`;

const PAGES = [
  { slug: "streamstick-home-v1", title: "StreamStickPro Home", file: "ops/cms/streamstick-home-v1.json" },
  { slug: "streamstick-pricing-v1", title: "StreamStickPro Pricing", file: "ops/cms/streamstick-pricing-v1.json" },
];

function escapeHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function ensureAndPopulate(p: { slug: string; title: string; file: string }) {
  const json = JSON.parse(await readFile(resolve(p.file), "utf8"));
  const content = `<pre><code>${escapeHtml(JSON.stringify(json, null, 2))}</code></pre>`;

  const fields = "id,slug,status";
  const lookup = await fetch(`${wpOrigin}/wp-json/wp/v2/pages?slug=${encodeURIComponent(p.slug)}&context=edit&status=any&_fields=${fields}`, {
    headers: { Authorization: auth },
  });
  if (!lookup.ok) throw new Error(`lookup ${p.slug}: ${lookup.status} ${await lookup.text()}`);
  const rows = (await lookup.json()) as Array<{ id: number; slug: string; status: string }>;
  let pageId = rows?.[0]?.id;

  if (!pageId) {
    console.log(`  + creating page ${p.slug}`);
    const create = await fetch(`${wpOrigin}/wp-json/wp/v2/pages`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ slug: p.slug, title: p.title, status: "publish", content }),
    });
    if (!create.ok) throw new Error(`create ${p.slug}: ${create.status} ${await create.text()}`);
    const created = (await create.json()) as { id: number };
    pageId = created.id;
    console.log(`    → created #${pageId}`);
    return;
  }

  console.log(`  ~ updating page ${p.slug} #${pageId}`);
  const update = await fetch(`${wpOrigin}/wp-json/wp/v2/pages/${pageId}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content, status: "publish" }),
  });
  if (!update.ok) throw new Error(`update ${p.slug}: ${update.status} ${await update.text()}`);
  console.log(`    → updated`);
}

async function main() {
  console.log(`wp-seed-pages → ${wpOrigin}`);
  for (const page of PAGES) {
    await ensureAndPopulate(page);
  }
  console.log("done.");
}

main().catch((e) => {
  console.error("FATAL:", e instanceof Error ? e.message : e);
  process.exit(1);
});
