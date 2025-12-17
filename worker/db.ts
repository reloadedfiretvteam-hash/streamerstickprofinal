import { createClient } from '@supabase/supabase-js';

export interface DbConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export function createDb(config: DbConfig) {
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  return supabase;
}

export type DbClient = ReturnType<typeof createDb>;
