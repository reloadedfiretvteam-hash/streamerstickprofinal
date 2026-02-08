-- E-E-A-T author database: 300 expert entries for seo_experts (Deliverable 10).
-- Run after 20260207000001_seo_domination_schema.sql.
-- Replace [N] with actual names/bios as you onboard real contributors.

INSERT INTO seo_experts (name, title, bio, image_url)
SELECT
  'Expert ' || n,
  'IPTV & Streaming Specialist, StreamStickPro',
  'StreamStickPro team member focused on IPTV, Fire Stick, and streaming device guides. Expertise in cord-cutting and live TV over IP.',
  NULL
FROM generate_series(1, 300) AS n;

-- Note: seo_experts has no UNIQUE constraint on (name); if your table has one, use:
-- INSERT INTO seo_experts (name, title, bio, image_url) VALUES
-- ('Alex Rivera', 'IPTV Specialist, StreamStickPro', '12+ years IPTV and streaming. StreamStickPro.', NULL),
-- ('Jordan Lee', 'Fire Stick & Android Specialist, StreamStickPro', 'Expert in pre-configured Fire Sticks and Kodi/Stremio setup.', NULL),
-- ... (add 298 more or use script to generate 300 with varied names/titles)
-- ON CONFLICT (name) DO NOTHING;
