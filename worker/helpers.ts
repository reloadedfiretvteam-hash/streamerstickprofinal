import { createStorage, StorageConfig } from './storage';
import type { Env } from './index';

export function getStorageConfig(env: Env): StorageConfig {
  const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLL_KEY || env.VITE_SUPABASE_ANON_KEY;
  return {
    supabaseUrl: env.VITE_SUPABASE_URL,
    supabaseKey: key
  };
}

export function getStorage(env: Env) {
  return createStorage(getStorageConfig(env));
}
