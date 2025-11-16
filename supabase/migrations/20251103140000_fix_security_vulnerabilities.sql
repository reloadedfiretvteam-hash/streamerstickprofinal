/*
  # Fix Security Vulnerabilities

  ## Security Fixes
  1. Remove SECURITY DEFINER from views
  2. Set search_path for all functions to prevent injection attacks

  ## Functions Fixed
  - log_order_status_change
  - verify_admin_password
  - log_blocked_request
  - create_order_notification
  - generate_tracking_code
  - generate_internal_code
  - create_order_code_for_order
  - generate_order_code
  - create_payment_transaction
  - confirm_payment_transaction
  - update_frontend_settings_timestamp
  - update_seo_settings_timestamp
*/

-- Drop SECURITY DEFINER view if it exists
DROP VIEW IF EXISTS order_stats_summary;

-- Recreate view without SECURITY DEFINER
CREATE OR REPLACE VIEW order_stats_summary AS
SELECT
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE order_status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE order_status = 'processing') as processing_orders,
  COUNT(*) FILTER (WHERE order_status = 'completed') as completed_orders,
  COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as total_revenue,
  COALESCE(AVG(total_amount), 0) as average_order_value
FROM orders_full;

-- Fix log_order_status_change function
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.order_status IS DISTINCT FROM NEW.order_status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.order_status, NEW.order_status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- Fix verify_admin_password function
DROP FUNCTION IF EXISTS verify_admin_password(text, text);
CREATE FUNCTION verify_admin_password(input_username TEXT, input_password TEXT)
RETURNS TABLE (
  id uuid,
  username text,
  email text,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.username,
    a.email,
    a.role
  FROM admin_users a
  WHERE a.username = input_username
    AND a.password = crypt(input_password, a.password)
    AND a.is_active = true;
END;
$$;

-- Fix log_blocked_request function
CREATE OR REPLACE FUNCTION log_blocked_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_logs (
    event_type,
    ip_address,
    user_agent,
    details
  ) VALUES (
    'blocked_request',
    NEW.ip_address,
    NEW.user_agent,
    jsonb_build_object(
      'reason', NEW.reason,
      'endpoint', NEW.endpoint
    )
  );
  RETURN NEW;
END;
$$;

-- Fix create_order_notification function
CREATE OR REPLACE FUNCTION create_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO order_notifications (
    order_id,
    notification_type,
    recipient_email,
    status
  ) VALUES (
    NEW.id,
    'order_created',
    NEW.customer_email,
    'pending'
  );
  RETURN NEW;
END;
$$;

-- Fix generate_tracking_code function
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'TRK-';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    IF i % 4 = 0 AND i < 12 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

-- Fix generate_internal_code function
CREATE OR REPLACE FUNCTION generate_internal_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'INT-';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    IF i % 4 = 0 AND i < 12 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

-- Fix create_order_code_for_order function
CREATE OR REPLACE FUNCTION create_order_code_for_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO order_codes (order_id, code)
  VALUES (NEW.id, generate_order_code());
  RETURN NEW;
END;
$$;

-- Fix generate_order_code function
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'ORD-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    IF i = 4 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

-- Fix create_payment_transaction function
CREATE OR REPLACE FUNCTION create_payment_transaction(
  p_order_id uuid,
  p_payment_method text,
  p_amount numeric,
  p_currency text DEFAULT 'USD'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id uuid;
  v_order_code text;
BEGIN
  -- Generate order code
  v_order_code := generate_order_code();

  -- Insert payment transaction
  INSERT INTO payment_transactions (
    order_id,
    payment_method,
    amount,
    currency,
    order_code,
    status
  ) VALUES (
    p_order_id,
    p_payment_method,
    p_amount,
    p_currency,
    v_order_code,
    'pending'
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

-- Fix confirm_payment_transaction function
CREATE OR REPLACE FUNCTION confirm_payment_transaction(
  p_transaction_id uuid,
  p_transaction_reference text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  -- Update transaction status
  UPDATE payment_transactions
  SET
    status = 'completed',
    transaction_reference = COALESCE(p_transaction_reference, transaction_reference),
    completed_at = now()
  WHERE id = p_transaction_id
  RETURNING order_id INTO v_order_id;

  -- Update order payment status
  IF v_order_id IS NOT NULL THEN
    UPDATE orders_full
    SET payment_status = 'paid'
    WHERE id = v_order_id;
  END IF;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Fix update_frontend_settings_timestamp function
CREATE OR REPLACE FUNCTION update_frontend_settings_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_seo_settings_timestamp function
CREATE OR REPLACE FUNCTION update_seo_settings_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON order_stats_summary TO authenticated;
GRANT SELECT ON order_stats_summary TO anon;
