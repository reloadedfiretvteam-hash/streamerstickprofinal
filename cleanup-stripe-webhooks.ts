/**
 * CLEANUP STRIPE WEBHOOKS
 * 
 * This script will:
 * 1. Keep the best webhook (clean URL with specific events)
 * 2. Delete duplicate webhooks
 * 
 * Usage:
 *   export STRIPE_SECRET_KEY="rk_live_YOUR_KEY"
 *   npx tsx cleanup-stripe-webhooks.ts
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CORRECT_WEBHOOK_URL = 'https://secure.streamstickpro.com/api/stripe/webhook';

if (!STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY environment variable not set!');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

async function cleanupWebhooks() {
  console.log('='.repeat(70));
  console.log('🧹 CLEANING UP STRIPE WEBHOOKS');
  console.log('='.repeat(70));
  console.log('');

  try {
    // List all webhooks
    const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    
    // Filter to only Cloudflare webhooks
    const cloudflareWebhooks = webhooks.data.filter(wh => 
      wh.url.includes('streamstickpro.com/api/stripe/webhook')
    );

    console.log(`Found ${cloudflareWebhooks.length} Cloudflare webhook(s)\n`);

    // Find the best one to keep (clean URL with specific events)
    const bestWebhook = cloudflareWebhooks.find(wh => 
      wh.url === CORRECT_WEBHOOK_URL && 
      wh.enabled_events.length > 0 && 
      wh.enabled_events[0] !== '*'
    ) || cloudflareWebhooks.find(wh => wh.url === CORRECT_WEBHOOK_URL) || cloudflareWebhooks[0];

    if (!bestWebhook) {
      console.log('⚠️  No webhooks found to clean up');
      return;
    }

    console.log('✅ KEEPING THIS WEBHOOK:');
    console.log(`   ID: ${bestWebhook.id}`);
    console.log(`   URL: ${bestWebhook.url}`);
    console.log(`   Events: ${bestWebhook.enabled_events.length} event(s)`);
    console.log('');

    // Delete all others
    const toDelete = cloudflareWebhooks.filter(wh => wh.id !== bestWebhook.id);
    
    if (toDelete.length === 0) {
      console.log('✅ No duplicate webhooks to delete - you\'re all set!');
      return;
    }

    console.log(`🗑️  DELETING ${toDelete.length} DUPLICATE WEBHOOK(S):\n`);

    for (const webhook of toDelete) {
      console.log(`   Deleting: ${webhook.id}`);
      console.log(`   URL: ${webhook.url}`);
      try {
        await stripe.webhookEndpoints.del(webhook.id);
        console.log(`   ✅ Deleted successfully\n`);
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }

    console.log('='.repeat(70));
    console.log('✅ CLEANUP COMPLETE!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📋 Remaining webhook:');
    console.log(`   ID: ${bestWebhook.id}`);
    console.log(`   URL: ${bestWebhook.url}`);
    console.log(`   Status: ${bestWebhook.status}`);
    console.log('');
    console.log('✅ You now have one clean webhook configured!');

  } catch (error: any) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

cleanupWebhooks();

