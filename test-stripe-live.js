import Stripe from 'stripe';

const stripe = new Stripe('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');

async function testStripe() {
  console.log('Testing Stripe Live Key...\n');

  try {
    // Test 1: List webhook endpoints
    console.log('1. Checking webhook endpoints:');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    console.log(`   Found ${webhooks.data.length} webhooks:`);
    webhooks.data.forEach(wh => {
      console.log(`   - ${wh.url}`);
      console.log(`     Status: ${wh.status}`);
      console.log(`     Events: ${wh.enabled_events.join(', ')}`);
    });

    // Test 2: Check account
    console.log('\n2. Checking account:');
    const account = await stripe.accounts.retrieve();
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Live mode: ${!account.charges_enabled ? 'RESTRICTED' : 'ACTIVE'}`);

    // Test 3: Try to create a test payment intent
    console.log('\n3. Creating test payment intent:');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'usd',
      description: 'Test payment intent',
    });
    console.log(`   ✓ Payment Intent created: ${paymentIntent.id}`);
    console.log(`   Status: ${paymentIntent.status}`);

    // Cancel it
    await stripe.paymentIntents.cancel(paymentIntent.id);
    console.log(`   ✓ Cancelled test payment`);

    console.log('\n✓ ALL STRIPE TESTS PASSED');

  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   This key is not valid or has been revoked');
    }
  }
}

testStripe();
