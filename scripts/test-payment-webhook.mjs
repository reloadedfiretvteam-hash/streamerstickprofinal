#!/usr/bin/env node
// Test script for payment webhook

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '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';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://streamstickpro.com/api/stripe/webhook';

async function testWebhook() {
  console.log('🧪 Testing Payment Webhook\n');
  console.log('=' .repeat(50) + '\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`   STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`   STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? '✓ Set' : '✗ Missing'}`);
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`   OWNER_EMAIL: ${process.env.OWNER_EMAIL || 'reloadedfiretvteam@gmail.com'}`);
  console.log(`   WEBHOOK_URL: ${WEBHOOK_URL}\n`);
  
  // Test webhook endpoint
  console.log('🌐 Testing Webhook Endpoint:');
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      body: JSON.stringify({ test: true })
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${await response.text()}\n`);
  } catch (error) {
    console.error(`   ✗ Error: ${error.message}\n`);
  }
  
  console.log('=' .repeat(50) + '\n');
  console.log('📝 Manual Testing Steps:');
  console.log('   1. Go to Stripe Dashboard → Developers → Webhooks');
  console.log('   2. Find your webhook endpoint');
  console.log('   3. Click "Send test webhook"');
  console.log('   4. Select event: checkout.session.completed');
  console.log('   5. Check your email for confirmation\n');
  
  console.log('✅ Test complete!\n');
}

testWebhook().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

