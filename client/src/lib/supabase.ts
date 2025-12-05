import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://emlqlmfzqsnqokrqvmcm.supabase.co'
const supabaseAnonKey = '9c809a380006b9cc16b852d4e34c4ee44e19ef91eb5f4bf'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
