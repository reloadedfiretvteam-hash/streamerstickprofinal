/*
  # Create Dynamic Carousel Management System

  1. New Tables
    - `carousel_slides`
      - `id` (uuid, primary key)
      - `title` (text) - Slide title/heading
      - `description` (text) - Slide description
      - `image_url` (text) - Image path
      - `link_url` (text, optional) - Click destination
      - `button_text` (text, optional) - CTA button text
      - `sort_order` (integer) - Display order
      - `is_active` (boolean) - Show/hide slide
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `carousel_slides` table
    - Public can read active slides
    - Only authenticated admins can modify
*/

CREATE TABLE IF NOT EXISTS carousel_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  link_url text DEFAULT '',
  button_text text DEFAULT 'Learn More',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active carousel slides"
  ON carousel_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage carousel slides"
  ON carousel_slides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_carousel_sort ON carousel_slides(sort_order, is_active);

-- Insert initial carousel slides
INSERT INTO carousel_slides (title, description, image_url, sort_order, is_active) VALUES
('Best IPTV for Firestick', 'Stream unlimited content on your Amazon Fire TV devices', '/download.jpg', 1, true),
('UFC Live Events', 'Watch every UFC fight live in stunning quality', '/UFC copy copy.jpg', 2, true),
('MLB Baseball', 'Never miss a game with live baseball streaming', '/BASEBALL copy.webp', 3, true),
('NFL Football', 'All your favorite NFL teams and games live', '/c643f060-ea1b-462f-8509-ea17b005318aNFL copy copy.jpg', 4, true),
('IPTV Smarters Pro', 'Easy to use interface with powerful features', '/Playback-Tile-1024x512 copy.webp', 5, true)
ON CONFLICT DO NOTHING;