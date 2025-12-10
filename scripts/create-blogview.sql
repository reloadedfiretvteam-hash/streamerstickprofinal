-- Idempotent SQL script to create a view for blog posts
-- This creates a camelCase view (blogPosts) that maps to the snake_case table (blog_posts)
-- Run this in the Supabase SQL Editor if your blog table is named blog_posts

-- First, check if the blog_posts table exists
DO $$
BEGIN
  -- Drop the view if it already exists to make this script idempotent
  DROP VIEW IF EXISTS public."blogPosts";
  
  -- Create the view only if blog_posts table exists
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'blog_posts'
  ) THEN
    -- Create the view mapping blogPosts to blog_posts
    EXECUTE '
      CREATE VIEW public."blogPosts" AS 
      SELECT * FROM public.blog_posts;
    ';
    
    RAISE NOTICE 'View public."blogPosts" created successfully';
  ELSE
    RAISE NOTICE 'Table public.blog_posts does not exist. View not created.';
  END IF;
END $$;

-- Grant appropriate permissions (adjust as needed for your RLS setup)
-- This grants SELECT to authenticated users - modify based on your security requirements
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname = 'blogPosts'
  ) THEN
    GRANT SELECT ON public."blogPosts" TO authenticated;
    GRANT SELECT ON public."blogPosts" TO anon;
    RAISE NOTICE 'Permissions granted on public."blogPosts"';
  END IF;
END $$;
