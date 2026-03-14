#!/usr/bin/env node
/**
 * Sync env from GitHub Actions secrets to Cloudflare Pages project env.
 * Run in CI with secrets in env so Cloudflare always has the full set (checkout, free trial, Worker).
 * Does NOT GET then merge (GET strips secrets); builds env_vars only from process.env and PATCHes.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const PROJECT = 'streamerstickpro-live';

// All vars the Worker needs. Values come from process.env (GitHub Secrets in CI).
const ENV_KEYS = [
  'ADMIN_PASSWORD',
  'ADMIN_USERNAME',
  'JWT_SECRET',
  'NODE_ENV',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'SESSION_SECRET',
  'SITE_URL',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLL_KEY',
  'UNSUBSCRIBE_JWT_SECRET',
  'VITE_SECURE_HOSTS',
  'VITE_STORAGE_BUCKET_NAME',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_URL',
];

function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    const p = path.join(root, name);
    if (!fs.existsSync(p)) continue;
    const buf = fs.readFileSync(p, 'utf8');
    for (const line of buf.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) {
        const val = m[2].replace(/^["']|["']$/g, '').trim();
        if (val) process.env[m[1]] = val;
      }
    }
    break;
  }
}
loadEnv();

function buildEnvVars() {
  const envVars = {};
  for (const key of ENV_KEYS) {
    const value = process.env[key];
    if (value !== undefined && value !== '') {
      envVars[key] = { value };
    }
  }
  return envVars;
}

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }

  const envVars = buildEnvVars();
  const keys = Object.keys(envVars);
  if (keys.length === 0) {
    console.warn('No env vars to sync (set them in GitHub Secrets or .env)');
    process.exit(0);
  }

  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${PROJECT}`;
  const headers = { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' };

  console.log('Fetching project to preserve build config...');
  const getRes = await fetch(base, { headers });
  const getData = await getRes.json();
  if (!getData.success) {
    console.error('GET project failed:', getData.errors);
    process.exit(1);
  }

  const current = getData.result;
  const configs = current.deployment_configs || {};
  const prod = configs.production || {};
  const prev = configs.preview || {};

  // Replace env_vars entirely with our set from GitHub/env (do not merge with GET result; GET strips secrets)
  const patchRes = await fetch(base, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      deployment_configs: {
        production: { ...prod, env_vars: envVars },
        preview: { ...prev, env_vars: envVars },
      },
    }),
  });
  const patchData = await patchRes.json();
  if (!patchData.success) {
    console.error('PATCH env failed:', patchData.errors);
    process.exit(1);
  }
  console.log('Synced', keys.length, 'env vars to Cloudflare Pages:', keys.join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
