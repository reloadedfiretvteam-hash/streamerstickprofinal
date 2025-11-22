/*
  # Enable NOWPayments Bitcoin Gateway with API Key Placeholder
  
  1. Updates
    - Update payment_gateways table to enable NOWPayments
    - Add placeholder for API key (to be replaced with actual key)
    - Set up proper configuration structure
  
  2. Configuration
    - Gateway: NOWPayments
    - Status: Enabled (ready for API key)
    - API URL: https://api.nowpayments.io/v1
    - Supports: BTC, ETH, USDT, and 300+ cryptocurrencies
  
  3. Instructions
    - Replace 'YOUR_NOWPAYMENTS_API_KEY_HERE' with actual API key
    - Get your API key from: https://account.nowpayments.io/settings/api-keys
    - IPN Secret from: https://account.nowpayments.io/settings/api-keys (IPN section)
*/

-- Update NOWPayments gateway configuration
UPDATE payment_gateways
SET 
  is_active = true,
  is_test_mode = false,
  api_key_encrypted = 'YOUR_NOWPAYMENTS_API_KEY_HERE',
  webhook_secret_encrypted = 'YOUR_IPN_SECRET_HERE',
  additional_config = jsonb_build_object(
    'api_url', 'https://api.nowpayments.io/v1',
    'ipn_secret', 'YOUR_IPN_SECRET_HERE',
    'sandbox_mode', false,
    'auto_convert', true,
    'accepted_currencies', ARRAY['BTC', 'ETH', 'USDT', 'LTC', 'BCH'],
    'default_currency', 'BTC'
  ),
  display_name = 'NOWPayments (Bitcoin & Crypto)',
  updated_at = now()
WHERE gateway_name = 'nowpayments';

-- Ensure bitcoin_orders table is ready
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bitcoin_orders' 
    AND column_name = 'nowpayments_invoice_id'
  ) THEN
    ALTER TABLE bitcoin_orders 
    ADD COLUMN IF NOT EXISTS nowpayments_invoice_id text,
    ADD COLUMN IF NOT EXISTS nowpayments_payment_url text;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bitcoin_orders_nowpayments_invoice 
  ON bitcoin_orders(nowpayments_invoice_id) 
  WHERE nowpayments_invoice_id IS NOT NULL;