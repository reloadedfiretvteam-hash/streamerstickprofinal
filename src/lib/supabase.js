import { createClient } from '@supabase/supabase-js'

// Use the same safe pattern as the TypeScript client so the site
// does NOT crash if env vars are missing in the browser build.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables are missing. ' +
      'Main site will load, but Supabase-powered features may be disabled.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-key-placeholder'
)
