/*
  # Update Content for Advertisements and SEO

  1. Changes
    - Update blog posts to advertisement-style content  
    - Add SEO fields to products table
    - Update products with real Fire Stick images
    - Create blog article pages for detailed content
    
  2. New Tables
    - `blog_article_pages` - Full detailed articles
    
  3. Security
    - Enable RLS on new tables
    - Public read access
    - Admin write access
*/

-- Add SEO fields to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords text;

-- Update blog posts to advertisement-style content
UPDATE blog_posts SET
  title = '🔥 STOP Paying for Cable! Get 18,000+ Channels for $15/Month',
  excerpt = 'Why pay $100+ for cable when you can get MORE channels for less? Our IPTV service gives you everything cable offers PLUS international channels, sports packages, and premium content at a fraction of the cost. Order now!',
  content = '<h2>Cable Companies Are Ripping You Off!</h2><p>The average cable bill in 2025 is $127/month. That''s $1,524 per year for limited channels and constant price hikes!</p><h3>Get Our IPTV Instead:</h3><ul><li>✅ 18,000+ Live Channels (vs cable''s 200-300)</li><li>✅ All Premium Sports Packages INCLUDED</li><li>✅ International Channels from 50+ Countries</li><li>✅ Movies & TV Shows On-Demand</li><li>✅ Works on ANY Device</li><li>✅ Only $15/Month - NO CONTRACT!</li></ul><h3>Special Offer: 3-Day FREE Trial</h3><p>Try it risk-free! If you don''t love it, cancel anytime. But we guarantee you''ll never go back to expensive cable.</p><p><strong>Order Now and Save $1,000+ Per Year!</strong></p>',
  meta_title = 'Stop Paying for Cable TV | Get 18,000+ Channels for $15/Month | IPTV',
  meta_description = 'Cut the cord and save $1,000/year! Get 18,000+ live channels, premium sports, and international content for only $15/month. 3-day free trial. No contract. Order now!',
  meta_keywords = 'cut the cord, cable alternative, iptv service, cheap cable alternative, streaming channels, live tv streaming'
WHERE title LIKE '%Cable%';

UPDATE blog_posts SET
  title = '🎯 Jailbroken Fire Stick 4K - Fully Loaded, Ready to Stream!',
  excerpt = 'Get our FULLY JAILBROKEN Fire Stick 4K with EVERYTHING pre-installed! No technical skills needed. Plug in, connect WiFi, start watching. 18,000+ channels, all apps ready. Ships TODAY!',
  content = '<h2>The #1 Jailbroken Fire Stick in America</h2><p>Tired of paying for multiple streaming services? Our jailbroken Fire Stick 4K comes with EVERYTHING you need!</p><h3>What You Get:</h3><ul><li>🔥 Brand New Amazon Fire Stick 4K</li><li>🔥 Fully Jailbroken & Configured</li><li>🔥 18,000+ Live TV Channels Pre-Loaded</li><li>🔥 All Popular Streaming Apps Installed</li><li>🔥 Premium Sports Packages</li><li>🔥 Movies & TV Shows On-Demand</li><li>🔥 Adult Content Available (Optional)</li><li>🔥 Lifetime Support & Updates</li></ul><h3>Why Choose Our Fire Stick?</h3><p><strong>100% Legal:</strong> Jailbreaking is legal. You own the device!</p><p><strong>Easy Setup:</strong> Just plug in and connect to WiFi. That''s it!</p><p><strong>Works Forever:</strong> No monthly fees for the jailbreak. Optional IPTV subscription for live channels.</p><h3>Limited Time: $79.99 (Regular Price $129.99)</h3><p>Ships same day! Order now and start streaming tonight.</p>',
  meta_title = 'Jailbroken Fire Stick 4K Fully Loaded | 18,000+ Channels | Ships Today',
  meta_description = 'Buy the #1 jailbroken Fire Stick 4K with 18,000+ channels pre-installed. Plug & play, ships same day! Only $79.99 with 3 months free IPTV. Order now!',
  meta_keywords = 'jailbroken fire stick, fire stick 4k, fully loaded fire stick, jailbroken firestick 2025, fire stick with kodi, streaming device'
WHERE title LIKE '%Fire Stick 4K%Setup%' OR title LIKE '%Fire Stick 4K%Tutorial%';

UPDATE blog_posts SET
  title = '⚡ Fire Stick 4K Max - The Ultimate Streaming Powerhouse!',
  excerpt = 'The FASTEST Fire Stick ever! Our 4K Max jailbreak includes everything: live TV, sports, movies, international channels. Zero buffering, maximum performance. Get yours TODAY!',
  content = '<h2>Fire Stick 4K Max: Unmatched Performance</h2><p>The Fire Stick 4K Max is 40% more powerful than the regular 4K. Perfect for 4K streaming, gaming, and heavy use!</p><h3>Our Jailbroken 4K Max Includes:</h3><ul><li>⚡ Fire Stick 4K Max (Latest 2024 Model)</li><li>⚡ WiFi 6 Support for FASTER Streaming</li><li>⚡ 18,000+ Live Channels Pre-Loaded</li><li>⚡ All Premium Apps Installed</li><li>⚡ 4K HDR Content Ready</li><li>⚡ Dolby Atmos Audio</li><li>⚡ NO Buffering - Ever!</li><li>⚡ Free Lifetime Updates</li></ul><h3>Perfect For:</h3><ul><li>✓ 4K Movie Lovers</li><li>✓ Sports Fans</li><li>✓ International Content</li><li>✓ Multiple TVs</li><li>✓ Heavy Streamers</li></ul><h3>Special Bundle Deal: $99.99</h3><p>Includes Fire Stick 4K Max + 3 Months FREE IPTV Service ($45 value)</p><p><strong>Order Now - Ships Within 24 Hours!</strong></p>',
  meta_title = 'Fire Stick 4K Max Jailbroken | WiFi 6 | Zero Buffering | Buy Now',
  meta_description = 'Get the fastest Fire Stick 4K Max jailbroken with 18,000+ channels, WiFi 6, and zero buffering. Only $99.99 with 3 months free IPTV. Ships fast!',
  meta_keywords = 'fire stick 4k max, jailbroken 4k max, fire tv stick 4k max, wifi 6 fire stick, fastest fire stick'
WHERE title LIKE '%4K Max%';

UPDATE blog_posts SET
  title = '🏆 Top 10 IPTV Services for Fire Stick - We''re #1!',
  excerpt = 'We tested 50+ IPTV services. Here''s why our service ranks #1 with 18,000+ channels, 99.9% uptime, and $15/month pricing. See the complete comparison and start your FREE trial!',
  content = '<h2>The BEST IPTV Services for Fire Stick (2025)</h2><p>We spent 6 months testing every major IPTV service. Here are the top 10 ranked by channels, reliability, and value.</p><h3>#1: Our Service (FireStreamPlus) ⭐⭐⭐⭐⭐</h3><ul><li>🥇 18,000+ Live Channels</li><li>🥇 99.9% Uptime Guarantee</li><li>🥇 $15/Month (No Contract)</li><li>🥇 3-Day FREE Trial</li><li>🥇 24/7 Support</li><li>🥇 All Devices Supported</li></ul><h3>Why We''re #1:</h3><p><strong>Most Channels:</strong> More than any competitor at this price.</p><p><strong>Best Reliability:</strong> Enterprise-grade servers, zero downtime.</p><p><strong>Easiest Setup:</strong> One-click installation on Fire Stick.</p><p><strong>Best Support:</strong> Live chat, email, phone. We''re always here.</p><h3>Other Services (For Comparison):</h3><p>#2-10: Various services with 5,000-12,000 channels at $20-40/month.</p><h3>Special Offer: Try Us FREE for 3 Days</h3><p>See why we''re ranked #1. No credit card required for trial!</p><p><strong>Start Your FREE Trial Now!</strong></p>',
  meta_title = 'Top 10 IPTV Services for Fire Stick 2025 | #1 Ranked Review',
  meta_description = 'Top 10 IPTV services tested and ranked. Our service #1 with 18,000+ channels for $15/month. 3-day free trial. See full comparison and order now!',
  meta_keywords = 'best iptv for fire stick, iptv service comparison, top iptv 2025, fire stick iptv, iptv reviews'
WHERE title LIKE '%Top 10 IPTV%';

UPDATE blog_posts SET
  title = '🛠️ Fire Stick Problems? We Fix It FREE with Purchase!',
  excerpt = 'Buy our jailbroken Fire Stick and get FREE lifetime support! We fix ALL Fire Stick problems: buffering, freezing, remote issues, app crashes. Plus 18,000+ channels included!',
  content = '<h2>Fire Stick Problems? We''ve Got You Covered!</h2><p>When you buy our jailbroken Fire Stick, you get FREE lifetime technical support. We fix everything!</p><h3>Common Problems We Fix (FREE):</h3><ul><li>🔧 Buffering Issues</li><li>🔧 App Crashes</li><li>🔧 Remote Not Working</li><li>🔧 WiFi Connection Problems</li><li>🔧 Slow Performance</li><li>🔧 Freezing & Lagging</li><li>🔧 Audio/Video Out of Sync</li><li>🔧 Installation Problems</li></ul><h3>Why Buy From Us?</h3><p><strong>Lifetime Support:</strong> We help you forever, not just for 30 days.</p><p><strong>Expert Team:</strong> We''ve helped 10,000+ customers.</p><p><strong>Fast Response:</strong> Live chat support answers in under 2 minutes.</p><p><strong>Complete Package:</strong> Fire Stick + Setup + Support + Updates</p><h3>Our Fire Stick Package Includes:</h3><ul><li>✓ Jailbroken Fire Stick (Your Choice of Model)</li><li>✓ 18,000+ Channels Pre-Installed</li><li>✓ All Apps Configured</li><li>✓ FREE Lifetime Support</li><li>✓ FREE Updates Forever</li><li>✓ 3-Month IPTV Subscription</li></ul><h3>From $79.99 - Order Now!</h3><p>Never worry about Fire Stick problems again. We handle everything!</p>',
  meta_title = 'Fire Stick Not Working? Free Lifetime Support | Buy Jailbroken Fire Stick',
  meta_description = 'Fire Stick problems? Get FREE lifetime support when you buy our jailbroken Fire Stick. We fix buffering, freezing, and all issues. From $79.99!',
  meta_keywords = 'fire stick not working, fire stick problems, fire stick buffering, fire stick support, fix fire stick'
WHERE title LIKE '%Fire Stick Not Working%' OR title LIKE '%Fire Stick%Problems%';

-- Update Fire Stick products with real Amazon images and high SEO content
UPDATE products SET
  name = '🔥 Jailbroken Fire Stick 4K - Fully Loaded | 18,000+ Channels',
  description = 'BEST-SELLING Fire Stick 4K comes fully jailbroken with 18,000+ live channels, all premium apps, sports packages, and movies pre-installed. Plug & Play - No technical skills needed! Ships same day. Includes 3 months FREE IPTV service ($45 value). 100% legal jailbreak. Lifetime support included. Works on any TV with HDMI. Zero buffering with our optimized settings. One-time payment, no hidden fees. Join 50,000+ happy customers streaming for FREE!',
  image = 'https://m.media-amazon.com/images/I/61QEPUD4wHL._AC_SL1000_.jpg',
  seo_title = 'Jailbroken Fire Stick 4K Fully Loaded | 18,000+ Channels | Free Shipping',
  seo_description = 'Buy the #1 jailbroken Fire Stick 4K with 18,000+ live channels, movies, sports & apps pre-installed. Plug & play setup. Ships today! 3 months free IPTV. Lifetime support. Order now!',
  seo_keywords = 'jailbroken fire stick, fire stick 4k, fully loaded fire stick, fire stick with channels, jailbroken firestick 2025, fire stick with kodi, streaming device, iptv fire stick'
WHERE (name LIKE '%Fire Stick 4K%' OR name LIKE '%FireStick 4K%') AND name NOT LIKE '%Max%' AND type = 'firestick';

UPDATE products SET
  name = '⚡ Fire Stick 4K Max - Ultimate Streaming Power | Jailbroken',
  description = 'FASTEST Fire Stick Ever! The 4K Max is 40% more powerful with WiFi 6 support. Fully jailbroken with 18,000+ channels, zero buffering, 4K HDR streaming. Perfect for sports fans and 4K movie lovers. Includes Dolby Atmos audio. All premium apps pre-configured. Ships within 24 hours with FREE setup guide. Bundle includes 3 months IPTV service FREE ($45 value). Works flawlessly on any TV. Professional jailbreak by certified technicians. Lifetime updates & support. The ultimate cord-cutting solution!',
  image = 'https://m.media-amazon.com/images/I/51TjJOAgWmL._AC_SL1000_.jpg',
  seo_title = 'Fire Stick 4K Max Jailbroken | WiFi 6 | Zero Buffering | Free Shipping',
  seo_description = 'Get the ultimate Fire Stick 4K Max jailbroken with 18,000+ channels, WiFi 6, 4K HDR, and zero buffering. Ships fast! 3 months free IPTV included. Order the best streaming device now!',
  seo_keywords = 'fire stick 4k max, jailbroken 4k max, fire tv stick 4k max, fastest fire stick, wifi 6 fire stick, 4k streaming device, fire stick max jailbroken'
WHERE name LIKE '%4K Max%' AND type = 'firestick';

UPDATE products SET
  name = '📺 Amazon Fire Stick Basic - Jailbroken | Perfect Starter',
  description = 'AFFORDABLE entry into cord-cutting! Original Fire Stick fully jailbroken with 18,000+ live channels and all popular apps installed. Perfect for HD TVs (non-4K). Easy plug & play setup - works in 5 minutes! Includes 1 month FREE IPTV service ($15 value). Great for bedrooms, guest rooms, or anyone on a budget. Streams in full HD 1080p. Comes with Alexa voice remote. Professional jailbreak with lifetime support. No monthly fees for jailbreak. Perfect gift for family & friends!',
  image = 'https://m.media-amazon.com/images/I/51CgKGfMclL._AC_SL1000_.jpg',
  seo_title = 'Jailbroken Amazon Fire Stick Basic | 18,000+ Channels | Budget Streaming',
  seo_description = 'Best value! Amazon Fire Stick Basic jailbroken with 18,000+ channels for only $59.99. Perfect starter streaming device. 1 month free IPTV. Ships today!',
  seo_keywords = 'amazon fire stick, jailbroken fire stick, fire stick basic, cheap fire stick, budget streaming, fire stick under 100, fire tv stick'
WHERE name LIKE '%Fire TV Stick%' OR (name LIKE '%Fire Stick%' AND name NOT LIKE '%4K%') AND type = 'firestick';

-- Create blog article pages table
CREATE TABLE IF NOT EXISTS blog_article_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  full_content text NOT NULL,
  read_time integer DEFAULT 8,
  word_count integer DEFAULT 2000,
  author text DEFAULT 'FireStreamPlus Team',
  published_date timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  views integer DEFAULT 0,
  shares integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_article_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read blog articles"
  ON blog_article_pages
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage blog articles"
  ON blog_article_pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_blog_articles_post ON blog_article_pages(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_article_pages(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published ON blog_article_pages(published_date DESC);
