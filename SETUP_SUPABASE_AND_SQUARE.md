# Setup Guide: Supabase & Square Environment Variables

This document explains the required environment variables and database setup for Stream Stick Pro.

## Required Environment Variables

Add these to your Cloudflare Pages project settings (Environment Variables section):

### Supabase Variables

- `VITE_SUPABASE_URL`
  - **Where to find it:** Supabase Dashboard → Project Settings → API → Project URL
  - **Format:** `https://your-project-id.supabase.co`

- `VITE_SUPABASE_ANON_KEY`
  - **Where to find it:** Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public` key
  - **Format:** Long string starting with `eyJ...`

### Square Variables

- `VITE_SQUARE_APP_ID`
  - **Where to find it:** Square Developer Dashboard → Applications → Your App → Credentials → Application ID
  - **Format:** String like `sq0idp-...` (Sandbox) or production app ID

- `VITE_SQUARE_LOCATION_ID`
  - **Where to find it:** Square Developer Dashboard → Locations → Your Location → Location ID
  - **Format:** String starting with location identifier

## Supabase Database Tables

You need to create the following tables in your Supabase project:

### 1. `admin_credentials` Table

Stores admin login credentials:

```sql
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own credentials"
  ON admin_credentials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
```

**Example row:**
- username: `starevan11`
- password_hash: (hashed version of `starevan11` - use bcrypt or similar)

### 2. `real_products` Table

Stores Fire Stick and IPTV products:

```sql
CREATE TABLE IF NOT EXISTS real_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  sale_price numeric,
  short_description text,
  description text,
  featured boolean DEFAULT false,
  status text DEFAULT 'active',
  main_image text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE real_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products"
  ON real_products
  FOR SELECT
  USING (status IN ('published', 'publish', 'active'));
```

**Example rows:**

| name | price | sale_price | description | featured | status |
|------|-------|------------|-------------|----------|--------|
| Fire Stick 4K | 150.00 | 150.00 | 18,000+ channels, 4K quality, 1 year IPTV | true | active |
| 3 Month IPTV | 30.00 | 30.00 | Premium IPTV subscription, All channels | true | active |

### 3. `square_products` Table

Links Square catalog items to your products:

```sql
CREATE TABLE IF NOT EXISTS square_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES real_products(id),
  square_item_id text UNIQUE NOT NULL,
  square_variation_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE square_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view square products"
  ON square_products
  FOR SELECT
  USING (true);
```

### 4. `email_captures` Table

Stores email signups from popups and forms:

```sql
CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  phone text,
  source text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert email captures"
  ON email_captures
  FOR INSERT
  WITH CHECK (true);
```

### 5. Analytics Tables

Used by useAnalytics, useCartAbandonment, and useConversionTracking hooks:

```sql
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  page text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  event_type text,
  product_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert cart events"
  ON cart_events FOR INSERT WITH CHECK (true);
```

## How the App Behaves Without Configuration

If environment variables are missing:
- The main marketing site will still load and display
- Supabase features will show console warnings
- Admin dashboards will display fallback messages
- Analytics/tracking will be disabled
- Products will show fallback/demo data

This ensures the site remains accessible even during initial setup.

## Setting Up Cloudflare Pages Environment Variables

1. Log in to Cloudflare Dashboard
2. Go to Workers & Pages → Your Project
3. Navigate to Settings → Environment Variables
4. Add each variable listed above
5. Select which environment: Production, Preview, or both
6. Save changes
7. Redeploy your site for changes to take effect

## Notes

- Never commit real keys to Git
- Use production keys for production environment only
- Test with sandbox/test keys first
- Rotate keys regularly for security
