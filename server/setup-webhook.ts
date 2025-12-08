import { getUncachableStripeClient, getStripeSecretKey } from './stripeClient';

async function setupWebhook() {
  console.log('='.repeat(50));
  console.log('STRIPE WEBHOOK SETUP');
  console.log('='.repeat(50));

  try {
    const stripe = await getUncachableStripeClient();
    
    // Step 1: Delete ALL existing webhooks to start fresh
    console.log('\n1. Cleaning up old webhooks...');
    const existing = await stripe.webhookEndpoints.list({ limit: 100 });
    
    for (const wh of existing.data) {
      console.log(`   Deleting: ${wh.id}`);
      await stripe.webhookEndpoints.del(wh.id);
    }
    console.log(`   Deleted ${existing.data.length} old webhook(s)`);

    // Step 2: Create fresh webhook
    console.log('\n2. Creating new webhook...');
    const webhook = await stripe.webhookEndpoints.create({
      url: 'https://secure.streamstickpro.com/api/stripe/webhook',
      enabled_events: [
        'checkout.session.completed',
        'checkout.session.expired',
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.canceled',
        'charge.succeeded',
        'charge.failed',
        'charge.refunded',
      ],
      description: 'StreamStickPro Production Webhook',
    });

    console.log('\n' + '='.repeat(50));
    console.log('SUCCESS! WEBHOOK CREATED');
    console.log('='.repeat(50));
    console.log('');
    console.log('Webhook ID:', webhook.id);
    console.log('URL:', webhook.url);
    console.log('Status:', webhook.status);
    console.log('');
    console.log('WEBHOOK SECRET (save this):');
    console.log(webhook.secret);
    console.log('');
    console.log('='.repeat(50));

    // Step 3: Verify it exists
    console.log('\n3. Verifying webhook exists...');
    const verify = await stripe.webhookEndpoints.list({ limit: 10 });
    console.log(`   Found ${verify.data.length} webhook(s):`);
    for (const w of verify.data) {
      console.log(`   - ${w.url} (${w.status})`);
    }

    console.log('\n✅ SETUP COMPLETE!');
    console.log('Your app should now receive Stripe events.');

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

setupWebhook();
