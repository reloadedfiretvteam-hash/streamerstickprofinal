import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DOMAIN = "https://streamstickpro.com";

async function main() {
  console.log("🗺️ Generating Sitemap with all blog posts...\n");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Fetch all published blog posts
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("slug, published_at, category")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch blog posts:", error.message);
    process.exit(1);
  }

  console.log(`📝 Found ${posts?.length || 0} published blog posts\n`);

  const today = new Date().toISOString().split("T")[0];

  // Static pages
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/blog", priority: "0.9", changefreq: "daily" },
    { url: "/checkout", priority: "0.8", changefreq: "monthly" },
    { url: "/free-trial", priority: "0.9", changefreq: "monthly" },
    { url: "/terms", priority: "0.5", changefreq: "yearly" },
    { url: "/privacy", priority: "0.5", changefreq: "yearly" },
    { url: "/refund", priority: "0.5", changefreq: "yearly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add static pages
  for (const page of staticPages) {
    xml += `  <url><loc>${DOMAIN}${page.url}</loc><lastmod>${today}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>\n`;
  }

  // Add blog posts
  for (const post of posts || []) {
    const lastmod = post.published_at 
      ? new Date(post.published_at).toISOString().split("T")[0] 
      : today;
    xml += `  <url><loc>${DOMAIN}/blog/${post.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
  }

  xml += `</urlset>`;

  // Write to client/public/sitemap.xml
  fs.writeFileSync("client/public/sitemap.xml", xml);
  console.log("✅ Sitemap written to client/public/sitemap.xml");

  // Also write to dist/sitemap.xml if it exists
  if (fs.existsSync("dist")) {
    fs.writeFileSync("dist/sitemap.xml", xml);
    console.log("✅ Sitemap written to dist/sitemap.xml");
  }

  // Count URLs
  const urlCount = staticPages.length + (posts?.length || 0);
  console.log(`\n📊 Total URLs in sitemap: ${urlCount}`);
  
  // Breakdown by category
  const categories = (posts || []).reduce((acc: Record<string, number>, post: any) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log("\nBy category:");
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`   - ${cat}: ${count}`);
  }
}

main().catch(console.error);
