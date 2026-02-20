import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { getUncachableResendClient } from "./resendClient";
import { createCampaignSchema, updateCampaignSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import * as crypto from "crypto";

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_JWT_SECRET || process.env.JWT_SECRET || process.env.SESSION_SECRET || '';
const BASE_URL = process.env.BASE_URL || 'https://streamstickpro.com';

function generateUnsubscribeToken(contactId: string): string {
  const payload = JSON.stringify({ sub: contactId, purpose: 'unsubscribe', exp: Date.now() + 365 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac('sha256', UNSUBSCRIBE_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + signature;
}

function verifyUnsubscribeToken(token: string): { valid: boolean; contactId?: string } {
  try {
    const [payloadB64, signature] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expected = crypto.createHmac('sha256', UNSUBSCRIBE_SECRET).update(payload).digest('hex');
    if (signature !== expected) return { valid: false };
    const data = JSON.parse(payload);
    if (data.exp && data.exp < Date.now()) return { valid: false };
    if (data.purpose !== 'unsubscribe') return { valid: false };
    return { valid: true, contactId: data.sub };
  } catch {
    return { valid: false };
  }
}

function generateUnsubscribeUrl(contactId: string): string {
  const token = generateUnsubscribeToken(contactId);
  return `${BASE_URL}/unsubscribe?contactId=${contactId}&token=${token}`;
}

function appendUnsubscribeFooter(html: string, contactId: string): string {
  const url = generateUnsubscribeUrl(contactId);
  return html + `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; font-family: Arial, sans-serif;">
        You're receiving this because you signed up at StreamStickPro.
        <br><a href="${url}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from marketing emails.
      </p>
    </div>`;
}

const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function registerMarketingRoutes(app: Express, adminAuthMiddleware: (req: Request, res: Response, next: NextFunction) => void) {

  // ===== CONTACTS =====

  app.get("/api/admin/marketing/contacts", adminAuthMiddleware, async (req, res) => {
    try {
      const { source, search, subscribedOnly } = req.query;
      const contacts = await storage.getAllContacts({
        source: source as string | undefined,
        search: search as string | undefined,
        subscribedOnly: subscribedOnly === 'true',
      });
      res.json({ data: contacts });
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.get("/api/admin/marketing/contacts/count", adminAuthMiddleware, async (req, res) => {
    try {
      const { source } = req.query;
      const count = await storage.getContactCount(source ? { source: source as string } : undefined);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to count contacts" });
    }
  });

  app.patch("/api/admin/marketing/contacts/:id/unsubscribe", adminAuthMiddleware, async (req, res) => {
    try {
      const contact = await storage.updateContactSubscription(req.params.id, false);
      if (!contact) return res.status(404).json({ error: "Contact not found" });
      res.json({ data: contact });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to unsubscribe contact" });
    }
  });

  app.patch("/api/admin/marketing/contacts/:id/resubscribe", adminAuthMiddleware, async (req, res) => {
    try {
      const contact = await storage.updateContactSubscription(req.params.id, true);
      if (!contact) return res.status(404).json({ error: "Contact not found" });
      res.json({ data: contact });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to resubscribe contact" });
    }
  });

  // ===== CAMPAIGNS =====

  app.get("/api/admin/marketing/campaigns", adminAuthMiddleware, async (req, res) => {
    try {
      const campaigns = await storage.getAllEmailCampaigns();
      const withStats = await Promise.all(campaigns.map(async (c) => {
        const stats = await storage.getCampaignSendStats(c.id);
        return { ...c, stats };
      }));
      res.json({ data: withStats });
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/admin/marketing/campaigns/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      const stats = await storage.getCampaignSendStats(campaign.id);
      const sends = await storage.getEmailSendsByCampaign(campaign.id);
      res.json({ data: { ...campaign, stats, sends } });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.post("/api/admin/marketing/campaigns", adminAuthMiddleware, async (req, res) => {
    try {
      const parseResult = createCampaignSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: fromZodError(parseResult.error).message });
      }
      const campaign = await storage.createEmailCampaign({
        ...parseResult.data,
        status: 'draft',
      });
      res.json({ data: campaign });
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.put("/api/admin/marketing/campaigns/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const parseResult = updateCampaignSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: fromZodError(parseResult.error).message });
      }
      const campaign = await storage.updateEmailCampaign(req.params.id, parseResult.data);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      res.json({ data: campaign });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/admin/marketing/campaigns/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const deleted = await storage.deleteEmailCampaign(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Campaign not found" });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  // Preview recipient count for a campaign
  app.post("/api/admin/marketing/campaigns/:id/preview-count", adminAuthMiddleware, async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      const segment = campaign.segment as { source?: string } | null;
      const count = await storage.getContactCount(segment || undefined);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get preview count" });
    }
  });

  // Test send - sends to a single email address
  app.post("/api/admin/marketing/campaigns/:id/test-send", adminAuthMiddleware, async (req, res) => {
    try {
      const { testEmail } = req.body;
      if (!testEmail) return res.status(400).json({ error: "testEmail is required" });

      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });

      const { client, fromEmail } = await getUncachableResendClient();
      const htmlWithFooter = campaign.bodyHtml + `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; font-family: Arial, sans-serif;">[TEST SEND] Unsubscribe link would appear here in actual sends.</p>
        </div>`;

      await client.emails.send({
        from: fromEmail,
        to: testEmail,
        subject: `[TEST] ${campaign.subject}`,
        html: htmlWithFooter,
        text: campaign.bodyText || undefined,
      });

      res.json({ success: true, message: `Test email sent to ${testEmail}` });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      res.status(500).json({ error: `Failed to send test email: ${error.message}` });
    }
  });

  // Send campaign to all matching contacts
  app.post("/api/admin/marketing/campaigns/:id/send", adminAuthMiddleware, async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      if (campaign.status === 'sent') return res.status(400).json({ error: "Campaign already sent" });

      await storage.updateEmailCampaign(campaign.id, { status: 'sending' });

      const segment = campaign.segment as { source?: string } | null;
      const allContacts = await storage.getAllContacts({
        source: segment?.source,
        subscribedOnly: true,
      });

      if (allContacts.length === 0) {
        await storage.updateEmailCampaign(campaign.id, { status: 'draft' });
        return res.status(400).json({ error: "No subscribed contacts match this segment" });
      }

      // Create queued send records
      const sendRecords = allContacts.map(c => ({
        campaignId: campaign.id,
        contactId: c.id,
        status: 'queued' as const,
      }));
      const sends = await storage.createEmailSendsBatch(sendRecords);

      // Send in batches (non-blocking - responds immediately)
      res.json({
        success: true,
        message: `Sending to ${allContacts.length} contacts in background...`,
        totalRecipients: allContacts.length,
      });

      // Background sending
      const { client, fromEmail } = await getUncachableResendClient();
      let sentCount = 0;
      let failedCount = 0;

      for (let i = 0; i < sends.length; i += BATCH_SIZE) {
        const batch = sends.slice(i, i + BATCH_SIZE);

        await Promise.allSettled(batch.map(async (send) => {
          const contact = allContacts.find(c => c.id === send.contactId);
          if (!contact) return;

          try {
            const htmlWithFooter = appendUnsubscribeFooter(campaign.bodyHtml, contact.id);
            const result = await client.emails.send({
              from: fromEmail,
              to: contact.email,
              subject: campaign.subject,
              html: htmlWithFooter,
              text: campaign.bodyText || undefined,
            });

            await storage.updateEmailSend(send.id, {
              status: 'sent',
              providerMessageId: result.data?.id || null,
              sentAt: new Date(),
            });
            sentCount++;
          } catch (err: any) {
            await storage.updateEmailSend(send.id, {
              status: 'failed',
              errorMessage: err.message?.substring(0, 500) || 'Unknown error',
            });
            failedCount++;
          }
        }));

        if (i + BATCH_SIZE < sends.length) {
          await sleep(BATCH_DELAY_MS);
        }
      }

      await storage.updateEmailCampaign(campaign.id, { status: 'sent', sentAt: new Date() });
      console.log(`Campaign "${campaign.name}" complete: ${sentCount} sent, ${failedCount} failed`);

    } catch (error: any) {
      console.error("Error sending campaign:", error);
      res.status(500).json({ error: `Failed to send campaign: ${error.message}` });
    }
  });

  // Send to specific contact IDs (from contacts page "send to selected")
  app.post("/api/admin/marketing/send-to-selected", adminAuthMiddleware, async (req, res) => {
    try {
      const { contactIds, subject, bodyHtml, bodyText } = req.body;
      if (!contactIds?.length || !subject || !bodyHtml) {
        return res.status(400).json({ error: "contactIds, subject, and bodyHtml are required" });
      }

      // Create an ad-hoc campaign
      const campaign = await storage.createEmailCampaign({
        name: `Ad-hoc: ${subject.substring(0, 50)}`,
        subject,
        bodyHtml,
        bodyText: bodyText || null,
        status: 'sending',
      });

      const { client, fromEmail } = await getUncachableResendClient();
      let sentCount = 0;
      let failedCount = 0;

      for (const contactId of contactIds) {
        const contact = await storage.getContact(contactId);
        if (!contact || !contact.isSubscribed) continue;

        const send = await storage.createEmailSend({
          campaignId: campaign.id,
          contactId: contact.id,
          status: 'queued',
        });

        try {
          const htmlWithFooter = appendUnsubscribeFooter(bodyHtml, contact.id);
          const result = await client.emails.send({
            from: fromEmail,
            to: contact.email,
            subject,
            html: htmlWithFooter,
            text: bodyText || undefined,
          });

          await storage.updateEmailSend(send.id, {
            status: 'sent',
            providerMessageId: result.data?.id || null,
            sentAt: new Date(),
          });
          sentCount++;
        } catch (err: any) {
          await storage.updateEmailSend(send.id, {
            status: 'failed',
            errorMessage: err.message?.substring(0, 500) || 'Unknown error',
          });
          failedCount++;
        }
      }

      await storage.updateEmailCampaign(campaign.id, { status: 'sent', sentAt: new Date() });
      res.json({ success: true, sent: sentCount, failed: failedCount, campaignId: campaign.id });
    } catch (error: any) {
      console.error("Error sending to selected:", error);
      res.status(500).json({ error: "Failed to send emails" });
    }
  });

  // ===== PUBLIC UNSUBSCRIBE (both /unsubscribe and /api/unsubscribe) =====

  const handleUnsubscribe = async (req: Request, res: Response) => {
    try {
      const { contactId, token } = req.query;
      if (!contactId || !token) {
        return res.status(400).send(unsubscribeHtml("Invalid unsubscribe link.", false));
      }

      const result = verifyUnsubscribeToken(token as string);
      if (!result.valid || result.contactId !== contactId) {
        return res.status(400).send(unsubscribeHtml("This unsubscribe link is invalid or expired.", false));
      }

      const contact = await storage.getContact(contactId as string);
      if (!contact) {
        return res.status(404).send(unsubscribeHtml("Contact not found.", false));
      }

      if (!contact.isSubscribed) {
        return res.send(unsubscribeHtml("You are already unsubscribed from marketing emails.", true));
      }

      await storage.updateContactSubscription(contact.id, false);
      return res.send(unsubscribeHtml("You have been unsubscribed from marketing emails. You will no longer receive promotional emails from StreamStickPro.", true));
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      return res.status(500).send(unsubscribeHtml("An error occurred. Please try again later.", false));
    }
  };

  app.get("/api/unsubscribe", handleUnsubscribe);
  app.get("/unsubscribe", handleUnsubscribe);
}

function unsubscribeHtml(message: string, success: boolean): string {
  const color = success ? '#10b981' : '#ef4444';
  const icon = success ? '&#10003;' : '&#10007;';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribe - StreamStickPro</title>
<style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#111827;color:#f9fafb}
.card{background:#1f2937;border-radius:16px;padding:48px;max-width:480px;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,.25)}
.icon{font-size:48px;color:${color};margin-bottom:16px}
h1{font-size:24px;margin:0 0 16px}
p{color:#9ca3af;line-height:1.6}
a{color:#8b5cf6;text-decoration:none}
</style></head><body>
<div class="card">
<div class="icon">${icon}</div>
<h1>${success ? 'Unsubscribed' : 'Error'}</h1>
<p>${message}</p>
<p style="margin-top:24px"><a href="https://streamstickpro.com">Return to StreamStickPro</a></p>
</div></body></html>`;
}
