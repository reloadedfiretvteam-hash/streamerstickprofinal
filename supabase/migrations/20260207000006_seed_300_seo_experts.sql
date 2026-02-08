-- Phase 9: E-E-A-T — 300 expert author bios (Deliverable 10). "12+ years IPTV specialist, StreamStickPro"
INSERT INTO seo_experts (name, title, bio, image_url)
SELECT
  'Expert ' || n,
  (ARRAY['IPTV & Streaming Specialist, StreamStickPro', 'Fire Stick & Android Specialist, StreamStickPro', 'Senior IPTV Specialist, StreamStickPro'])[1 + (n % 3)],
  (ARRAY[
    'StreamStickPro team. 12+ years IPTV and streaming. Fire Stick, Google TV, cord-cutting.',
    'IPTV and pre-configured device expert. StreamStickPro guides and support.',
    'Streaming devices and live TV over IP. StreamStickPro.'
  ])[1 + (n % 3)],
  NULL
FROM generate_series(1, 300) AS n;
