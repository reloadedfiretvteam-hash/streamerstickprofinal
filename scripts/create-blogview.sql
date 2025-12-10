-- Idempotent SQL script to create a view for blog posts
-- Run this in the Supabase SQL Editor
--
-- This creates a view public."blogPosts" that maps to public.blog_posts
-- allowing Edge Functions and other services to reference either name

-- Drop the view if it exists (makes this script idempotent)
DROP VIEW IF EXISTS public."blogPosts";

-- Create the view only if the blog_posts table exists
-- This view allows accessing blog_posts table as "blogPosts" (camelCase)
CREATE OR REPLACE VIEW public."blogPosts" AS 
SELECT * FROM public.blog_posts;

-- Grant appropriate permissions
-- Adjust these based on your RLS policies and security requirements
GRANT SELECT ON public."blogPosts" TO anon;
GRANT SELECT ON public."blogPosts" TO authenticated;

-- Optional: Create an index on the underlying table if not already present
-- Uncomment if needed:
-- CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published) WHERE published = true;
-- CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'View public."blogPosts" created successfully';
END $$;
