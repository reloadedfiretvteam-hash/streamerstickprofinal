/*
  # Fix Duplicate RLS Policies

  This migration removes duplicate permissive policies on the email_subscribers table
  to ensure clean and maintainable RLS configuration.

  ## Issue
  Table email_subscribers has multiple permissive policies for role 'anon' for action 'INSERT':
  - "Anyone can subscribe"
  - "Anyone can subscribe to email list"

  ## Solution
  Drop one of the duplicate policies, keeping the more descriptive one.

  ## Policy Retained
  - "Anyone can subscribe to email list" - More descriptive and clear policy name
*/

-- Drop the duplicate policy with less descriptive name
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;

-- Verify the remaining policy exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_subscribers' 
    AND policyname = 'Anyone can subscribe to email list'
  ) THEN
    CREATE POLICY "Anyone can subscribe to email list"
      ON public.email_subscribers
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;
