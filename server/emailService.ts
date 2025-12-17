import { getUncachableResendClient } from './resendClient';
import { storage } from './storage';
import type { Order, Customer } from '@shared/schema';

const CREDENTIALS_DELAY_MS = 5 * 60 * 1000;
const SETUP_VIDEO_URL = 'https://youtu.be/DYSOp6mUzDU';
const STREAMING_PORTAL_URL = 'http://ky-tv.cc';
const OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';

export class EmailService {
  static async sendOrderConfirmation(order: Order): Promise<void> {
    const { client, fromEmail } = await getUncachableResendClient();

    const priceFormatted = (order.amount / 100).toFixed(2);
    
    await client.emails.send({
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

    console.log(`Order confirmation email sent to ${order.customerEmail}`);
  }

  static async sendCredentialsEmail(order: Order): Promise<void> {
    if (order.isRenewal) {
      await EmailService.sendRenewalConfirmationEmail(order);
      return;
    }

    const { client, fromEmail } = await getUncachableResendClient();

    const credentials = order.generatedUsername && order.generatedPassword
      ? { username: order.generatedUsername, password: order.generatedPassword }
      : EmailService.generateCredentials(order);

    const productIds = order.realProductId?.split(',') || [];
    const hasIPTV = productIds.some(id => id.trim().startsWith('iptv-'));
    const hasFireStick = productIds.some(id => id.trim().startsWith('firestick-'));

    let productInstructions = '';
    if (hasIPTV) {
      productInstructions = `
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #0066cc;">Live TV Setup Instructions</h2>
          <p><strong>Portal URL:</strong> <a href="${STREAMING_PORTAL_URL}">${STREAMING_PORTAL_URL}</a></p>
          <p><strong>Username:</strong> ${credentials.username}</p>
          <p><strong>Password:</strong> ${credentials.password}</p>
          
          <h3 style="color: #0066cc;">How to Setup:</h3>
          <ol>
            <li>Download the streaming app on your device</li>
            <li>Enter the portal URL: ${STREAMING_PORTAL_URL}</li>
            <li>Enter your username and password</li>
            <li>Start streaming!</li>
          </ol>
          
          <p><strong>Watch our setup video:</strong> <a href="${SETUP_VIDEO_URL}">${SETUP_VIDEO_URL}</a></p>
        </div>
      `;
    }
    
    if (hasFireStick) {
      productInstructions += `
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #ea580c;">StreamStick Setup Instructions</h2>
          <p><strong>Portal URL:</strong> <a href="${STREAMING_PORTAL_URL}">${STREAMING_PORTAL_URL}</a></p>
          <p><strong>Username:</strong> ${credentials.username}</p>
          <p><strong>Password:</strong> ${credentials.password}</p>
          
          <h3 style="color: #ea580c;">How to Get Fully Loaded in 10 Minutes:</h3>
          <ol>
            <li>Your StreamStick arrives ready - just plug it into your TV</li>
            <li>Connect to your WiFi</li>
            <li>Open the Live TV app and enter your credentials above</li>
            <li>Follow our quick setup video and you're fully loaded!</li>
          </ol>
          
          <p><strong>Watch our setup video:</strong> <a href="${SETUP_VIDEO_URL}">${SETUP_VIDEO_URL}</a></p>
        </div>
      `;
    }

    await client.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `Your Login Credentials - ${order.realProductName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Your Credentials Are Ready!</h1>
          
          <p>Hi ${order.customerName || 'Valued Customer'},</p>
          
          <p>Here are your login credentials for ${order.realProductName}:</p>
          
          ${productInstructions}
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <strong>⏱️ Activation Time:</strong> Please allow 1-4 hours (typically 15 minutes) for your activation to be active. You will be able to log in once your account is activated.
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <strong>Important:</strong> Please save these credentials in a safe place. Do not share them with anyone.
          </div>
          
          <p>If you need any assistance, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br>StreamStickPro Team</p>
        </div>
      `,
    });

    await storage.updateOrder(order.id, { credentialsSent: true });
    console.log(`Credentials email sent to ${order.customerEmail}`);
  }

  static async sendRenewalConfirmationEmail(order: Order): Promise<void> {
    const { client, fromEmail } = await getUncachableResendClient();

    const priceFormatted = (order.amount / 100).toFixed(2);
    const existingUsername = order.existingUsername || 'your current username';

    await client.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `Subscription Renewed! - ${order.realProductName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">🎉 Your Subscription Has Been Extended!</h1>
          
          <p>Hi ${order.customerName || 'Valued Customer'},</p>
          
          <p>Great news! Your Live TV subscription has been successfully renewed.</p>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white;">
            <h2 style="margin-top: 0; color: white;">Renewal Confirmed</h2>
            <p style="font-size: 16px;"><strong>Product:</strong> ${order.realProductName}</p>
            <p style="font-size: 16px;"><strong>Amount Paid:</strong> $${priceFormatted}</p>
            <p style="font-size: 16px;"><strong>Your Username:</strong> ${existingUsername}</p>
          </div>
          
          <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <h3 style="margin-top: 0; color: #0369a1;">Your Existing Credentials Still Work!</h3>
            <p>You can continue using your current login credentials. No changes needed!</p>
            <p><strong>Portal URL:</strong> <a href="${STREAMING_PORTAL_URL}" style="color: #0369a1;">${STREAMING_PORTAL_URL}</a></p>
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

    await storage.updateOrder(order.id, { credentialsSent: true });
    console.log(`Renewal confirmation email sent to ${order.customerEmail}`);
  }

  static generateCredentials(order: Order): { username: string; password: string } {
    const letters = 'abcdefghkmnpqrstuvwxyz';
    const numbers = '23456789';
    const alphanumeric = letters + letters.toUpperCase() + numbers;
    
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
    password += generateChar(0, letters.toUpperCase());
    password += generateChar(1, letters);
    password += generateChar(2, numbers);
    password += generateChar(3, letters.toUpperCase());
    for (let i = 4; password.length < 10; i++) {
      password += generateChar(i + 10, alphanumeric);
    }
    
    return {
      username: username.substring(0, 10),
      password: password.substring(0, 10),
    };
  }

  static async scheduleCredentialsEmail(orderId: string): Promise<void> {
    console.log(`Scheduling credentials email for order ${orderId} in ${CREDENTIALS_DELAY_MS / 1000} seconds`);
    
    setTimeout(async () => {
      try {
        const order = await storage.getOrder(orderId);
        if (!order) {
          console.error(`Order ${orderId} not found for credentials email`);
          return;
        }

        if (order.credentialsSent) {
          console.log(`Credentials already sent for order ${orderId}`);
          return;
        }

        await EmailService.sendCredentialsEmail(order);
      } catch (error) {
        console.error(`Error sending credentials email for order ${orderId}:`, error);
      }
    }, CREDENTIALS_DELAY_MS);
  }

  static async sendOwnerOrderNotification(order: Order): Promise<void> {
    const { client, fromEmail } = await getUncachableResendClient();

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
        : EmailService.generateCredentials(order);

    const emoji = hasFireStick ? '🔥' : '📺';
    const category = hasFireStick && hasIPTV ? '🔥📺 StreamStick + Live TV' : hasFireStick ? '🔥 StreamStick' : '📺 Live TV Plan';
    
    const headerColor = isRenewal 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
      : 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)';
    
    const credentialsSection = isRenewal ? `
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h2 style="margin-top: 0; color: #047857;">🔄 Renewal - Existing Customer</h2>
            <p><strong>Existing Username:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${order.existingUsername || 'Not provided'}</code></p>
            <p><strong>Action:</strong> Extend this customer's subscription in admin panel</p>
            <p><strong>Portal URL:</strong> <a href="${STREAMING_PORTAL_URL}" style="color: #047857;">${STREAMING_PORTAL_URL}</a></p>
          </div>
    ` : `
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h2 style="margin-top: 0; color: #15803d;">🔑 New Customer Credentials</h2>
            <p><strong>Username:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${credentials.username}</code></p>
            <p><strong>Password:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${credentials.password}</code></p>
            <p><strong>Action:</strong> Create this account in admin panel</p>
            <p><strong>Portal URL:</strong> <a href="${STREAMING_PORTAL_URL}" style="color: #15803d;">${STREAMING_PORTAL_URL}</a></p>
            <p><strong>Setup Video:</strong> <a href="${SETUP_VIDEO_URL}" style="color: #15803d;">${SETUP_VIDEO_URL}</a></p>
          </div>
    `;
    
    await client.emails.send({
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
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Customer Type:</strong> <span style="background: ${isRenewal ? '#d1fae5' : '#fef3c7'}; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${orderTypeLabel}</span></p>
          </div>
          
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

    console.log(`Owner notification sent for order ${order.id} to ${OWNER_EMAIL}`);
  }

  static async generateUniqueCredentials(order: Order): Promise<{ username: string; password: string }> {
    const baseCredentials = EmailService.generateCredentials(order);
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
}
