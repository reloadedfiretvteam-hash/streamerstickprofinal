// Complete Stripe System Test
const SUPABASE_URL = 'https://pruppukvoqvsnjdzhdze.supabase.co';
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVVUcvC8';

console.log('\n=== STRIPE CHECKOUT SYSTEM VERIFICATION ===\n');

// Test 1: Stripe Publishable Key Format
console.log('1. Stripe Publishable Key Check:');
if (STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
  console.log('   ✓ Using LIVE Stripe key');
  console.log('   ✓ Format is correct');
} else if (STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
  console.log('   ⚠ Using TEST Stripe key (payments will be simulated)');
} else {
  console.log('   ✗ Invalid Stripe key format');
}

// Test 2: Edge Function Availability
console.log('\n2. Testing Edge Function Endpoints:');
const endpoints = [
  '/functions/v1/stripe-payment-intent',
  '/functions/v1/stripe-webhook'
];

async function testEndpoint(path) {
  try {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok || response.status === 200) {
      console.log(`   ✓ ${path} - Available`);
      return true;
    } else {
      console.log(`   ✗ ${path} - Status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ✗ ${path} - Error: ${error.message}`);
    return false;
  }
}

async function testPaymentIntentCreation() {
  console.log('\n3. Testing Payment Intent Creation:');

  try {
    const testProduct = {
      realProductId: 'fed48a09-199b-44bb-8e2e-58dd4198161d',
      customerEmail: 'test@example.com',
      customerName: 'Test Customer'
    };

    console.log('   Sending test request...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProduct)
    });

    const data = await response.json();

    if (response.ok && data.clientSecret) {
      console.log('   ✓ Payment Intent created successfully');
      console.log('   ✓ Client Secret received:', data.clientSecret.substring(0, 20) + '...');
      return true;
    } else {
      console.log('   ✗ Failed to create Payment Intent');
      console.log('   Error:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('   ✗ Payment Intent test failed:', error.message);
    return false;
  }
}

async function runTests() {
  // Test endpoints
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }

  // Test payment intent creation
  await testPaymentIntentCreation();

  console.log('\n=== CHECKOUT PAGE ACCESS ===');
  console.log('\n   Your checkout page should be available at:');
  console.log('   https://streamerstickpro.com/stripe-checkout');
  console.log('\n   Or with a specific product:');
  console.log('   https://streamerstickpro.com/stripe-checkout?product=fed48a09-199b-44bb-8e2e-58dd4198161d');

  console.log('\n=== NEXT STEPS ===');
  console.log('\n   1. Make sure STRIPE_SECRET_KEY is set in Supabase Edge Functions');
  console.log('   2. Make sure STRIPE_WEBHOOK_SECRET is set in Supabase Edge Functions');
  console.log('   3. Configure webhook in Stripe Dashboard to point to:');
  console.log(`      ${SUPABASE_URL}/functions/v1/stripe-webhook`);
  console.log('\n=== END OF TESTS ===\n');
}

runTests().catch(console.error);
