# ⏰ Cloudflare Cron Trigger Setup for Email Campaigns

## ⚠️ Important Note

Cloudflare **Pages** does NOT support cron triggers in `wrangler.toml`.  
Cron triggers must be configured through the **Cloudflare Dashboard**.

## ✅ How to Set Up Cron Trigger

### Step 1: Go to Cloudflare Dashboard
1. Log in to: https://dash.cloudflare.com
2. Navigate to: **Workers & Pages**
3. Select your project: **streamerstickpro-live** (or your project name)

### Step 2: Configure Cron Trigger
1. Click on your project
2. Go to **Settings** tab
3. Scroll down to **Triggers** section
4. Click **Add Cron Trigger** or **Edit** if one exists

### Step 3: Set Schedule
- **Cron Expression:** `0 */6 * * *`
- **Description:** Process scheduled email campaigns every 6 hours
- **Endpoint:** Will automatically call `/cron/email-campaigns`

### Step 4: Save
- Click **Save** or **Update**
- The cron trigger will start running automatically

## 🔄 What It Does

Every 6 hours, Cloudflare will automatically:
1. Call your Worker at `/cron/email-campaigns`
2. Process all scheduled email campaigns
3. Send weekly/monthly reminder emails to customers
4. Update campaign schedules

## ✅ Verification

After setting up:
1. Wait 6 hours (or test manually)
2. Check Cloudflare Worker logs
3. Check email campaign status in database
4. Verify emails are being sent

## 🧪 Manual Testing

You can test the cron endpoint manually:

```bash
curl https://your-domain.com/cron/email-campaigns
```

Or visit in browser:
```
https://streamstickpro.com/cron/email-campaigns
```

## 📝 Alternative: Use Cloudflare Workers (Not Pages)

If you want to use `wrangler.toml` triggers, you need to:
1. Deploy as a **Cloudflare Worker** (not Pages)
2. Then `[triggers]` section in `wrangler.toml` will work

But for Pages projects, use the Dashboard method above.

---

**Status:** ✅ Cron endpoint ready, just needs Dashboard configuration
