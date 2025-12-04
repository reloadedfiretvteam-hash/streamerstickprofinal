/*
  # Add Bing Webmaster Tools Verification

  This migration adds the bing_webmaster_verification column to seo_settings table
  to support Bing Webmaster Tools site verification.
*/

-- Add bing_webmaster_verification column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'seo_settings' AND column_name = 'bing_webmaster_verification'
  ) THEN
    ALTER TABLE seo_settings
    ADD COLUMN bing_webmaster_verification text DEFAULT 'YOUR_BING_VERIFICATION_CODE';

    -- Update existing row with default if it exists
    UPDATE seo_settings
    SET bing_webmaster_verification = 'YOUR_BING_VERIFICATION_CODE'
    WHERE id = '00000000-0000-0000-0000-000000000001'
    AND bing_webmaster_verification IS NULL;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN seo_settings.bing_webmaster_verification IS 'Bing Webmaster Tools verification code for site ownership verification';
