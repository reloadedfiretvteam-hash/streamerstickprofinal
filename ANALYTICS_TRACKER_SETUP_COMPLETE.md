# 🔴 ANALYTICS TRACKER SETUP - ACTION REQUIRED

Your analytics tracker code is **fully integrated** in the codebase, but you need to complete these 3 steps to make it work:

## ✅ Code Status (Already Done)
- ✅ Tracking hook (`useTrackView`) is integrated in `App.tsx`
- ✅ API route (`/api/track-view`) is registered in `server/routes.ts`
- ✅ Admin dashboard (`AnalyticsAdmin`) exists at `/admin/analytics`
- ✅ Supabase client is configured

## 🔴 REQUIRED SETUP (3 Steps)

### Step 1: Create Supabase Tables (5 minutes)

1. **Go to Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new
   ```

2. **Copy the entire contents of `supabase-analytics-setup.sql`**

3. **Paste into the SQL Editor**

4. **Click "Run" (or press Ctrl+Enter)**

This creates:
- `analytics_page_views` table (aggregated views)
- `analytics_visits` table (individual visits)
- `log_page_view()` function (handles logging)

---

### Step 2: Enable Realtime (2 minutes)

1. **Go to Realtime Settings:**
   ```
   https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/database/replication
   ```

2. **Enable Realtime for these tables:**
   - ✅ `public.analytics_page_views`
   - ✅ `public.analytics_visits`

This allows the admin dashboard to update in real-time.

---

### Step 3: Set Cloudflare Environment Variable (3 minutes)

1. **Go to Cloudflare Dashboard:**
   ```
   https://dash.cloudflare.com
   ```

2. **Navigate to:** Pages → streamerstickprofinal → Settings → Environment Variables

3. **Add/Update this variable:**

   **Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`
   
   **Value:** Get from:
   ```
   https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api
   ```
   - Find "service_role" key
   - Click "Reveal" 
   - Copy the key
   - Paste into Cloudflare

4. **Also verify these exist:**
   - `VITE_SUPABASE_URL` = `https://emlqlmfzqsnqokrqvmcm.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (should already be set)

5. **Redeploy your site** after adding the variable

---

## ✅ Verify It's Working

1. **Visit your site** - tracking should start automatically
2. **Log in to admin:** `https://streamstickpro.com/admin`
3. **Go to analytics:** `https://streamstickpro.com/admin/analytics`
4. **You should see:**
   - Top Pages table
   - Recent Visits table (updates in real-time)

---

## 🐛 Troubleshooting

### "Analytics service not configured" error
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in Cloudflare
- Redeploy after adding the variable

### "Failed to load analytics" in dashboard
- Verify SQL ran successfully (check Supabase SQL Editor history)
- Check that Realtime is enabled for both tables
- Verify `VITE_SUPABASE_ANON_KEY` is set correctly

### No data appearing
- Open browser console (F12) and check for errors
- Verify `/api/track-view` endpoint is accessible
- Check server logs for errors
- Make sure `log_page_view` function exists in Supabase

---

## 📁 Files Involved

- `src/lib/useTrackView.ts` - Frontend tracking hook
- `src/App.tsx` - Uses the tracking hook
- `server/routes-analytics.ts` - API endpoint
- `server/routes.ts` - Registers analytics routes
- `src/pages/AnalyticsAdmin.tsx` - Admin dashboard
- `supabase-analytics-setup.sql` - SQL to run in Supabase

---

**Once you complete these 3 steps, your live visitor tracker will be fully functional!** 🚀

