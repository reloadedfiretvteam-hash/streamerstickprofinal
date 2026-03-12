#!/usr/bin/env node
/**
 * Sync GitHub Actions secrets to Cloudflare Pages (streamerstickpro-live).
 * Requires: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN.
 * Reads from env: STRIPE_*, VITE_SUPABASE_*, SUPABASE_SERVICE_KEY, RESEND_*, SESSION_SECRET.
 */

import { spawn } from 'child_process';

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

async function putSecret(name, value) {
  if (!value || value.trim() === '') {
    console.log(`Skip ${name} (empty)`);
    return;
  }
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['wrangler', 'pages', 'secret', 'put', name, '--project-name', PROJECT],
      {
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
          CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
        },
        stdio: ['pipe', 'inherit', 'inherit'],
      }
    );
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`wrangler exit ${code}`))));
    child.stdin.write(value, () => {
      child.stdin.end();
    });
  });
}

async function main() {
  requireEnv('CLOUDFLARE_ACCOUNT_ID');
  requireEnv('CLOUDFLARE_API_TOKEN');

  for (const name of SECRET_NAMES) {
    const value = process.env[name];
    try {
      await putSecret(name, value || '');
      console.log(`Set ${name}`);
    } catch (e) {
      console.error(`Failed ${name}:`, e.message);
      throw e;
    }
  }
  console.log('Sync secrets done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
