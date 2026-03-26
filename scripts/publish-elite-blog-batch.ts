/**
 * Publish a quality-controlled elite SEO blog batch to Supabase.
 *
 * Usage:
 * VITE_SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx scripts/publish-elite-blog-batch.ts --limit=60
 *
 * Notes:
 * - Uses upsert on slug to remain idempotent.
 * - Enforces visible links to "/", "/trial", and "/shop" in every post.
 * - Assigns one canonical pillar owner per post to reduce keyword overlap.
 */
import { createClient } from "@supabase/supabase-js";

type Intent = "transactional" | "commercial" | "informational";

interface Topic {
  label: string;
  keyword: string;
  slugRoot: string;
  owner: string;
  related: string[];
  category: string;
}

interface Angle {
  slug: string;
  title: (subject: string) => string;
  intent: Intent;
}

interface BlogRow {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured: boolean;
  is_published: boolean;
  published_at: string;
  keywords: string[];
  meta_description: string;
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLL_KEY ||
  "";
const ADMIN_API_BASE = process.env.ADMIN_API_BASE || "https://streamstickpro.com";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const TOPICS: Topic[] = [
  { label: "IPTV on Fire Stick 4K Max", keyword: "iptv fire stick 4k max", slugRoot: "iptv-fire-stick-4k-max", owner: "/iptv-firestick", related: ["/firestick-devices", "/iptv-services"], category: "Fire Stick Guides" },
  { label: "IPTV on Fire Stick HD", keyword: "iptv fire stick hd", slugRoot: "iptv-fire-stick-hd", owner: "/iptv-firestick", related: ["/firestick-devices", "/best-iptv-firestick"], category: "Fire Stick Guides" },
  { label: "IPTV on Fire TV Cube", keyword: "iptv fire tv cube", slugRoot: "iptv-fire-tv-cube", owner: "/iptv-firestick", related: ["/iptv-media-players", "/iptv-services"], category: "Fire Stick Guides" },
  { label: "ONN 4K IPTV setup", keyword: "onn 4k iptv setup", slugRoot: "onn-4k-iptv-setup", owner: "/onn-google-tv", related: ["/iptv-media-players", "/iptv-services"], category: "ONN Devices" },
  { label: "ONN 4K Pro IPTV setup", keyword: "onn 4k pro iptv setup", slugRoot: "onn-4k-pro-iptv-setup", owner: "/onn-google-tv", related: ["/iptv-media-players", "/tutorials"], category: "ONN Devices" },
  { label: "Google TV Streamer IPTV setup", keyword: "google tv streamer iptv setup", slugRoot: "google-tv-streamer-iptv-setup", owner: "/onn-google-tv", related: ["/iptv-media-players", "/iptv-services"], category: "ONN Devices" },
  { label: "Android TV IPTV setup", keyword: "android tv iptv setup", slugRoot: "android-tv-iptv-setup", owner: "/iptv-services", related: ["/iptv-media-players", "/tutorials"], category: "IPTV Services" },
  { label: "TiviMate setup on Fire Stick", keyword: "tivimate setup fire stick", slugRoot: "tivimate-setup-fire-stick", owner: "/tivimate", related: ["/iptv-media-players", "/iptv-firestick"], category: "IPTV Apps" },
  { label: "TiviMate setup on ONN", keyword: "tivimate setup onn", slugRoot: "tivimate-setup-onn", owner: "/tivimate", related: ["/onn-google-tv", "/iptv-media-players"], category: "IPTV Apps" },
  { label: "IPTV Smarters Pro setup", keyword: "iptv smarters pro setup", slugRoot: "iptv-smarters-pro-setup", owner: "/iptv-smarters-pro", related: ["/iptv-media-players", "/iptv-services"], category: "IPTV Apps" },
  { label: "M3U playlist setup", keyword: "m3u playlist setup", slugRoot: "m3u-playlist-setup", owner: "/iptv-media-players", related: ["/iptv-services", "/tutorials"], category: "IPTV Apps" },
  { label: "Xtream Codes login setup", keyword: "xtream codes setup", slugRoot: "xtream-codes-setup", owner: "/iptv-media-players", related: ["/iptv-smarters-pro", "/tutorials"], category: "IPTV Apps" },
  { label: "Best IPTV apps for Fire Stick", keyword: "best iptv apps fire stick", slugRoot: "best-iptv-apps-fire-stick", owner: "/iptv-media-players", related: ["/iptv-firestick", "/tivimate"], category: "IPTV Apps" },
  { label: "Best IPTV apps for ONN", keyword: "best iptv apps onn", slugRoot: "best-iptv-apps-onn", owner: "/iptv-media-players", related: ["/onn-google-tv", "/iptv-smarters-pro"], category: "IPTV Apps" },
  { label: "Fire Stick IPTV troubleshooting", keyword: "fire stick iptv troubleshooting", slugRoot: "fire-stick-iptv-troubleshooting", owner: "/iptv-firestick", related: ["/tutorials", "/resources"], category: "Troubleshooting" },
  { label: "ONN IPTV troubleshooting", keyword: "onn iptv troubleshooting", slugRoot: "onn-iptv-troubleshooting", owner: "/onn-google-tv", related: ["/tutorials", "/resources"], category: "Troubleshooting" },
  { label: "IPTV app login errors", keyword: "iptv login errors", slugRoot: "iptv-app-login-errors", owner: "/iptv-services", related: ["/tutorials", "/iptv-media-players"], category: "Troubleshooting" },
  { label: "IPTV EPG setup", keyword: "iptv epg setup", slugRoot: "iptv-epg-setup", owner: "/iptv-media-players", related: ["/tivimate", "/iptv-smarters-pro"], category: "IPTV Apps" },
  { label: "IPTV VOD setup", keyword: "iptv vod setup", slugRoot: "iptv-vod-setup", owner: "/iptv-services", related: ["/iptv-media-players", "/tutorials"], category: "IPTV Services" },
  { label: "IPTV multi-device setup", keyword: "iptv multi device setup", slugRoot: "iptv-multi-device-setup", owner: "/pricing", related: ["/iptv-services", "/trial"], category: "IPTV Services" },
  { label: "IPTV for family homes", keyword: "iptv for families", slugRoot: "iptv-for-family-homes", owner: "/pricing", related: ["/iptv-services", "/trial"], category: "IPTV Services" },
  { label: "IPTV for seniors", keyword: "iptv for seniors", slugRoot: "iptv-for-seniors", owner: "/iptv-services", related: ["/tutorials", "/trial"], category: "Guides" },
  { label: "IPTV for travelers", keyword: "iptv for travelers", slugRoot: "iptv-for-travelers", owner: "/iptv-services", related: ["/resources", "/trial"], category: "Guides" },
  { label: "Fire Stick vs ONN for IPTV", keyword: "fire stick vs onn for iptv", slugRoot: "fire-stick-vs-onn-for-iptv", owner: "/best-iptv-firestick", related: ["/onn-google-tv", "/iptv-services"], category: "Comparisons" },
  { label: "TiviMate vs IPTV Smarters", keyword: "tivimate vs iptv smarters", slugRoot: "tivimate-vs-iptv-smarters", owner: "/iptv-media-players", related: ["/tivimate", "/iptv-smarters-pro"], category: "Comparisons" },
  { label: "IPTV on hotel WiFi", keyword: "iptv on hotel wifi", slugRoot: "iptv-on-hotel-wifi", owner: "/resources", related: ["/tutorials", "/iptv-services"], category: "Guides" },
  { label: "IPTV on low bandwidth", keyword: "iptv low bandwidth setup", slugRoot: "iptv-low-bandwidth-setup", owner: "/tutorials", related: ["/iptv-services", "/resources"], category: "Troubleshooting" },
  { label: "How to pick an IPTV plan", keyword: "how to choose iptv plan", slugRoot: "how-to-choose-iptv-plan", owner: "/pricing", related: ["/iptv-services", "/trial"], category: "Guides" },
  { label: "IPTV monthly vs yearly plans", keyword: "iptv monthly vs yearly", slugRoot: "iptv-monthly-vs-yearly", owner: "/pricing", related: ["/iptv-services", "/shop"], category: "Comparisons" },
  { label: "New customer IPTV checklist", keyword: "new customer iptv checklist", slugRoot: "new-customer-iptv-checklist", owner: "/trial", related: ["/iptv-services", "/tutorials"], category: "Guides" },
];

const ANGLES: Angle[] = [
  { slug: "complete-guide", title: (s) => `${s}: Complete Setup Guide (2026)`, intent: "informational" },
  { slug: "beginner-checklist", title: (s) => `${s}: Beginner Checklist for Fast Setup`, intent: "informational" },
  { slug: "best-app-stack", title: (s) => `${s}: Best App Stack and Workflow`, intent: "commercial" },
  { slug: "mistakes-to-avoid", title: (s) => `${s}: Common Mistakes to Avoid`, intent: "informational" },
  { slug: "issue-fixes", title: (s) => `${s}: Most Common Issues and Fixes`, intent: "informational" },
  { slug: "cost-breakdown", title: (s) => `${s}: Real Cost Breakdown and Value`, intent: "commercial" },
  { slug: "comparison", title: (s) => `${s}: What Works Best in 2026`, intent: "commercial" },
  { slug: "buyers-playbook", title: (s) => `${s}: Buyer Playbook and Next Steps`, intent: "transactional" },
];

function parseLimitArg(defaultValue: number): number {
  const arg = process.argv.find((x) => x.startsWith("--limit="));
  if (!arg) return defaultValue;
  const parsed = Number(arg.split("=")[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultValue;
  return Math.floor(parsed);
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function trim160(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length <= 160 ? clean : `${clean.slice(0, 157).trim()}...`;
}

function buildExcerpt(topic: Topic, angle: Angle): string {
  return trim160(
    `${topic.label} with a ${angle.intent} focus. Learn setup steps, app choices, and practical fixes, then follow direct links back to StreamStickPro home, trial, and plan pages.`
  );
}

function buildContent(topic: Topic, angle: Angle): string {
  const titleHint = `${topic.label} (${angle.intent})`;
  const relatedA = topic.related[0] || "/iptv-services";
  const relatedB = topic.related[1] || "/tutorials";
  const owner = topic.owner;
  const kw = topic.keyword;
  return [
    `# ${titleHint}`,
    ``,
    `## Quick answer`,
    `${topic.label} works best when you keep one reliable setup flow: stable internet, a compatible app, and clear account steps. This guide focuses on ${kw} with practical, no-fluff instructions.`,
    ``,
    `## Step-by-step playbook`,
    `1. Confirm your device and app path.`,
    `2. Use the exact account format your app expects.`,
    `3. Test one live channel and one VOD title.`,
    `4. Tune playback and EPG settings.`,
    `5. Save the setup profile and backup notes.`,
    ``,
    `## Common mistakes`,
    `- Mixing login methods in one app profile`,
    `- Skipping timezone/EPG alignment`,
    `- Not testing with a wired or high-quality WiFi path`,
    `- Using outdated app builds`,
    ``,
    `## Smart internal resources`,
    `- Main guide owner: [${owner}](${owner})`,
    `- Related path 1: [${relatedA}](${relatedA})`,
    `- Related path 2: [${relatedB}](${relatedB})`,
    `- Full tutorials: [/tutorials](/tutorials)`,
    ``,
    `## Next steps`,
    `If you want the fastest path, use the links below and keep your setup notes in one place so future updates are simple.`,
    ``,
    `- Home page: [Visit StreamStickPro homepage](/)`,
    `- Trial access: [Start 36-hour trial](/trial)`,
    `- Plans and devices: [View plans and devices](/shop)`,
    ``,
    `## Final takeaway`,
    `Use one clean workflow, one primary app profile, and one canonical guide path. That keeps performance high and support simple.`,
  ].join("\n");
}

function buildKeywords(topic: Topic, angle: Angle): string[] {
  return [
    topic.keyword,
    `${topic.keyword} guide`,
    `${topic.keyword} setup`,
    `${topic.keyword} 2026`,
    `${angle.intent} intent`,
  ];
}

function buildRows(limit: number): BlogRow[] {
  const rows: BlogRow[] = [];
  const now = Date.now();
  for (const topic of TOPICS) {
    for (const angle of ANGLES) {
      if (rows.length >= limit) return rows;
      const title = angle.title(topic.label);
      const slug = normalizeSlug(`${topic.slugRoot}-${angle.slug}`);
      const excerpt = buildExcerpt(topic, angle);
      const content = buildContent(topic, angle);
      const keywords = buildKeywords(topic, angle);
      rows.push({
        title,
        slug,
        excerpt,
        content,
        category: topic.category,
        featured: false,
        is_published: true,
        published_at: new Date(now - rows.length * 3600000).toISOString(),
        keywords,
        meta_description: trim160(`${title}. ${excerpt}`),
      });
    }
  }
  return rows;
}

async function main() {
  const limit = parseLimitArg(60);
  const rows = buildRows(limit);
  console.log(`[elite-publish] prepared ${rows.length} rows`);

  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    let success = 0;
    let errors = 0;
    const batchSize = 20;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from("blog_posts").upsert(batch, { onConflict: "slug" });
      if (!error) {
        success += batch.length;
        console.log(`[elite-publish] db batch ${Math.floor(i / batchSize) + 1}: +${batch.length} (${success}/${rows.length})`);
        continue;
      }

      console.error(`[elite-publish] db batch failed: ${error.message}`);
      for (const row of batch) {
        const { error: singleError } = await supabase.from("blog_posts").upsert(row, { onConflict: "slug" });
        if (singleError) {
          errors += 1;
          console.error(`[elite-publish] row failed ${row.slug}: ${singleError.message}`);
        } else {
          success += 1;
        }
      }
    }

    const { count } = await supabase
      .from("blog_posts")
      .select("slug", { count: "exact", head: true })
      .eq("is_published", true);

    console.log(`[elite-publish] db mode complete success=${success} errors=${errors}`);
    console.log(`[elite-publish] total published count=${count ?? "unknown"}`);
    return;
  }

  // Fallback mode: publish through live admin API, which already uses production env keys.
  const loginRes = await fetch(`${ADMIN_API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  const loginJson: any = await loginRes.json().catch(() => ({}));
  const token = loginJson?.token;
  if (!loginRes.ok || !token) {
    console.error(`[elite-publish] admin API login failed: ${loginRes.status} ${JSON.stringify(loginJson)}`);
    process.exit(1);
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const existingRes = await fetch(`${ADMIN_API_BASE}/api/blog/posts`);
  const existingJson: any = await existingRes.json().catch(() => ({}));
  if (!existingRes.ok) {
    console.error(`[elite-publish] fetch existing posts failed: ${existingRes.status} ${JSON.stringify(existingJson)}`);
    process.exit(1);
  }
  const existingSlugs = new Set<string>(
    Array.isArray(existingJson?.data) ? existingJson.data.map((p: any) => String(p?.slug || "").toLowerCase()).filter(Boolean) : []
  );

  let success = 0;
  let skipped = 0;
  let errors = 0;
  for (const row of rows) {
    if (existingSlugs.has(row.slug.toLowerCase())) {
      skipped += 1;
      continue;
    }
    const payload = {
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      category: row.category,
      featured: row.featured,
      published: true,
      keywords: row.keywords,
      metaDescription: row.meta_description,
    };

    const createRes = await fetch(`${ADMIN_API_BASE}/api/admin/blog/posts`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    if (createRes.ok) {
      success += 1;
      if (success % 10 === 0) console.log(`[elite-publish] api progress ${success}/${rows.length} created`);
    } else {
      errors += 1;
      const txt = await createRes.text();
      console.error(`[elite-publish] api create failed ${row.slug}: ${createRes.status} ${txt.slice(0, 180)}`);
    }
  }

  console.log(`[elite-publish] api mode complete success=${success} skipped=${skipped} errors=${errors}`);
}

main().catch((err) => {
  console.error(`[elite-publish] fatal: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
