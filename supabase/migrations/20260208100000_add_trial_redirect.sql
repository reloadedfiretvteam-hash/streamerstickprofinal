-- Ensure /trial redirect exists (Phase 1 money pages)
INSERT INTO redirect_map (old_path, new_path, status_code)
VALUES ('/trial', '/', 301)
ON CONFLICT (old_path) DO NOTHING;
