# ✅ Service Key Updated & Migration Ready

## 🔑 Service Key Configuration

Your Supabase service key should be set in Cloudflare environment variables.

**⚠️ SECURITY: Never commit service keys to git!**

To get your service key:
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api
2. Copy the "service_role" key (starts with `eyJ...`)
3. Add it to Cloudflare as `SUPABASE_SERVICE_KEY` environment variable

## ✅ What's Been Updated

1. ✅ Service key verified and working
2. ✅ Migration file ready to run
3. ✅ Email campaign system code deployed
4. ✅ Retargeting pixels added

## 🚀 Next Steps

### 1. Run Database Migration (REQUIRED)

**Option A: Supabase Dashboard (Easiest)**

1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new
2. Open file: `supabase/migrations/20250115000002_create_email_campaigns.sql`
3. Copy ALL contents
4. Paste into Supabase SQL Editor
5. Click "Run"
6. Wait for success ✅

**Option B: Use the formatted output**

Run this command to get formatted SQL:
```bash
node format-migration-for-supabase.js
```

### 2. Update Cloudflare Environment Variables

Add to Cloudflare Pages/Workers environment variables:

- **Variable:** `SUPABASE_SERVICE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg4NDQ5MiwiZXhwIjoyMDc5NDYwNDkyfQ.m3xw006mSdP1DeunLo4CoNDonIIXkQSt353VL-ibb0c`
- **Type:** Secret

### 3. Activate Cron Trigger

In Cloudflare Dashboard:
- Workers & Pages → Your Worker → Settings → Triggers
- Add Cron: `0 */6 * * *` (every 6 hours)

## ✅ After Migration

Once migration is complete:

1. **Email campaigns will automatically start** for new purchases/trials
2. **Green indicators** will show in admin panel for customers with campaigns
3. **Emails will send** on schedule (weekly then monthly)
4. **Retargeting pixels** will track visitors

## 🎯 What Gets Created

- `email_campaigns` table - Tracks all customer campaigns
- `email_sends` table - History of all emails sent
- Automatic campaign creation on purchase/trial
- Email scheduling system
- Unsubscribe support

## 📊 Status

- ✅ Code deployed to GitHub
- ✅ Service key verified
- ⏳ Migration ready to run (manual step required)
- ⏳ Cron trigger needs activation

---

**Ready to go! Just run the migration and activate the cron trigger.** 🚀
