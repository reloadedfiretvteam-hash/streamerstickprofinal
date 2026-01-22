/**
 * Build-time SEO audit: crawl dist (or local index), run audit rules, output report.
 * Run after prerender: npx tsx scripts/seo-audit.ts [--dist=dist] [--base=http://localhost:PORT]
 */

import { readFile, readdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const DIST = process.env.SEO_AUDIT_DIST || "dist";
const BASE = process.env.SEO_AUDIT_BASE || "https://streamstickpro.com";

interface AuditRule {
  id: string;
  name: string;
  check: string;
  action: string;
  severity: string;
}

interface AuditResult {
  ruleId: string;
  ruleName: string;
  severity: string;
  passed: boolean;
  message?: string;
  url?: string;
}

async function loadAuditRules(): Promise<AuditRule[]> {
  const p = path.join(process.cwd(), "seo", "config", "audit-rules.json");
  if (!existsSync(p)) return [];
  const raw = await readFile(p, "utf-8");
  const json = JSON.parse(raw);
  return (json.rules || []) as AuditRule[];
}

function extractCanonical(html: string): string | null {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return m ? m[1] : null;
}

function countH1(html: string): number {
  return (html.match(/<h1[^>]*>/gi) || []).length;
}

function roughWordCount(html: string): number {
  const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
  return (text.match(/\S+/g) || []).length;
}

async function findHtmlFiles(dir: string, base = ""): Promise<string[]> {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name === "assets" || e.name === "node_modules") continue;
      out.push(...(await findHtmlFiles(path.join(dir, e.name), rel)));
    } else if (e.name.endsWith(".html")) {
      out.push(rel);
    }
  }
  return out;
}

async function runAudit(): Promise<void> {
  const rules = await loadAuditRules();
  const results: AuditResult[] = [];
  const distPath = path.join(process.cwd(), DIST);

  if (!existsSync(distPath)) {
    console.warn(`[seo-audit] dist not found: ${distPath}. Skipping audit.`);
    return;
  }

  let files = await findHtmlFiles(distPath);
  files = files.filter((f) => {
    const p = f.replace(/\\/g, "/");
    if (p.startsWith("googled") || p.includes("BingSiteAuth") || /^[a-f0-9]+\.html$/i.test(path.basename(p))) return false;
    return true;
  });
  const urls = files.map((f) => {
    const p = f.replace(/\\/g, "/");
    const seg = p === "index.html" ? "" : p.replace(/\/index\.html$/, "").replace(/\.html$/, "");
    return `${BASE.replace(/\/$/, "")}/${seg ? seg + "/" : ""}`;
  });

  for (const file of files) {
    const fullPath = path.join(distPath, file);
    const html = await readFile(fullPath, "utf-8");
    const canonical = extractCanonical(html);
    const h1Count = countH1(html);
    const wordCount = roughWordCount(html);
    const p = file.replace(/\\/g, "/");
    const seg = p === "index.html" ? "" : p.replace(/\/index\.html$/, "").replace(/\.html$/, "");
    const pageUrl = `${BASE.replace(/\/$/, "")}/${seg ? seg + "/" : ""}`;

    const isRootIndex = p === "index.html" || /^index\.html$/i.test(path.basename(file));
    for (const r of rules) {
      let passed = true;
      let message: string | undefined;

      if (r.id === "missing-canonical") {
        if (isRootIndex) continue;
        passed = !!canonical;
        if (!passed) message = "Missing canonical tag";
      } else if (r.id === "missing-h1") {
        if (isRootIndex) continue;
        passed = h1Count >= 1;
        if (!passed) message = "No H1 found";
      } else if (r.id === "multiple-h1") {
        passed = h1Count <= 1;
        if (!passed) message = `Multiple H1 (${h1Count})`;
      } else if (r.id === "thin-content-plan" || r.id === "thin-content-device") {
        const template = r.id.includes("plan") ? "plan-detail" : "device-detail";
        const min = r.id.includes("plan") ? 500 : 400;
        const isRelevant = /\/plans\//.test(seg) || /\/devices\//.test(seg);
        passed = !isRelevant || wordCount >= min;
        if (!passed) message = `Thin content: ${wordCount} words (min ${min}) for ${template}`;
      }

      if (!passed) {
        results.push({
          ruleId: r.id,
          ruleName: r.name,
          severity: r.severity,
          passed: false,
          message,
          url: pageUrl,
        });
      }
    }
  }

  const errors = results.filter((x) => x.severity === "error");
  const warnings = results.filter((x) => x.severity === "warning");

  console.log("\n[seo-audit] SEO Audit Report");
  console.log("  Pages scanned:", files.length);
  console.log("  Issues found:", results.length, `(${errors.length} errors, ${warnings.length} warnings)`);
  if (results.length) {
    results.forEach((r) => {
      const sym = r.severity === "error" ? "✗" : "⚠";
      console.log(`  ${sym} [${r.ruleId}] ${r.message || r.ruleName} ${r.url || ""}`);
    });
  }
  console.log("");

  if (errors.length > 0) process.exitCode = 1;
}

runAudit().catch((err) => {
  console.error("[seo-audit]", err);
  process.exitCode = 1;
});
