import { Resend } from 'resend';
import type { Order } from '../shared/schema';
import type { Storage } from './storage';
import type { Env } from './index';

const SETUP_VIDEO_URL = 'https://youtu.be/DYSOp6mUzDU';
const IPTV_PORTAL_URL = 'http://ky-tv.cc';
const OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';

export async function sendOrderConfirmation(order: Order, env: Env): Promise<void> {
  // #region agent log
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email.ts:10',message:'sendOrderConfirmation called',data:{orderId:order.id,customerEmail:order.customerEmail,hasResendKey:!!env.RESEND_API_KEY,hasFromEmail:!!env.RESEND_FROM_EMAIL},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion
  if (!order.customerEmail) {
    const error = `Cannot send order confirmation: missing customerEmail for order ${order.id}`;
    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email.ts:13',message:'Missing customer email',data:{orderId:order.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'M'})}).catch(()=>{});
    }
    // #endregion
    console.error(`[EMAIL] ${error}`);
    throw new Error(error);
  }
  
  if (!env.RESEND_API_KEY) {
    const error = `Cannot send order confirmation: RESEND_API_KEY not configured`;
    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email.ts:20',message:'RESEND_API_KEY missing',data:{orderId:order.id},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'N'})}).catch(()=>{});
    }
    // #endregion
    console.error(`[EMAIL] ${error}`);
    throw new Error(error);
  }
  
  const resend = new Resend(env.RESEND_API_KEY);
  const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';

  const priceFormatted = (order.amount / 100).toFixed(2);
  
  try {
    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email.ts:28',message:'Calling resend.emails.send',data:{orderId:order.id,from:fromEmail,to:order.customerEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    await resend.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.realProductName}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Thank You for Your Order!</h1>
        
        <p>Hi ${order.customerName || 'Valued Customer'},</p>
        
        <p>Your order has been confirmed and is being processed.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #333;">Order Details</h2>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Product:</strong> ${order.realProductName}</p>
          <p><strong>Amount:</strong> $${priceFormatted}</p>
          ${order.countryPreference ? `<p><strong>Channel Preferences:</strong> ${order.countryPreference}</p>` : ''}
        </div>
        
        <p>You will receive your login credentials in a separate email within the next 5 minutes.</p>
        
        <p>If you have any questions, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>StreamStickPro Team</p>
      </div>
    `,
    });
    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email.ts:52',message:'Order confirmation email sent successfully',data:{orderId:order.id,customerEmail:order.customerEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    console.log(`[EMAIL] Order confirmation email sent successfully to ${order.customerEmail}`);
  } catch (error: any) {
    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email.ts:55',message:'Order confirmation email failed',data:{orderId:order.id,error:error.message,errorStack:error.stack,errorType:error.constructor.name},timestamp:Date.now(),sessionId:'debug-session',runId:'email-debug',hypothesisId:'O'})}).catch(()=>{});
    }
    // #endregion
    console.error(`[EMAIL] Failed to send order confirmation email to ${order.customerEmail}:`, error.message);
    throw new Error(`Failed to send order confirmation email: ${error.message}`);
  }
}

export async function sendCredentialsEmail(order: Order, env: Env, storage: Storage): Promise<void> {
  if (order.isRenewal) {
    await sendRenewalConfirmationEmail(order, env);
    return;
  }

  if (!order.customerEmail) {
    const error = `Cannot send credentials: missing customerEmail for order ${order.id}`;
    console.error(`[EMAIL] ${error}`);
    throw new Error(error);
  }
  
  const resend = new Resend(env.RESEND_API_KEY);
  const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';

  // Use existing credentials or generate new ones and save them
  let credentials: { username: string; password: string };
  if (order.generatedUsername && order.generatedPassword) {
    credentials = { username: order.generatedUsername, password: order.generatedPassword };
  } else {
    // Generate unique credentials and save them to the order
    credentials = await generateUniqueCredentials(order, storage);
    await storage.updateOrder(order.id, {
      generatedUsername: credentials.username,
      generatedPassword: credentials.password,
    });
    console.log(`[EMAIL] Generated and saved credentials for order ${order.id}: ${credentials.username}`);
  }

  const productIds = order.realProductId?.split(',') || [];
  const hasIPTV = productIds.some(id => id.trim().startsWith('iptv-'));
  const hasFireStick = productIds.some(id => id.trim().startsWith('firestick-'));
  const hasAnyDigitalProduct = hasIPTV || hasFireStick;

  // Default credentials section that always includes credentials
  const defaultCredentialsSection = `
    <div style="background: #f9fafb; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #f97316;">Your Login Credentials</h2>
      <div style="margin: 15px 0;">
        <p><strong>Username:</strong> <span style="font-family: monospace; font-size: 16px; color: #f97316; font-weight: bold;">${credentials.username}</span></p>
        <p><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; color: #f97316; font-weight: bold;">${credentials.password}</span></p>
      </div>
    </div>
    
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Service Portal URL:</strong></p>
      <p style="margin: 0;"><a href="${IPTV_PORTAL_URL}" style="color: #3b82f6; text-decoration: none; font-weight: bold; font-size: 18px;">${IPTV_PORTAL_URL}</a></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Use the credentials above to log in to your service portal.</p>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>📺 Setup Tutorial Video:</strong></p>
      <p style="margin: 0;"><a href="${SETUP_VIDEO_URL}" style="color: #d97706; text-decoration: none; font-weight: bold;" target="_blank">Watch YouTube Setup Tutorial →</a></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Follow along with our step-by-step video guide to get started.</p>
    </div>
  `;

  let productInstructions = defaultCredentialsSection;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `Your Login Credentials - ${order.realProductName}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Your Credentials Are Ready!</h1>
        
        <p>Hi ${order.customerName || 'Valued Customer'},</p>
        
        <p>Here are your login credentials for ${order.realProductName}:</p>
        
        ${productInstructions}
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <strong>Important:</strong> Please save these credentials in a safe place. Do not share them with anyone.
        </div>
        
        <p>If you need any assistance, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>StreamStickPro Team</p>
      </div>
    `,
    });
    await storage.updateOrder(order.id, { credentialsSent: true });
    console.log(`[EMAIL] Credentials email sent successfully to ${order.customerEmail}`);
  } catch (error: any) {
    console.error(`[EMAIL] Failed to send credentials email to ${order.customerEmail}:`, error.message);
    throw new Error(`Failed to send credentials email: ${error.message}`);
  }
}

export async function sendRenewalConfirmationEmail(order: Order, env: Env): Promise<void> {
  if (!order.customerEmail) {
    const error = `Cannot send renewal confirmation: missing customerEmail for order ${order.id}`;
    console.error(`[EMAIL] ${error}`);
    throw new Error(error);
  }
  
  const resend = new Resend(env.RESEND_API_KEY);
  const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';

  const priceFormatted = (order.amount / 100).toFixed(2);
  const existingUsername = order.existingUsername || 'your current username';

  try {
    await resend.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `Subscription Renewed! - ${order.realProductName}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">🎉 Your Subscription Has Been Extended!</h1>
        
        <p>Hi ${order.customerName || 'Valued Customer'},</p>
        
        <p>Great news! Your IPTV subscription has been successfully renewed.</p>
        
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white;">
          <h2 style="margin-top: 0; color: white;">Renewal Confirmed</h2>
          <p style="font-size: 16px;"><strong>Product:</strong> ${order.realProductName}</p>
          <p style="font-size: 16px;"><strong>Amount Paid:</strong> $${priceFormatted}</p>
          <p style="font-size: 16px;"><strong>Your Username:</strong> ${existingUsername}</p>
        </div>
        
        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
          <h3 style="margin-top: 0; color: #0369a1;">Your Existing Credentials Still Work!</h3>
          <p>You can continue using your current login credentials. No changes needed!</p>
          <p><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}" style="color: #0369a1;">${IPTV_PORTAL_URL}</a></p>
          <p><strong>Username:</strong> ${existingUsername}</p>
          <p><strong>Password:</strong> (same as before)</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <strong>✅ What's Next:</strong> Your subscription is now extended. Just keep streaming - no action required!
        </div>
        
        <p>Thank you for being a loyal customer! If you have any questions, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>StreamStickPro Team</p>
      </div>
    `,
    });
    console.log(`[EMAIL] Renewal confirmation email sent successfully to ${order.customerEmail}`);
  } catch (error: any) {
    console.error(`[EMAIL] Failed to send renewal confirmation email to ${order.customerEmail}:`, error.message);
    throw new Error(`Failed to send renewal confirmation email: ${error.message}`);
  }
}

export function generateCredentials(order: Order): { username: string; password: string } {
  const letters = 'abcdefghkmnpqrstuvwxyz';
  const upperLetters = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const allChars = letters + upperLetters + numbers;
  
  const seed = order.id.replace(/-/g, '');
  
  const generateChar = (index: number, charset: string): string => {
    const charCode = seed.charCodeAt(index % seed.length) || 65;
    return charset[(charCode + index) % charset.length];
  };
  
  const customerName = order.customerName?.replace(/[^a-zA-Z]/g, '') || '';
  const namePrefix = customerName.substring(0, 3).toLowerCase();
  
  let username = '';
  if (namePrefix.length >= 2) {
    username = namePrefix;
    for (let i = 0; username.length < 8; i++) {
      username += generateChar(i, numbers + letters);
    }
  } else {
    for (let i = 0; username.length < 8; i++) {
      username += generateChar(i, letters + numbers);
    }
  }
  
  let password = '';
  password += generateChar(0, upperLetters);
  password += generateChar(1, letters);
  password += generateChar(2, numbers);
  password += generateChar(3, upperLetters);
  for (let i = 4; password.length < 10; i++) {
    password += generateChar(i + 10, allChars);
  }
  
  return {
    username: username.substring(0, 10),
    password: password.substring(0, 10),
  };
}

export async function generateUniqueCredentials(order: Order, storage: Storage): Promise<{ username: string; password: string }> {
  const baseCredentials = generateCredentials(order);
  let username = baseCredentials.username;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const existingCustomer = await storage.getCustomerByUsername(username);
    if (!existingCustomer) {
      return { username, password: baseCredentials.password };
    }
    
    attempts++;
    const suffix = attempts.toString();
    username = baseCredentials.username.substring(0, 10 - suffix.length) + suffix;
  }
  
  const timestamp = Date.now().toString(36).substring(0, 4);
  username = baseCredentials.username.substring(0, 6) + timestamp;
  
  return { username, password: baseCredentials.password };
}

export async function sendOwnerOrderNotification(order: Order, env: Env): Promise<void> {
  // Owner notification doesn't need customer email, but log if order email is missing
  if (!order.customerEmail) {
    console.warn(`[EMAIL] Order ${order.id} missing customerEmail, sending owner notification anyway`);
  }
  
  const resend = new Resend(env.RESEND_API_KEY);
  const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';

  const priceFormatted = (order.amount / 100).toFixed(2);
  const orderDate = new Date().toLocaleString();
  const productIds = order.realProductId?.split(',') || [];
  const hasIPTV = productIds.some(id => id.trim().startsWith('iptv-'));
  const hasFireStick = productIds.some(id => id.trim().startsWith('firestick-'));
  
  const isRenewal = order.isRenewal || false;
  const orderTypeEmoji = isRenewal ? '🔄' : '🆕';
  const orderTypeLabel = isRenewal ? 'RENEWAL' : 'NEW CUSTOMER';
  
  const credentials = isRenewal 
    ? { username: order.existingUsername || 'N/A', password: '(existing)' }
    : (order.generatedUsername && order.generatedPassword)
      ? { username: order.generatedUsername, password: order.generatedPassword }
      : generateCredentials(order);

  const emoji = hasFireStick ? '🔥' : '📺';
  const category = hasFireStick && hasIPTV ? '🔥📺 Fire Stick + IPTV' : hasFireStick ? '🔥 Fire Stick' : '📺 IPTV Subscription';
  
  const headerColor = isRenewal 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
    : 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)';
  
  const credentialsSection = isRenewal ? `
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h2 style="margin-top: 0; color: #047857;">🔄 Renewal - Existing Customer</h2>
          <p><strong>Existing Username:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${order.existingUsername || 'Not provided'}</code></p>
          <p><strong>Action:</strong> Extend this customer's subscription in IPTV panel</p>
          <p><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}" style="color: #047857;">${IPTV_PORTAL_URL}</a></p>
        </div>
  ` : `
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <h2 style="margin-top: 0; color: #15803d;">🔑 New Customer Credentials</h2>
          <p><strong>Username:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${credentials.username}</code></p>
          <p><strong>Password:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${credentials.password}</code></p>
          <p><strong>Action:</strong> Create this account in IPTV panel</p>
          <p><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}" style="color: #15803d;">${IPTV_PORTAL_URL}</a></p>
          <p><strong>Setup Video:</strong> <a href="${SETUP_VIDEO_URL}" style="color: #15803d;">${SETUP_VIDEO_URL}</a></p>
        </div>
  `;
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: OWNER_EMAIL,
      subject: `${emoji} ${orderTypeEmoji} ${orderTypeLabel} - $${priceFormatted} - ${order.realProductName}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${headerColor}; padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">💰 ${isRenewal ? 'Subscription Renewal!' : 'New Paid Order!'}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">${orderTypeLabel}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b;">
          <h2 style="margin-top: 0; color: #92400e;">Order Summary</h2>
          <p style="font-size: 24px; color: #16a34a; font-weight: bold; margin: 10px 0;">$${priceFormatted}</p>
        </div>
        
        <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #7c3aed;">Customer Details</h2>
          <p><strong>Name:</strong> ${order.customerName || 'Not provided'}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone || order.shippingPhone || 'Not provided'}</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Customer Type:</strong> <span style="background: ${isRenewal ? '#d1fae5' : '#fef3c7'}; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${orderTypeLabel}</span></p>
        </div>
        
        ${order.customerMessage ? `
        <div style="background: #fef9c3; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #facc15;">
          <h2 style="margin-top: 0; color: #854d0e;">💬 Customer Message</h2>
          <p style="font-style: italic; color: #713f12;">"${order.customerMessage}"</p>
        </div>
        ` : ''}
        
        ${credentialsSection}
        
        <div style="background: ${hasFireStick ? '#fef2f2' : '#eff6ff'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: ${hasFireStick ? '#dc2626' : '#2563eb'};">Product Information</h2>
          <p><strong>Product:</strong> ${order.realProductName}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          ${order.countryPreference ? `<p><strong>🌍 Channel Preferences:</strong> <span style="background: #dbeafe; padding: 2px 8px; border-radius: 4px;">${order.countryPreference}</span></p>` : ''}
        </div>

        ${hasFireStick ? `
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <strong>⚠️ Action Required:</strong> This is a Fire Stick order. Ship the device to the customer!
        </div>
        ` : ''}
        
        <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
          <strong>📧 Email Status:</strong> ${isRenewal ? 'Renewal confirmation' : 'Order confirmation and credentials'} emails will be sent automatically to the customer.
        </div>
        
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">
          StreamStickPro Order Notification System
        </p>
      </div>
    `,
    });
    console.log(`[EMAIL] Owner notification sent successfully for order ${order.id} to ${OWNER_EMAIL}`);
  } catch (error: any) {
    console.error(`[EMAIL] Failed to send owner notification email for order ${order.id}:`, error.message);
    throw new Error(`Failed to send owner notification email: ${error.message}`);
  }
}
