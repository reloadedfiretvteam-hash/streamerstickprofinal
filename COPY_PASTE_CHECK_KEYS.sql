-- ============================================================
-- COPY-PASTE THIS TO CHECK YOUR STRIPE KEYS
-- ============================================================
-- Go to Supabase → SQL Editor → Paste this → Click Run
-- ============================================================

SELECT 
  setting_key,
  CASE 
    WHEN setting_key = 'stripe_publishable_key' THEN 
      CASE 
        WHEN setting_value IS NULL THEN '❌ MISSING - Add your pk_test_ or pk_live_ key'
        WHEN setting_value = '' THEN '❌ EMPTY - Add your pk_test_ or pk_live_ key'
        WHEN setting_value LIKE 'pk_test_%' THEN '✅ VALID TEST KEY'
        WHEN setting_value LIKE 'pk_live_%' THEN '✅ VALID LIVE KEY'
        ELSE '❌ WRONG FORMAT - Should start with pk_test_ or pk_live_'
      END
    WHEN setting_key = 'stripe_secret_key' THEN 
      CASE 
        WHEN setting_value IS NULL THEN '❌ MISSING - Add your sk_test_ or sk_live_ key'
        WHEN setting_value = '' THEN '❌ EMPTY - Add your sk_test_ or sk_live_ key'
        WHEN setting_value LIKE 'sk_test_%' THEN '✅ VALID TEST KEY'
        WHEN setting_value LIKE 'sk_live_%' THEN '✅ VALID LIVE KEY'
        ELSE '❌ WRONG FORMAT - Should start with sk_test_ or sk_live_'
      END
  END as status,
  CASE 
    WHEN setting_value IS NOT NULL AND setting_value != '' THEN
      LEFT(setting_value, 12) || '...' || RIGHT(setting_value, 4)
    ELSE 'NO KEY FOUND'
  END as key_preview
FROM site_settings
WHERE setting_key IN ('stripe_publishable_key', 'stripe_secret_key')
ORDER BY setting_key;

-- ============================================================
-- IF KEYS ARE MISSING, COPY-PASTE ONE OF THESE:
-- ============================================================

-- ADD PUBLISHABLE KEY (replace pk_test_YOUR_KEY_HERE with your actual key):
/*
INSERT INTO site_settings (setting_key, setting_value)
VALUES ('stripe_publishable_key', 'pk_test_YOUR_KEY_HERE')
ON CONFLICT (setting_key) 
DO UPDATE SET setting_value = EXCLUDED.setting_value;
*/

-- ADD SECRET KEY (replace sk_test_YOUR_KEY_HERE with your actual key):
/*
INSERT INTO site_settings (setting_key, setting_value)
VALUES ('stripe_secret_key', 'sk_test_YOUR_KEY_HERE')
ON CONFLICT (setting_key) 
DO UPDATE SET setting_value = EXCLUDED.setting_value;
*/

