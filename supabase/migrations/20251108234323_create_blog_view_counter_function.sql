/*
  # Create Blog View Counter Function

  1. Purpose
    - Add a helper function to safely increment blog post view counts
    - Ensures thread-safe view counting

  2. Security
    - Function can be called by anyone (public access for counting views)
    - Only updates view_count field, cannot modify other data
*/

-- Create function to increment blog view count
CREATE OR REPLACE FUNCTION increment_blog_view(post_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = post_slug;
END;
$$;

-- Grant execute permission to anonymous users for view tracking
GRANT EXECUTE ON FUNCTION increment_blog_view(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_blog_view(TEXT) TO authenticated;
