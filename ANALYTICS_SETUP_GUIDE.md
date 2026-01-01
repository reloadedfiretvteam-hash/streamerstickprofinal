# Supabase Analytics Setup Guide

This guide will help you set up the Supabase-powered analytics system for tracking page views and live visitor data.

## Prerequisites

- A Supabase project (create one at https://supabase.com)
- Your Supabase project URL and API keys

## Step 1: Set Up Supabase Database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase-analytics-setup.sql`
4. Click **Run** to execute the SQL

This will create:
- `analytics_page_views` table (aggregated page view counts)
- `analytics_visits` table (individual visit records)
- `log_page_view()` function (handles both tables in one call)

## Step 2: Enable Realtime

1. In Supabase Dashboard, go to **Database → Replication → Realtime**
2. Enable Realtime for:
   - `public.analytics_page_views`
   - `public.analytics_visits`

This allows your admin dashboard to receive live updates when new visits are logged.

## Step 3: Configure Environment Variables

Add these to your `.env` file and Cloudflare/GitHub secrets:

```env
# Public Supabase URL (used in browser for realtime subscriptions)
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co

# Public Supabase Anon Key (used in browser)
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY

# Service Role Key (SERVER-ONLY, never expose to client)
# Used by the API route to call log_page_view
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY
```

**Important Security Notes:**
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS)
- **Never** expose it to client-side code
- Only use it in server-side API routes
- Add it to Cloudflare environment variables, not in your frontend code

## Step 4: Access the Analytics Dashboard

Once everything is configured:

1. Log in to your admin panel at `/admin`
2. Navigate to `/admin/analytics` or click the Analytics link in your admin dashboard
3. You should see:
   - **Top Pages**: Pages sorted by view count
   - **Recent Visits**: Live feed of visitor activity

The dashboard updates in real-time as visitors browse your site!

## How It Works

1. **Frontend Tracking**: The `useTrackView()` hook in `App.tsx` automatically tracks every page view
2. **API Route**: `/api/track-view` receives tracking data and calls the Supabase function
3. **Database**: Supabase stores aggregated views and individual visits
4. **Realtime**: The admin dashboard subscribes to changes and updates live

## Troubleshooting

### "Analytics service not configured"
- Check that `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Restart your server after adding environment variables

### "Failed to load analytics" in dashboard
- Verify the SQL setup ran successfully
- Check that Realtime is enabled for both tables
- Ensure `VITE_SUPABASE_ANON_KEY` is set correctly

### No data appearing
- Check browser console for errors
- Verify the `/api/track-view` endpoint is working (check server logs)
- Ensure the `log_page_view` function exists in Supabase

## Files Created

- `src/lib/useTrackView.ts` - Frontend tracking hook
- `server/routes-analytics.ts` - API route for tracking
- `src/pages/AnalyticsAdmin.tsx` - Admin dashboard component
- `supabase-analytics-setup.sql` - Database setup SQL

## Next Steps

- Customize the analytics dashboard styling
- Add more metrics (time on page, bounce rate, etc.)
- Set up automated reports
- Integrate with other analytics tools

