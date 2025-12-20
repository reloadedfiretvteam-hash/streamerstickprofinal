/**
 * FIX STRIPE WEBHOOK URL
 * 
 * This script will:
 * 1. Delete old webhooks pointing to Supabase
 * 2. Create new webhook pointing to Cloudflare Worker
 * 3. Output the webhook secret for Cloudflare configuration
 * 
 * IMPORTANT: This script requires Stripe API access.
 * Make sure you have STRIPE_SECRET_KEY in your environment.
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CORRECT_WEBHOOK_URL = 'https://secure.streamstickpro.com/api/stripe/webhook';
const OLD_SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook';

if (!STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY environment variable not set!');
  console.error('Set it with: export STRIPE_SECRET_KEY=sk_live_...');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

async function fixWebhook() {
  console.log('='.repeat(70));
  console.log('🔧 FIXING STRIPE WEBHOOK URL');
  console.log('='.repeat(70));
  console.log('');

  try {
    // Step 1: List all existing webhooks
    console.log('📋 Step 1: Checking existing webhooks...');
    const existing = await stripe.webhookEndpoints.list({ limit: 100 });
    console.log(`   Found ${existing.data.length} webhook(s)\n`);

    // Step 2: Find and delete old Supabase webhooks
    let deletedCount = 0;
    for (const webhook of existing.data) {
      if (webhook.url.includes('supabase.co') || webhook.url === OLD_SUPABASE_URL) {
        console.log(`   🗑️  Deleting old webhook: ${webhook.url}`);
        await stripe.webhookEndpoints.del(webhook.id);
        deletedCount++;
      } else if (webhook.url === CORRECT_WEBHOOK_URL) {
        console.log(`   ✅ Found existing correct webhook: ${webhook.url}`);
        console.log(`   ℹ️  Webhook ID: ${webhook.id}`);
        console.log(`   ℹ️  Status: ${webhook.status}`);
        console.log('');
        console.log('   📝 To get the webhook secret:');
        console.log('   1. Go to: https://dashboard.stripe.com/webhooks');
        console.log(`   2. Click on webhook ID: ${webhook.id}`);
        console.log('   3. Click "Reveal" next to "Signing secret"');
        console.log('   4. Copy the secret (starts with whsec_)');
        console.log('   5. Add it to Cloudflare as STRIPE_WEBHOOK_SECRET');
        console.log('');
        console.log('✅ Webhook is already correctly configured!');
        return;
      }
    }

    if (deletedCount > 0) {
      console.log(`   ✅ Deleted ${deletedCount} old webhook(s)\n`);
    }

    // Step 3: Create new webhook pointing to Cloudflare
    console.log('🔨 Step 2: Creating new webhook...');
    console.log(`   URL: ${CORRECT_WEBHOOK_URL}`);
    
    const webhook = await stripe.webhookEndpoints.create({
      url: CORRECT_WEBHOOK_URL,
      enabled_events: [
        'checkout.session.completed',      // REQUIRED for order confirmation emails
        'payment_intent.succeeded',         // REQUIRED for credentials emails
        'payment_intent.payment_failed',    // For tracking failed payments
        'payment_intent.canceled',          // For tracking canceled payments
      ],
      description: 'StreamStickPro Production Webhook (Cloudflare Worker)',
    });

    console.log('   ✅ Webhook created successfully!\n');

    // Step 4: Output results
    console.log('='.repeat(70));
    console.log('✅ SUCCESS! WEBHOOK FIXED');
    console.log('='.repeat(70));
    console.log('');
    console.log('📋 Webhook Details:');
    console.log(`   Webhook ID: ${webhook.id}`);
    console.log(`   URL: ${webhook.url}`);
    console.log(`   Status: ${webhook.status}`);
    console.log('');
    console.log('🔑 WEBHOOK SECRET (IMPORTANT - SAVE THIS!):');
    console.log(`   ${webhook.secret}`);
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Copy the webhook secret above (starts with whsec_)');
    console.log('   2. Go to Cloudflare Pages → Your Project → Settings → Environment Variables');
    console.log('   3. Add/Update: STRIPE_WEBHOOK_SECRET = (paste the secret)');
    console.log('   4. Save and redeploy if needed');
    console.log('');
    console.log('✅ Your webhook is now correctly configured!');
    console.log('   Product purchase emails should now work!');
    console.log('='.repeat(70));

  } catch (error: any) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Check that your STRIPE_SECRET_KEY is correct');
    }
    process.exit(1);
  }
}

fixWebhook();

