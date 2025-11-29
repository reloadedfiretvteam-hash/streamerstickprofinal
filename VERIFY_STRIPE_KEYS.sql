-- ============================================================
-- VERIFY YOUR STRIPE KEYS IN SUPABASE
-- ============================================================
-- Copy and paste this into Supabase SQL Editor to check your keys
-- ============================================================

-- Check if keys exist and their format
SELECT 
  setting_key,
  CASE 
    WHEN setting_key = 'stripe_publishable_key' THEN 
      CASE 
        WHEN setting_value IS NULL THEN '❌ MISSING'
        WHEN setting_value = '' THEN '❌ EMPTY'
        WHEN setting_value LIKE 'pk_test_%' THEN '✅ VALID TEST KEY'
        WHEN setting_value LIKE 'pk_live_%' THEN '✅ VALID LIVE KEY'
        ELSE '❌ INVALID FORMAT (should start with pk_test_ or pk_live_)'
      END
    WHEN setting_key = 'stripe_secret_key' THEN 
      CASE 
        WHEN setting_value IS NULL THEN '❌ MISSING'
        WHEN setting_value = '' THEN '❌ EMPTY'
        WHEN setting_value LIKE 'sk_test_%' THEN '✅ VALID TEST KEY'
        WHEN setting_value LIKE 'sk_live_%' THEN '✅ VALID LIVE KEY'
        ELSE '❌ INVALID FORMAT (should start with sk_test_ or sk_live_)'
      END
  END as status,
  CASE 
    WHEN setting_value IS NOT NULL AND setting_value != '' THEN
      LEFT(setting_value, 12) || '...' || RIGHT(setting_value, 4)
    ELSE 'NO KEY'
  END as key_preview,
  LENGTH(setting_value) as key_length,
  CASE 
    WHEN setting_key = 'stripe_publishable_key' AND LENGTH(setting_value) > 50 THEN '✅ Length OK'
    WHEN setting_key = 'stripe_secret_key' AND LENGTH(setting_value) > 50 THEN '✅ Length OK'
    WHEN setting_value IS NULL OR setting_value = '' THEN '❌ No key'
    ELSE '⚠️ Key seems too short'
  END as length_check
FROM site_settings
WHERE setting_key IN ('stripe_publishable_key', 'stripe_secret_key')
ORDER BY setting_key;

-- ============================================================
-- If keys are missing, run these to add them:
-- ============================================================

-- Add Publishable Key (replace YOUR_KEY_HERE)
-- INSERT INTO site_settings (setting_key, setting_value)
-- VALUES ('stripe_publishable_key', 'pk_test_YOUR_KEY_HERE')
-- ON CONFLICT (setting_key) 
-- DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Add Secret Key (replace YOUR_KEY_HERE)
-- INSERT INTO site_settings (setting_key, setting_value)
-- VALUES ('stripe_secret_key', 'sk_test_YOUR_KEY_HERE')
-- ON CONFLICT (setting_key) 
-- DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- ============================================================
-- Check all payment-related settings:
-- ============================================================

SELECT setting_key, 
       CASE 
         WHEN setting_value IS NOT NULL AND setting_value != '' THEN '✅ SET'
         ELSE '❌ NOT SET'
       END as status,
       LEFT(setting_value, 30) || CASE WHEN LENGTH(setting_value) > 30 THEN '...' ELSE '' END as preview
FROM site_settings
WHERE setting_key LIKE '%stripe%' 
   OR setting_key LIKE '%payment%'
   OR setting_key IN ('cashapp_tag', 'bitcoin_address', 'wise_email')
ORDER BY setting_key;

