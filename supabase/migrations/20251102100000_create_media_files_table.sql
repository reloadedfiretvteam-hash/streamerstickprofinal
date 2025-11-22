/*
  # Create Media Files Table
  
  1. New Table
    - media_files: Stores uploaded file URLs and metadata
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create media files table
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  filename text NOT NULL,
  file_type text DEFAULT 'file',
  file_size bigint DEFAULT 0,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Policies (allow authenticated users to manage files)
CREATE POLICY "Anyone can view media files"
  ON media_files
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload files"
  ON media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update files"
  ON media_files
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete files"
  ON media_files
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_at ON media_files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
