import { Resend } from 'resend';
import type { Order } from '../shared/schema';
import type { Storage } from './storage';
import type { Env } from './index';
import { sendEmail } from './email-providers';
import { SURFSHARK_AFFILIATE_URL } from '../shared/surfshark-affiliate';
import { variantsForRealProductId } from '../shared/real-product-id';

const SETUP_VIDEO_URL = 'https://youtu.be/DYSOp6mUzDU';
const IPTV_PORTAL_URL = 'http://ky-tv.cc';
const DEFAULT_OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';

export function getOwnerNotificationEmail(env: Env): string {
  return String(env.ORDER_NOTIFICATION_EMAIL || env.OWNER_EMAIL || DEFAULT_OWNER_EMAIL).trim() || DEFAULT_OWNER_EMAIL;
}

export async function sendOrderConfirmation(order: Order, env: Env): Promise<void> {
  if (!order.customerEmail) {
    const error = `Cannot send order confirmation: missing customerEmail for order ${order.id}`;
    console.error(`[EMAIL] ${error}`);
    throw new Error(error);
  }
  
  const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';
  const priceFormatted = (order.amount / 100).toFixed(2);
  const surf = SURFSHARK_AFFILIATE_URL;

  const emailHtml = `
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

      <div style="background: #ecfeff; border-left: 4px solid #0dd9d2; padding: 16px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 8px 0;"><strong>Surfshark VPN reminder (post-purchase)</strong></p>
        <p style="margin: 0; font-size: 14px; line-height: 1.5;">ISP throttling causes most IPTV buffering. A VPN encrypts your traffic so your ISP can&apos;t throttle streams as easily. Read the full guide at <a href="https://streamstickpro.com/vpn" style="color: #0891b2;">streamstickpro.com/vpn</a> — special offer: <a href="${surf}" style="color: #0891b2; font-weight: bold;">Get Surfshark VPN</a>.</p>
      </div>
      
      <p>You will receive a separate account email after payment is confirmed and provisioning is completed.</p>
      
      <p>If you have any questions, please don't hesitate to reach out.</p>
      
      <p>Best regards,<br>StreamStickPro Team</p>
    </div>
  `;
  
  let result;
  try {
    result = await sendEmail({
      to: order.customerEmail,
      from: fromEmail,
      subject: `Order Confirmation - ${order.realProductName}`,
      html: emailHtml,
    }, env);
  } catch (error: any) {
    console.error(`[EMAIL] Unexpected error calling sendEmail for order confirmation: ${error.message}`);
    throw new Error(`Failed to send order confirmation email: ${error.message}`);
  }

  if (!result.success) {
    console.error(`[EMAIL] Failed to send order confirmation email to ${order.customerEmail} via ${result.provider}: ${result.error}`);
    throw new Error(`Failed to send order confirmation email: ${result.error}`);
  }

  console.log(`[EMAIL] ✅ Order confirmation email sent successfully to ${order.customerEmail} via ${result.provider}`);
}

export async function sendCredentialsEmail(order: Order, env: Env, storage: Storage): Promise<void> {
  if (order.provisioningBranch === 'existing_not_found_manual_review') {
    console.log(`[EMAIL] Skipping credentials email for ${order.id}; manual review required`);
    return;
  }

  const shouldSendRenewalVerificationEmail =
    order.isRenewal &&
    !!order.existingUsername &&
    !!order.provisioningBranch &&
    order.provisioningBranch.startsWith('existing_customer_');

  if (shouldSendRenewalVerificationEmail) {
    await sendRenewalConfirmationEmail(order, env);
    await storage.updateOrder(order.id, { credentialsSent: true });
    return;
  }

  if (!order.customerEmail) {
    const error = `Cannot send credentials: missing customerEmail for order ${order.id}`;
    console.error(`[EMAIL] ${error}`);
    throw new Error(error);
  }
  
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
  const idHintsHardware = (raw: string) => {
    const x = raw.trim().toLowerCase();
    return (
      x.startsWith('firestick-') ||
      x.startsWith('onn-google') ||
      x.startsWith('android-onn') ||
      x.startsWith('fs-')
    );
  };
  const hasFireStick = productIds.some(id => idHintsHardware(id));
  const hasAnyDigitalProduct = hasIPTV || hasFireStick;
  const surf = SURFSHARK_AFFILIATE_URL;
  const vpnCredentialsNote = hasIPTV
    ? `
    <div style="background: #ecfeff; border-left: 4px solid #0dd9d2; padding: 16px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0;"><strong>VPN reminder for smoother IPTV</strong></p>
      <p style="margin: 0; font-size: 14px;">If you see buffering, your ISP may be throttling streaming traffic. Surfshark VPN helps mask that traffic. Guide: <a href="https://streamstickpro.com/vpn" style="color: #0891b2;">streamstickpro.com/vpn</a> — <a href="${surf}" style="color: #0891b2; font-weight: bold;">Get Surfshark</a>.</p>
    </div>
  `
    : '';

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

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Your Credentials Are Ready!</h1>
      
      <p>Hi ${order.customerName || 'Valued Customer'},</p>
      
      <p>Here are your login credentials for ${order.realProductName}:</p>
      
      ${productInstructions}
      ${vpnCredentialsNote}
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <strong>Important:</strong> Please save these credentials in a safe place. Do not share them with anyone.
      </div>
      
      <p>If you need any assistance, please don't hesitate to reach out.</p>
      
      <p>Best regards,<br>StreamStickPro Team</p>
    </div>
  `;

  let result;
  try {
    result = await sendEmail({
      to: order.customerEmail,
      from: fromEmail,
      subject: `Your Login Credentials - ${order.realProductName}`,
      html: emailHtml,
    }, env);
  } catch (error: any) {
    console.error(`[EMAIL] Unexpected error calling sendEmail for credentials: ${error.message}`);
    throw new Error(`Failed to send credentials email: ${error.message}`);
  }

  if (!result.success) {
    console.error(`[EMAIL] Failed to send credentials email to ${order.customerEmail} via ${result.provider}: ${result.error}`);
    throw new Error(`Failed to send credentials email: ${result.error}`);
  }

  await storage.updateOrder(order.id, { credentialsSent: true });
  console.log(`[EMAIL] ✅ Credentials email sent successfully to ${order.customerEmail} via ${result.provider}`);
}

export async function sendRenewalConfirmationEmail(order: Order, env: Env): Promise<void> {
  if (!order.customerEmail) {
    const error = `Cannot send renewal confirmation: missing customerEmail for order ${order.id}`;
    console.error(`[EMAIL] ${error}`);
    throw new Error(error);
  }
  
  const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';
  const priceFormatted = (order.amount / 100).toFixed(2);
  const existingUsername = order.existingUsername || 'your current username';
  const confirmedPassword = order.generatedPassword || null;
  const passwordLine = confirmedPassword
    ? `<p><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; color: #f97316; font-weight: bold;">${confirmedPassword}</span></p>`
    : `<p><strong>Password:</strong> Continue using your current password unless support tells you otherwise.</p>`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Your Existing Account Was Verified</h1>
      
      <p>Hi ${order.customerName || 'Valued Customer'},</p>
      
      <p>Your payment for ${order.realProductName} was confirmed and your existing account details have been verified for continued use.</p>
      
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white;">
        <h2 style="margin-top: 0; color: white;">Verified Existing Account</h2>
        <p style="font-size: 16px;"><strong>Product:</strong> ${order.realProductName}</p>
        <p style="font-size: 16px;"><strong>Amount Paid:</strong> $${priceFormatted}</p>
        <p style="font-size: 16px;"><strong>Username:</strong> ${existingUsername}</p>
      </div>
      
      <div style="background: #f9fafb; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #f97316;">Your Account Details</h2>
        <div style="margin: 15px 0;">
          <p><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${IPTV_PORTAL_URL}</a></p>
          <p><strong>Username:</strong> <span style="font-family: monospace; font-size: 16px; color: #f97316; font-weight: bold;">${existingUsername}</span></p>
          ${passwordLine}
        </div>
      </div>
      
      <div style="background: #ecfeff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 8px;">
        <strong>Important:</strong> This follow-up confirms the account result for your paid order. Keep using the verified username above when logging into your IPTV apps.
      </div>
      
      <p>Thank you for your order. If you have any questions, please don't hesitate to reach out.</p>
      
      <p>Best regards,<br>StreamStickPro Team</p>
    </div>
  `;

  let result;
  try {
    result = await sendEmail({
      to: order.customerEmail,
      from: fromEmail,
      subject: `Your Account Details - ${order.realProductName}`,
      html: emailHtml,
    }, env);
  } catch (error: any) {
    console.error(`[EMAIL] Unexpected error calling sendEmail for renewal confirmation: ${error.message}`);
    throw new Error(`Failed to send renewal confirmation email: ${error.message}`);
  }

  if (!result.success) {
    console.error(`[EMAIL] Failed to send renewal confirmation email to ${order.customerEmail} via ${result.provider}: ${result.error}`);
    throw new Error(`Failed to send renewal confirmation email: ${result.error}`);
  }

  console.log(`[EMAIL] ✅ Renewal confirmation email sent successfully to ${order.customerEmail} via ${result.provider}`);
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
  
  const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';

  const priceFormatted = (order.amount / 100).toFixed(2);
  const orderDate = new Date().toLocaleString();
  const productIds = order.realProductId?.split(',') || [];
  let hasIPTV = false;
  let hasFireStick = false;
  for (const raw of productIds) {
    for (const id of variantsForRealProductId(String(raw || '').trim())) {
      const x = id.toLowerCase();
      if (x.startsWith('iptv-')) hasIPTV = true;
      if (
        x.startsWith('firestick-') ||
        x.startsWith('onn-google') ||
        x.startsWith('android-onn') ||
        x.startsWith('fs-')
      )
        hasFireStick = true;
    }
  }

  const isRenewal = order.isRenewal || false;
  const orderTypeEmoji = isRenewal ? '🔄' : '🆕';
  const orderTypeLabel = isRenewal ? 'RENEWAL' : 'NEW CUSTOMER';
  
  const credentials = isRenewal 
    ? { username: order.existingUsername || 'N/A', password: '(existing)' }
    : (order.generatedUsername && order.generatedPassword)
      ? { username: order.generatedUsername, password: order.generatedPassword }
      : generateCredentials(order);

  const emoji = hasFireStick ? '🔥' : '📺';
  const category =
    hasFireStick && hasIPTV
      ? '🔥📺 Device bundle + IPTV'
      : hasFireStick
        ? '🔥 Streaming device'
        : '📺 IPTV Subscription';
  
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
  const shippingAddress = [
    order.shippingStreet,
    [order.shippingCity, order.shippingState].filter(Boolean).join(', '),
    [order.shippingZip, order.shippingCountry].filter(Boolean).join(' '),
  ]
    .filter((part) => !!part && part.trim().length > 0)
    .join('<br>');
  const hasShippingInfo = !!(
    order.shippingName ||
    order.shippingStreet ||
    order.shippingCity ||
    order.shippingState ||
    order.shippingZip ||
    order.shippingCountry ||
    order.shippingPhone
  );
  
  const emailHtml = `
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

        <div style="background: ${hasShippingInfo ? '#ecfeff' : '#fff7ed'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${hasShippingInfo ? '#06b6d4' : '#f97316'};">
          <h2 style="margin-top: 0; color: ${hasShippingInfo ? '#155e75' : '#9a3412'};">📦 Shipping Details</h2>
          <p><strong>Recipient:</strong> ${order.shippingName || order.customerName || 'Not provided'}</p>
          <p><strong>Shipping Phone:</strong> ${order.shippingPhone || order.customerPhone || 'Not provided'}</p>
          <p><strong>Address:</strong><br>${shippingAddress || 'Not captured yet'}</p>
          ${!hasShippingInfo ? '<p style="color: #b45309; font-weight: bold; margin-top: 10px;">⚠️ Shipping address missing. Check Stripe Checkout session before fulfillment.</p>' : ''}
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
  `;

  const ownerInbox = getOwnerNotificationEmail(env);
  let result;
  try {
    result = await sendEmail({
      to: ownerInbox,
      from: fromEmail,
      subject: `${emoji} ${orderTypeEmoji} ${orderTypeLabel} - $${priceFormatted} - ${order.realProductName}`,
      html: emailHtml,
    }, env);
  } catch (error: any) {
    console.error(`[EMAIL] Unexpected error calling sendEmail for owner notification: ${error.message}`);
    throw new Error(`Failed to send owner notification email: ${error.message}`);
  }

  if (!result.success) {
    console.error(
      `[EMAIL] CRITICAL: Owner notification failed for order ${order.id} → ${ownerInbox} via ${result.provider}: ${result.error}`,
    );
    throw new Error(`Failed to send owner notification email: ${result.error}`);
  }

  console.log(`[EMAIL] ✅ Owner notification sent successfully for order ${order.id} to ${ownerInbox} via ${result.provider}`);
}