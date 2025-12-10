# Elite SEO Tools - Complete Guide

This guide provides step-by-step instructions for setting up SEO tools, generating sitemaps, and ensuring your blog posts are indexable by search engines.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Blog View (SQL)](#step-1-create-blog-view-sql)
4. [Step 2: Generate Sitemap](#step-2-generate-sitemap)
5. [Step 3: Deploy to Cloudflare Pages](#step-3-deploy-to-cloudflare-pages)
6. [Step 4: Submit to Search Engines](#step-4-submit-to-search-engines)
7. [Row Level Security (RLS)](#row-level-security-rls)
8. [Key Rotation and Security](#key-rotation-and-security)
9. [Troubleshooting](#troubleshooting)
10. [Automation with CI/CD](#automation-with-cicd)

## Overview

The Elite SEO toolkit includes:

- **Resilient Blog Posts Edge Function**: Automatically tries multiple table name variations (blogPosts, blog_posts, blogposts, blogs)
- **SQL View Creation Script**: Creates a camelCase view for database tables using snake_case naming
- **Sitemap Generator**: Node.js script that discovers blog tables and generates XML sitemap
- **Elite SEO Dashboard**: React-based UI for managing SEO tasks, checking sitemap status, and submitting to search engines

## Prerequisites

- Access to Supabase project (SQL Editor and API credentials)
- Node.js installed locally (v18 or later)
- Environment variables: `SUPABASE_URL`, `SUPABASE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`)
- Optional: `SITE_BASE_URL` (defaults to https://streamstickpro.com)

## Step 1: Create Blog View (SQL)

If your blog table uses snake_case naming (e.g., `blog_posts`) but your application expects camelCase (`blogPosts`), create a database view.

### Instructions:

1. Open Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql
2. Paste the contents of `scripts/create-blogview.sql`
3. Run the SQL script

### What this does:

- Creates a view `public."blogPosts"` that maps to `public.blog_posts`
- Grants appropriate SELECT permissions to `authenticated` and `anon` roles
- Script is idempotent (safe to run multiple times)

### SQL Script Location:

```
scripts/create-blogview.sql
```

### Manual SQL (if needed):

```sql
-- Drop view if exists
DROP VIEW IF EXISTS public."blogPosts";

-- Create view
CREATE VIEW public."blogPosts" AS 
SELECT * FROM public.blog_posts;

-- Grant permissions
GRANT SELECT ON public."blogPosts" TO authenticated;
GRANT SELECT ON public."blogPosts" TO anon;
```

## Step 2: Generate Sitemap

The sitemap generator script discovers your blog table automatically and creates a sitemap.xml file.

### Instructions:

1. **Set environment variables** (locally or in CI):

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-service-role-key-or-anon-key"
export SITE_BASE_URL="https://streamstickpro.com"  # Optional
```

2. **Run the generator**:

```bash
npm run generate-sitemap
```

3. **Verify output**:

The script will:
- Try table names: blogPosts, blog_posts, blogposts, blogs
- Fetch all published posts
- Generate `client/public/sitemap.xml`
- Display a summary with statistics

### Example Output:

```
🚀 Sitemap Generator
==================
📍 Supabase URL: https://xxx.supabase.co
🌐 Site Base URL: https://streamstickpro.com

📥 Fetching blog posts...
🔍 Trying table: blogPosts...
✅ Found 45 published posts in table: blogPosts

📝 Generating sitemap...

✅ Sitemap generated successfully!
================================
📊 Statistics:
   - Blog table: blogPosts
   - Blog posts: 45
   - Static pages: 3
   - Total URLs: 48
📄 Output: /path/to/client/public/sitemap.xml

📌 Next steps:
   1. Commit and push the sitemap.xml file
   2. Deploy to Cloudflare Pages (automatic on push)
   3. Submit sitemap to search engines
   4. Verify sitemap is accessible: https://streamstickpro.com/sitemap.xml
```

### What gets included in the sitemap:

- **Static pages**: Home, Blog, Checkout
- **Blog posts**: All published posts from database
- **Metadata**: Last modified date, change frequency, priority

### Sitemap structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://streamstickpro.com/</loc>
    <lastmod>2025-12-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://streamstickpro.com/blog/your-post-slug</loc>
    <lastmod>2025-12-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  ...
</urlset>
```

## Step 3: Deploy to Cloudflare Pages

### Automatic Deployment:

1. **Commit the sitemap**:

```bash
git add client/public/sitemap.xml
git commit -m "Update sitemap.xml with latest blog posts"
git push
```

2. **Cloudflare Pages automatically deploys** when changes are pushed to the main branch

3. **Verify deployment**:
   - Check Cloudflare Pages dashboard for deployment status
   - Visit: https://streamstickpro.com/sitemap.xml

### Manual Verification:

```bash
curl -I https://streamstickpro.com/sitemap.xml
# Should return: 200 OK
```

## Step 4: Submit to Search Engines

### Option 1: Use Elite SEO Dashboard

1. Navigate to: `/elite-seo` on your site
2. Click the **"Submit to Engines"** tab
3. Use the **Ping Google** and **Ping Bing** buttons

### Option 2: Manual Submission

#### Google Search Console:

1. Visit: https://search.google.com/search-console
2. Select your property (or add it if needed)
3. Go to **Sitemaps** section
4. Enter: `sitemap.xml`
5. Click **Submit**

#### Bing Webmaster Tools:

1. Visit: https://www.bing.com/webmasters
2. Add your site if not already added
3. Go to **Sitemaps** section
4. Enter: `https://streamstickpro.com/sitemap.xml`
5. Click **Submit**

### Option 3: Ping URLs (Programmatic)

```bash
# Ping Google
curl "https://www.google.com/ping?sitemap=https://streamstickpro.com/sitemap.xml"

# Ping Bing
curl "https://www.bing.com/ping?sitemap=https://streamstickpro.com/sitemap.xml"
```

## Row Level Security (RLS)

### Understanding RLS with Blog Posts

Supabase Row Level Security (RLS) controls who can access your data. For blog posts to be publicly readable:

1. **Check RLS status**:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('blog_posts', 'blogPosts');
```

2. **Enable RLS** (if disabled):

```sql
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
```

3. **Create policy for public read access**:

```sql
-- Allow anonymous users to read published posts
CREATE POLICY "Public can read published posts" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);

-- Allow authenticated users to read all posts
CREATE POLICY "Authenticated can read all posts" 
ON public.blog_posts 
FOR SELECT 
TO authenticated 
USING (true);
```

4. **For views** (blogPosts view):

Views inherit the RLS policies from the underlying table. The view permissions granted in Step 1 are sufficient.

### Testing RLS:

```javascript
// Test with anon key (should only see published posts)
const { data, error } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('published', true);

// Test with service_role key (should see all posts)
// Only use service_role in secure server environments
```

## Key Rotation and Security

### Security Best Practices:

1. **Never commit secrets** to the repository
2. **Use service_role key** only in secure server environments (CI/CD, backend)
3. **Use anon key** for client-side applications
4. **Rotate keys** after using service_role in CI/CD pipelines

### Environment Variable Security:

✅ **Safe for scripts** (non-VITE prefixed):
```bash
SUPABASE_URL=xxx
SUPABASE_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

❌ **NEVER use in scripts** (these are exposed in frontend bundles):
```bash
VITE_SUPABASE_URL=xxx  # Exposed in client bundle!
VITE_SUPABASE_ANON_KEY=xxx  # OK for frontend, NOT for scripts
```

### Key Rotation Steps:

1. **Generate new service_role key** in Supabase dashboard:
   - Settings → API → Service role key → Regenerate

2. **Update CI/CD secrets**:
   - GitHub Secrets: Settings → Secrets → Actions
   - Update `SUPABASE_SERVICE_ROLE_KEY`

3. **Update local environment**:
   ```bash
   # Update .env.local or equivalent
   SUPABASE_SERVICE_ROLE_KEY=new_key_here
   ```

4. **Test with new key**:
   ```bash
   npm run generate-sitemap
   ```

5. **Revoke old key** by regenerating in Supabase (step 1 invalidates the old key)

### Setting Secrets in Cloudflare Pages:

1. Go to Cloudflare Pages dashboard
2. Select your project
3. Settings → Environment variables
4. Add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (for build-time sitemap generation)

## Troubleshooting

### Problem: "No blog table found"

**Solution**: The script tries multiple table names. Ensure your blog table is named one of:
- `blogPosts`
- `blog_posts`
- `blogposts`
- `blogs`

Or modify `CANDIDATE_TABLES` array in:
- `scripts/generate-sitemap.js`
- `supabase/functions/blog-posts/index.ts`

### Problem: RLS blocks anonymous access

**Symptoms**: Blog posts don't show on frontend, but work with service_role key

**Solution**: 
1. Check RLS policies (see [RLS section](#row-level-security-rls))
2. Ensure `published = true` policy exists
3. Grant SELECT to `anon` role:
   ```sql
   GRANT SELECT ON public.blog_posts TO anon;
   ```

### Problem: Sitemap not accessible after deploy

**Solution**:
1. Verify file exists: `client/public/sitemap.xml`
2. Check Cloudflare Pages build logs
3. Ensure public folder is included in deployment
4. Try accessing: `https://your-site.com/sitemap.xml` directly

### Problem: Empty sitemap (no blog posts)

**Possible causes**:
1. No published posts: Check `published` column in database
2. Wrong table name: Review script output for attempted tables
3. RLS blocking access: Use service_role key or fix RLS policies

**Debug**:
```bash
# Run with verbose output
SUPABASE_URL=xxx SUPABASE_KEY=xxx npm run generate-sitemap
# Check which table was found and post count
```

### Problem: "Missing SUPABASE_URL or SUPABASE_KEY"

**Solution**: Set environment variables before running:
```bash
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_KEY="your-key-here"
npm run generate-sitemap
```

Or inline:
```bash
SUPABASE_URL=xxx SUPABASE_KEY=xxx npm run generate-sitemap
```

## Automation with CI/CD

### GitHub Actions Example:

Create `.github/workflows/update-sitemap.yml`:

```yaml
name: Update Sitemap

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:  # Allow manual trigger

jobs:
  generate-sitemap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
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
          git add client/public/sitemap.xml
          git diff --quiet && git diff --staged --quiet || (git commit -m "Update sitemap.xml [automated]" && git push)
```

### Security Notes for CI/CD:

- Store `SUPABASE_SERVICE_ROLE_KEY` as a GitHub Secret
- **Never** log secrets in CI output
- Rotate service_role key periodically
- Use branch protection to prevent unauthorized changes

## robots.txt Configuration

Ensure your `client/public/robots.txt` includes:

```
User-agent: *
Allow: /

Sitemap: https://streamstickpro.com/sitemap.xml
```

This tells search engines where to find your sitemap.

## Monitoring and Maintenance

### Regular Tasks:

1. **Weekly**: Check sitemap in Elite SEO dashboard
2. **After adding posts**: Regenerate sitemap
3. **Monthly**: Verify indexing in Google Search Console
4. **Quarterly**: Rotate service_role keys

### Elite SEO Dashboard:

Access at `/elite-seo` to:
- Check sitemap and robots.txt status
- Submit sitemap to search engines
- View example meta tags and JSON-LD
- Access this documentation

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Google Search Console Help](https://support.google.com/webmasters)
- [Bing Webmaster Tools Documentation](https://www.bing.com/webmasters/help)
- [Sitemaps.org Protocol](https://www.sitemaps.org/protocol.html)

---

**Last Updated**: December 2025  
**Maintained by**: StreamStickPro Development Team
