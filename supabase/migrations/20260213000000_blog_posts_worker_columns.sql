-- blog_posts: add worker/seed columns if missing
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Guides',
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS keywords text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS blog_posts_is_published_idx ON public.blog_posts (is_published) WHERE is_published = true;
