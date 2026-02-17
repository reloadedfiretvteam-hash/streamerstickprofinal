/**
 * Seed 2000+ geo + topic SEO blog posts (USA, UK, Canada).
 * Topics: Fire Stick, jailbroken/pre-configured, ONN, IPTV, free trials, subscriptions, tutorials. No sports.
 * Usage: VITE_SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx scripts/seed-thousands-seo-blogs.ts
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BATCH_SIZE = 100;

interface SeedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured: boolean;
  is_published: boolean;
  published_at: string;
  keywords: string;
  meta_description: string;
}

const USA_STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
const CANADA_PROVINCES = ["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Northwest Territories","Nova Scotia","Nunavut","Ontario","Prince Edward Island","Quebec","Saskatchewan","Yukon"];
const UK_REGIONS = ["England","Scotland","Wales","Northern Ireland","London","North West England","South East England","Midlands","North East England","Yorkshire","South West England","East of England"];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generateParagraph(topic: string, kw: string): string {
  return `When it comes to ${topic.toLowerCase()}, understanding your options is key. Many users searching for ${kw} find that modern streaming solutions offer great value. With the right setup, you can access thousands of channels and on-demand content. Our team at StreamStickPro has tested dozens of solutions to bring you the best recommendations.`;
}

function generateContent(title: string, intro: string, sections: string[], keywordsStr: string): string {
  const kw = keywordsStr.split(",").map((s) => s.trim()).filter(Boolean);
  const sectionContent = sections.map((s) => `## ${s}\n\n${generateParagraph(s, kw[0] || "streaming")}\n`).join("\n\n");
  return `# ${title}\n\n${intro}\n\n${sectionContent}\n\n## Why Choose StreamStickPro?\n\nWe offer **pre-configured Fire Sticks** and **premium IPTV** with 10-minute setup, 24/7 support, 20,000+ channels, and money-back guarantee. [Shop Fire Sticks](/shop) | [Get IPTV](/shop)\n\n---\n*Last updated: February 2026*`;
}

const TOPIC_TEMPLATES: Array<{ title: string; slug: string; category: string; keywords: string; sections: string[] }> = [
  { title: "Best IPTV in {{region}} 2026", slug: "best-iptv-{{region-slug}}-2026", category: "IPTV Services", keywords: "iptv {{region}}, streaming {{region}}", sections: ["What is IPTV?", "Choosing a Provider", "Free Trials", "Subscription Options"] },
  { title: "Jailbroken Fire Stick {{region}}: Guide", slug: "jailbroken-fire-stick-{{region-slug}}-guide", category: "Fire Stick Guides", keywords: "jailbroken fire stick {{region}}, fire stick {{region}}", sections: ["What is a Jailbroken Fire Stick?", "Setup and Apps", "Support"] },
  { title: "Pre-Configured Fire Stick {{region}}", slug: "pre-configured-fire-stick-{{region-slug}}", category: "Fire Stick Guides", keywords: "pre-configured fire stick {{region}}, fire stick {{region}}", sections: ["Why Pre-Configured?", "What's Included", "Setup"] },
  { title: "ONN Google TV IPTV {{region}}", slug: "onn-google-tv-iptv-{{region-slug}}", category: "ONN Devices", keywords: "onn iptv {{region}}, onn google tv {{region}}", sections: ["ONN Overview", "IPTV on ONN", "Troubleshooting"] },
  { title: "Best IPTV Channels {{region}}", slug: "best-iptv-channels-{{region-slug}}", category: "IPTV Services", keywords: "iptv channels {{region}}, streaming {{region}}", sections: ["Channel Lineups", "How to Get Access"] },
  { title: "IPTV Free Trial {{region}}", slug: "iptv-free-trial-{{region-slug}}", category: "IPTV Services", keywords: "iptv free trial {{region}}, iptv trial {{region}}", sections: ["How Free Trials Work", "Subscription Options"] },
  { title: "IPTV Subscription Options {{region}} 2026", slug: "iptv-subscription-options-{{region-slug}}-2026", category: "IPTV Services", keywords: "iptv subscription {{region}}, iptv plans {{region}}", sections: ["Monthly vs Yearly", "Best Value"] },
  { title: "1-Year IPTV + Fire Stick {{region}}", slug: "1-year-iptv-fire-stick-{{region-slug}}", category: "IPTV Services", keywords: "iptv fire stick deal {{region}}, streaming bundle {{region}}", sections: ["Bundle Benefits", "Setup"] },
  { title: "Tutorial: IPTV on Fire Stick {{region}}", slug: "tutorial-iptv-fire-stick-{{region-slug}}", category: "Guides", keywords: "iptv fire stick setup {{region}}", sections: ["Step-by-Step", "App Recommendations"] },
  { title: "Streaming Device Guide {{region}}", slug: "streaming-device-guide-{{region-slug}}", category: "Guides", keywords: "streaming device {{region}}, fire stick {{region}}", sections: ["Fire Stick vs ONN", "Where to Buy"] },
  { title: "Fire Stick Setup {{region}}", slug: "fire-stick-setup-{{region-slug}}", category: "Fire Stick Guides", keywords: "fire stick setup {{region}}", sections: ["Connect and Register", "Install Apps"] },
  { title: "ONN Device Setup {{region}}", slug: "onn-device-setup-{{region-slug}}", category: "ONN Devices", keywords: "onn setup {{region}}, onn iptv", sections: ["ONN Overview", "IPTV Setup"] },
  { title: "Cord-Cutting Guide {{region}} 2026", slug: "cord-cutting-guide-{{region-slug}}-2026", category: "Guides", keywords: "cord cutting {{region}}, streaming {{region}}", sections: ["Why Cord-Cut", "Streaming Options"] },
  { title: "IPTV for Beginners {{region}}", slug: "iptv-for-beginners-{{region-slug}}", category: "IPTV Services", keywords: "iptv beginners {{region}}, what is iptv", sections: ["What is IPTV?", "Getting Started"] },
  { title: "Best Streaming Device {{region}} 2026", slug: "best-streaming-device-{{region-slug}}-2026", category: "Guides", keywords: "best streaming device {{region}}", sections: ["Fire Stick", "ONN", "Comparison"] },
  { title: "IPTV + Fire Stick Bundle {{region}}", slug: "iptv-fire-stick-bundle-{{region-slug}}", category: "IPTV Services", keywords: "iptv fire stick bundle {{region}}", sections: ["Bundle Contents", "Activation"] },
  { title: "Free Trial IPTV {{region}} No Card", slug: "free-trial-iptv-{{region-slug}}-no-credit-card", category: "IPTV Services", keywords: "iptv free trial {{region}}", sections: ["How It Works", "Subscribing"] },
  { title: "Year Subscription + Fire Stick {{region}}", slug: "year-subscription-fire-stick-{{region-slug}}", category: "IPTV Services", keywords: "year subscription fire stick {{region}}", sections: ["What's Included", "Setup"] },
  { title: "ONN vs Fire Stick {{region}}", slug: "onn-vs-fire-stick-{{region-slug}}", category: "ONN Devices", keywords: "onn vs fire stick {{region}}", sections: ["Features", "Price", "Verdict"] },
  { title: "How to Get IPTV in {{region}} Legally", slug: "how-to-get-iptv-{{region-slug}}-legally", category: "IPTV Services", keywords: "iptv {{region}} legal", sections: ["Legal IPTV", "Providers"] },
  { title: "Fire Stick or ONN for IPTV {{region}}?", slug: "fire-stick-or-onn-iptv-{{region-slug}}", category: "Guides", keywords: "fire stick or onn iptv {{region}}", sections: ["Comparison", "Recommendation"] },
  { title: "IPTV + ONN Device {{region}}", slug: "iptv-subscription-onn-device-{{region-slug}}", category: "ONN Devices", keywords: "iptv onn {{region}}", sections: ["Package Options", "Setup"] },
  { title: "Streaming {{region}}: Fire Stick, ONN, IPTV", slug: "streaming-{{region-slug}}-fire-stick-onn-iptv", category: "Guides", keywords: "streaming {{region}}, fire stick {{region}}", sections: ["Options", "Getting Started"] },
  { title: "1-Year Subscription + Device {{region}}", slug: "1-year-subscription-plus-device-{{region-slug}}", category: "IPTV Services", keywords: "1 year subscription fire stick {{region}}", sections: ["Deal Details", "Value"] },
];

function buildPosts(): SeedPost[] {
  const regions = [...USA_STATES, ...CANADA_PROVINCES, ...UK_REGIONS].map((n) => ({ name: n, slug: slugify(n) }));
  const posts: SeedPost[] = [];
  let index = 0;
  for (const region of regions) {
    for (const t of TOPIC_TEMPLATES) {
      const title = t.title.replace(/\{\{region\}\}/g, region.name);
      const slug = t.slug.replace(/\{\{region-slug\}\}/g, region.slug);
      const keywords = t.keywords.replace(/\{\{region\}\}/g, region.name);
      const intro = `Guide to **${keywords.split(",")[0].trim()}** in ${region.name}. Everything you need for streaming and IPTV in ${region.name} in 2026.`;
      const sections = t.sections.map((s) => s.replace(/\{\{region\}\}/g, region.name));
      const content = generateContent(title, intro, sections, keywords);
      posts.push({
        title, slug,
        excerpt: intro.slice(0, 200) + (intro.length > 200 ? "…" : ""),
        content, category: t.category,
        featured: index < 30, is_published: true,
        published_at: new Date(Date.now() - index * 86400000).toISOString(),
        keywords, meta_description: `${title} – Guide for ${region.name}. Free trials, subscriptions, device bundles.`,
      });
      index++;
    }
  }
  return posts;
}

async function main() {
  console.log("🚀 Seed thousands of geo + topic SEO blogs (USA, UK, Canada)\n");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY");
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const posts = buildPosts();
  console.log(`📝 Posts to upsert: ${posts.length} (${USA_STATES.length}+${CANADA_PROVINCES.length}+${UK_REGIONS.length} regions × ${TOPIC_TEMPLATES.length} templates)\n`);
  let successCount = 0, errorCount = 0;
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("blog_posts").upsert(batch, { onConflict: "slug" });
    if (error) {
      for (const p of batch) {
        const { error: e } = await supabase.from("blog_posts").upsert(p, { onConflict: "slug" });
        if (e) { console.error(`❌ ${p.slug}`); errorCount++; } else successCount++;
      }
    } else successCount += batch.length;
    if ((i + batch.length) % 500 === 0 || i + batch.length >= posts.length) console.log(`   ${Math.min(i + BATCH_SIZE, posts.length)}/${posts.length}`);
  }
  console.log(`\n✅ Done. Success: ${successCount}, Errors: ${errorCount}`);
  const { count } = await supabase.from("blog_posts").select("slug", { count: "exact", head: true }).eq("is_published", true);
  console.log(`📊 Published in DB: ${count ?? "?"}`);
}

main().catch(console.error);
