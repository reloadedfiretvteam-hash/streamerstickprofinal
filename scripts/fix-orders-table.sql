-- Run this in Supabase SQL Editor to fix the orders table
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste this → Run

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_message TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('customer_message', 'customer_phone');
