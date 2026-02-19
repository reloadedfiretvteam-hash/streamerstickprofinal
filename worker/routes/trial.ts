import { Hono } from 'hono';
import type { Env } from '../index';
import { sendEmail } from '../email-providers';

const IPTV_PORTAL_URL = 'http://ky-tv.cc';
const SETUP_VIDEO_URL = 'https://youtu.be/DYSOp6mUzDU';
const OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';

export function createTrialRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/', async (c) => {
    try {
      const body = await c.req.json();
      const { 
        email, 
        name, 
        phone, 
        address, 
        message, 
        countryPreference, 
        isExistingUser, 
        existingUsername 
      } = body;

      if (!email || !name) {
        return c.json({ error: "Email and name are required" }, 400);
      }

      if (!email.includes("@")) {
        return c.json({ error: "Please enter a valid email address" }, 400);
      }

      if (isExistingUser && !existingUsername) {
        return c.json({ error: "Please enter your existing username" }, 400);
      }

      const fromEmail = c.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';
      const from = fromEmail.includes('<') ? fromEmail : `StreamStickPro <${fromEmail}>`;

      const letters = 'abcdefghkmnpqrstuvwxyz';
      const upperLetters = 'ABCDEFGHJKMNPQRSTUVWXYZ';
      const numbers = '23456789';
      const timestamp = Date.now().toString(36);
      const seed = email.replace(/[^a-zA-Z0-9]/g, '') + timestamp;
      
      const generateChar = (index: number, charset: string): string => {
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
      password += generateChar(0, upperLetters);
      password += generateChar(1, letters);
      password += generateChar(2, numbers);
      password += generateChar(3, upperLetters);
      for (let i = 4; password.length < 10; i++) {
        password += generateChar(i + 5, letters + upperLetters + numbers);
      }
      
      const trialCredentials = {
        username: isExistingUser ? existingUsername : username,
        password: isExistingUser ? '(using existing password)' : password.substring(0, 10),
      };

      // Customer email (REQUIRED). Use unified sender (Resend → MailChannels fallback).
      const customerSubject = 'Your FREE 36-Hour IPTV Trial Credentials - StreamStickPro';
      const customerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #9333ea;">🎉 Your Free Trial is Ready!</h1>
            
            <p>Hi ${name},</p>
            
            <p>Thank you for trying StreamStickPro! ${isExistingUser ? 'Your existing account has been extended for a 36-hour trial.' : 'Here are your <strong>36-hour free trial</strong> credentials:'}</p>
            
            <div style="background: #f9fafb; border: 2px solid #9333ea; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #9333ea;">Your Trial Credentials</h2>
              <div style="margin: 15px 0;">
                <p><strong>Username:</strong> <span style="font-family: monospace; font-size: 16px; color: #9333ea; font-weight: bold;">${trialCredentials.username}</span></p>
                ${!isExistingUser ? `<p><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; color: #9333ea; font-weight: bold;">${trialCredentials.password}</span></p>` : '<p style="font-size: 14px;">(Use your existing password)</p>'}
              </div>
            </div>
            
            <div style="background: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
              <strong>⏳ Activation Time:</strong> Please allow <strong>1–3 hours</strong> for your subscription to be fully active. During business hours (5 AM – 11 PM EST), activation is usually completed within <strong>15 minutes</strong>.
            </div>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Service Portal URL:</strong></p>
              <p style="margin: 0;"><a href="${IPTV_PORTAL_URL}" style="color: #3b82f6; text-decoration: none; font-weight: bold; font-size: 18px;" target="_blank">${IPTV_PORTAL_URL}</a></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Use the credentials above to log in to your service portal.</p>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>📺 Setup Tutorial Video:</strong></p>
              <p style="margin: 0;"><a href="${SETUP_VIDEO_URL}" style="color: #d97706; text-decoration: none; font-weight: bold;" target="_blank">Watch YouTube Setup Tutorial →</a></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Follow along with our step-by-step video guide to get started.</p>
            </div>
            
            <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #7c3aed; margin-top: 0;">Quick Setup Steps:</h3>
              <ol style="color: #4c1d95;">
                <li>Download IPTV Smarters or TiviMate app on your device</li>
                <li>Enter the portal URL: ${IPTV_PORTAL_URL}</li>
                <li>Enter your username and password above</li>
                <li>Enjoy 18,000+ live channels for FREE!</li>
              </ol>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <strong>⏰ Remember:</strong> Your trial expires in 36 hours. Upgrade anytime to keep streaming!
            </div>

            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
              <h3 style="margin-top: 0; color: #0369a1;">📋 Subscriptions & Free Trial Info</h3>
              <p>Your free trial gives you full access to <strong>18,000+ live channels</strong>, VOD, and sports — the same experience as our paid subscribers.</p>
              <p>Ready to upgrade? We have flexible subscription plans with no contracts:</p>
              <ul style="padding-left: 20px;">
                <li><strong>Monthly Plan</strong> — Pay month-to-month, cancel anytime</li>
                <li><strong>Quarterly Plan</strong> — Save more with 3-month billing</li>
                <li><strong>Yearly Plan + Free Fire Stick</strong> — Best value, biggest savings</li>
              </ul>
              <p><a href="https://streamstickpro.com/shop" style="color: #0284c7; font-weight: bold;">View All Subscription Plans →</a></p>
            </div>

            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <h3 style="margin-top: 0; color: #15803d;">🕐 Business Hours & Contact</h3>
              <p><strong>Business Hours:</strong> 5:00 AM – 11:00 PM Eastern (US) Standard Time</p>
              <p><strong>Email:</strong> <a href="mailto:reloadedfiretvteam@gmail.com" style="color: #15803d;">reloadedfiretvteam@gmail.com</a></p>
              <p><strong>Website:</strong> <a href="https://streamstickpro.com" style="color: #15803d;">streamstickpro.com</a></p>
              <p style="font-size: 14px; color: #4b5563;">We respond to all emails within business hours. Feel free to reach out with any questions about your trial, setup, or subscriptions!</p>
            </div>

            <div style="background: #fdf4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a855f7;">
              <h3 style="margin-top: 0; color: #7c3aed;">🎁 Refer a Friend & Earn Credits!</h3>
              <p>Love StreamStickPro? Bring a friend or family member to sign up and <strong>earn credits toward your subscription!</strong></p>
              <p>Simply tell them to mention your email when they sign up. We'll apply credits to your account automatically.</p>
              <p><a href="https://streamstickpro.com" style="color: #7c3aed; font-weight: bold;">Share StreamStickPro →</a></p>
            </div>
            
            <p>Love the service? <a href="https://streamstickpro.com/shop" style="color: #9333ea; font-weight: bold;">Visit our shop</a> to get full access!</p>
            
            <p>Questions? Reply to this email or contact us at <a href="mailto:reloadedfiretvteam@gmail.com" style="color: #9333ea;">reloadedfiretvteam@gmail.com</a></p>
            
            <p>Happy Streaming! 🎬<br><strong>StreamStickPro Team</strong><br><span style="font-size: 13px; color: #6b7280;">Business Hours: 5 AM – 11 PM EST</span></p>
          </div>
        `;

      const customerResult = await sendEmail({
        from,
        to: email,
        subject: customerSubject,
        html: customerHtml,
      }, c.env);

      if (!customerResult.success) {
        console.error('[free-trial] customer email failed:', customerResult.error);
        return c.json({
          error: 'Failed to send trial email. Please try again in a few minutes.',
          details: customerResult.error,
          provider: customerResult.provider,
          providerId: customerResult.providerId,
        }, 500);
      }

      // Owner notification (NON-FATAL). If this fails, customer still gets credentials.
      try {
        const ownerSubject = `🆕 New Free Trial Signup - ${name}`;
        const ownerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #9333ea;">New Free Trial Request</h1>
            
            <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #7c3aed;">Customer Details</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              ${address ? `<p><strong>Address:</strong> ${address}</p>` : ''}
              <p><strong>Signed up:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Account Type:</strong> ${isExistingUser ? 'Existing User' : 'New User'}</p>
              ${isExistingUser && existingUsername ? `<p><strong>Existing Username:</strong> ${existingUsername}</p>` : ''}
            </div>

            ${countryPreference ? `
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #0369a1;">Channel Preferences</h2>
              <p><strong>Countries/Regions:</strong> ${countryPreference}</p>
            </div>
            ` : ''}

            ${message ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #b45309;">Customer Message</h2>
              <p>${message}</p>
            </div>
            ` : ''}
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h2 style="margin-top: 0; color: #15803d;">Trial Credentials Sent</h2>
              <p><strong>Username:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${trialCredentials.username}</code></p>
              ${!isExistingUser ? `<p><strong>Password:</strong> <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${trialCredentials.password}</code></p>` : '<p>(Using existing password)</p>'}
              <p><strong>Service Portal URL:</strong> <a href="${IPTV_PORTAL_URL}" style="color: #15803d;">${IPTV_PORTAL_URL}</a></p>
              <p><strong>Setup Video:</strong> <a href="${SETUP_VIDEO_URL}" style="color: #15803d;">${SETUP_VIDEO_URL}</a></p>
              <p><strong>Expires:</strong> 36 hours from signup</p>
            </div>
            
            <p>This customer may convert to a paying customer. Consider following up after their trial expires!</p>
          </div>
        `;

        const ownerResult = await sendEmail({
          from,
          to: OWNER_EMAIL,
          subject: ownerSubject,
          html: ownerHtml,
        }, c.env);
        if (!ownerResult.success) {
          console.warn('[free-trial] owner email failed (non-fatal):', ownerResult.error);
        }
      } catch (e: any) {
        console.warn('[free-trial] owner email threw (non-fatal):', e?.message || e);
      }

      console.log(`Free trial credentials sent to ${email} (provider=${customerResult.provider}, id=${customerResult.providerId || 'n/a'})`);

      // Create email campaign for free trial customer
      try {
        const trialId = `trial-${Date.now()}-${email.replace(/[^a-zA-Z0-9]/g, '')}`;
        const campaignResponse = await fetch(`${c.req.url.split('/api/free-trial')[0]}/api/email-campaigns/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail: email,
            customerName: name,
            campaignType: 'free_trial',
            trialId: trialId,
          }),
        });
        if (campaignResponse.ok) {
          console.log(`[EMAIL_CAMPAIGN] ✅ Campaign created for trial customer ${email}`);
        }
      } catch (error: any) {
        console.warn(`[EMAIL_CAMPAIGN] Failed to create campaign: ${error.message}`);
        // Don't fail the request if campaign creation fails
      }

      return c.json({ success: true, message: "Trial credentials sent", provider: customerResult.provider, providerId: customerResult.providerId });
    } catch (error: any) {
      console.error("Error processing free trial:", error?.message || error);
      return c.json({ error: "Failed to process trial request. Please try again.", details: error?.message }, 500);
    }
  });

  return app;
}
