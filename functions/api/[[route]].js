// Cloudflare Pages Function - Direct API handling
// Uses: Supabase (database), Stripe (payments), Resend (email)

export const onRequest = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return corsResponse(null, 204);
  }

  // Route API requests
  try {
    if (path === '/api/free-trial' && request.method === 'POST') {
      return await handleFreeTrial(request, env);
    }
    
    if (path === '/api/checkout' && request.method === 'POST') {
      return await handleCheckout(request, env);
    }
    
    if (path === '/api/products' && request.method === 'GET') {
      return await handleGetProducts(env);
    }
    
    if (path === '/api/stripe/config' && request.method === 'GET') {
      return corsResponse(JSON.stringify({ 
        publishableKey: env.STRIPE_PUBLISHABLE_KEY 
      }));
    }

    // Not an API route, continue to static files
    if (!path.startsWith('/api/')) {
      return context.next();
    }

    return corsResponse(JSON.stringify({ error: 'Endpoint not found' }), 404);
  } catch (error) {
    console.error('API Error:', error);
    return corsResponse(JSON.stringify({ error: 'Internal server error' }), 500);
  }
};

// CORS helper
function corsResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle Free Trial
async function handleFreeTrial(request, env) {
  const { email, name } = await request.json();

  if (!email || !name) {
    return corsResponse(JSON.stringify({ error: 'Email and name are required' }), 400);
  }

  // Generate credentials
  const letters = 'abcdefghkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '@#$%&*!';
  const timestamp = Date.now().toString(36);
  const seed = email.replace(/[^a-zA-Z0-9]/g, '') + timestamp;
  
  const generateChar = (index, charset) => {
    const charCode = seed.charCodeAt(index % seed.length) || 65;
    return charset[(charCode + index) % charset.length];
  };
  
  const nameClean = name.replace(/[^a-zA-Z]/g, '').toLowerCase().substring(0, 3);
  let username = nameClean.length >= 2 ? nameClean : 'usr';
  for (let i = 0; username.length < 8; i++) {
    username += generateChar(i, numbers + letters);
  }
  username = username.substring(0, 10);
  
  let password = '';
  password += generateChar(0, letters.toUpperCase());
  password += generateChar(1, letters);
  password += generateChar(2, numbers);
  password += generateChar(3, symbols);
  for (let i = 4; password.length < 10; i++) {
    password += generateChar(i + 5, letters + letters.toUpperCase() + numbers + symbols);
  }
  password = password.substring(0, 10);

  const IPTV_PORTAL_URL = 'http://ky-tv.cc';
  const SETUP_VIDEO_URL = 'https://youtu.be/DYSOp6mUzDU';

  // Send email via Resend
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #9333ea;">🎉 Your Free Trial is Ready!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for trying StreamStickPro! Here are your <strong>36-hour free trial</strong> credentials:</p>
      <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white;">
        <h2 style="margin-top: 0; color: white;">Your Trial Credentials</h2>
        <p style="font-size: 16px;"><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}" style="color: #fef08a;">${IPTV_PORTAL_URL}</a></p>
        <p style="font-size: 18px;"><strong>Username:</strong> ${username}</p>
        <p style="font-size: 18px;"><strong>Password:</strong> ${password}</p>
      </div>
      <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #7c3aed; margin-top: 0;">Quick Setup Guide:</h3>
        <ol style="color: #4c1d95;">
          <li>Download IPTV Smarters or TiviMate app on your device</li>
          <li>Enter the portal URL: ${IPTV_PORTAL_URL}</li>
          <li>Enter your username and password above</li>
          <li>Enjoy 18,000+ live channels for FREE!</li>
        </ol>
        <p><strong>Watch our setup video:</strong> <a href="${SETUP_VIDEO_URL}" style="color: #7c3aed;">${SETUP_VIDEO_URL}</a></p>
      </div>
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <strong>⏰ Remember:</strong> Your trial expires in 36 hours. Upgrade anytime to keep streaming!
      </div>
      <p>Love the service? <a href="https://streamstickpro.com" style="color: #9333ea; font-weight: bold;">Visit our shop</a> to get full access!</p>
      <p>Questions? Reply to this email or contact us at reloadedfiretvteam@gmail.com</p>
      <p>Happy Streaming! 🎬<br>StreamStickPro Team</p>
    </div>
  `;

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL || 'StreamStickPro <noreply@streamstickpro.com>',
        to: email,
        subject: 'Your FREE 36-Hour IPTV Trial Credentials - StreamStickPro',
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Resend error:', error);
      return corsResponse(JSON.stringify({ error: 'Failed to send email' }), 500);
    }

    // Notify owner
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL || 'StreamStickPro <noreply@streamstickpro.com>',
        to: 'reloadedfiretvteam@gmail.com',
        subject: `🆕 New Free Trial Signup - ${name}`,
        html: `<p>New trial signup:</p><p>Name: ${name}</p><p>Email: ${email}</p><p>Username: ${username}</p>`,
      }),
    });

    return corsResponse(JSON.stringify({ success: true, message: 'Trial credentials sent' }));
  } catch (error) {
    console.error('Email error:', error);
    return corsResponse(JSON.stringify({ error: 'Failed to process request' }), 500);
  }
}

// Handle Checkout
async function handleCheckout(request, env) {
  const body = await request.json();
  const { items, customerEmail, customerName, countryPreference } = body;

  if (!items || !items.length || !customerEmail) {
    return corsResponse(JSON.stringify({ error: 'Items and email are required' }), 400);
  }

  // Get products from Supabase
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_ANON_KEY;

  const productIds = items.map(item => item.productId);
  const productsResponse = await fetch(
    `${supabaseUrl}/rest/v1/real_products?id=in.(${productIds.map(id => `"${id}"`).join(',')})`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );

  const products = await productsResponse.json();
  
  if (!products || products.length === 0) {
    return corsResponse(JSON.stringify({ error: 'Products not found' }), 404);
  }

  // Build line items for Stripe
  const lineItems = [];
  const productMap = {};
  products.forEach(p => productMap[p.id] = p);

  for (const item of items) {
    const product = productMap[item.productId];
    if (!product || !product.shadow_price_id) {
      return corsResponse(JSON.stringify({ error: `Product not configured: ${item.productId}` }), 400);
    }
    lineItems.push({
      price: product.shadow_price_id,
      quantity: item.quantity,
    });
  }

  const realProductNames = items.map(item => productMap[item.productId]?.name).join(', ');
  const hasFireStick = realProductNames.toLowerCase().includes('fire') || realProductNames.toLowerCase().includes('stick');

  // Create Stripe checkout session
  const stripeParams = new URLSearchParams();
  stripeParams.append('mode', 'payment');
  stripeParams.append('success_url', 'https://streamstickpro.com/success?session_id={CHECKOUT_SESSION_ID}');
  stripeParams.append('cancel_url', 'https://streamstickpro.com/cancel');
  stripeParams.append('customer_email', customerEmail);
  stripeParams.append('metadata[realProductNames]', realProductNames);
  stripeParams.append('metadata[countryPreference]', countryPreference || 'All Countries');

  lineItems.forEach((item, index) => {
    stripeParams.append(`line_items[${index}][price]`, item.price);
    stripeParams.append(`line_items[${index}][quantity]`, item.quantity);
  });

  if (hasFireStick) {
    stripeParams.append('shipping_address_collection[allowed_countries][0]', 'US');
    stripeParams.append('shipping_address_collection[allowed_countries][1]', 'CA');
    stripeParams.append('phone_number_collection[enabled]', 'true');
  }

  try {
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripeParams.toString(),
    });

    const session = await stripeResponse.json();

    if (session.error) {
      console.error('Stripe error:', session.error);
      return corsResponse(JSON.stringify({ error: 'Failed to create checkout session' }), 500);
    }

    return corsResponse(JSON.stringify({
      sessionId: session.id,
      url: session.url,
    }));
  } catch (error) {
    console.error('Checkout error:', error);
    return corsResponse(JSON.stringify({ error: 'Failed to process checkout' }), 500);
  }
}

// Handle Get Products
async function handleGetProducts(env) {
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/real_products?select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const products = await response.json();
    
    // Transform to match expected format
    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.image_url,
      category: p.category,
      shadowProductId: p.shadow_product_id,
      shadowPriceId: p.shadow_price_id,
    }));

    return corsResponse(JSON.stringify({ data: formatted }));
  } catch (error) {
    console.error('Products fetch error:', error);
    return corsResponse(JSON.stringify({ error: 'Failed to fetch products' }), 500);
  }
}

// Handle CORS preflight
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};
