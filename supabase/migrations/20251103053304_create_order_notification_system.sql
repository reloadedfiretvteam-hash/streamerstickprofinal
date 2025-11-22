/*
  # Order Notification and Tracking System

  ## Overview
  Complete order tracking system with automatic email notifications to both store owner
  and customers when orders are placed or updated.

  ## New Tables

  ### 1. `order_status_history`
  Track all status changes for orders with timestamps
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key to orders_full)
  - `old_status` (text) - Previous order status
  - `new_status` (text) - New order status
  - `changed_by` (text) - Who made the change (admin email or 'system')
  - `notes` (text) - Optional notes about the change
  - `created_at` (timestamptz) - When the change happened

  ### 2. `order_notifications`
  Track all notifications sent for orders
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key to orders_full)
  - `notification_type` (text) - 'order_placed', 'status_update', 'shipped', etc.
  - `recipient_email` (text) - Who received the notification
  - `recipient_type` (text) - 'customer' or 'owner'
  - `subject` (text) - Email subject
  - `body` (text) - Email body content
  - `status` (text) - 'pending', 'sent', 'failed'
  - `error_message` (text) - If failed, why
  - `sent_at` (timestamptz) - When notification was sent
  - `created_at` (timestamptz)

  ### 3. `store_settings`
  Store owner email and notification preferences
  - `id` (uuid, primary key)
  - `owner_email` (text) - Store owner email for order notifications
  - `owner_name` (text) - Store owner name
  - `notify_on_new_order` (boolean) - Send email on new orders
  - `notify_on_payment` (boolean) - Send email on payment status change
  - `auto_email_customer` (boolean) - Automatically email customers on status updates
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Only authenticated admins can modify settings
  - Read-only access for order history
*/

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders_full(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by text DEFAULT 'system',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
  ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at
  ON order_status_history(created_at DESC);

-- Create order_notifications table
CREATE TABLE IF NOT EXISTS order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders_full(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('customer', 'owner')),
  subject text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_notifications_order_id
  ON order_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_status
  ON order_notifications(status);
CREATE INDEX IF NOT EXISTS idx_order_notifications_created_at
  ON order_notifications(created_at DESC);

-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_email text NOT NULL,
  owner_name text DEFAULT 'Store Owner',
  notify_on_new_order boolean DEFAULT true,
  notify_on_payment boolean DEFAULT true,
  auto_email_customer boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default store settings
INSERT INTO store_settings (owner_email, owner_name, notify_on_new_order, notify_on_payment, auto_email_customer)
VALUES ('reloadedfiretvteam@gmail.com', 'Inferno TV Team', true, true, true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_status_history
CREATE POLICY "Anyone can view order status history"
  ON order_status_history FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert order status history"
  ON order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
    )
  );

-- RLS Policies for order_notifications
CREATE POLICY "Anyone can view order notifications"
  ON order_notifications FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage order notifications"
  ON order_notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
    )
  );

-- RLS Policies for store_settings
CREATE POLICY "Anyone can view store settings"
  ON store_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update store settings"
  ON store_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.order_status IS DISTINCT FROM NEW.order_status) THEN
    INSERT INTO order_status_history (
      order_id,
      old_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.order_status,
      NEW.order_status,
      COALESCE(NEW.notes, 'Status updated'),
      'Status changed from ' || OLD.order_status || ' to ' || NEW.order_status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status logging
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders_full;
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders_full
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Function to create order notification
CREATE OR REPLACE FUNCTION create_order_notification(
  p_order_id uuid,
  p_notification_type text,
  p_recipient_email text,
  p_recipient_type text,
  p_subject text,
  p_body text
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO order_notifications (
    order_id,
    notification_type,
    recipient_email,
    recipient_type,
    subject,
    body,
    status
  ) VALUES (
    p_order_id,
    p_notification_type,
    p_recipient_email,
    p_recipient_type,
    p_subject,
    p_body,
    'pending'
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;
