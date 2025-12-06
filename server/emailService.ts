import { getUncachableResendClient } from './resendClient';
import { storage } from './storage';
import type { Order } from '@shared/schema';

const CREDENTIALS_DELAY_MS = 5 * 60 * 1000;
const SETUP_VIDEO_URL = 'https://youtu.be/DYSOp6mUzDU';
const IPTV_PORTAL_URL = 'http://ky-tv.cc';

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
    const { client, fromEmail } = await getUncachableResendClient();

    const credentials = EmailService.generateCredentials(order);

    const productIds = order.realProductId?.split(',') || [];
    const hasIPTV = productIds.some(id => id.trim().startsWith('iptv-'));
    const hasFireStick = productIds.some(id => id.trim().startsWith('firestick-'));

    let productInstructions = '';
    if (hasIPTV) {
      productInstructions = `
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #0066cc;">IPTV Setup Instructions</h2>
          <p><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}">${IPTV_PORTAL_URL}</a></p>
          <p><strong>Username:</strong> ${credentials.username}</p>
          <p><strong>Password:</strong> ${credentials.password}</p>
          
          <h3 style="color: #0066cc;">How to Setup:</h3>
          <ol>
            <li>Download IPTV Smarters or TiviMate app on your device</li>
            <li>Enter the portal URL: ${IPTV_PORTAL_URL}</li>
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
          <h2 style="margin-top: 0; color: #ea580c;">Fire Stick Setup Instructions</h2>
          <p><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}">${IPTV_PORTAL_URL}</a></p>
          <p><strong>Username:</strong> ${credentials.username}</p>
          <p><strong>Password:</strong> ${credentials.password}</p>
          
          <h3 style="color: #ea580c;">How to Setup Your Device:</h3>
          <ol>
            <li>Your Fire Stick will arrive pre-configured</li>
            <li>Simply plug it into your TV</li>
            <li>Connect to your WiFi</li>
            <li>Open the IPTV app and enter your credentials</li>
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

  static generateCredentials(order: Order): { username: string; password: string } {
    const letters = 'abcdefghkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '@#$%&*!';
    const allChars = letters + letters.toUpperCase() + numbers + symbols;
    
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
    password += generateChar(3, symbols);
    for (let i = 4; password.length < 10; i++) {
      password += generateChar(i + 10, allChars);
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
    const OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';

    const priceFormatted = (order.amount / 100).toFixed(2);
    const orderDate = new Date().toLocaleString();
    const productIds = order.realProductId?.split(',') || [];
    const hasIPTV = productIds.some(id => id.trim().startsWith('iptv-'));
    const hasFireStick = productIds.some(id => id.trim().startsWith('firestick-'));
    
    const credentials = EmailService.generateCredentials(order);

    const emoji = hasFireStick ? '🔥' : '📺';
    const category = hasFireStick && hasIPTV ? '🔥📺 Fire Stick + IPTV' : hasFireStick ? '🔥 Fire Stick' : '📺 IPTV Subscription';
    
    await client.emails.send({
      from: fromEmail,
      to: OWNER_EMAIL,
      subject: `${emoji} NEW ORDER - $${priceFormatted} - ${order.realProductName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">💰 New Paid Order!</h1>
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
          </div>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h2 style="margin-top: 0; color: #15803d;">🔑 Customer Credentials (Auto-Generated)</h2>
            <p><strong>Username:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${credentials.username}</code></p>
            <p><strong>Password:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${credentials.password}</code></p>
            <p><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}" style="color: #15803d;">${IPTV_PORTAL_URL}</a></p>
            <p><strong>Setup Video:</strong> <a href="${SETUP_VIDEO_URL}" style="color: #15803d;">${SETUP_VIDEO_URL}</a></p>
          </div>
          
          <div style="background: ${hasFireStick ? '#fef2f2' : '#eff6ff'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: ${hasFireStick ? '#dc2626' : '#2563eb'};">Product Information</h2>
            <p><strong>Product:</strong> ${order.realProductName}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          ${hasFireStick ? `
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <strong>⚠️ Action Required:</strong> This is a Fire Stick order. Ship the device to the customer!
          </div>
          ` : ''}
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <strong>📧 Email Status:</strong> Order confirmation and credentials emails will be sent automatically to the customer.
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">
            StreamStickPro Order Notification System
          </p>
        </div>
      `,
    });

    console.log(`Owner notification sent for order ${order.id} to ${OWNER_EMAIL}`);
  }
}
