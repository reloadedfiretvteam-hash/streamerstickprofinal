import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://emlqlmfzqsnqokrqvmcm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '9c809a380006b9cc16b852d4e34c4ee44e19ef91eb5f4bf899ed68f1bff55e2b'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
