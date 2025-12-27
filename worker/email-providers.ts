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
 * Tries MailChannels (Cloudflare) first, then Resend
 */
export async function sendEmail(options: EmailOptions, env: Env): Promise<EmailResult> {
  const fromEmail = options.from || env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';
  
  // Try MailChannels first (Cloudflare built-in, free, reliable)
  try {
    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-providers.ts:18',message:'Attempting MailChannels email',data:{to:options.to,subject:options.subject,from:fromEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'email-provider-test',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    
    const mailChannelsResult = await sendViaMailChannels({
      ...options,
      from: fromEmail,
    });
    
    if (mailChannelsResult.success) {
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-providers.ts:28',message:'MailChannels email sent successfully',data:{to:options.to},timestamp:Date.now(),sessionId:'debug-session',runId:'email-provider-test',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
      return mailChannelsResult;
    }
    
    console.warn(`[EMAIL] MailChannels failed, trying Resend: ${mailChannelsResult.error}`);
  } catch (error: any) {
    console.warn(`[EMAIL] MailChannels error: ${error.message}`);
    // #region agent log
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-providers.ts:38',message:'MailChannels threw error, trying Resend',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'email-provider-test',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
  }

  // Fallback to Resend
  if (env.RESEND_API_KEY) {
    try {
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-providers.ts:47',message:'Attempting Resend email',data:{to:options.to,subject:options.subject,hasResendKey:!!env.RESEND_API_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'email-provider-test',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      
      const resendResult = await sendViaResend({
        ...options,
        from: fromEmail,
      }, env);
      
      if (resendResult.success) {
        // #region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-providers.ts:57',message:'Resend email sent successfully',data:{to:options.to},timestamp:Date.now(),sessionId:'debug-session',runId:'email-provider-test',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
        return resendResult;
      }
      
      console.warn(`[EMAIL] Resend failed: ${resendResult.error}`);
    } catch (error: any) {
      console.error(`[EMAIL] Resend error: ${error.message}`);
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-providers.ts:67',message:'Resend threw error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'email-provider-test',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
    }
  } else {
    console.warn(`[EMAIL] RESEND_API_KEY not configured, skipping Resend fallback`);
  }

  // All providers failed
  const errorMsg = 'All email providers failed. MailChannels and Resend both unavailable.';
  console.error(`[EMAIL] ${errorMsg}`);
  // #region agent log
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-providers.ts:78',message:'All email providers failed',data:{to:options.to,hasResendKey:!!env.RESEND_API_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'email-provider-test',hypothesisId:'C'})}).catch(()=>{});
  }
  // #endregion
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
