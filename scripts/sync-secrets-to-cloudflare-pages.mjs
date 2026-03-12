#!/usr/bin/env node
/**
 * Sync GitHub Actions secrets to Cloudflare Pages (streamerstickpro-live) production.
 * Uses wrangler pages secret bulk with a temp JSON file for reliable upload.
 * Requires: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and the secrets below.
 */

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const PROJECT = 'streamerstickpro-live';

const SECRET_NAMES = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'SESSION_SECRET',
];

function requireEnv(name) {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN },
      ...opts,
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  requireEnv('CLOUDFLARE_ACCOUNT_ID');
  requireEnv('CLOUDFLARE_API_TOKEN');
  requireEnv('STRIPE_SECRET_KEY');
  requireEnv('RESEND_API_KEY');
  requireEnv('VITE_SUPABASE_URL');
  requireEnv('SUPABASE_SERVICE_KEY');

  const payload = {};
  for (const name of SECRET_NAMES) {
    const value = process.env[name];
    if (value != null && String(value).trim() !== '') {
      payload[name] = String(value).trim();
    }
  }
  const filePath = join(tmpdir(), `pages-secrets-${Date.now()}.json`);
  try {
    writeFileSync(filePath, JSON.stringify(payload), 'utf8');
    console.log('Uploading', Object.keys(payload).length, 'secrets via wrangler pages secret bulk...');
    await run('npx', [
      'wrangler', 'pages', 'secret', 'bulk',
      filePath,
      '--project-name', PROJECT,
      '--env', 'production',
    ]);
    console.log('Sync secrets done.');
  } finally {
    try { unlinkSync(filePath); } catch (_) {}
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
