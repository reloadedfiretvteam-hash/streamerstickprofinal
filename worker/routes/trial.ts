import { Hono } from 'hono';
import { Resend } from 'resend';
import type { Env } from '../index';

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

      const resend = new Resend(c.env.RESEND_API_KEY);
      const fromEmail = c.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';

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

      // Customer email
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Your FREE 36-Hour IPTV Trial Credentials - StreamStickPro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #9333ea;">🎉 Your Free Trial is Ready!</h1>
            
            <p>Hi ${name},</p>
            
            <p>Thank you for trying StreamStickPro! ${isExistingUser ? 'Your existing account has been extended for a 36-hour trial.' : 'Here are your <strong>36-hour free trial</strong> credentials:'}</p>
            
            <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white;">
              <h2 style="margin-top: 0; color: white;">Your Trial Credentials</h2>
              <p style="font-size: 16px;"><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}" style="color: #fef08a;">${IPTV_PORTAL_URL}</a></p>
              <p style="font-size: 18px;"><strong>Username:</strong> ${trialCredentials.username}</p>
              ${!isExistingUser ? `<p style="font-size: 18px;"><strong>Password:</strong> ${trialCredentials.password}</p>` : '<p style="font-size: 14px;">(Use your existing password)</p>'}
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
        `,
      });

      // Owner notification email with all details
      await resend.emails.send({
        from: fromEmail,
        to: OWNER_EMAIL,
        subject: `🆕 New Free Trial Signup - ${name}`,
        html: `
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
            
            <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #4338ca;">Trial Credentials Sent</h2>
              <p><strong>Username:</strong> ${trialCredentials.username}</p>
              ${!isExistingUser ? `<p><strong>Password:</strong> ${trialCredentials.password}</p>` : '<p>(Using existing password)</p>'}
              <p><strong>Expires:</strong> 36 hours from signup</p>
            </div>
            
            <p>This customer may convert to a paying customer. Consider following up after their trial expires!</p>
          </div>
        `,
      });

      console.log(`Free trial credentials sent to ${email}, owner notified`);

      return c.json({ success: true, message: "Trial credentials sent" });
    } catch (error: any) {
      console.error("Error processing free trial:", error);
      return c.json({ error: "Failed to process trial request. Please try again." }, 500);
    }
  });

  return app;
}
