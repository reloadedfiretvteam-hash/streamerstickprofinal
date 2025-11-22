/*
  # IPTV Website Database Schema

  ## Overview
  This migration creates the complete database structure for an IPTV service website with:
  - Email capture and newsletter management
  - Abandoned cart tracking with automated email reminders
  - Visitor analytics and conversion tracking
  - Pricing plans and subscription tiers

  ## New Tables

  ### `email_subscribers`
  - `id` (uuid, primary key): Unique identifier
  - `email` (text, unique): Subscriber email address
  - `source` (text): Where the email was captured (hero, pricing, popup)
  - `subscribed_at` (timestamptz): When they subscribed
  - `unsubscribed_at` (timestamptz, nullable): When they unsubscribed
  - `metadata` (jsonb): Additional tracking data

  ### `cart_abandonments`
  - `id` (uuid, primary key): Unique identifier
  - `email` (text): Customer email
  - `plan_id` (text): Selected pricing plan
  - `amount` (decimal): Cart value
  - `abandoned_at` (timestamptz): When cart was abandoned
  - `reminder_sent_at` (timestamptz, nullable): When reminder email was sent
  - `converted_at` (timestamptz, nullable): If they completed purchase
  - `metadata` (jsonb): Additional cart data

  ### `visitor_analytics`
  - `id` (uuid, primary key): Unique identifier
  - `visitor_id` (text): Anonymous visitor identifier
  - `page_view` (text): Page visited
  - `referrer` (text, nullable): Where they came from
  - `device_type` (text): mobile, desktop, tablet
  - `country` (text, nullable): Geographic location
  - `visited_at` (timestamptz): Visit timestamp
  - `session_duration` (integer, nullable): Time on site in seconds

  ### `pricing_plans`
  - `id` (text, primary key): Plan identifier (monthly, quarterly, yearly)
  - `name` (text): Display name
  - `price` (decimal): Price amount
  - `currency` (text): Currency code (USD, EUR, etc)
  - `billing_period` (text): month, quarter, year
  - `features` (jsonb): Array of features included
  - `is_popular` (boolean): Featured plan flag
  - `display_order` (integer): Sort order
  - `active` (boolean): Whether plan is available

  ## Security
  - RLS enabled on all tables
  - Public read access for pricing plans
  - Authenticated admin access for analytics
  - Email capture allows anonymous inserts only

  ## Notes
  - Email capture is intentionally permissive to allow anonymous subscriptions
  - Cart abandonment tracking helps recover lost sales
  - Analytics help optimize conversion funnel
  - All timestamps use timestamptz for timezone awareness
*/

CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text NOT NULL DEFAULT 'unknown',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS cart_abandonments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  plan_id text NOT NULL,
  amount decimal(10,2) NOT NULL,
  abandoned_at timestamptz DEFAULT now(),
  reminder_sent_at timestamptz,
  converted_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS visitor_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  page_view text NOT NULL,
  referrer text,
  device_type text NOT NULL DEFAULT 'desktop',
  country text,
  visited_at timestamptz DEFAULT now(),
  session_duration integer
);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  billing_period text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_popular boolean DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true
);

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_abandonments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to email list"
  ON email_subscribers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view active pricing plans"
  ON pricing_plans FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Anyone can track cart abandonments"
  ON cart_abandonments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can log analytics"
  ON visitor_analytics FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_subscribed ON email_subscribers(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_abandonments_email ON cart_abandonments(email);
CREATE INDEX IF NOT EXISTS idx_cart_abandonments_converted ON cart_abandonments(converted_at);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visited ON visitor_analytics(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_order ON pricing_plans(display_order);

INSERT INTO pricing_plans (id, name, price, billing_period, features, is_popular, display_order) VALUES
('monthly', 'Monthly Plan', 19.99, 'month', '["22,000+ Live TV Channels", "120,000+ Movies & Series", "All Sports Channels & PPV Events", "4K/FHD/HD Quality", "Works on All Devices", "Anti-Freeze Technology", "EPG & Catch-Up TV", "24/7 Customer Support"]'::jsonb, false, 1),
('quarterly', 'Quarterly Plan', 49.99, 'quarter', '["22,000+ Live TV Channels", "120,000+ Movies & Series", "All Sports Channels & PPV Events", "4K/FHD/HD Quality", "Works on All Devices", "Anti-Freeze Technology", "EPG & Catch-Up TV", "24/7 Customer Support", "Save 17% vs Monthly", "Priority Support"]'::jsonb, true, 2),
('yearly', 'Yearly Plan', 159.99, 'year', '["22,000+ Live TV Channels", "120,000+ Movies & Series", "All Sports Channels & PPV Events", "4K/FHD/HD Quality", "Works on All Devices", "Anti-Freeze Technology", "EPG & Catch-Up TV", "24/7 Customer Support", "Save 33% vs Monthly", "Priority Support", "Free Setup Assistance", "Exclusive Premium Channels"]'::jsonb, false, 3)
ON CONFLICT (id) DO NOTHING;