# Elite SEO Tools - Complete Guide

This guide covers setup, usage, and maintenance of the Elite SEO tools for StreamStickPro.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Creating the Blog View (SQL)](#creating-the-blog-view-sql)
5. [Generating Sitemaps](#generating-sitemaps)
6. [Deploying to Cloudflare Pages](#deploying-to-cloudflare-pages)
7. [Submitting to Search Engines](#submitting-to-search-engines)
8. [RLS Considerations](#rls-considerations)
9. [Key Rotation](#key-rotation)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Elite SEO toolkit provides:

- **Resilient Edge Function**: Multi-table fallback for blog posts API
- **SQL View Creation**: Maps `blog_posts` table to `blogPosts` view
- **Sitemap Generator**: Automated sitemap.xml generation from Supabase
- **Elite SEO Dashboard**: Web interface for SEO management
- **Search Engine Integration**: Quick submission to Google and Bing

---

## Prerequisites

- Supabase project with blog posts data
- Node.js and npm installed
- Access to Supabase SQL Editor
- Cloudflare Pages account (for deployment)
- Google Search Console and Bing Webmaster Tools accounts

---

## Initial Setup

### 1. Install Dependencies

The required dependencies are already in `package.json`:

```json
"@supabase/supabase-js": "^2.86.2"
```

If needed, reinstall:

```bash
npm install
```

### 2. Environment Variables

**IMPORTANT: Never commit these to version control!**

Create a `.env.local` file (or use your existing `.env`):

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Optional, for Edge Functions

# Site Configuration
SITE_BASE_URL=https://streamstickpro.com
```

**Security Note**: 
- Use `.env.local` for local development
- Never commit `.env` files containing real credentials
- Use Cloudflare environment variables for production
- Rotate keys regularly (see [Key Rotation](#key-rotation))

---

## Creating the Blog View (SQL)

The blog view allows the Edge Function to access blog posts using the camelCase name `blogPosts` instead of snake_case `blog_posts`.

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the SQL Script

Copy and paste the contents of `scripts/create-blogview.sql`:

```sql
-- Drop the view if it exists (makes this script idempotent)
DROP VIEW IF EXISTS public."blogPosts";

-- Create the view
CREATE OR REPLACE VIEW public."blogPosts" AS 
SELECT * FROM public.blog_posts;

-- Grant appropriate permissions
GRANT SELECT ON public."blogPosts" TO anon;
GRANT SELECT ON public."blogPosts" TO authenticated;
```

### Step 3: Execute

Click **Run** or press `Ctrl/Cmd + Enter`

### Step 4: Verify

Run this query to verify:

```sql
SELECT COUNT(*) FROM public."blogPosts" WHERE published = true;
```

You should see the count of published blog posts.

---

## Generating Sitemaps

### Method 1: Using the npm Script (Recommended)

1. **Set environment variables** (in terminal or `.env` file):

```bash
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_KEY="your-key-here"
export SITE_BASE_URL="https://streamstickpro.com"
```

2. **Run the generator**:

```bash
npm run generate-sitemap
```

3. **Review the output**:

The script will:
- Try multiple table names (blog_posts, blogPosts, blogposts, blogs)
- Fetch all published blog posts
- Generate `client/public/sitemap.xml`
- Print a summary

Expected output:
```
🗺️  Sitemap Generator for StreamStickPro

Configuration:
  SUPABASE_URL: ✅ Set
  SUPABASE_KEY: ✅ Set
  SITE_BASE_URL: https://streamstickpro.com
  Output: /path/to/client/public/sitemap.xml

Fetching blog posts from Supabase...
Trying table: blog_posts...
  ✅ Found 50 posts in table: blog_posts

✅ Sitemap generated successfully!

Summary:
  📄 Static pages: 3
  📝 Blog posts: 50
  📊 Total URLs: 53
  💾 Saved to: /path/to/client/public/sitemap.xml
  📋 Source table: blog_posts
```

### Method 2: Manual Script Execution

```bash
node scripts/generate-sitemap.js
```

### Script Features

The sitemap generator:

1. **Auto-discovers blog table**: Tries multiple table name variations
2. **Fetches published posts only**: Filters by `published = true`
3. **Includes static pages**: Home, blog index, checkout
4. **Proper XML formatting**: Valid sitemap.xml format
5. **Date handling**: Uses publishedAt, updatedAt, or createdAt
6. **URL mapping**: Maps post slugs to `/blog/:slug`

### Sitemap Structure

Generated sitemap includes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://streamstickpro.com/</loc>
    <lastmod>2024-12-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://streamstickpro.com/blog/post-slug</loc>
    <lastmod>2024-12-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... more URLs ... -->
</urlset>
```

---

## Deploying to Cloudflare Pages

### Step 1: Review Generated Sitemap

```bash
cat client/public/sitemap.xml
```

Verify:
- URLs are correct
- Dates are properly formatted
- All blog posts are included

### Step 2: Commit and Push

```bash
git add client/public/sitemap.xml
git commit -m "Update sitemap with latest blog posts"
git push origin main
```

### Step 3: Verify Deployment

After Cloudflare Pages deploys:

```bash
curl https://streamstickpro.com/sitemap.xml
```

Or visit in browser: `https://streamstickpro.com/sitemap.xml`

### Step 4: Check Robots.txt

Ensure `client/public/robots.txt` references the sitemap:

```
User-agent: *
Allow: /

Sitemap: https://streamstickpro.com/sitemap.xml
```

---

## Submitting to Search Engines

### Google Search Console

#### Method 1: Quick Ping (Automated)

1. Navigate to `/elite-seo` in your deployed site
2. Click **Submit** tab
3. Click **Ping Google** button

Or use this URL directly:
```
https://www.google.com/ping?sitemap=https://streamstickpro.com/sitemap.xml
```

#### Method 2: Search Console (Recommended)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (streamstickpro.com)
3. Navigate to **Sitemaps** in left sidebar
4. Enter `sitemap.xml` in the field
5. Click **Submit**

#### Monitoring

- Check indexing status in Search Console
- Review **Coverage** report for errors
- Monitor **Performance** for search traffic

### Bing Webmaster Tools

#### Method 1: Quick Ping (Automated)

1. Navigate to `/elite-seo` in your deployed site
2. Click **Submit** tab
3. Click **Ping Bing** button

Or use this URL directly:
```
https://www.bing.com/ping?sitemap=https://streamstickpro.com/sitemap.xml
```

#### Method 2: Webmaster Tools (Recommended)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add/verify your site if not already done
3. Navigate to **Sitemaps**
4. Click **Submit Sitemap**
5. Enter `https://streamstickpro.com/sitemap.xml`
6. Click **Submit**

---

## RLS Considerations

### Understanding Row Level Security (RLS)

Supabase uses PostgreSQL's RLS to control data access. For blog posts to be publicly accessible:

### Option 1: Disable RLS for Blog Posts (Public Data)

If blog posts are meant to be public:

```sql
-- Disable RLS for blog_posts table
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;
```

### Option 2: Create RLS Policy (Recommended)

Allow anonymous access to published posts only:

```sql
-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to published posts
CREATE POLICY "Public can read published blog posts"
ON public.blog_posts
FOR SELECT
USING (published = true);

-- Also apply to the view
-- Views inherit permissions from underlying tables, but you can grant explicitly:
GRANT SELECT ON public."blogPosts" TO anon;
GRANT SELECT ON public."blogPosts" TO authenticated;
```

### Testing RLS Policies

Test with anon key in browser console or Postman:

```javascript
const { data, error } = await supabase
  .from('blogPosts')
  .select('*')
  .eq('published', true);

console.log('Data:', data);
console.log('Error:', error);
```

### Edge Function Considerations

The Edge Function in `supabase/functions/blog-posts/index.ts`:

- **Prefers** `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- **Falls back** to `SUPABASE_ANON_KEY` (respects RLS)

For production:
- Use service role key in Edge Function environment
- Use anon key in client applications
- Set up proper RLS policies for defense in depth

---

## Key Rotation

### When to Rotate Keys

- **Scheduled**: Every 90 days
- **Immediately**: If key is compromised or exposed
- **After team changes**: When team members leave

### How to Rotate Supabase Keys

#### Step 1: Generate New Keys

1. Go to Supabase Dashboard → Settings → API
2. Click **Generate new anon key** (if rotating anon)
3. Click **Generate new service_role key** (if rotating service)

**Note**: Service role key rotation affects all backend services!

#### Step 2: Update Environment Variables

**Cloudflare Pages**:
1. Go to Cloudflare Dashboard → Pages → Your Project
2. Navigate to Settings → Environment variables
3. Update `SUPABASE_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy

**Local Development**:
```bash
# Update .env.local
SUPABASE_KEY=new-key-here
SUPABASE_SERVICE_ROLE_KEY=new-service-key-here
```

**Edge Functions**:
1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Update `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy functions

#### Step 3: Update Client Applications

If rotating anon key, update all client apps:

```typescript
// lib/supabase.ts
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'new-anon-key';  // ← Update this

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### Step 4: Verify

Test all endpoints:

```bash
# Test Edge Function
curl https://your-project.supabase.co/functions/v1/blog-posts

# Test sitemap generation
npm run generate-sitemap

# Test client app
# Visit site and check blog loads
```

#### Step 5: Revoke Old Keys

**IMPORTANT**: Only after verifying everything works!

1. Supabase Dashboard → Settings → API
2. Click **Revoke** on old keys
3. Confirm revocation

### Key Rotation Checklist

- [ ] Generate new keys in Supabase
- [ ] Update Cloudflare Pages environment variables
- [ ] Update local `.env.local` files
- [ ] Update Edge Function secrets
- [ ] Update client application code (if anon key)
- [ ] Test all services
- [ ] Verify sitemap generation works
- [ ] Verify blog posts load on site
- [ ] Revoke old keys
- [ ] Document rotation in changelog

---

## Troubleshooting

### Sitemap Generation Issues

#### Error: "Missing required environment variables"

**Problem**: `SUPABASE_URL` or `SUPABASE_KEY` not set

**Solution**:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-key-here"
npm run generate-sitemap
```

#### Error: "Could not find blog posts in any candidate table"

**Problem**: No blog posts table exists or is accessible

**Solutions**:
1. Verify table exists: `SELECT * FROM blog_posts LIMIT 1;` in SQL Editor
2. Check RLS policies allow access
3. Verify key has proper permissions
4. Check table name matches one of: blog_posts, blogPosts, blogposts, blogs

#### Sitemap has 0 blog posts

**Problem**: No published posts or RLS blocking access

**Solutions**:
1. Check if posts are published: `SELECT COUNT(*) FROM blog_posts WHERE published = true;`
2. Verify RLS policies (see [RLS Considerations](#rls-considerations))
3. Try with service role key instead of anon key
4. Check Edge Function logs for errors

### Edge Function Issues

#### Error: "Database not configured"

**Problem**: Missing environment variables in Edge Function

**Solution**:
1. Go to Supabase Dashboard → Edge Functions → blog-posts
2. Click Settings → Secrets
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

#### Edge Function returns empty array

**Problem**: RLS policies blocking access or no published posts

**Solutions**:
1. Use service role key (bypasses RLS)
2. Check RLS policies allow public read
3. Verify posts are published
4. Check function logs in Supabase Dashboard

### Deployment Issues

#### Sitemap not accessible after deployment

**Problem**: File not committed or deployment failed

**Solutions**:
1. Verify file exists: `ls client/public/sitemap.xml`
2. Check git status: `git status`
3. Commit if needed: `git add client/public/sitemap.xml && git commit -m "Add sitemap"`
4. Check Cloudflare Pages build logs
5. Verify public folder is deployed

#### Robots.txt not referencing sitemap

**Problem**: robots.txt missing or incorrect

**Solution**:
Edit `client/public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://streamstickpro.com/sitemap.xml
```

### Search Engine Issues

#### Google not indexing sitemap

**Problem**: Sitemap not submitted or has errors

**Solutions**:
1. Submit via Search Console (don't just ping)
2. Validate sitemap: https://www.xml-sitemaps.com/validate-xml-sitemap.html
3. Check for XML errors
4. Verify sitemap is accessible publicly
5. Wait 24-48 hours for initial processing

#### Bing not crawling pages

**Problem**: Site not verified or crawl errors

**Solutions**:
1. Verify site ownership in Bing Webmaster Tools
2. Submit sitemap via Webmaster Tools
3. Check crawl errors in dashboard
4. Verify robots.txt allows Bingbot

---

## Best Practices

### Sitemap Maintenance

1. **Regenerate regularly**: When adding new blog posts
2. **Automate if possible**: Consider CI/CD integration
3. **Monitor size**: Keep under 50MB and 50,000 URLs
4. **Split if needed**: Use sitemap index for large sites

### Security

1. **Never commit credentials**: Use `.gitignore` for `.env` files
2. **Use environment variables**: For all sensitive data
3. **Rotate keys regularly**: Every 90 days minimum
4. **Principle of least privilege**: Use anon key when possible
5. **Monitor access logs**: Check Supabase logs regularly

### Performance

1. **Cache sitemaps**: Consider CDN caching
2. **Optimize queries**: Add indexes on published, slug columns
3. **Limit results**: Generator already limits to 1000 posts
4. **Pagination**: For very large sites, paginate sitemap generation

### SEO

1. **Keep sitemaps fresh**: Update when content changes
2. **Use lastmod correctly**: Actual last modification date
3. **Set priorities wisely**: 1.0 for homepage, 0.8-0.9 for important pages
4. **Monitor Search Console**: Check for crawl errors
5. **Use HTTPS**: Always use secure URLs

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Google Search Console Help](https://support.google.com/webmasters)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

---

## Support

For issues or questions:

1. Check this documentation first
2. Review Supabase logs and error messages
3. Check Cloudflare Pages deployment logs
4. Verify environment variables are set correctly
5. Test locally before deploying

---

**Last Updated**: December 2024  
**Version**: 1.0.0
