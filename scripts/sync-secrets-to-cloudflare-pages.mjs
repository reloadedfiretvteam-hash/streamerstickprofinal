#!/usr/bin/env node
/**
 * Sync secrets from env (e.g. GitHub Secrets) to Cloudflare Pages using
 * "wrangler pages secret put" for EACH variable. This only adds/updates
 * these keys and never overwrites or deletes other project env vars.
 *
 * Run in CI with env from GitHub Secrets. Requires: CLOUDFLARE_ACCOUNT_ID,
 * CLOUDFLARE_API_TOKEN, and the secrets you want to sync (STRIPE_*, etc.).
 */
import { spawn } from 'child_process';

const PROJECT = 'streamerstickpro-live';

const VAR_NAMES = [
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

function putSecret(name, value) {
  return new Promise((resolve, reject) => {
    if (!value || value.trim() === '') {
      resolve({ name, skipped: true, reason: 'empty' });
      return;
    }
    const args = [
      'pages', 'secret', 'put', name,
      '--project-name', PROJECT,
    ];
    const child = spawn('npx', ['wrangler', ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });
    child.stdin.write(value, () => {
      child.stdin.end();
    });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) => {
      if (code === 0) resolve({ name, ok: true });
      else reject(new Error(`${name}: wrangler exited ${code} - ${stderr.slice(0, 200)}`));
    });
    child.on('error', reject);
  });
}

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    console.error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }

  console.log('Syncing secrets to Cloudflare Pages (merge only)...');
  for (const name of VAR_NAMES) {
    const value = process.env[name];
    try {
      const result = await putSecret(name, value || '');
      if (result.skipped) {
        console.log(`  ${name}: (skip, ${result.reason})`);
      } else {
        console.log(`  ${name}: ok`);
      }
    } catch (e) {
      console.error(`  ${name}: ${e.message}`);
      process.exit(1);
    }
  }

  console.log('\nDone. Secrets synced (merge only; other project vars unchanged).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
