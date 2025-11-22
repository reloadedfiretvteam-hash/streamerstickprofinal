/*
  # Create Promo Usage Function

  1. New Functions
    - `increment_promo_usage` - Safely increment promotion usage count
  
  2. Purpose
    - Increment usage_count for a specific promotion code
    - Ensures atomic updates to prevent race conditions
*/

-- Create function to increment promotion usage
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE promotions
  SET usage_count = COALESCE(usage_count, 0) + 1,
      updated_at = now()
  WHERE code = promo_code
    AND is_active = true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_promo_usage TO authenticated, anon;
