import { Resend } from 'resend';
import type { Env } from './index';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  provider: string;
  error?: string;
}

/**
 * Unified email sending with multiple provider fallbacks
 * Tries Resend first (more reliable delivery), then MailChannels as fallback
 */
export async function sendEmail(options: EmailOptions, env: Env): Promise<EmailResult> {
  const fromEmail = options.from || env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';
  
  // Try Resend first (better deliverability for customer emails)
  if (env.RESEND_API_KEY) {
    try {
      console.log(`[EMAIL] Attempting Resend email to ${options.to}`);
      
      const resendResult = await sendViaResend({
        ...options,
        from: fromEmail,
      }, env);
      
      if (resendResult.success) {
        console.log(`[EMAIL] Resend email sent successfully to ${options.to}`);
        return resendResult;
      }
      
      console.warn(`[EMAIL] Resend failed, trying MailChannels: ${resendResult.error}`);
    } catch (error: any) {
      console.error(`[EMAIL] Resend error: ${error.message}`);
    }
  } else {
    console.warn(`[EMAIL] RESEND_API_KEY not configured, trying MailChannels`);
  }

  // Fallback to MailChannels (Cloudflare built-in)
  try {
    console.log(`[EMAIL] Attempting MailChannels email to ${options.to}`);
    
    const mailChannelsResult = await sendViaMailChannels({
      ...options,
      from: fromEmail,
    });
    
    if (mailChannelsResult.success) {
      console.log(`[EMAIL] MailChannels email sent to ${options.to}`);
      return mailChannelsResult;
    }
    
    console.warn(`[EMAIL] MailChannels failed: ${mailChannelsResult.error}`);
  } catch (error: any) {
    console.warn(`[EMAIL] MailChannels error: ${error.message}`);
  }

  // All providers failed
  const errorMsg = 'All email providers failed. Resend and MailChannels both unavailable.';
  console.error(`[EMAIL] ${errorMsg}`);
  return {
    success: false,
    provider: 'none',
    error: errorMsg,
  };
}

/**
 * Send email via Cloudflare MailChannels
 * Free, built-in, requires domain verification
 */
async function sendViaMailChannels(options: EmailOptions): Promise<EmailResult> {
  try {
    // MailChannels API endpoint (available in Cloudflare Workers)
    // Requires DNS setup: TXT record with MailChannels verification
    // For now, we'll use the standard MailChannels API
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
          },
        ],
        from: {
          email: options.from || 'noreply@streamstickpro.com',
          name: 'StreamStickPro',
        },
        subject: options.subject,
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        provider: 'mailchannels',
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    return {
      success: true,
      provider: 'mailchannels',
    };
  } catch (error: any) {
    return {
      success: false,
      provider: 'mailchannels',
      error: error.message,
    };
  }
}

/**
 * Send email via Resend
 * Requires RESEND_API_KEY
 */
async function sendViaResend(options: EmailOptions, env: Env): Promise<EmailResult> {
  try {
    if (!env.RESEND_API_KEY) {
      return {
        success: false,
        provider: 'resend',
        error: 'RESEND_API_KEY not configured',
      };
    }

    const resend = new Resend(env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: options.from || env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    return {
      success: true,
      provider: 'resend',
    };
  } catch (error: any) {
    return {
      success: false,
      provider: 'resend',
      error: error.message,
    };
  }
}
