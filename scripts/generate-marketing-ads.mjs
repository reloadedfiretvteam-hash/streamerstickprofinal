#!/usr/bin/env node
/**
 * Generate high-volume marketing ad copy variants for StreamStickPro.
 *
 * Usage:
 *   node scripts/generate-marketing-ads.mjs --count=300 --out=docs/marketing-ads-jailbroken-firesticks.csv
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const countArg = args.find((a) => a.startsWith("--count="));
const outArg = args.find((a) => a.startsWith("--out="));

const COUNT = Math.max(50, Math.min(2000, Number(countArg?.split("=")[1] || 300)));
const OUT_REL = outArg?.split("=")[1] || "docs/marketing-ads-jailbroken-firesticks.csv";
const OUT_PATH = path.resolve(process.cwd(), OUT_REL);

const channels = [
  "Facebook",
  "Instagram",
  "Google Search",
  "YouTube",
  "TikTok",
  "Native Ads",
  "Email Retargeting",
  "SMS Follow-up",
];

const audiences = [
  "Cord-cutters",
  "Fire Stick users",
  "ONN Google TV users",
  "Budget-conscious streamers",
  "Families replacing cable",
  "Returning IPTV users",
  "Former trial users",
  "Lapsed subscribers",
];

const campaignTypes = [
  "Prospecting",
  "Retargeting",
  "Trial-to-Paid",
  "Device Bundle",
  "Referral Push",
  "Winback",
];

const hooks = [
  "Stop paying cable prices",
  "Upgrade your streaming setup",
  "One app. Cleaner streaming experience",
  "Built for Fire Stick and ONN",
  "Ready in about 10 minutes",
  "Get premium channels without cable contracts",
  "Bring your own device or choose a bundle",
  "Skip app-hunting and start with guided setup",
];

const offers = [
  "18,000+ live channels and 100,000+ movies & series",
  "1-year service included on device bundles",
  "36-hour subscription trial available",
  "24/7 support and setup tutorials included",
  "Shipping included on device bundles",
  "Secure Stripe checkout with card + wallet options",
  "Referral rewards for qualified yearly purchases",
  "Fast activation and clear onboarding flow",
];

const proof = [
  "Trusted by thousands of streamers",
  "Fast setup with clear step-by-step guidance",
  "Works with IPTV Smarters Pro and TiviMate",
  "Built for Fire Stick HD, 4K, 4K Max, and ONN devices",
  "No long contracts required for subscription plans",
  "Easy renewals and support when you need it",
  "Built for mobile-first buying flows and quick checkout",
  "Created for first-time and returning IPTV users",
];

const ctas = [
  "Start your 36-hour subscription trial",
  "Compare plans and device bundles",
  "Shop Fire Stick and ONN options",
  "See pricing and start today",
  "Get setup support and stream tonight",
  "Visit StreamStickPro now",
  "Claim referral rewards details",
  "Reactivate your plan in minutes",
];

const angles = [
  "speed",
  "value",
  "setup simplicity",
  "support confidence",
  "device compatibility",
  "subscription flexibility",
];

function escCsv(value) {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function pick(list, i, stride = 1) {
  return list[(i * stride) % list.length];
}

const rows = [];
rows.push([
  "ad_id",
  "campaign_type",
  "channel",
  "audience",
  "angle",
  "headline",
  "primary_text",
  "description",
  "cta",
  "keywords",
  "notes",
]);

for (let i = 1; i <= COUNT; i++) {
  const campaignType = pick(campaignTypes, i, 2);
  const channel = pick(channels, i, 3);
  const audience = pick(audiences, i, 5);
  const angle = pick(angles, i, 7);
  const hook = pick(hooks, i, 7);
  const offerA = pick(offers, i, 11);
  const offerB = pick(offers, i + 2, 13);
  const proofLine = pick(proof, i, 17);
  const cta = pick(ctas, i, 19);

  const headline = `${hook} | ${offerA.split(" and ")[0]} | ${campaignType}`;
  const primaryText =
    `${hook}. ${offerA}. ${offerB}. ${proofLine}. Built for ${audience.toLowerCase()} with a ${angle} angle.`;
  const description =
    "For IPTV subscriptions and streaming device bundles. 36-hour trial applies to subscription plans only.";
  const keywords =
    "jailbroken fire stick, onn google tv, iptv subscription, fire stick streaming, streamstickpro";
  const notes =
    "Keep pricing synchronized with live product data. Avoid mentioning buffering claims.";

  rows.push([
    `AD-${String(i).padStart(4, "0")}`,
    campaignType,
    channel,
    audience,
    angle,
    headline,
    primaryText,
    description,
    cta,
    keywords,
    notes,
  ]);
}

const csv = rows.map((r) => r.map(escCsv).join(",")).join("\n") + "\n";
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, csv, "utf8");

console.log(`Generated ${COUNT} ads -> ${OUT_REL}`);
