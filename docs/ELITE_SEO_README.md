# Elite SEO Tools - Complete Guide

This guide provides step-by-step instructions for setting up and using the Elite SEO tools to fix missing blog posts and improve search engine indexability.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Blog View (First Time Only)](#step-1-create-blog-view-first-time-only)
4. [Step 2: Generate Sitemap](#step-2-generate-sitemap)
5. [Step 3: Deploy Sitemap](#step-3-deploy-sitemap)
6. [Step 4: Submit to Search Engines](#step-4-submit-to-search-engines)
7. [RLS Considerations](#rls-considerations)
8. [Security Best Practices](#security-best-practices)
9. [Key Rotation Instructions](#key-rotation-instructions)
10. [Troubleshooting](#troubleshooting)

## Overview

The Elite SEO tools consist of:

- **Resilient Blog Posts Edge Function** (`supabase/functions/blog-posts/index.ts`) - Automatically discovers and reads from multiple possible blog table names
- **Blog View SQL Script** (`scripts/create-blogview.sql`) - Creates a consistent view interface for blog posts
- **Sitemap Generator** (`scripts/generate-sitemap.js`) - Generates sitemap.xml from Supabase blog data
- **Elite SEO Dashboard** (`/elite-seo`) - Web interface for monitoring and managing SEO tools

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** installed (v18 or higher)
2. **Supabase project** set up with a blog posts table
3. **Environment variables** configured:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` or `SUPABASE_ANON_KEY` - Your Supabase key
   - `SITE_BASE_URL` (optional) - Your site's base URL (defaults to https://streamstickpro.com)

### Finding Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy your **Project URL** (SUPABASE_URL)
5. Copy your **anon/public** key (SUPABASE_KEY)

## Step 1: Create Blog View (First Time Only)

If your blog posts table is named `blog_posts` instead of `blogPosts`, you need to create a view for consistent API access.

### 1.1 Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New query**

### 1.2 Run the SQL Script

Copy and paste the contents of `scripts/create-blogview.sql`:

```sql
-- Drop the view if it already exists (makes this script idempotent)
DROP VIEW IF EXISTS public."blogPosts";

-- Create the view only if the blog_posts table exists
CREATE OR REPLACE VIEW public."blogPosts" AS
SELECT * FROM public.blog_posts;

-- Grant appropriate permissions to the view
GRANT SELECT ON public."blogPosts" TO anon;
GRANT SELECT ON public."blogPosts" TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public."blogPosts" IS 'View that maps to blog_posts table for consistent API access';
```

### 1.3 Execute the Script

Click **Run** to execute the SQL script.

### 1.4 Verify the View

Run this query to verify the view was created successfully:

```sql
SELECT * FROM public."blogPosts" LIMIT 5;
```

You should see your blog posts data.

## Step 2: Generate Sitemap

### 2.1 Set Environment Variables

Create a `.env` file in the project root (if it doesn't exist) or set environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SITE_BASE_URL=https://streamstickpro.com
```

**Important:** Never commit `.env` files to version control. The `.env` file is already in `.gitignore`.

### 2.2 Run the Sitemap Generator

Execute the npm script:

```bash
npm run generate-sitemap
```

### 2.3 Verify Output

The script will:
- Discover which blog table exists (tries: blogPosts, blog_posts, blogposts, blogs)
- Fetch all published blog posts (limit 1000)
- Generate `client/public/sitemap.xml`
- Display a summary:

```
📊 Summary:
   Static pages: 3
   Blog posts: 45
   Total URLs: 48
   Output: /path/to/client/public/sitemap.xml

✨ Done! You can now deploy the sitemap to production.
```

### 2.4 Review the Generated Sitemap

Check `client/public/sitemap.xml` to ensure all blog posts are included:

```bash
cat client/public/sitemap.xml | grep "<url>" | wc -l
```

## Step 3: Deploy Sitemap

### 3.1 Commit the Sitemap

```bash
git add client/public/sitemap.xml
git commit -m "Update sitemap with latest blog posts"
```

### 3.2 Push to Repository

```bash
git push origin your-branch-name
```

### 3.3 Deploy to Cloudflare Pages

**Option A: Automatic Deployment**
- If auto-deploy is enabled, Cloudflare Pages will automatically build and deploy when you push to the connected branch

**Option B: Manual Deployment**
1. Go to your [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Select your project
3. Go to **Deployments**
4. Click **Create deployment**
5. Select the branch and deploy

### 3.4 Verify Deployment

Once deployed, verify the sitemap is accessible:

```bash
curl https://streamstickpro.com/sitemap.xml
```

Or visit in your browser: https://streamstickpro.com/sitemap.xml

## Step 4: Submit to Search Engines

### 4.1 Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (or add it if not already added)
3. Navigate to **Sitemaps** in the left sidebar
4. Enter your sitemap URL: `https://streamstickpro.com/sitemap.xml`
5. Click **Submit**

**Quick Ping Method:**
You can also use the Elite SEO dashboard at `/elite-seo` and click the "Ping Google" button.

### 4.2 Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site if not already added
3. Navigate to **Sitemaps**
4. Enter your sitemap URL: `https://streamstickpro.com/sitemap.xml`
5. Click **Submit**

**Quick Ping Method:**
You can also use the Elite SEO dashboard at `/elite-seo` and click the "Ping Bing" button.

### 4.3 robots.txt Verification

Ensure your `robots.txt` file references the sitemap:

```
Sitemap: https://streamstickpro.com/sitemap.xml
```

This is already configured in `client/public/robots.txt`.

## RLS Considerations

Row Level Security (RLS) is Supabase's security feature that controls access to database rows.

### Default Behavior

The blog posts Edge Function attempts to use:
1. `SUPABASE_SERVICE_ROLE_KEY` (if available) - bypasses RLS
2. `SUPABASE_ANON_KEY` (fallback) - subject to RLS policies

### Recommended RLS Policy for Blog Posts

To allow public read access to published blog posts, create this RLS policy:

```sql
-- Enable RLS on the blog_posts table
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to published posts
CREATE POLICY "Public can read published posts"
ON public.blog_posts
FOR SELECT
USING (published = true);
```

### Testing RLS

To test if RLS is working correctly:

1. Use the anon key (not service role key)
2. Try to fetch blog posts:

```bash
curl 'https://your-project.supabase.co/rest/v1/blog_posts?published=eq.true' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Troubleshooting RLS Issues

If blog posts aren't appearing:

1. Check if RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'blog_posts';
   ```

2. List current policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'blog_posts';
   ```

3. Temporarily disable RLS for testing (NOT recommended for production):
   ```sql
   ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;
   ```

## Security Best Practices

### 1. Never Commit Secrets

- **DO NOT** commit `.env` files
- **DO NOT** hardcode API keys in code
- **DO NOT** commit `SUPABASE_SERVICE_ROLE_KEY` to Git

### 2. Use Environment Variables

Store all secrets in environment variables:
- Locally: `.env` file (gitignored)
- Production: Cloudflare Pages environment variables

### 3. Use Anon Key When Possible

The anon key is safe to use in public-facing code because it's subject to RLS policies. Use the service role key only when necessary and only in secure environments (server-side, Edge Functions).

### 4. Rotate Keys Regularly

See [Key Rotation Instructions](#key-rotation-instructions) below.

### 5. Set Up Proper RLS Policies

Always enable RLS on tables with sensitive data and create appropriate policies.

## Key Rotation Instructions

### When to Rotate Keys

- Suspected key compromise
- Employee/contractor offboarding
- Regular security maintenance (quarterly recommended)
- After a security incident

### How to Rotate Supabase Keys

#### 1. Generate New Keys in Supabase

**For Project API Keys:**
1. Go to Supabase Dashboard → Settings → API
2. Note: Supabase doesn't currently support rotating the anon key without creating a new project
3. For service role key rotation, contact Supabase support

**For Custom Service Keys:**
If you're using custom service keys, you can generate new ones and update your Edge Functions.

#### 2. Update Environment Variables

**Local Development:**
```bash
# Update .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=new-anon-key
SUPABASE_ANON_KEY=new-anon-key
SUPABASE_SERVICE_ROLE_KEY=new-service-role-key
```

**Cloudflare Pages:**
1. Go to Cloudflare Dashboard → Pages
2. Select your project
3. Go to **Settings** → **Environment variables**
4. Update the following variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (if used)
5. Redeploy your application

**Supabase Edge Functions:**
```bash
# Set secrets for Edge Functions
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=new-service-role-key
```

#### 3. Update and Redeploy

1. Update all environments (dev, staging, production)
2. Redeploy Edge Functions:
   ```bash
   supabase functions deploy blog-posts
   ```
3. Redeploy your main application
4. Verify all services are working

#### 4. Revoke Old Keys

Once new keys are deployed and verified:
1. Revoke or delete old keys from Supabase
2. Update any documentation or team knowledge bases
3. Notify team members of the change

#### 5. Test Thoroughly

- Test blog posts loading
- Test sitemap generation
- Test Edge Function responses
- Verify search engine crawlers can access sitemap

## Troubleshooting

### Issue: "No blog table found" Error

**Cause:** The Edge Function or sitemap generator can't find any blog table.

**Solution:**
1. Verify your table exists in Supabase:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE '%blog%';
   ```
2. Ensure the table is named one of: `blogPosts`, `blog_posts`, `blogposts`, or `blogs`
3. Check RLS policies (see [RLS Considerations](#rls-considerations))

### Issue: Sitemap Generation Fails

**Cause:** Missing environment variables or connection issues.

**Solution:**
1. Verify environment variables are set:
   ```bash
   echo $SUPABASE_URL
   echo $SUPABASE_KEY
   ```
2. Check network connectivity to Supabase
3. Verify API key has correct permissions
4. Run with debug output:
   ```bash
   NODE_DEBUG=* npm run generate-sitemap
   ```

### Issue: Blog Posts Not Appearing in Sitemap

**Cause:** Posts may not have `published = true` or missing slug/id field.

**Solution:**
1. Check post status in database:
   ```sql
   SELECT id, title, slug, published 
   FROM blog_posts 
   WHERE published = true;
   ```
2. Ensure posts have a `slug` field or `id` field
3. Verify `published` column exists and is set to `true`

### Issue: Search Engines Not Indexing

**Cause:** Various SEO-related issues.

**Solution:**
1. Verify sitemap is accessible: https://streamstickpro.com/sitemap.xml
2. Check robots.txt allows crawling:
   ```
   User-agent: *
   Allow: /
   ```
3. Submit sitemap to Google Search Console and Bing Webmaster Tools
4. Check for crawl errors in search console
5. Ensure proper meta tags are present on pages
6. Wait 24-48 hours for indexing (search engines aren't instant)

### Issue: RLS Permission Denied

**Cause:** Row Level Security blocking access.

**Solution:**
1. Check if RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE tablename = 'blog_posts';
   ```
2. Create or update RLS policy (see [RLS Considerations](#rls-considerations))
3. Use service role key for Edge Functions (already configured)

### Issue: Edge Function Timeout

**Cause:** Large number of blog posts or slow query.

**Solution:**
1. The function already limits to 1000 posts
2. Add indexes to improve query performance:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_blog_posts_published 
   ON blog_posts(published);
   ```
3. Consider pagination for large datasets

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Google Search Console Help](https://support.google.com/webmasters)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmasters-guidelines-30fba23a)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)

## Support

For issues or questions:
1. Check this documentation
2. Review the [Troubleshooting](#troubleshooting) section
3. Check Supabase logs for Edge Function errors
4. Review Cloudflare Pages deployment logs
5. Contact your development team

---

**Last Updated:** December 2025
**Version:** 1.0.0
