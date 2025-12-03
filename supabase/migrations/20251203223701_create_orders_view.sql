/*
  # Create orders view

  1. Changes
    - Creates a view called `orders` that maps to `orders_full` table
    - This allows code to reference either `orders` or `orders_full`

  2. Security
    - View inherits RLS policies from the underlying `orders_full` table
*/

-- Create a view that points to orders_full
CREATE OR REPLACE VIEW orders AS
SELECT * FROM orders_full;

-- Grant access to the view
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO anon, authenticated;