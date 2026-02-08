-- Phase 1 prompt: 30 H2 questions, 20 numbered lists, 15 tables per location page
ALTER TABLE seo_architecture ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '{}';

COMMENT ON COLUMN seo_architecture.content_blocks IS 'h2_sections, numbered_lists, tables for snippet and PAA targeting.';

-- Backfill: template content with [LOCATION] (replaced at render time)
UPDATE seo_architecture
SET content_blocks = '{
  "h2_sections": [
    {"heading": "What is IPTV in [LOCATION]?", "body": "StreamStickPro delivers 18,000+ IPTV channels and jailbroken Fire Sticks with Kodi/Stremio pre-installed. Works on Google TV and Chromecast. Free trial available in [LOCATION]."},
    {"heading": "How does jailbroken Fire Stick work in [LOCATION]?", "body": "A jailbroken Fire Stick in [LOCATION] gives you access to 18,000+ live channels and 100,000+ movies. StreamStickPro pre-configures your device so you are ready in 10 minutes."},
    {"heading": "Is IPTV legal in [LOCATION]?", "body": "IPTV technology is legal. StreamStickPro provides licensed content and fully loaded devices. Check local regulations in [LOCATION] for streaming services."},
    {"heading": "Best IPTV for Fire Stick in [LOCATION]", "body": "StreamStickPro is the best IPTV for Fire Stick in [LOCATION]: 18,000+ channels, TiviMate-ready, free trial. Pre-loaded devices ship fast."},
    {"heading": "Google TV IPTV in [LOCATION]", "body": "StreamStickPro works on Google TV and Chromecast in [LOCATION]. Same 18,000+ channels and apps. Start your free trial today."},
    {"heading": "How to set up IPTV in [LOCATION]", "body": "Order a pre-configured device or plan. Use your instant credentials and our 10-minute setup video. StreamStickPro support is available 24/7 for [LOCATION] customers."},
    {"heading": "Cheap IPTV [LOCATION]", "body": "StreamStickPro offers affordable IPTV and jailbroken Fire Sticks for [LOCATION]. Compare plans on our shop page. Free trial available."},
    {"heading": "IPTV channels list [LOCATION]", "body": "Get 18,000+ live TV channels including sports, news, and entertainment. StreamStickPro channel list works in [LOCATION] on Fire Stick and Google TV."},
    {"heading": "Jailbroken Fire Stick near [LOCATION]", "body": "Order StreamStickPro jailbroken Fire Sticks online; we ship to [LOCATION]. Pre-loaded with Kodi and Stremio. No store visit needed."},
    {"heading": "IPTV free trial [LOCATION]", "body": "Start a free IPTV trial for [LOCATION]. StreamStickPro lets you test 18,000+ channels on Fire Stick or Google TV before you commit."}
  ],
  "numbered_lists": [
    {"title": "Steps to get IPTV in [LOCATION]", "items": ["Choose a plan or device on StreamStickPro", "Create an account and complete checkout", "Receive instant credentials or pre-loaded device", "Follow the 10-minute setup guide", "Start streaming 18,000+ channels"]},
    {"title": "Why StreamStickPro for [LOCATION]", "items": ["18,000+ live TV channels", "100,000+ movies and series", "Works on Fire Stick, Google TV, Chromecast", "Pre-configured devices ready in 10 minutes", "24/7 support and free trial"]},
    {"title": "Top IPTV apps for [LOCATION]", "items": ["TiviMate", "IPTV Smarters", "Perfect Player", "Kodi", "Stremio"]},
    {"title": "What you need for IPTV in [LOCATION]", "items": ["Stable internet connection", "Fire Stick, Android TV, or Google TV device", "StreamStickPro subscription or pre-loaded device", "Email for credentials"]},
    {"title": "StreamStickPro plans for [LOCATION]", "items": ["Monthly IPTV plan", "Quarterly plan", "Annual plan", "Pre-loaded Fire Stick with 1 year included"]}
  ],
  "tables": [
    {"caption": "IPTV comparison [LOCATION]", "headers": ["Feature", "StreamStickPro"], "rows": [["Channels", "18,000+"], ["Devices", "Fire Stick, Google TV, Android"], ["Setup", "10 minutes"], ["Support", "24/7"]]},
    {"caption": "Device options for [LOCATION]", "headers": ["Device", "Best for"], "rows": [["Fire Stick 4K", "Most popular"], ["Fire Stick 4K Max", "Best performance"], ["Google TV", "Android users"], ["Chromecast", "Cast from phone"]]}
  ]
}'::jsonb
WHERE content_blocks IS NULL OR content_blocks = '{}' OR content_blocks = 'null';
