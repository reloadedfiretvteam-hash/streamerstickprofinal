# Elite SEO & Blog Integration Guide

This guide provides step-by-step instructions for deploying and managing the SEO tools and blog functionality for StreamStickPro.

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Generating the Sitemap](#generating-the-sitemap)
4. [Deploying to Cloudflare Pages](#deploying-to-cloudflare-pages)
5. [Submitting to Search Engines](#submitting-to-search-engines)
6. [Security: Rotating Keys](#security-rotating-keys)
7. [Using the Elite SEO Page](#using-the-elite-seo-page)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This implementation adds the following features:

- **Resilient Blog Posts API**: Supabase Edge Function that tries multiple table name variations (blogPosts, blog_posts, etc.)
- **SQL Migration Script**: Creates a database view to map snake_case to camelCase table names
- **Sitemap Generator**: Node.js script to generate `public/sitemap.xml` from blog posts
- **Elite SEO Page**: React-based dashboard to monitor SEO files and submit to search engines
- **Navigation Component**: Ready-to-use nav link for the Elite SEO page

### Why These Changes?

**Common Problem**: Database tables are often created with snake_case names (`blog_posts`) while application code expects camelCase (`blogPosts`). This causes "table not found" errors.

**Solution**: The Edge Function now tries multiple table name variations automatically, and we provide a SQL view to create the mapping at the database level.

---

## Database Setup

### Option A: Using the SQL View (Recommended)

If your blog table is named `blog_posts` (snake_case) but your application expects `blogPosts` (camelCase), run the SQL view creation script:

**Steps:**

1. **Open Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Go to **SQL Editor** (left sidebar)

2. **Run the SQL Script**
   - Open the file `scripts/create-blogview.sql` in your code editor
   - Copy the entire contents
   - Paste into the Supabase SQL Editor
   - Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

3. **Verify the View**
   Run this verification query:
   ```sql
   SELECT * FROM public."blogPosts" LIMIT 10;
   ```
   
   You should see your blog posts. If you get an error, check that the `blog_posts` table exists.

4. **Check Permissions**
   The script grants SELECT permissions to `anon` and `authenticated` roles. If you need different permissions, modify the GRANT statements in the SQL file.

### Option B: Rename Your Table (Alternative)

If you prefer to rename your table to match the application code:

```sql
ALTER TABLE public.blog_posts RENAME TO "blogPosts";
```

⚠️ **Warning**: This may break existing queries that reference `blog_posts`. Test thoroughly.

### Required Table Schema

Your blog posts table should have at least these columns:

- `id` - Unique identifier (text or uuid)
- `title` - Post title (text)
- `slug` - URL-friendly slug (text)
- `published` - Boolean flag (boolean)
- `date` - Publication date (timestamp or date)
- `updated_at` - Last update timestamp (optional, timestamp)

Example table creation (if starting from scratch):

```sql
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  category text,
  published boolean DEFAULT false,
  date timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create the camelCase view
CREATE OR REPLACE VIEW public."blogPosts" AS
SELECT * FROM public.blog_posts;

-- Grant permissions
GRANT SELECT ON public."blogPosts" TO anon;
GRANT SELECT ON public."blogPosts" TO authenticated;
```

---

## Generating the Sitemap

The sitemap generator creates an XML file listing all your published blog posts for search engines.

### Prerequisites

Ensure you have these environment variables set:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Service role key or anon key (service role recommended)
- `SITE_BASE_URL` - Your site's base URL (e.g., `https://streamstickpro.com`)

### Running Locally

**Option 1: With .env file**

Create a `.env.local` file:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key-here
SITE_BASE_URL=https://streamstickpro.com
```

Then run:

```bash
npm run generate-sitemap
```

**Option 2: Inline environment variables**

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_KEY=your-service-role-key \
SITE_BASE_URL=https://streamstickpro.com \
npm run generate-sitemap
```

### Output

The script will:

1. Search for your blog table (tries: blogPosts, blog_posts, blogposts, blogs)
2. Fetch all published posts
3. Generate `public/sitemap.xml` with:
   - Homepage (/)
   - Blog index (/blog)
   - Individual blog posts (/blog/:slug)
4. Display a summary with URL count and next steps

### Example Output

```
🚀 Starting sitemap generation...

📍 Site base URL: https://streamstickpro.com
🔗 Supabase URL: https://your-project.supabase.co

🔍 Searching for blog posts table...
✅ Found blog table: "blogPosts"
📥 Fetching published posts from "blogPosts"...
📊 Found 42 published blog posts

✅ Sitemap generated successfully!
📄 Location: /path/to/public/sitemap.xml
📏 Size: 4.32 KB
🔗 URLs included: 44 (homepage + blog index + 42 posts)

📤 Next steps:
   1. Commit public/sitemap.xml to your repository
   2. Deploy to Cloudflare Pages (automatic on push)
   3. Verify at: https://streamstickpro.com/sitemap.xml
   4. Submit to search engines (see docs/ELITE_SEO_README.md)
```

### Committing the Sitemap

After generating the sitemap:

```bash
git add public/sitemap.xml
git commit -m "Add generated sitemap.xml"
git push
```

This will trigger an automatic deployment to Cloudflare Pages.

---

## Deploying to Cloudflare Pages

Cloudflare Pages automatically deploys your site when you push to your repository.

### Deployment Process

1. **Push Your Changes**
   ```bash
   git push origin main
   ```

2. **Monitor Deployment**
   - Go to Cloudflare Dashboard → Pages
   - Select your project (streamerstickpro)
   - View the latest deployment status

3. **Verify Deployment**
   Once deployed, verify the sitemap is accessible:
   ```
   https://streamstickpro.com/sitemap.xml
   ```

### Environment Variables in Cloudflare

For the Edge Functions to work, ensure these environment variables are set in Cloudflare Pages:

**Settings → Environment Variables**

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (or `SUPABASE_ANON_KEY` as fallback)

### Updating the Sitemap

**Option A: Manual Updates**

Run the generator locally whenever you publish new blog posts:

```bash
npm run generate-sitemap
git add public/sitemap.xml
git commit -m "Update sitemap with latest posts"
git push
```

**Option B: Automated CI/CD (Recommended)**

Add a GitHub Action to regenerate the sitemap automatically:

Create `.github/workflows/update-sitemap.yml`:

```yaml
name: Update Sitemap

on:
  # Run when changes are pushed to main
  push:
    branches: [main]
    paths:
      - 'scripts/generate-sitemap.js'
  
  # Run on a schedule (every day at 3 AM UTC)
  schedule:
    - cron: '0 3 * * *'
  
  # Allow manual triggering
  workflow_dispatch:

jobs:
  update-sitemap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install @supabase/supabase-js
      
      - name: Generate sitemap
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          SITE_BASE_URL: https://streamstickpro.com
        run: npm run generate-sitemap
      
      - name: Commit and push if changed
        run: |
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add public/sitemap.xml
          git diff --staged --quiet || git commit -m "Auto-update sitemap [skip ci]"
          git push
```

**Note**: Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to your GitHub repository secrets (Settings → Secrets and variables → Actions).

---

## Submitting to Search Engines

After deploying your sitemap, submit it to search engines for indexing.

### Using the Elite SEO Page

1. Navigate to `https://streamstickpro.com/elite-seo` in your browser
2. The page will automatically check if `sitemap.xml` and `robots.txt` exist
3. Use the "Search Engine Submission" section to:
   - **Ping Bing**: Automatically notifies Bing of your sitemap
   - **Open Google Console**: Opens Google Search Console for manual submission

### Manual Submission

#### Google Search Console

1. **Verify Your Site** (one-time setup)
   - Go to https://search.google.com/search-console
   - Click "Add Property"
   - Choose "URL prefix" and enter `https://streamstickpro.com`
   - Verify ownership using one of the methods (DNS, HTML file, etc.)

2. **Submit Sitemap**
   - In Google Search Console, go to **Sitemaps** (left sidebar)
   - Enter `sitemap.xml` in the "Add a new sitemap" field
   - Click **Submit**

3. **Monitor Indexing**
   - Check the "Coverage" report to see which pages are indexed
   - Google typically takes 1-7 days to crawl new content

#### Bing Webmaster Tools

1. **Add Your Site** (one-time setup)
   - Go to https://www.bing.com/webmasters
   - Click "Add a Site"
   - Enter `https://streamstickpro.com`
   - Verify ownership (can import from Google Search Console)

2. **Submit Sitemap**
   - Go to **Sitemaps** section
   - Enter `https://streamstickpro.com/sitemap.xml`
   - Click **Submit**

**Quick Ping (Alternative)**:
   
Visit this URL to ping Bing directly:
```
https://www.bing.com/webmasters/ping.aspx?siteMap=https://streamstickpro.com/sitemap.xml
```

### Robots.txt

Ensure your `public/robots.txt` file references the sitemap:

```txt
User-agent: *
Allow: /

# Sitemap
Sitemap: https://streamstickpro.com/sitemap.xml
```

If this file doesn't exist, create it in the `public/` directory.

---

## Security: Rotating Keys

After running database scripts with service role keys, it's important to rotate your keys for security.

### When to Rotate

- After running the SQL view creation script
- If a service role key is accidentally exposed
- Periodically (every 90 days recommended)

### How to Rotate Supabase Keys

1. **Generate New Service Role Key**
   - Go to Supabase Dashboard → Settings → API
   - Find "Service role" section
   - Click "Reset" or "Generate new key"
   - Copy the new key immediately (it won't be shown again)

2. **Update Environment Variables**
   
   **In Cloudflare Pages:**
   - Go to Cloudflare Dashboard → Pages → Your Project
   - Settings → Environment Variables
   - Edit `SUPABASE_SERVICE_ROLE_KEY`
   - Paste the new key
   - Save and redeploy
   
   **In Your Local .env:**
   - Update `SUPABASE_SERVICE_KEY` with the new value
   - Never commit this file to version control

3. **Update GitHub Secrets** (if using CI/CD)
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Update `SUPABASE_SERVICE_ROLE_KEY`

4. **Test**
   - Verify your Edge Functions still work
   - Run the sitemap generator locally to ensure it connects

### Anon Key vs Service Role Key

- **Anon Key**: Safe to expose in frontend code, limited permissions
- **Service Role Key**: Full database access, must be kept secret

The blog-posts Edge Function will use the service role key if available, but falls back to the anon key. For production, always use the service role key for Edge Functions.

---

## Using the Elite SEO Page

The Elite SEO page provides a dashboard for monitoring and managing your SEO assets.

### Accessing the Page

Navigate to: `https://streamstickpro.com/elite-seo`

### Features

**1. SEO Files Status**
- Checks if `sitemap.xml` exists and is accessible
- Checks if `robots.txt` exists and is accessible
- Displays current URLs for both files
- Refresh button to re-check status

**2. Search Engine Submission**
- **Ping Bing**: Opens Bing's ping service to notify them of your sitemap
- **Open Google Console**: Direct link to Google Search Console

**3. SEO Metadata**
- Displays JSON-LD structured data for your site
- Shows essential meta tags
- Copy buttons for easy reuse

### Adding to Navigation

The `NavEliteSEO` component is available for easy navigation integration.

**Option 1: Admin Panel**

In your admin panel navigation (e.g., `AdminPanel.tsx`):

```tsx
import { NavEliteSEO } from "@/components/NavEliteSEO";

// In your admin nav JSX:
<nav>
  {/* Other admin nav items */}
  <NavEliteSEO />
</nav>
```

**Option 2: Main Navigation (Admin Only)**

In your main navigation component:

```tsx
import { NavEliteSEO } from "@/components/NavEliteSEO";

// Show only to admin users
{user?.isAdmin && <NavEliteSEO />}
```

**Option 3: Direct Access**

Users can directly navigate to `/elite-seo` - no navigation link needed.

---

## Troubleshooting

### "Blog posts table not found" Error

**Symptoms**: The Edge Function returns a 404 with `checked_tables` in the response.

**Solutions**:

1. **Check Table Name**
   - Go to Supabase Dashboard → Table Editor
   - Verify your blog table exists and note its exact name
   - If it's `blog_posts`, run the SQL view script (`scripts/create-blogview.sql`)

2. **Check Permissions**
   - The table or view must be accessible by the service role or anon key
   - Run: `GRANT SELECT ON public."blogPosts" TO anon;`

3. **Check Published Column**
   - Ensure your table has a `published` boolean column
   - Test query: `SELECT * FROM blog_posts WHERE published = true;`

### Sitemap Generator Fails

**Symptoms**: `npm run generate-sitemap` exits with errors.

**Solutions**:

1. **Missing Environment Variables**
   ```
   Error: Missing required environment variables
   ```
   Set `SUPABASE_URL` and `SUPABASE_KEY`:
   ```bash
   export SUPABASE_URL=https://your-project.supabase.co
   export SUPABASE_KEY=your-key-here
   ```

2. **Table Not Found**
   ```
   Error: Could not find blog posts table
   ```
   - Run the SQL view script
   - Or ensure your table is named one of: blogPosts, blog_posts, blogposts, blogs

3. **Permission Denied**
   ```
   Error fetching blog posts: permission denied
   ```
   - Use the service role key instead of anon key
   - Or grant SELECT permissions to the anon role

### Sitemap Not Accessible After Deploy

**Symptoms**: Visiting `/sitemap.xml` returns 404.

**Solutions**:

1. **Check File Exists in Repository**
   ```bash
   ls -la public/sitemap.xml
   git status
   ```
   Ensure the file is committed and pushed.

2. **Check Cloudflare Build Output**
   - Go to Cloudflare Dashboard → Pages → Your Project → Deployments
   - Click on the latest deployment
   - Check build logs to ensure `public/` directory is included

3. **Clear Cloudflare Cache**
   - Go to Cloudflare Dashboard → Cache → Purge Everything
   - Wait a few minutes and try again

### Elite SEO Page Shows "Not Found"

**Symptoms**: Navigating to `/elite-seo` shows a 404 or NotFound page.

**Solutions**:

1. **Route Not Added**
   - Check `client/src/App.tsx`
   - Ensure the route is added: `<Route path="/elite-seo" component={EliteSEO} />`

2. **Component Not Imported**
   - Check the imports at the top of `App.tsx`
   - Ensure: `import EliteSEO from "@/pages/EliteSEO";`

3. **Build Not Updated**
   - Run `npm run build` locally
   - Push changes and redeploy

### Edge Function Returns Errors

**Symptoms**: Blog posts don't load on the website.

**Solutions**:

1. **Check Supabase Logs**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for errors in the `blog-posts` function

2. **Test Edge Function Directly**
   ```bash
   curl https://your-project.supabase.co/functions/v1/blog-posts
   ```
   Check the response for error details.

3. **Environment Variables Not Set**
   - Go to Supabase Dashboard → Edge Functions → Settings
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

---

## Additional Resources

### Files Modified/Created

- ✏️ Modified: `supabase/functions/blog-posts/index.ts` - Added table fallback logic
- ✏️ Modified: `supabase/functions/products/index.ts` - Added anon key fallback
- ✏️ Modified: `package.json` - Added generate-sitemap script
- ✏️ Modified: `client/src/App.tsx` - Added EliteSEO route
- ➕ Created: `scripts/create-blogview.sql` - SQL view migration
- ➕ Created: `scripts/generate-sitemap.js` - Sitemap generator
- ➕ Created: `client/src/pages/EliteSEO.tsx` - SEO dashboard page
- ➕ Created: `client/src/components/NavEliteSEO.tsx` - Navigation component
- ➕ Created: `docs/ELITE_SEO_README.md` - This documentation

### Related Documentation

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Search Console Help](https://support.google.com/webmasters)
- [Bing Webmaster Tools Help](https://www.bing.com/webmasters/help/)

### Support

For issues specific to this implementation:
1. Check the troubleshooting section above
2. Review the Edge Function logs in Supabase Dashboard
3. Test the sitemap generator locally with verbose logging

---

**Last Updated**: December 2025  
**Version**: 1.0.0
