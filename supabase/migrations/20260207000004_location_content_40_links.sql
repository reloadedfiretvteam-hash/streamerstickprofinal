-- Phase 1 prompt: 30 H2, 20 numbered lists, 15 tables (structure); 40 internal links per page.
-- Add content_blocks JSONB; set 40 internal links (15 pillars, 15 money, 10 contextual) for all location pages.

ALTER TABLE seo_architecture ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT NULL;

-- 40 internal links: 15 pillar, 15 money/trial/pricing, 10 contextual (prompt line-for-line)
UPDATE seo_architecture
SET internal_links = '[
  {"url":"/iptv-services","anchor":"IPTV Services"},
  {"url":"/iptv-firestick","anchor":"IPTV for Fire Stick"},
  {"url":"/jailbroken-fire-sticks","anchor":"Jailbroken Fire Sticks"},
  {"url":"/firestick-devices","anchor":"Fire Stick Devices"},
  {"url":"/best-iptv-firestick","anchor":"Best IPTV Firestick"},
  {"url":"/iptv-media-players","anchor":"IPTV Media Players"},
  {"url":"/iptv-services","anchor":"Live TV streaming guide"},
  {"url":"/jailbroken-fire-sticks","anchor":"Pre-loaded Fire Stick"},
  {"url":"/iptv-media-players","anchor":"Google TV IPTV"},
  {"url":"/firestick-devices","anchor":"Streaming devices"},
  {"url":"/best-iptv-firestick","anchor":"IPTV comparison"},
  {"url":"/iptv-firestick","anchor":"Firestick setup"},
  {"url":"/iptv-services","anchor":"IPTV channels"},
  {"url":"/jailbroken-fire-sticks","anchor":"Jailbroken devices"},
  {"url":"/iptv-media-players","anchor":"TiviMate and apps"},
  {"url":"/","anchor":"Home"},
  {"url":"/shop","anchor":"Shop"},
  {"url":"/","anchor":"Free trial"},
  {"url":"/shop","anchor":"Pricing"},
  {"url":"/shop","anchor":"Plans"},
  {"url":"/shop","anchor":"Devices & plans"},
  {"url":"/shop","anchor":"Live TV subscription"},
  {"url":"/","anchor":"Get started"},
  {"url":"/shop","anchor":"IPTV plans"},
  {"url":"/shop","anchor":"Fire Stick with TV"},
  {"url":"/shop","anchor":"Streaming plans"},
  {"url":"/shop","anchor":"Order now"},
  {"url":"/shop","anchor":"Subscribe"},
  {"url":"/","anchor":"Start free trial"},
  {"url":"/blog","anchor":"Blog"},
  {"url":"/resources","anchor":"Resources"},
  {"url":"/terms","anchor":"Terms"},
  {"url":"/privacy","anchor":"Privacy"},
  {"url":"/refund","anchor":"Refund policy"},
  {"url":"/blog","anchor":"Guides"},
  {"url":"/resources","anchor":"Channel directory"},
  {"url":"/iptv-services","anchor":"IPTV guide"},
  {"url":"/jailbroken-fire-sticks","anchor":"Setup guide"},
  {"url":"/blog","anchor":"Cord cutting tips"}
]'::jsonb
WHERE published = true;

-- Seed content_blocks template (H2 sections, numbered lists, tables) for featured-snippet structure. Full 30/20/15 can be filled via admin.
UPDATE seo_architecture
SET content_blocks = '{
  "h2_sections": [
    {"heading": "What is IPTV?", "body": "IPTV delivers live TV over the internet. StreamStickPro offers 18,000+ channels for Fire Stick and Google TV."},
    {"heading": "How do I get IPTV in my area?", "body": "StreamStickPro works nationwide. Order a pre-configured Fire Stick or sign up for an IPTV plan; 18,000+ channels stream over the internet."},
    {"heading": "What is a jailbroken Fire Stick?", "body": "A jailbroken Fire Stick runs apps like Kodi and Stremio for streaming. StreamStickPro ships devices ready to stream 18,000+ channels."},
    {"heading": "Does StreamStickPro work on Google TV?", "body": "Yes. StreamStickPro IPTV works on Google TV, Chromecast, Fire Stick, and Android. Same 18,000+ channels everywhere."},
    {"heading": "Is there a free trial?", "body": "Yes. StreamStickPro offers a free trial. Visit the homepage to start streaming 18,000+ channels on your device."}
  ],
  "numbered_lists": [
    {"title": "How to get started in 4 steps", "items": ["Order a Fire Stick or IPTV plan from StreamStickPro.", "Receive your credentials or device by mail.", "Enter credentials in TiviMate or your app.", "Stream 18,000+ channels and 100,000+ movies."]},
    {"title": "Why choose StreamStickPro", "items": ["18,000+ live TV channels.", "100,000+ movies and series.", "Works on Fire Stick, Google TV, Android.", "Free trial available.", "24/7 support."]},
    {"title": "Supported devices", "items": ["Amazon Fire TV Stick (all models).", "Google TV and Chromecast.", "Android phones and tablets.", "Smart TVs with Android."]}
  ],
  "tables": [
    {"caption": "StreamStickPro at a glance", "headers": ["Feature", "Details"], "rows": [["Channels", "18,000+"], ["Movies & series", "100,000+"], ["Devices", "Fire Stick, Google TV, Android"], ["Free trial", "Yes"]]},
    {"caption": "Service comparison", "headers": ["Service", "Best for"], "rows": [["IPTV plans", "Live TV streaming"], ["Jailbroken Fire Stick", "All-in-one device"], ["Google TV", "Chromecast and Google TV users"]]}
  ]
}'::jsonb
WHERE published = true;
