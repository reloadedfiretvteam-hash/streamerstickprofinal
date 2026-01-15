# 📧 Email Campaign Automation System

## ✅ What This Does

Automatically sends reminder emails to customers who:
- **Made a purchase** OR
- **Signed up for free trial**

### Email Schedule:
1. **First Week:** 1-2 emails per week (reminders about your website)
2. **After First Week:** Monthly reminders (keeps your website in their mind)

## 🎯 Features

- ✅ **Green Indicator** in Admin Panel - Shows which customers have active email campaigns
- ✅ **Automatic Creation** - Campaigns created when purchase/trial happens
- ✅ **Smart Scheduling** - Sends emails at optimal times
- ✅ **Unsubscribe Support** - Customers can opt out
- ✅ **Email Tracking** - See all emails sent in admin panel

## 🔧 Setup Required

### 1. Run Database Migration

```bash
# The migration file is already created:
# supabase/migrations/20250115000002_create_email_campaigns.sql

# Apply it via Supabase Dashboard or CLI:
supabase migration up
```

### 2. Set Up Cron Job (Cloudflare Workers Cron Triggers)

Add to `wrangler.toml`:

```toml
[triggers]
crons = ["0 */6 * * *"]  # Every 6 hours - check for scheduled emails
```

Or set up in Cloudflare Dashboard:
1. Go to Workers & Pages → Your Worker
2. Settings → Triggers
3. Add Cron Trigger: `0 */6 * * *` (every 6 hours)

### 3. Environment Variables

Already configured! Uses existing:
- `RESEND_API_KEY` - For sending emails
- `RESEND_FROM_EMAIL` - Sender email address

## 📊 How It Works

### When Customer Purchases:
1. Order is completed
2. Email campaign automatically created
3. First email scheduled for 2-3 days later
4. Weekly emails sent (1-2x per week)
5. After 2 weekly emails, switches to monthly

### When Customer Takes Free Trial:
1. Trial signup completed
2. Email campaign automatically created
3. Same schedule as purchases

## 🎨 Admin Panel Features

### Green Indicator
- Customers with active email campaigns show a **green checkmark** ✅
- View campaign status in customer details
- See email history

### Campaign Management
- View all campaigns
- Pause/resume campaigns
- See email send history
- Track open rates (if using Resend analytics)

## 📧 Email Templates

### Weekly Reminder Email:
- Friendly reminder about StreamStickPro
- Highlights key benefits
- Call-to-action to visit website
- Sent 1-2x per week for first week

### Monthly Reminder Email:
- Monthly update about website
- New features/channels
- Special offers
- Keeps brand top-of-mind

## 🔄 Retargeting Pixels

Also added retargeting pixels for visitors:
- **Google Ads Pixel** - Track visitors and show ads
- **Facebook Pixel** - Retarget on Facebook/Instagram

### Setup:
Add to `.env.local`:
```
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=XXXXXXXXX
```

## 🚀 API Endpoints

### Create Campaign (Automatic)
```
POST /api/email-campaigns/create
{
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "campaignType": "purchase" | "free_trial",
  "orderId": "uuid" (optional),
  "trialId": "string" (optional)
}
```

### Process Scheduled Emails (Cron)
```
POST /api/email-campaigns/process-scheduled
```
Called automatically by cron trigger.

### Get Campaign Status
```
GET /api/email-campaigns/status/:email
```

## 📝 Notes

- Emails are sent via Resend (already configured)
- Campaigns are automatically created on purchase/trial
- No manual intervention needed
- Customers can unsubscribe via link in emails
- All emails are logged in database

## ✅ Status

- ✅ Database migration created
- ✅ Email campaign routes created
- ✅ Hooks added to checkout and trial routes
- ✅ Retargeting pixels added
- ⏳ Cron trigger needs to be set up in Cloudflare
- ⏳ Migration needs to be run in Supabase

---

**Last Updated:** 2025-01-15
