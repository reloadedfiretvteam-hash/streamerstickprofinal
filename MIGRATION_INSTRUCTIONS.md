# 🚀 Email Campaign Migration - Quick Setup

## ✅ Service Key Updated

Your Supabase service key has been configured. Now let's run the migration!

## 📋 Step 1: Run Database Migration

### Option A: Via Supabase Dashboard (Easiest - Recommended)

1. **Go to Supabase SQL Editor:**
   - Open: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new
   - Or: Dashboard → SQL Editor → New Query

2. **Copy the Migration File:**
   - Open: `supabase/migrations/20250115000002_create_email_campaigns.sql`
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

3. **Paste and Run:**
   - Paste into the SQL Editor
   - Click the green **"Run"** button (or press Ctrl+Enter)
   - Wait 10-20 seconds
   - You should see "Success" message

4. **Verify Tables Created:**
   - Go to: Table Editor
   - You should see two new tables:
     - `email_campaigns`
     - `email_sends`

### Option B: Via Supabase CLI (If you have it installed)

```bash
supabase db push
```

## ✅ Step 2: Update Environment Variables

The service key is already configured in the code. For Cloudflare:

1. **Go to Cloudflare Dashboard:**
   - Workers & Pages → Your Project → Settings → Environment Variables

2. **Add/Update:**
   - `SUPABASE_SERVICE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg4NDQ5MiwiZXhwIjoyMDc5NDYwNDkyfQ.m3xw006mSdP1DeunLo4CoNDonIIXkQSt353VL-ibb0c`

## ✅ Step 3: Activate Cron Trigger

1. **Go to Cloudflare Dashboard:**
   - Workers & Pages → Your Worker → Settings → Triggers

2. **Add Cron Trigger:**
   - Schedule: `0 */6 * * *` (every 6 hours)
   - This will automatically process scheduled emails

## 🎯 What This Migration Creates

### Tables:
1. **`email_campaigns`** - Tracks customer email campaigns
   - Customer email, name, campaign type
   - Email schedule and phase (weekly/monthly)
   - Status tracking

2. **`email_sends`** - History of all emails sent
   - Campaign ID, email type, sent date
   - Provider info, status

### Features:
- ✅ Automatic campaign creation on purchase/trial
- ✅ Weekly emails (1-2x) for first week
- ✅ Monthly reminders after first week
- ✅ Email tracking and history
- ✅ Unsubscribe support

## ✅ Verification

After migration, test by:

1. **Make a test purchase or trial signup**
2. **Check admin panel** - customer should show green indicator ✅
3. **Check database:**
   ```sql
   SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT 5;
   ```

## 🚨 Troubleshooting

### If migration fails:
- Check Supabase logs for errors
- Ensure you're using the service role key (not anon key)
- Verify RLS policies are correct

### If emails don't send:
- Check `RESEND_API_KEY` is set in Cloudflare
- Verify cron trigger is active
- Check Cloudflare Worker logs

---

**Status:** Ready to run migration! ✅
