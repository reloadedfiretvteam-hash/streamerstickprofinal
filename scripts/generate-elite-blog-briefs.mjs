#!/usr/bin/env node
/**
 * Generate a high-intent blog brief queue with strict internal-link rules.
 *
 * Output:
 * - docs/elite-blog-briefs-240.csv
 * - docs/elite-blog-briefs-240.md
 *
 * This script does not write to Supabase directly. It only generates a
 * quality-controlled publishing queue to avoid crawl/index quality issues.
 */
import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://streamstickpro.com";

const SUBJECTS = [
  { label: "IPTV on Fire Stick 4K Max", keyword: "iptv fire stick 4k max", slugRoot: "iptv-fire-stick-4k-max", owner: "/iptv-firestick", related: ["/firestick-devices", "/iptv-services"] },
  { label: "IPTV on Fire Stick HD", keyword: "iptv fire stick hd", slugRoot: "iptv-fire-stick-hd", owner: "/iptv-firestick", related: ["/firestick-devices", "/best-iptv-firestick"] },
  { label: "IPTV on Fire TV Cube", keyword: "iptv fire tv cube", slugRoot: "iptv-fire-tv-cube", owner: "/iptv-firestick", related: ["/iptv-media-players", "/iptv-services"] },
  { label: "ONN 4K IPTV setup", keyword: "onn 4k iptv setup", slugRoot: "onn-4k-iptv-setup", owner: "/onn-google-tv", related: ["/iptv-media-players", "/iptv-services"] },
  { label: "ONN 4K Pro IPTV setup", keyword: "onn 4k pro iptv setup", slugRoot: "onn-4k-pro-iptv-setup", owner: "/onn-google-tv", related: ["/iptv-media-players", "/tutorials"] },
  { label: "Google TV Streamer IPTV setup", keyword: "google tv streamer iptv setup", slugRoot: "google-tv-streamer-iptv-setup", owner: "/onn-google-tv", related: ["/iptv-media-players", "/iptv-services"] },
  { label: "Android TV IPTV setup", keyword: "android tv iptv setup", slugRoot: "android-tv-iptv-setup", owner: "/iptv-services", related: ["/iptv-media-players", "/tutorials"] },
  { label: "TiviMate setup on Fire Stick", keyword: "tivimate setup fire stick", slugRoot: "tivimate-setup-fire-stick", owner: "/tivimate", related: ["/iptv-media-players", "/iptv-firestick"] },
  { label: "TiviMate setup on ONN", keyword: "tivimate setup onn", slugRoot: "tivimate-setup-onn", owner: "/tivimate", related: ["/onn-google-tv", "/iptv-media-players"] },
  { label: "IPTV Smarters Pro setup", keyword: "iptv smarters pro setup", slugRoot: "iptv-smarters-pro-setup", owner: "/iptv-smarters-pro", related: ["/iptv-media-players", "/iptv-services"] },
  { label: "M3U playlist setup", keyword: "m3u playlist setup", slugRoot: "m3u-playlist-setup", owner: "/iptv-media-players", related: ["/iptv-services", "/tutorials"] },
  { label: "Xtream Codes login setup", keyword: "xtream codes setup", slugRoot: "xtream-codes-setup", owner: "/iptv-media-players", related: ["/iptv-smarters-pro", "/tutorials"] },
  { label: "Best IPTV apps for Fire Stick", keyword: "best iptv apps fire stick", slugRoot: "best-iptv-apps-fire-stick", owner: "/iptv-media-players", related: ["/iptv-firestick", "/tivimate"] },
  { label: "Best IPTV apps for ONN", keyword: "best iptv apps onn", slugRoot: "best-iptv-apps-onn", owner: "/iptv-media-players", related: ["/onn-google-tv", "/iptv-smarters-pro"] },
  { label: "Fire Stick IPTV troubleshooting", keyword: "fire stick iptv troubleshooting", slugRoot: "fire-stick-iptv-troubleshooting", owner: "/iptv-firestick", related: ["/tutorials", "/resources"] },
  { label: "ONN IPTV troubleshooting", keyword: "onn iptv troubleshooting", slugRoot: "onn-iptv-troubleshooting", owner: "/onn-google-tv", related: ["/tutorials", "/resources"] },
  { label: "IPTV app login errors", keyword: "iptv login errors", slugRoot: "iptv-app-login-errors", owner: "/iptv-services", related: ["/tutorials", "/iptv-media-players"] },
  { label: "IPTV EPG setup", keyword: "iptv epg setup", slugRoot: "iptv-epg-setup", owner: "/iptv-media-players", related: ["/tivimate", "/iptv-smarters-pro"] },
  { label: "IPTV VOD setup", keyword: "iptv vod setup", slugRoot: "iptv-vod-setup", owner: "/iptv-services", related: ["/iptv-media-players", "/tutorials"] },
  { label: "IPTV multi-device setup", keyword: "iptv multi device setup", slugRoot: "iptv-multi-device-setup", owner: "/pricing", related: ["/iptv-services", "/trial"] },
  { label: "IPTV for family homes", keyword: "iptv for families", slugRoot: "iptv-for-family-homes", owner: "/pricing", related: ["/iptv-services", "/trial"] },
  { label: "IPTV for seniors", keyword: "iptv for seniors", slugRoot: "iptv-for-seniors", owner: "/iptv-services", related: ["/tutorials", "/trial"] },
  { label: "IPTV for travelers", keyword: "iptv for travelers", slugRoot: "iptv-for-travelers", owner: "/iptv-services", related: ["/resources", "/trial"] },
  { label: "Fire Stick vs ONN for IPTV", keyword: "fire stick vs onn for iptv", slugRoot: "fire-stick-vs-onn-for-iptv", owner: "/best-iptv-firestick", related: ["/onn-google-tv", "/iptv-services"] },
  { label: "TiviMate vs IPTV Smarters", keyword: "tivimate vs iptv smarters", slugRoot: "tivimate-vs-iptv-smarters", owner: "/iptv-media-players", related: ["/tivimate", "/iptv-smarters-pro"] },
  { label: "IPTV on hotel WiFi", keyword: "iptv on hotel wifi", slugRoot: "iptv-on-hotel-wifi", owner: "/resources", related: ["/tutorials", "/iptv-services"] },
  { label: "IPTV on low bandwidth", keyword: "iptv low bandwidth setup", slugRoot: "iptv-low-bandwidth-setup", owner: "/tutorials", related: ["/iptv-services", "/resources"] },
  { label: "How to pick an IPTV plan", keyword: "how to choose iptv plan", slugRoot: "how-to-choose-iptv-plan", owner: "/pricing", related: ["/iptv-services", "/trial"] },
  { label: "IPTV monthly vs yearly plans", keyword: "iptv monthly vs yearly", slugRoot: "iptv-monthly-vs-yearly", owner: "/pricing", related: ["/iptv-services", "/shop"] },
  { label: "New customer IPTV checklist", keyword: "new customer iptv checklist", slugRoot: "new-customer-iptv-checklist", owner: "/trial", related: ["/iptv-services", "/tutorials"] },
];

const ANGLES = [
  { slug: "complete-guide", title: (s) => `${s}: Complete Setup Guide (2026)`, intent: "informational" },
  { slug: "beginner-checklist", title: (s) => `${s}: Beginner Checklist for Fast Setup`, intent: "informational" },
  { slug: "best-app-stack", title: (s) => `${s}: Best App Stack and Workflow`, intent: "commercial" },
  { slug: "mistakes-to-avoid", title: (s) => `${s}: Common Mistakes to Avoid`, intent: "informational" },
  { slug: "issue-fixes", title: (s) => `${s}: Most Common Issues and Fixes`, intent: "informational" },
  { slug: "cost-breakdown", title: (s) => `${s}: Real Cost Breakdown and Value`, intent: "commercial" },
  { slug: "comparison", title: (s) => `${s}: What Works Best in 2026`, intent: "commercial" },
  { slug: "buyers-playbook", title: (s) => `${s}: Buyer Playbook and Next Steps`, intent: "transactional" },
];

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[,"\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toSlug(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function buildSecondaryKeywords(primary) {
  const p = String(primary || "");
  return [
    `${p} guide`,
    `${p} setup`,
    `${p} tips`,
    `${p} best apps`,
    `${p} checklist`,
  ];
}

function createBriefs() {
  const rows = [];
  let id = 1;
  for (const subject of SUBJECTS) {
    for (const angle of ANGLES) {
      const slug = `${subject.slugRoot}-${angle.slug}`;
      rows.push({
        id: id++,
        slug: toSlug(slug),
        title: angle.title(subject.label),
        primaryKeyword: subject.keyword,
        secondaryKeywords: buildSecondaryKeywords(subject.keyword).join(" | "),
        intent: angle.intent,
        pillarOwner: subject.owner,
        requiredLinks: ["/", "/trial", "/shop", subject.owner, ...subject.related].join(" | "),
        homeAnchorText: "Visit StreamStickPro homepage",
        trialAnchorText: "Start 36-hour trial",
        shopAnchorText: "View plans and devices",
      });
    }
  }
  return rows;
}

function toCsv(rows) {
  const headers = [
    "id",
    "slug",
    "title",
    "primary_keyword",
    "secondary_keywords",
    "intent",
    "pillar_owner",
    "required_links",
    "home_anchor_text",
    "trial_anchor_text",
    "shop_anchor_text",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push([
      row.id,
      row.slug,
      row.title,
      row.primaryKeyword,
      row.secondaryKeywords,
      row.intent,
      row.pillarOwner,
      row.requiredLinks,
      row.homeAnchorText,
      row.trialAnchorText,
      row.shopAnchorText,
    ].map(csvEscape).join(","));
  }
  return lines.join("\n");
}

function toMarkdown(rows) {
  const top = rows.slice(0, 80);
  const lines = [];
  lines.push("# Elite Blog Brief Queue (240)");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("Publishing rules:");
  lines.push("- Every post must link to `/`, `/trial`, and `/shop` in visible sections.");
  lines.push("- Every post must link to its `pillar_owner` and two related pages.");
  lines.push("- Keep one canonical target keyword per post to reduce index overlap.");
  lines.push("- Do not publish all at once: ship in weekly waves of 20 to 35 posts.");
  lines.push("");
  lines.push("## First 80 briefs (priority batch)");
  lines.push("");
  for (const row of top) {
    lines.push(`### ${row.id}. ${row.title}`);
    lines.push(`- Slug: \`${row.slug}\``);
    lines.push(`- Primary keyword: \`${row.primaryKeyword}\``);
    lines.push(`- Intent: \`${row.intent}\``);
    lines.push(`- Pillar owner: \`${row.pillarOwner}\``);
    lines.push(`- Required links: \`${row.requiredLinks}\``);
    lines.push("");
  }
  return lines.join("\n");
}

function ensureDocsDir() {
  const docsDir = path.resolve(process.cwd(), "docs");
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  return docsDir;
}

function main() {
  const rows = createBriefs();
  const docsDir = ensureDocsDir();
  const csvPath = path.join(docsDir, "elite-blog-briefs-240.csv");
  const mdPath = path.join(docsDir, "elite-blog-briefs-240.md");
  fs.writeFileSync(csvPath, toCsv(rows), "utf8");
  fs.writeFileSync(mdPath, toMarkdown(rows), "utf8");

  console.log(`[briefs] generated ${rows.length} briefs`);
  console.log(`[briefs] csv: ${csvPath}`);
  console.log(`[briefs] md:  ${mdPath}`);
  console.log(`[briefs] home links hard-required: yes`);
  console.log(`[briefs] canonical strategy owner pages: yes`);
  console.log(`[briefs] site: ${SITE_URL}`);
}

main();
