// Test Stripe API connection
// Run this in browser console or Node.js to test Stripe connectivity

async function testStripeConnection() {
  console.log('Testing Stripe API connection...');
  
  // Test 1: Check if Stripe.js loads
  if (typeof window !== 'undefined' && window.Stripe) {
    console.log('✅ Stripe.js is loaded');
    const publishableKey = import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      console.log('✅ Stripe publishable key found:', publishableKey.substring(0, 12) + '...');
    } else {
      console.error('❌ Stripe publishable key NOT found');
    }
  } else {
    console.error('❌ Stripe.js is NOT loaded');
  }
  
  // Test 2: Test Supabase edge function endpoint
  const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('❌ Supabase URL not configured');
    return;
  }
  
  console.log('Testing Supabase edge function:', `${supabaseUrl}/functions/v1/create-payment-intent`);
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100, // $1.00 test
        currency: 'usd',
        customerInfo: {
          email: 'test@example.com',
          fullName: 'Test User'
        }
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.clientSecret) {
      console.log('✅ Stripe connection successful!');
      console.log('✅ Payment intent created:', data.paymentIntentId);
      console.log('✅ Client secret received:', data.clientSecret.substring(0, 20) + '...');
    } else {
      console.error('❌ Stripe connection failed:', data.error || 'Unknown error');
      console.error('Response status:', response.status);
      console.error('Response data:', data);
    }
  } catch (error) {
    console.error('❌ Network error connecting to Stripe:', error.message);
    console.error('Full error:', error);
  }
}

// Run test
testStripeConnection();







