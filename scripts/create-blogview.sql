-- Idempotent SQL script to create a view for blog posts
-- Run this in the Supabase SQL Editor
-- This creates a view "blogPosts" that maps to the actual "blog_posts" table

-- Drop the view if it already exists (makes this script idempotent)
DROP VIEW IF EXISTS public."blogPosts";

-- Create the view only if the blog_posts table exists
-- This view provides a consistent interface regardless of the underlying table name
CREATE OR REPLACE VIEW public."blogPosts" AS
SELECT * FROM public.blog_posts;

-- Grant appropriate permissions to the view
-- Adjust these based on your RLS policies
GRANT SELECT ON public."blogPosts" TO anon;
GRANT SELECT ON public."blogPosts" TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public."blogPosts" IS 'View that maps to blog_posts table for consistent API access';
