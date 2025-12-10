-- =====================================================
-- Blog Posts View Creation Script
-- =====================================================
-- Purpose: Creates a view to map blog_posts table to blogPosts (camelCase)
-- This resolves common naming mismatches between database schema and application code.
--
-- INSTRUCTIONS FOR DATABASE OPERATOR:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- 4. Verify the view was created: SELECT * FROM "blogPosts" LIMIT 10;
-- 5. IMPORTANT: After running this script, rotate your Supabase service role key
--    for security (Dashboard → Settings → API → Service role key → Regenerate)
-- 6. Update SUPABASE_SERVICE_ROLE_KEY in your Cloudflare Pages environment variables
--
-- This script is idempotent - safe to run multiple times
-- =====================================================

-- Create or replace the blogPosts view
-- Maps to blog_posts table if it exists
-- Explicitly list columns to avoid issues with schema changes
CREATE OR REPLACE VIEW public."blogPosts" AS
SELECT 
  id,
  title,
  slug,
  excerpt,
  content,
  category,
  published,
  date,
  updated_at,
  featured,
  image,
  "readTime",
  "linkedProductIds"
FROM public.blog_posts;

-- Alternative: If your table has different columns, adjust the above SELECT
-- to match your actual blog_posts schema. Common columns include:
-- id, title, slug, excerpt, content, category, published, date, updated_at

-- Grant access to the view
-- Adjust permissions based on your security requirements
GRANT SELECT ON public."blogPosts" TO anon;
GRANT SELECT ON public."blogPosts" TO authenticated;

-- Optional: Add a comment to document the view
COMMENT ON VIEW public."blogPosts" IS 'View mapping blog_posts table to camelCase blogPosts for application compatibility';

-- =====================================================
-- Verification Query (optional - run separately to test)
-- =====================================================
-- SELECT COUNT(*) as total_posts FROM public."blogPosts";
-- SELECT * FROM public."blogPosts" WHERE published = true LIMIT 5;
