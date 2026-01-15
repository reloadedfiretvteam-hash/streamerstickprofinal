import { Hono } from 'hono';
import { getStorage } from '../helpers';
import { sendEmail } from '../email-providers';
import type { Env } from '../index';

export function createEmailCampaignRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  // Create campaign when customer purchases or takes free trial
  app.post('/create', async (c) => {
    try {
      const body = await c.req.json();
      const { customerEmail, customerName, campaignType, orderId, trialId } = body;

      if (!customerEmail || !campaignType) {
        return c.json({ error: 'Customer email and campaign type are required' }, 400);
      }

      if (!['purchase', 'free_trial'].includes(campaignType)) {
        return c.json({ error: 'Invalid campaign type. Must be "purchase" or "free_trial"' }, 400);
      }

      const serviceKey = c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, serviceKey);

      // Check if active campaign already exists
      const { data: existing } = await supabase
        .from('email_campaigns')
        .select('id')
        .eq('customer_email', customerEmail)
        .eq('campaign_type', campaignType)
        .eq('status', 'active')
        .maybeSingle();

      if (existing) {
        return c.json({ 
          success: true, 
          message: 'Campaign already exists',
          campaignId: existing.id 
        });
      }

      // Calculate first email time (send first email in 2-3 days)
      const now = new Date();
      const firstEmailDate = new Date(now.getTime() + (2 + Math.random()) * 24 * 60 * 60 * 1000); // 2-3 days

      // Create campaign
      const { data: campaign, error } = await supabase
        .from('email_campaigns')
        .insert({
          customer_email: customerEmail,
          customer_name: customerName || null,
          campaign_type: campaignType,
          order_id: orderId || null,
          trial_id: trialId || null,
          status: 'active',
          phase: 'weekly',
          next_email_scheduled_at: firstEmailDate.toISOString(),
          week_emails_sent: 0,
          emails_sent_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      return c.json({ 
        success: true, 
        campaign,
        message: 'Email campaign created successfully',
        firstEmailScheduled: firstEmailDate.toISOString()
      });
    } catch (error: any) {
      console.error('Error creating email campaign:', error);
      return c.json({ 
        error: 'Failed to create email campaign',
        details: error.message 
      }, 500);
    }
  });

  // Process scheduled emails (called by cron job)
  app.post('/process-scheduled', async (c) => {
    try {
      const serviceKey = c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, serviceKey);

      const now = new Date();
      
      // Find campaigns ready to send
      const { data: campaigns, error: fetchError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('status', 'active')
        .lte('next_email_scheduled_at', now.toISOString())
        .order('next_email_scheduled_at', { ascending: true })
        .limit(50); // Process 50 at a time

      if (fetchError) throw fetchError;

      if (!campaigns || campaigns.length === 0) {
        return c.json({ 
          success: true, 
          message: 'No campaigns ready to send',
          processed: 0 
        });
      }

      const results = {
        processed: 0,
        sent: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const campaign of campaigns) {
        try {
          const emailSent = await sendCampaignEmail(campaign, c.env, supabase);
          
          if (emailSent.success) {
            results.sent++;
            
            // Update campaign
            const updateData: any = {
              last_email_sent_at: now.toISOString(),
              emails_sent_count: campaign.emails_sent_count + 1,
            };

            if (campaign.phase === 'weekly') {
              updateData.week_emails_sent = campaign.week_emails_sent + 1;
              
              // After 2 emails in first week, move to monthly phase
              if (updateData.week_emails_sent >= 2) {
                updateData.phase = 'monthly';
                // Schedule first monthly email for 30 days from now
                const monthlyDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                updateData.next_email_scheduled_at = monthlyDate.toISOString();
              } else {
                // Schedule next weekly email (3-4 days from now)
                const nextWeekly = new Date(now.getTime() + (3 + Math.random()) * 24 * 60 * 60 * 1000);
                updateData.next_email_scheduled_at = nextWeekly.toISOString();
              }
            } else {
              // Monthly phase - schedule next email for 30 days
              const nextMonthly = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              updateData.next_email_scheduled_at = nextMonthly.toISOString();
            }

            if (!campaign.first_email_sent_at) {
              updateData.first_email_sent_at = now.toISOString();
            }

            await supabase
              .from('email_campaigns')
              .update(updateData)
              .eq('id', campaign.id);

            // Record email send
            await supabase
              .from('email_sends')
              .insert({
                campaign_id: campaign.id,
                customer_email: campaign.customer_email,
                email_type: campaign.phase === 'weekly' ? 'weekly_reminder' : 'monthly_reminder',
                subject: emailSent.subject,
                provider: emailSent.provider,
                provider_id: emailSent.providerId,
                status: 'sent',
              });
          } else {
            results.failed++;
            results.errors.push(`${campaign.customer_email}: ${emailSent.error}`);
          }
          
          results.processed++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${campaign.customer_email}: ${error.message}`);
          console.error(`Error processing campaign ${campaign.id}:`, error);
        }
      }

      return c.json({
        success: true,
        ...results,
        message: `Processed ${results.processed} campaigns: ${results.sent} sent, ${results.failed} failed`
      });
    } catch (error: any) {
      console.error('Error processing scheduled emails:', error);
      return c.json({ 
        error: 'Failed to process scheduled emails',
        details: error.message 
      }, 500);
    }
  });

  // Get campaign status for admin
  app.get('/status/:email', async (c) => {
    try {
      const email = c.req.param('email');
      const serviceKey = c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, serviceKey);

      const { data: campaigns, error } = await supabase
        .from('email_campaigns')
        .select('*, email_sends(*)')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return c.json({ data: campaigns || [] });
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  return app;
}

async function sendCampaignEmail(campaign: any, env: Env, supabase: any): Promise<{
  success: boolean;
  subject: string;
  provider?: string;
  providerId?: string;
  error?: string;
}> {
  const isWeekly = campaign.phase === 'weekly';
  const customerName = campaign.customer_name || 'Valued Customer';
  const websiteUrl = 'https://streamstickpro.com';
  
  const subject = isWeekly 
    ? `🎬 Don't Miss Out - Your Streaming Solution Awaits!`
    : `📺 Monthly Reminder - StreamStickPro Has You Covered`;

  const emailContent = isWeekly
    ? generateWeeklyReminderEmail(customerName, websiteUrl, campaign.campaign_type)
    : generateMonthlyReminderEmail(customerName, websiteUrl, campaign.campaign_type);

  const result = await sendEmail({
    to: campaign.customer_email,
    subject,
    html: emailContent,
  }, env);

  if (result.success) {
    return {
      success: true,
      subject,
      provider: result.provider,
      providerId: result.providerId,
    };
  }

  return {
    success: false,
    subject,
    error: result.error,
  };
}

function generateWeeklyReminderEmail(name: string, websiteUrl: string, campaignType: string): string {
  const isTrial = campaignType === 'free_trial';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎬 StreamStickPro</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
        
        <p>We wanted to remind you about <strong>StreamStickPro</strong> - your ultimate streaming solution!</p>
        
        ${isTrial 
          ? `<p>Since you tried our free trial, we thought you'd like to know about our full service options:</p>`
          : `<p>As a valued customer, here's what makes StreamStickPro special:</p>`
        }
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="margin-top: 0; color: #667eea;">✨ Why Choose StreamStickPro?</h3>
          <ul style="padding-left: 20px;">
            <li><strong>20,000+ Live Channels</strong> - Sports, Movies, TV Shows, and more!</li>
            <li><strong>Instant Setup</strong> - Get fully loaded in just 10 minutes</li>
            <li><strong>24/7 Support</strong> - We're here to help whenever you need us</li>
            <li><strong>Best Prices</strong> - Save thousands compared to cable TV</li>
            <li><strong>Regular Updates</strong> - Always fresh content, automatically updated</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${websiteUrl}" 
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
            Visit StreamStickPro Now →
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Questions? Just reply to this email - we're here to help!<br>
          <strong>StreamStickPro Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>You're receiving this because you ${isTrial ? 'signed up for a free trial' : 'made a purchase'} with StreamStickPro.</p>
        <p><a href="${websiteUrl}/unsubscribe?email={{email}}" style="color: #999;">Unsubscribe</a></p>
      </div>
    </body>
    </html>
  `;
}

function generateMonthlyReminderEmail(name: string, websiteUrl: string, campaignType: string): string {
  const isTrial = campaignType === 'free_trial';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">📺 StreamStickPro Monthly Update</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
        
        <p>Just a friendly monthly reminder that <strong>StreamStickPro</strong> is here whenever you need the best streaming experience!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="margin-top: 0; color: #667eea;">🎯 What's New This Month?</h3>
          <ul style="padding-left: 20px;">
            <li>New channels added to our lineup</li>
            <li>Improved streaming quality and reliability</li>
            <li>Enhanced customer support features</li>
            <li>Special offers for returning customers</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${websiteUrl}" 
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
            Check Out StreamStickPro →
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Remember: StreamStickPro offers the best value in streaming - save thousands compared to cable!<br><br>
          <strong>StreamStickPro Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>Monthly reminder from StreamStickPro</p>
        <p><a href="${websiteUrl}/unsubscribe?email={{email}}" style="color: #999;">Unsubscribe</a></p>
      </div>
    </body>
    </html>
  `;
}
