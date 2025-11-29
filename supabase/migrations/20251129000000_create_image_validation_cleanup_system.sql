/*
  # Image Validation and Cleanup System
  
  This migration creates functions to validate and purge corrupt or 
  minimum-size placeholder image records from the database.

  1. Functions Created:
    - validate_image_urls() - Validates image URLs and detects corrupt/placeholder records
    - purge_invalid_image_records() - Removes or updates records with invalid images
    - get_image_validation_stats() - Returns statistics about image validation

  2. Features:
    - Detects placeholder images (pexels, unsplash, etc.)
    - Detects corrupt/minimum-size placeholder patterns
    - Validates URL format consistency
    - Provides consistent SQL data pattern handling for image cleanup
*/

-- Function to validate image URLs and detect invalid patterns
CREATE OR REPLACE FUNCTION validate_image_urls()
RETURNS TABLE(
  source_table text,
  record_id uuid,
  record_name text,
  image_url_value text,
  validation_status text,
  issue_type text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check products table for invalid images
  RETURN QUERY
  SELECT 
    'products'::text as source_table,
    p.id as record_id,
    p.name as record_name,
    COALESCE(p.image_url, 'NULL')::text as image_url_value,
    CASE
      WHEN p.image_url IS NULL OR p.image_url = '' THEN 'invalid'
      WHEN p.image_url LIKE '%pexels%' THEN 'placeholder'
      WHEN p.image_url LIKE '%unsplash%' THEN 'placeholder'
      WHEN p.image_url LIKE '%placeholder%' THEN 'placeholder'
      WHEN p.image_url LIKE '%dummy%' THEN 'placeholder'
      WHEN p.image_url LIKE 'data:image%' AND LENGTH(p.image_url) < 100 THEN 'corrupt_base64'
      WHEN p.image_url NOT LIKE '/%' AND p.image_url NOT LIKE 'http%' THEN 'invalid_format'
      ELSE 'valid'
    END as validation_status,
    CASE
      WHEN p.image_url IS NULL OR p.image_url = '' THEN 'missing_image'
      WHEN p.image_url LIKE '%pexels%' THEN 'external_placeholder_pexels'
      WHEN p.image_url LIKE '%unsplash%' THEN 'external_placeholder_unsplash'
      WHEN p.image_url LIKE '%placeholder%' THEN 'named_placeholder'
      WHEN p.image_url LIKE '%dummy%' THEN 'dummy_image'
      WHEN p.image_url LIKE 'data:image%' AND LENGTH(p.image_url) < 100 THEN 'corrupted_base64_minimum_size'
      WHEN p.image_url NOT LIKE '/%' AND p.image_url NOT LIKE 'http%' THEN 'malformed_url'
      ELSE 'none'
    END as issue_type
  FROM products p
  WHERE p.image_url IS NULL 
     OR p.image_url = ''
     OR p.image_url LIKE '%pexels%'
     OR p.image_url LIKE '%unsplash%'
     OR p.image_url LIKE '%placeholder%'
     OR p.image_url LIKE '%dummy%'
     OR (p.image_url LIKE 'data:image%' AND LENGTH(p.image_url) < 100)
     OR (p.image_url NOT LIKE '/%' AND p.image_url NOT LIKE 'http%');

  -- Check real_products table for invalid images  
  RETURN QUERY
  SELECT 
    'real_products'::text as source_table,
    rp.id as record_id,
    rp.name as record_name,
    COALESCE(rp.main_image, 'NULL')::text as image_url_value,
    CASE
      WHEN rp.main_image IS NULL OR rp.main_image = '' THEN 'invalid'
      WHEN rp.main_image LIKE '%pexels%' THEN 'placeholder'
      WHEN rp.main_image LIKE '%unsplash%' THEN 'placeholder'
      WHEN rp.main_image LIKE '%placeholder%' THEN 'placeholder'
      WHEN rp.main_image LIKE '%dummy%' THEN 'placeholder'
      WHEN rp.main_image LIKE 'data:image%' AND LENGTH(rp.main_image) < 100 THEN 'corrupt_base64'
      WHEN rp.main_image NOT LIKE '/%' AND rp.main_image NOT LIKE 'http%' THEN 'invalid_format'
      ELSE 'valid'
    END as validation_status,
    CASE
      WHEN rp.main_image IS NULL OR rp.main_image = '' THEN 'missing_image'
      WHEN rp.main_image LIKE '%pexels%' THEN 'external_placeholder_pexels'
      WHEN rp.main_image LIKE '%unsplash%' THEN 'external_placeholder_unsplash'
      WHEN rp.main_image LIKE '%placeholder%' THEN 'named_placeholder'
      WHEN rp.main_image LIKE '%dummy%' THEN 'dummy_image'
      WHEN rp.main_image LIKE 'data:image%' AND LENGTH(rp.main_image) < 100 THEN 'corrupted_base64_minimum_size'
      WHEN rp.main_image NOT LIKE '/%' AND rp.main_image NOT LIKE 'http%' THEN 'malformed_url'
      ELSE 'none'
    END as issue_type
  FROM real_products rp
  WHERE rp.main_image IS NULL 
     OR rp.main_image = ''
     OR rp.main_image LIKE '%pexels%'
     OR rp.main_image LIKE '%unsplash%'
     OR rp.main_image LIKE '%placeholder%'
     OR rp.main_image LIKE '%dummy%'
     OR (rp.main_image LIKE 'data:image%' AND LENGTH(rp.main_image) < 100)
     OR (rp.main_image NOT LIKE '/%' AND rp.main_image NOT LIKE 'http%');

  -- Check blog_posts table for invalid images
  RETURN QUERY
  SELECT 
    'blog_posts'::text as source_table,
    bp.id as record_id,
    bp.title as record_name,
    COALESCE(bp.featured_image, 'NULL')::text as image_url_value,
    CASE
      WHEN bp.featured_image IS NULL OR bp.featured_image = '' THEN 'invalid'
      WHEN bp.featured_image LIKE '%pexels%' THEN 'placeholder'
      WHEN bp.featured_image LIKE '%unsplash%' THEN 'placeholder'
      WHEN bp.featured_image LIKE '%placeholder%' THEN 'placeholder'
      WHEN bp.featured_image LIKE '%dummy%' THEN 'placeholder'
      WHEN bp.featured_image LIKE 'data:image%' AND LENGTH(bp.featured_image) < 100 THEN 'corrupt_base64'
      WHEN bp.featured_image NOT LIKE '/%' AND bp.featured_image NOT LIKE 'http%' THEN 'invalid_format'
      ELSE 'valid'
    END as validation_status,
    CASE
      WHEN bp.featured_image IS NULL OR bp.featured_image = '' THEN 'missing_image'
      WHEN bp.featured_image LIKE '%pexels%' THEN 'external_placeholder_pexels'
      WHEN bp.featured_image LIKE '%unsplash%' THEN 'external_placeholder_unsplash'
      WHEN bp.featured_image LIKE '%placeholder%' THEN 'named_placeholder'
      WHEN bp.featured_image LIKE '%dummy%' THEN 'dummy_image'
      WHEN bp.featured_image LIKE 'data:image%' AND LENGTH(bp.featured_image) < 100 THEN 'corrupted_base64_minimum_size'
      WHEN bp.featured_image NOT LIKE '/%' AND bp.featured_image NOT LIKE 'http%' THEN 'malformed_url'
      ELSE 'none'
    END as issue_type
  FROM blog_posts bp
  WHERE bp.featured_image IS NULL 
     OR bp.featured_image = ''
     OR bp.featured_image LIKE '%pexels%'
     OR bp.featured_image LIKE '%unsplash%'
     OR bp.featured_image LIKE '%placeholder%'
     OR bp.featured_image LIKE '%dummy%'
     OR (bp.featured_image LIKE 'data:image%' AND LENGTH(bp.featured_image) < 100)
     OR (bp.featured_image NOT LIKE '/%' AND bp.featured_image NOT LIKE 'http%');

  -- Check stripe_products table for invalid images
  RETURN QUERY
  SELECT 
    'stripe_products'::text as source_table,
    sp.id as record_id,
    sp.name as record_name,
    COALESCE(sp.image_url, 'NULL')::text as image_url_value,
    CASE
      WHEN sp.image_url IS NULL OR sp.image_url = '' THEN 'invalid'
      WHEN sp.image_url LIKE '%pexels%' THEN 'placeholder'
      WHEN sp.image_url LIKE '%unsplash%' THEN 'placeholder'
      WHEN sp.image_url LIKE '%placeholder%' THEN 'placeholder'
      WHEN sp.image_url LIKE '%dummy%' THEN 'placeholder'
      WHEN sp.image_url LIKE 'data:image%' AND LENGTH(sp.image_url) < 100 THEN 'corrupt_base64'
      WHEN sp.image_url NOT LIKE '/%' AND sp.image_url NOT LIKE 'http%' THEN 'invalid_format'
      ELSE 'valid'
    END as validation_status,
    CASE
      WHEN sp.image_url IS NULL OR sp.image_url = '' THEN 'missing_image'
      WHEN sp.image_url LIKE '%pexels%' THEN 'external_placeholder_pexels'
      WHEN sp.image_url LIKE '%unsplash%' THEN 'external_placeholder_unsplash'
      WHEN sp.image_url LIKE '%placeholder%' THEN 'named_placeholder'
      WHEN sp.image_url LIKE '%dummy%' THEN 'dummy_image'
      WHEN sp.image_url LIKE 'data:image%' AND LENGTH(sp.image_url) < 100 THEN 'corrupted_base64_minimum_size'
      WHEN sp.image_url NOT LIKE '/%' AND sp.image_url NOT LIKE 'http%' THEN 'malformed_url'
      ELSE 'none'
    END as issue_type
  FROM stripe_products sp
  WHERE sp.image_url IS NULL 
     OR sp.image_url = ''
     OR sp.image_url LIKE '%pexels%'
     OR sp.image_url LIKE '%unsplash%'
     OR sp.image_url LIKE '%placeholder%'
     OR sp.image_url LIKE '%dummy%'
     OR (sp.image_url LIKE 'data:image%' AND LENGTH(sp.image_url) < 100)
     OR (sp.image_url NOT LIKE '/%' AND sp.image_url NOT LIKE 'http%');
END;
$$;

-- Function to purge/fix invalid image records by setting them to NULL
-- This allows the application to use default fallback images
CREATE OR REPLACE FUNCTION purge_invalid_image_records(
  p_dry_run boolean DEFAULT true,
  p_default_image text DEFAULT NULL
)
RETURNS TABLE(
  source_table text,
  records_affected integer,
  action_taken text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_products_count integer := 0;
  v_real_products_count integer := 0;
  v_blog_posts_count integer := 0;
  v_stripe_products_count integer := 0;
  v_action text;
BEGIN
  v_action := CASE WHEN p_dry_run THEN 'would_update' ELSE 'updated' END;

  -- Count/Update products table
  IF p_dry_run THEN
    SELECT COUNT(*) INTO v_products_count
    FROM products
    WHERE image_url IS NOT NULL
      AND (
        image_url = ''
        OR image_url LIKE '%pexels%'
        OR image_url LIKE '%unsplash%'
        OR image_url LIKE '%placeholder%'
        OR image_url LIKE '%dummy%'
        OR (image_url LIKE 'data:image%' AND LENGTH(image_url) < 100)
      );
  ELSE
    UPDATE products
    SET image_url = p_default_image,
        updated_at = NOW()
    WHERE image_url IS NOT NULL
      AND (
        image_url = ''
        OR image_url LIKE '%pexels%'
        OR image_url LIKE '%unsplash%'
        OR image_url LIKE '%placeholder%'
        OR image_url LIKE '%dummy%'
        OR (image_url LIKE 'data:image%' AND LENGTH(image_url) < 100)
      );
    GET DIAGNOSTICS v_products_count = ROW_COUNT;
  END IF;

  -- Count/Update real_products table
  IF p_dry_run THEN
    SELECT COUNT(*) INTO v_real_products_count
    FROM real_products
    WHERE main_image IS NOT NULL
      AND (
        main_image = ''
        OR main_image LIKE '%pexels%'
        OR main_image LIKE '%unsplash%'
        OR main_image LIKE '%placeholder%'
        OR main_image LIKE '%dummy%'
        OR (main_image LIKE 'data:image%' AND LENGTH(main_image) < 100)
      );
  ELSE
    UPDATE real_products
    SET main_image = p_default_image,
        updated_at = NOW()
    WHERE main_image IS NOT NULL
      AND (
        main_image = ''
        OR main_image LIKE '%pexels%'
        OR main_image LIKE '%unsplash%'
        OR main_image LIKE '%placeholder%'
        OR main_image LIKE '%dummy%'
        OR (main_image LIKE 'data:image%' AND LENGTH(main_image) < 100)
      );
    GET DIAGNOSTICS v_real_products_count = ROW_COUNT;
  END IF;

  -- Count/Update blog_posts table
  IF p_dry_run THEN
    SELECT COUNT(*) INTO v_blog_posts_count
    FROM blog_posts
    WHERE featured_image IS NOT NULL
      AND (
        featured_image = ''
        OR featured_image LIKE '%pexels%'
        OR featured_image LIKE '%unsplash%'
        OR featured_image LIKE '%placeholder%'
        OR featured_image LIKE '%dummy%'
        OR (featured_image LIKE 'data:image%' AND LENGTH(featured_image) < 100)
      );
  ELSE
    UPDATE blog_posts
    SET featured_image = p_default_image,
        updated_at = NOW()
    WHERE featured_image IS NOT NULL
      AND (
        featured_image = ''
        OR featured_image LIKE '%pexels%'
        OR featured_image LIKE '%unsplash%'
        OR featured_image LIKE '%placeholder%'
        OR featured_image LIKE '%dummy%'
        OR (featured_image LIKE 'data:image%' AND LENGTH(featured_image) < 100)
      );
    GET DIAGNOSTICS v_blog_posts_count = ROW_COUNT;
  END IF;

  -- Count/Update stripe_products table
  IF p_dry_run THEN
    SELECT COUNT(*) INTO v_stripe_products_count
    FROM stripe_products
    WHERE image_url IS NOT NULL
      AND (
        image_url = ''
        OR image_url LIKE '%pexels%'
        OR image_url LIKE '%unsplash%'
        OR image_url LIKE '%placeholder%'
        OR image_url LIKE '%dummy%'
        OR (image_url LIKE 'data:image%' AND LENGTH(image_url) < 100)
      );
  ELSE
    UPDATE stripe_products
    SET image_url = p_default_image,
        updated_at = NOW()
    WHERE image_url IS NOT NULL
      AND (
        image_url = ''
        OR image_url LIKE '%pexels%'
        OR image_url LIKE '%unsplash%'
        OR image_url LIKE '%placeholder%'
        OR image_url LIKE '%dummy%'
        OR (image_url LIKE 'data:image%' AND LENGTH(image_url) < 100)
      );
    GET DIAGNOSTICS v_stripe_products_count = ROW_COUNT;
  END IF;

  -- Return results
  RETURN QUERY SELECT 'products'::text, v_products_count, v_action;
  RETURN QUERY SELECT 'real_products'::text, v_real_products_count, v_action;
  RETURN QUERY SELECT 'blog_posts'::text, v_blog_posts_count, v_action;
  RETURN QUERY SELECT 'stripe_products'::text, v_stripe_products_count, v_action;
END;
$$;

-- Function to get image validation statistics
CREATE OR REPLACE FUNCTION get_image_validation_stats()
RETURNS TABLE(
  source_table text,
  total_records bigint,
  valid_images bigint,
  invalid_images bigint,
  placeholder_images bigint,
  corrupt_images bigint,
  validation_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Stats for products
  RETURN QUERY
  SELECT 
    'products'::text as source_table,
    COUNT(*)::bigint as total_records,
    COUNT(*) FILTER (WHERE 
      image_url IS NOT NULL 
      AND image_url != ''
      AND image_url NOT LIKE '%pexels%'
      AND image_url NOT LIKE '%unsplash%'
      AND image_url NOT LIKE '%placeholder%'
      AND image_url NOT LIKE '%dummy%'
      AND NOT (image_url LIKE 'data:image%' AND LENGTH(image_url) < 100)
    )::bigint as valid_images,
    COUNT(*) FILTER (WHERE image_url IS NULL OR image_url = '')::bigint as invalid_images,
    COUNT(*) FILTER (WHERE 
      image_url LIKE '%pexels%'
      OR image_url LIKE '%unsplash%'
      OR image_url LIKE '%placeholder%'
      OR image_url LIKE '%dummy%'
    )::bigint as placeholder_images,
    COUNT(*) FILTER (WHERE 
      image_url LIKE 'data:image%' AND LENGTH(image_url) < 100
    )::bigint as corrupt_images,
    ROUND(
      COALESCE(
        COUNT(*) FILTER (WHERE 
          image_url IS NOT NULL 
          AND image_url != ''
          AND image_url NOT LIKE '%pexels%'
          AND image_url NOT LIKE '%unsplash%'
          AND image_url NOT LIKE '%placeholder%'
          AND image_url NOT LIKE '%dummy%'
          AND NOT (image_url LIKE 'data:image%' AND LENGTH(image_url) < 100)
        )::numeric / NULLIF(COUNT(*), 0) * 100,
        0
      ), 
      2
    ) as validation_percentage
  FROM products;

  -- Stats for real_products
  RETURN QUERY
  SELECT 
    'real_products'::text as source_table,
    COUNT(*)::bigint as total_records,
    COUNT(*) FILTER (WHERE 
      main_image IS NOT NULL 
      AND main_image != ''
      AND main_image NOT LIKE '%pexels%'
      AND main_image NOT LIKE '%unsplash%'
      AND main_image NOT LIKE '%placeholder%'
      AND main_image NOT LIKE '%dummy%'
      AND NOT (main_image LIKE 'data:image%' AND LENGTH(main_image) < 100)
    )::bigint as valid_images,
    COUNT(*) FILTER (WHERE main_image IS NULL OR main_image = '')::bigint as invalid_images,
    COUNT(*) FILTER (WHERE 
      main_image LIKE '%pexels%'
      OR main_image LIKE '%unsplash%'
      OR main_image LIKE '%placeholder%'
      OR main_image LIKE '%dummy%'
    )::bigint as placeholder_images,
    COUNT(*) FILTER (WHERE 
      main_image LIKE 'data:image%' AND LENGTH(main_image) < 100
    )::bigint as corrupt_images,
    ROUND(
      COALESCE(
        COUNT(*) FILTER (WHERE 
          main_image IS NOT NULL 
          AND main_image != ''
          AND main_image NOT LIKE '%pexels%'
          AND main_image NOT LIKE '%unsplash%'
          AND main_image NOT LIKE '%placeholder%'
          AND main_image NOT LIKE '%dummy%'
          AND NOT (main_image LIKE 'data:image%' AND LENGTH(main_image) < 100)
        )::numeric / NULLIF(COUNT(*), 0) * 100,
        0
      ), 
      2
    ) as validation_percentage
  FROM real_products;

  -- Stats for blog_posts
  RETURN QUERY
  SELECT 
    'blog_posts'::text as source_table,
    COUNT(*)::bigint as total_records,
    COUNT(*) FILTER (WHERE 
      featured_image IS NOT NULL 
      AND featured_image != ''
      AND featured_image NOT LIKE '%pexels%'
      AND featured_image NOT LIKE '%unsplash%'
      AND featured_image NOT LIKE '%placeholder%'
      AND featured_image NOT LIKE '%dummy%'
      AND NOT (featured_image LIKE 'data:image%' AND LENGTH(featured_image) < 100)
    )::bigint as valid_images,
    COUNT(*) FILTER (WHERE featured_image IS NULL OR featured_image = '')::bigint as invalid_images,
    COUNT(*) FILTER (WHERE 
      featured_image LIKE '%pexels%'
      OR featured_image LIKE '%unsplash%'
      OR featured_image LIKE '%placeholder%'
      OR featured_image LIKE '%dummy%'
    )::bigint as placeholder_images,
    COUNT(*) FILTER (WHERE 
      featured_image LIKE 'data:image%' AND LENGTH(featured_image) < 100
    )::bigint as corrupt_images,
    ROUND(
      COALESCE(
        COUNT(*) FILTER (WHERE 
          featured_image IS NOT NULL 
          AND featured_image != ''
          AND featured_image NOT LIKE '%pexels%'
          AND featured_image NOT LIKE '%unsplash%'
          AND featured_image NOT LIKE '%placeholder%'
          AND featured_image NOT LIKE '%dummy%'
          AND NOT (featured_image LIKE 'data:image%' AND LENGTH(featured_image) < 100)
        )::numeric / NULLIF(COUNT(*), 0) * 100,
        0
      ), 
      2
    ) as validation_percentage
  FROM blog_posts;

  -- Stats for stripe_products
  RETURN QUERY
  SELECT 
    'stripe_products'::text as source_table,
    COUNT(*)::bigint as total_records,
    COUNT(*) FILTER (WHERE 
      image_url IS NOT NULL 
      AND image_url != ''
      AND image_url NOT LIKE '%pexels%'
      AND image_url NOT LIKE '%unsplash%'
      AND image_url NOT LIKE '%placeholder%'
      AND image_url NOT LIKE '%dummy%'
      AND NOT (image_url LIKE 'data:image%' AND LENGTH(image_url) < 100)
    )::bigint as valid_images,
    COUNT(*) FILTER (WHERE image_url IS NULL OR image_url = '')::bigint as invalid_images,
    COUNT(*) FILTER (WHERE 
      image_url LIKE '%pexels%'
      OR image_url LIKE '%unsplash%'
      OR image_url LIKE '%placeholder%'
      OR image_url LIKE '%dummy%'
    )::bigint as placeholder_images,
    COUNT(*) FILTER (WHERE 
      image_url LIKE 'data:image%' AND LENGTH(image_url) < 100
    )::bigint as corrupt_images,
    ROUND(
      COALESCE(
        COUNT(*) FILTER (WHERE 
          image_url IS NOT NULL 
          AND image_url != ''
          AND image_url NOT LIKE '%pexels%'
          AND image_url NOT LIKE '%unsplash%'
          AND image_url NOT LIKE '%placeholder%'
          AND image_url NOT LIKE '%dummy%'
          AND NOT (image_url LIKE 'data:image%' AND LENGTH(image_url) < 100)
        )::numeric / NULLIF(COUNT(*), 0) * 100,
        0
      ), 
      2
    ) as validation_percentage
  FROM stripe_products;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_image_urls() TO authenticated;
GRANT EXECUTE ON FUNCTION purge_invalid_image_records(boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_image_validation_stats() TO authenticated;

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '✅ Image validation and cleanup functions created successfully';
  RAISE NOTICE 'Available functions:';
  RAISE NOTICE '  - validate_image_urls(): Lists all invalid image records';
  RAISE NOTICE '  - purge_invalid_image_records(dry_run, default_image): Clean up invalid images';
  RAISE NOTICE '  - get_image_validation_stats(): Get statistics about image validation';
END $$;
