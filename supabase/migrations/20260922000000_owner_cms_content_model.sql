-- Owner CMS content model (Stage 2)
-- Additive only. Does NOT modify Stripe/checkout/orders/provisioning tables.
-- Safe to re-run (IF NOT EXISTS). Payment impact: None for new tables;
-- real_products display columns are content-only and must not drive Stripe sync.

BEGIN;

-- ---------------------------------------------------------------------------
-- Homepage document (draft + published)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_homepage (
  id text PRIMARY KEY DEFAULT 'default',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  scheduled_at timestamptz,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  document jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.cms_homepage (id, status, document)
VALUES (
  'default',
  'published',
  '{
    "hero": {
      "title": "Need a Device or Already Have One?",
      "subtitle": "Shop Google TV devices, explore plans for compatible equipment, or get setup and compatibility help.",
      "backgroundImageUrl": "",
      "primaryCta": { "label": "Shop Google TV Devices", "href": "/devices" },
      "secondaryCta": { "label": "Explore Plans & Services", "href": "/plans" },
      "supportCta": { "label": "Setup & Compatibility Help", "href": "/guides" }
    },
    "pathTiles": [
      { "id": "need-device", "title": "I Need a Google TV Device", "description": "Shop ONN and Google TV kits with clear condition, inclusions, and support.", "href": "/devices", "imageUrl": "" },
      { "id": "have-device", "title": "I Already Have a Compatible Device", "description": "Plans and services for Fire TV, Google TV, ONN, and other supported equipment you already own.", "href": "/plans", "imageUrl": "" },
      { "id": "need-help", "title": "I Need Setup Help", "description": "Written guides, authorized videos, troubleshooting, and support.", "href": "/guides", "imageUrl": "" }
    ],
    "sections": [
      { "id": "hero", "visible": true, "order": 1 },
      { "id": "pathTiles", "visible": true, "order": 2 },
      { "id": "featuredDevices", "visible": true, "order": 3, "title": "Featured Google TV Devices", "description": "" },
      { "id": "featuredPlans", "visible": true, "order": 4, "title": "Plans & Services", "description": "" },
      { "id": "howItWorks", "visible": true, "order": 5, "title": "How It Works", "description": "" },
      { "id": "guides", "visible": true, "order": 6, "title": "Setup Guides", "description": "" },
      { "id": "trust", "visible": true, "order": 7, "title": "Support & Trust", "description": "" },
      { "id": "faq", "visible": true, "order": 8, "title": "FAQ", "description": "" },
      { "id": "finalCta", "visible": true, "order": 9, "title": "Ready to get started?", "description": "" }
    ],
    "featuredDeviceIds": ["android-onn-4k", "android-onn-pro"],
    "featuredPlanIds": ["iptv-1mo-1d", "iptv-1yr-1d"],
    "featuredGuideIds": [],
    "faq": { "title": "Frequently asked questions", "items": [] },
    "meta": {
      "title": "StreamStickPro | Google TV Devices, Plans & Setup Help",
      "description": "Shop Google TV devices, explore plans for compatible equipment, or get setup and compatibility help.",
      "ogImage": ""
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Banners / campaigns (display only — no Stripe price fields)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  subheadline text,
  background_color text DEFAULT '#0f172a',
  text_color text DEFAULT '#ffffff',
  image_url text,
  button_label text,
  button_href text,
  target_pages text[] DEFAULT ARRAY['*']::text[],
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_banners_active_idx ON public.cms_banners (is_active, status, priority DESC);

-- ---------------------------------------------------------------------------
-- Device content (extends real_products; does not replace commerce row)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_device_content (
  sku text PRIMARY KEY,
  real_product_id text,
  public_title text NOT NULL,
  brand text,
  model text,
  condition text NOT NULL DEFAULT 'new',
  category text DEFAULT 'google-tv',
  short_description text,
  full_description text,
  included_items jsonb DEFAULT '[]'::jsonb,
  specifications jsonb DEFAULT '{}'::jsonb,
  compatibility text,
  availability text NOT NULL DEFAULT 'in_stock',
  public_display_price_cents integer,
  public_compare_at_cents integer,
  sale_label text,
  badges jsonb DEFAULT '[]'::jsonb,
  gallery jsonb DEFAULT '[]'::jsonb,
  primary_image_url text,
  image_alt text,
  faq jsonb DEFAULT '[]'::jsonb,
  related_skus text[] DEFAULT '{}',
  related_guide_ids uuid[] DEFAULT '{}',
  shipping_returns_text text,
  support_link text,
  setup_guide_link text,
  seo_title text,
  seo_description text,
  social_image_url text,
  structured_data_extra jsonb DEFAULT '{}'::jsonb,
  merchant_feed_extra jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  payment_ref_display text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_device_content_status_idx ON public.cms_device_content (status, featured, sort_order);

-- ---------------------------------------------------------------------------
-- Plans & services content
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_plan_content (
  code text PRIMARY KEY,
  real_product_id text,
  public_title text NOT NULL,
  short_description text,
  full_description text,
  features jsonb DEFAULT '[]'::jsonb,
  public_display_price_cents integer,
  public_compare_at_cents integer,
  sale_label text,
  billing_term text,
  eligibility text,
  support_scope text,
  faq jsonb DEFAULT '[]'::jsonb,
  related_guide_ids uuid[] DEFAULT '{}',
  seo_title text,
  seo_description text,
  social_image_url text,
  primary_image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  payment_ref_display text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_plan_content_status_idx ON public.cms_plan_content (status, featured, sort_order);

-- ---------------------------------------------------------------------------
-- Guides
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text,
  category text DEFAULT 'setup',
  prerequisites jsonb DEFAULT '[]'::jsonb,
  written_steps jsonb DEFAULT '[]'::jsonb,
  youtube_url text,
  chapters jsonb DEFAULT '[]'::jsonb,
  hero_image_url text,
  image_alt text,
  faq jsonb DEFAULT '[]'::jsonb,
  related_device_skus text[] DEFAULT '{}',
  related_plan_codes text[] DEFAULT '{}',
  related_guide_ids uuid[] DEFAULT '{}',
  support_link text,
  seo_title text,
  seo_description text,
  social_image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  scheduled_at timestamptz,
  published_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_guides_status_slug_idx ON public.cms_guides (status, slug);

-- ---------------------------------------------------------------------------
-- Navigation + brand settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_navigation (
  id text PRIMARY KEY DEFAULT 'main',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  footer jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.cms_navigation (id, items, footer)
VALUES (
  'main',
  '[
    {"label":"Home","href":"/","order":1},
    {"label":"Google TV Devices","href":"/devices","order":2},
    {"label":"Plans & Services","href":"/plans","order":3},
    {"label":"Setup Guides","href":"/guides","order":4},
    {"label":"Support","href":"/support","order":5},
    {"label":"Contact","href":"/contact","order":6}
  ]'::jsonb,
  '{"supportEmail":"","policyLinks":[{"label":"Terms","href":"/terms"},{"label":"Privacy","href":"/privacy"},{"label":"Refunds","href":"/refund"}],"socialLinks":[]}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.cms_brand_settings (
  id text PRIMARY KEY DEFAULT 'default',
  logo_url text,
  primary_color text DEFAULT '#2563eb',
  secondary_color text DEFAULT '#14b8a6',
  accent_sale_color text DEFAULT '#d97706',
  support_email text,
  support_phone text,
  contact_links jsonb DEFAULT '[]'::jsonb,
  global_announcement text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.cms_brand_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Media assets with usage tracking
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  width integer,
  height integer,
  alt_text text,
  folder text DEFAULT 'general',
  usage_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_media_assets_folder_idx ON public.cms_media_assets (folder, created_at DESC);

-- ---------------------------------------------------------------------------
-- SEO metadata per entity
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  seo_title text,
  meta_description text,
  h1 text,
  social_title text,
  social_description text,
  social_image_url text,
  canonical_url text,
  robots text DEFAULT 'index,follow',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);

-- ---------------------------------------------------------------------------
-- Revisions + audit log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  snapshot jsonb NOT NULL,
  note text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_content_revisions_entity_idx
  ON public.cms_content_revisions (entity_type, entity_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.cms_admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  detail jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_admin_audit_log_created_idx ON public.cms_admin_audit_log (created_at DESC);

-- ---------------------------------------------------------------------------
-- Display-only price columns on real_products (do not auto-sync Stripe)
-- ---------------------------------------------------------------------------
ALTER TABLE public.real_products
  ADD COLUMN IF NOT EXISTS public_display_price_cents integer;

ALTER TABLE public.real_products
  ADD COLUMN IF NOT EXISTS public_compare_at_cents integer;

ALTER TABLE public.real_products
  ADD COLUMN IF NOT EXISTS content_kind text;

COMMENT ON COLUMN public.real_products.public_display_price_cents IS
  'Owner-facing public display price (cents). Must not auto-update Stripe Price IDs.';
COMMENT ON COLUMN public.real_products.public_compare_at_cents IS
  'Public comparison/old price (cents). Display only.';
COMMENT ON COLUMN public.real_products.content_kind IS
  'device | plan | other — catalog classification for CMS; independent of legacy category labels.';

-- Ensure site_promotion exists for legacy promo admin (display + protected stripe ref)
CREATE TABLE IF NOT EXISTS public.site_promotion (
  id text PRIMARY KEY DEFAULT 'default',
  is_active boolean NOT NULL DEFAULT false,
  headline text NOT NULL DEFAULT '',
  subheadline text,
  cta_label text DEFAULT 'Claim offer',
  real_product_id text NOT NULL DEFAULT '',
  promo_shadow_price_id text NOT NULL DEFAULT '',
  promo_amount_cents integer NOT NULL DEFAULT 0,
  shadow_headline text,
  shadow_subheadline text,
  ends_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.site_promotion (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- RLS: enable; service role bypasses. Anon has no write.
ALTER TABLE public.cms_homepage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_device_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_plan_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_promotion ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content (anon)
DO $$ BEGIN
  CREATE POLICY cms_homepage_public_read ON public.cms_homepage
    FOR SELECT TO anon, authenticated
    USING (status = 'published' OR id = 'default');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cms_banners_public_read ON public.cms_banners
    FOR SELECT TO anon, authenticated
    USING (is_active = true AND status = 'published'
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cms_devices_public_read ON public.cms_device_content
    FOR SELECT TO anon, authenticated USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cms_plans_public_read ON public.cms_plan_content
    FOR SELECT TO anon, authenticated USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cms_guides_public_read ON public.cms_guides
    FOR SELECT TO anon, authenticated USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cms_nav_public_read ON public.cms_navigation
    FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cms_brand_public_read ON public.cms_brand_settings
    FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cms_media_public_read ON public.cms_media_assets
    FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cms_seo_public_read ON public.cms_seo_metadata
    FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY site_promotion_public_read ON public.site_promotion
    FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.cms_homepage TO anon, authenticated;
GRANT SELECT ON public.cms_banners TO anon, authenticated;
GRANT SELECT ON public.cms_device_content TO anon, authenticated;
GRANT SELECT ON public.cms_plan_content TO anon, authenticated;
GRANT SELECT ON public.cms_guides TO anon, authenticated;
GRANT SELECT ON public.cms_navigation TO anon, authenticated;
GRANT SELECT ON public.cms_brand_settings TO anon, authenticated;
GRANT SELECT ON public.cms_media_assets TO anon, authenticated;
GRANT SELECT ON public.cms_seo_metadata TO anon, authenticated;
GRANT SELECT ON public.site_promotion TO anon, authenticated;

COMMIT;

-- PostgREST schema reload (Supabase)
NOTIFY pgrst, 'reload schema';
