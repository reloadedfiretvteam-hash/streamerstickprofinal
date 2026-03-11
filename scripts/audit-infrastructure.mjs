#!/usr/bin/env node
/**
 * Infrastructure audit: Cloudflare, Supabase, GitHub.
 * Uses tokens from environment only (never hardcoded).
 * Set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GITHUB_TOKEN in .env or CI secrets.
 * Run: node scripts/audit-infrastructure.mjs
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLL_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function auditCloudflare() {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
    return { ok: false, message: 'Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID' };
  }
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects`,
      { headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` } }
    );
    const data = await res.json();
    if (!data.success) return { ok: false, message: data.errors?.[0]?.message || 'Cloudflare API error' };
    const projects = data.result || [];
    return { ok: true, projects: projects.map((p) => ({ name: p.name, created: p.created_on })) };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

async function auditSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { ok: false, message: 'Missing VITE_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_KEY' };
  }
  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    if (res.status === 200 || res.status === 404) {
      return { ok: true, message: 'Supabase REST reachable' };
    }
    const text = await res.text();
    return { ok: false, message: `Supabase returned ${res.status}: ${text.slice(0, 200)}` };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

async function auditGitHub() {
  if (!GITHUB_TOKEN) return { ok: false, message: 'Missing GITHUB_TOKEN' };
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    const data = await res.json();
    if (res.status !== 200) return { ok: false, message: data.message || `HTTP ${res.status}` };
    return { ok: true, user: data.login, type: data.type };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

async function main() {
  console.log('--- StreamStickPro infrastructure audit ---\n');
  console.log('Cloudflare:');
  const cf = await auditCloudflare();
  if (cf.ok) {
    console.log('  OK – Pages projects:', cf.projects?.length ?? 0);
    (cf.projects || []).forEach((p) => console.log('    -', p.name));
  } else console.log('  SKIP/FAIL:', cf.message);

  console.log('\nSupabase:');
  const sb = await auditSupabase();
  console.log(sb.ok ? '  OK – REST reachable' : '  SKIP/FAIL:', sb.message);

  console.log('\nGitHub:');
  const gh = await auditGitHub();
  console.log(gh.ok ? `  OK – user: ${gh.user} (${gh.type})` : '  SKIP/FAIL:', gh.message);

  console.log('\n--- End audit ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
