/**
 * CHECK STRIPE WEBHOOK CONFIGURATION (Using Restricted Key)
 * 
 * This script checks your Stripe webhook configuration using a restricted API key.
 * 
 * Required Permissions for Restricted Key:
 * - Read access to: Webhooks
 * 
 * Usage:
 *   export STRIPE_SECRET_KEY="rk_live_YOUR_RESTRICTED_KEY"
 *   npx tsx check-stripe-webhook-restricted.ts
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CORRECT_WEBHOOK_URL = 'https://secure.streamstickpro.com/api/stripe/webhook';
const OLD_SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook';

if (!STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY environment variable not set!');
  console.error('');
  console.error('You can use either:');
  console.error('  1. Full secret key: sk_live_...');
  console.error('  2. Restricted key: rk_live_... (RECOMMENDED for security)');
  console.error('');
  console.error('Set it with:');
  console.error('  export STRIPE_SECRET_KEY="rk_live_YOUR_KEY"');
  console.error('');
  console.error('Or on Windows PowerShell:');
  console.error('  $env:STRIPE_SECRET_KEY="rk_live_YOUR_KEY"');
  console.error('');
  console.error('Then run: npx tsx check-stripe-webhook-restricted.ts');
  process.exit(1);
}

// Detect key type
const isRestricted = STRIPE_SECRET_KEY.startsWith('rk_');
const isLive = STRIPE_SECRET_KEY.includes('_live_');

console.log('🔑 Key Type:', isRestricted ? 'Restricted Key ✅' : 'Full Secret Key');
console.log('🌍 Mode:', isLive ? 'LIVE' : 'TEST');
console.log('');

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

async function checkWebhooks() {
  console.log('='.repeat(70));
  console.log('🔍 CHECKING STRIPE WEBHOOK CONFIGURATION');
  console.log('='.repeat(70));
  console.log('');

  try {
    // List all webhooks
    console.log('📋 Fetching webhook endpoints from Stripe...\n');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });

    if (webhooks.data.length === 0) {
      console.log('⚠️  No webhooks found!');
      console.log('   You need to create a webhook endpoint.');
      console.log('');
      console.log('✅ Correct URL should be:');
      console.log(`   ${CORRECT_WEBHOOK_URL}`);
      return;
    }

    console.log(`Found ${webhooks.data.length} webhook(s):\n`);

    let foundCorrect = false;
    let foundOld = false;

    for (const webhook of webhooks.data) {
      const isSupabase = webhook.url.includes('supabase.co') || 
                         webhook.url.includes('/functions/v1/');
      const isCorrect = webhook.url === CORRECT_WEBHOOK_URL ||
                       webhook.url.includes('streamstickpro.com/api/stripe/webhook');

      console.log('─'.repeat(70));
      console.log(`Webhook ID: ${webhook.id}`);
      console.log(`URL: ${webhook.url}`);
      console.log(`Status: ${webhook.status}`);
      console.log(`Created: ${new Date(webhook.created * 1000).toLocaleString()}`);
      console.log('');

      if (isSupabase) {
        console.log('   ⚠️  ⚠️  ⚠️  THIS IS THE OLD SUPABASE WEBHOOK! ⚠️  ⚠️  ⚠️');
        console.log('   ❌ DELETE THIS ONE');
        console.log('');
        foundOld = true;
      } else if (isCorrect) {
        console.log('   ✅ ✅ ✅ THIS IS THE CORRECT CLOUDFLARE WEBHOOK! ✅ ✅ ✅');
        console.log('   ✅ KEEP THIS ONE');
        console.log('');
        foundCorrect = true;
      } else {
        console.log('   ⚠️  Unknown webhook type');
        console.log('');
      }

      // Show events
      if (webhook.enabled_events.length > 0) {
        console.log('   Events configured:');
        const requiredEvents = ['checkout.session.completed', 'payment_intent.succeeded'];
        for (const event of webhook.enabled_events) {
          const isRequired = requiredEvents.includes(event);
          const marker = isRequired ? '✅' : '  ';
          console.log(`   ${marker} ${event}`);
        }
      } else {
        console.log('   ⚠️  No events configured!');
      }
      console.log('');
    }

    console.log('='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log('');

    if (foundCorrect && !foundOld) {
      console.log('✅ PERFECT! You have the correct webhook configured.');
      console.log('✅ No old Supabase webhook found.');
      console.log('✅ Your system should be working correctly!');
    } else if (foundCorrect && foundOld) {
      console.log('⚠️  You have BOTH webhooks!');
      console.log('✅ Correct Cloudflare webhook: FOUND');
      console.log('❌ Old Supabase webhook: FOUND (DELETE THIS ONE)');
      console.log('');
      console.log('🔧 ACTION REQUIRED:');
      console.log('   1. Delete the Supabase webhook (the one with supabase.co in URL)');
      console.log('   2. Keep the Cloudflare webhook (the one with streamstickpro.com)');
    } else if (foundOld && !foundCorrect) {
      console.log('❌ PROBLEM FOUND!');
      console.log('❌ You only have the OLD Supabase webhook');
      console.log('❌ Correct Cloudflare webhook: NOT FOUND');
      console.log('');
      console.log('🔧 ACTION REQUIRED:');
      console.log('   1. Delete the Supabase webhook');
      console.log('   2. Create new webhook with URL:');
      console.log(`      ${CORRECT_WEBHOOK_URL}`);
      console.log('   3. Select these events:');
      console.log('      - checkout.session.completed');
      console.log('      - payment_intent.succeeded');
      console.log('      - payment_intent.payment_failed');
    } else {
      console.log('⚠️  You have webhook(s) but they don\'t match expected URLs');
      console.log('   Check the URLs above to determine which to keep/delete');
    }

    console.log('');
    console.log('='.repeat(70));

  } catch (error: any) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('');
      console.error('The Stripe key is incorrect or invalid.');
      if (isRestricted) {
        console.error('');
        console.error('⚠️  If using a restricted key, make sure it has:');
        console.error('   ✅ Read permission for: Webhooks');
      } else {
        console.error('Make sure you\'re using your LIVE secret key (starts with sk_live_)');
      }
    } else if (error.code === 'resource_missing' || error.message.includes('permission')) {
      console.error('');
      console.error('⚠️  Permission error!');
      console.error('If using a restricted key, ensure it has:');
      console.error('   ✅ Read access to: Webhooks');
    }
    process.exit(1);
  }
}

checkWebhooks();

