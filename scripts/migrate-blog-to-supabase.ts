import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const LOCAL_DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function main() {
  console.log("🔄 Starting blog migration to Supabase...\n");

  if (!LOCAL_DATABASE_URL) {
    console.error("❌ Missing DATABASE_URL");
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
    process.exit(1);
  }

  console.log("📦 Connecting to local PostgreSQL...");
  const sql = postgres(LOCAL_DATABASE_URL);

  console.log("📦 Connecting to Supabase...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Step 1: Create the blog_posts table in Supabase if it doesn't exist
  console.log("\n📋 Creating blog_posts table in Supabase...");
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.blog_posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      slug text UNIQUE NOT NULL,
      excerpt text,
      content text NOT NULL,
      category text DEFAULT 'Guides',
      featured boolean DEFAULT false,
      is_published boolean DEFAULT true,
      published_at timestamp with time zone DEFAULT now(),
      keywords text[],
      meta_description text
    );
    
    CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON public.blog_posts (is_published);
    CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug);
  `;

  // Execute via Supabase REST API (raw SQL)
  const { error: rpcError } = await supabase.rpc("exec_sql", { sql_text: createTableSQL });
  
  if (rpcError) {
    console.log("ℹ️ Table creation via RPC failed (may need manual creation):", rpcError.message);
    console.log("\n📝 Please run this SQL in Supabase SQL Editor:");
    console.log(createTableSQL);
  } else {
    console.log("✅ Table created successfully");
  }

  // Step 2: Fetch blog posts from local PostgreSQL
  console.log("\n📥 Fetching blog posts from local database...");
  
  let posts: any[];
  try {
    posts = await sql`
      SELECT 
        title, 
        slug, 
        excerpt, 
        content, 
        category, 
        featured, 
        published as is_published, 
        published_at, 
        keywords, 
        meta_description 
      FROM blog_posts
    `;
  } catch (err: any) {
    console.error("❌ Failed to fetch from local DB:", err.message);
    await sql.end();
    process.exit(1);
  }

  console.log(`   Found ${posts.length} blog posts\n`);

  if (posts.length === 0) {
    console.log("⚠️ No blog posts found to migrate");
    await sql.end();
    return;
  }

  // Step 3: Insert/upsert posts into Supabase
  console.log("📤 Uploading blog posts to Supabase...");
  let successCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    const { error } = await supabase
      .from("blog_posts")
      .upsert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        category: post.category || "Guides",
        featured: post.featured || false,
        is_published: post.is_published ?? true,
        published_at: post.published_at || new Date().toISOString(),
        keywords: post.keywords || [],
        meta_description: post.meta_description || post.excerpt || "",
      }, { 
        onConflict: "slug" 
      });

    if (error) {
      console.error(`   ❌ Failed to upsert "${post.slug}":`, error.message);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);

  // Step 4: Verify the migration
  console.log("\n🔍 Verifying migration...");
  const { data: verifyData, error: verifyError } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);

  if (verifyError) {
    console.error("   ❌ Verification failed:", verifyError.message);
  } else {
    console.log(`   ✅ Found ${verifyData?.length || 0} published posts in Supabase`);
  }

  await sql.end();
  console.log("\n🎉 Done!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
