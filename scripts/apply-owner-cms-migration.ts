/**
 * Apply owner CMS migration (additive). Uses DATABASE_URL / SUPABASE_DATABASE_URL.
 * Does not touch Stripe, orders, or provisioning logic.
 */
import postgres from "postgres";
import { readFile } from "fs/promises";
import path from "path";

async function main() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing SUPABASE_DATABASE_URL or DATABASE_URL");
    process.exit(1);
  }

  const sqlPath = path.join(
    process.cwd(),
    "supabase/migrations/20260922000000_owner_cms_content_model.sql",
  );
  const body = await readFile(sqlPath, "utf8");

  const sql = postgres(databaseUrl, { ssl: "require", max: 1, idle_timeout: 20 });
  try {
    console.log("Applying owner CMS migration...");
    await sql.unsafe(body);
    console.log("Owner CMS migration applied.");
    try {
      await sql`NOTIFY pgrst, 'reload schema'`;
    } catch {
      /* optional */
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
