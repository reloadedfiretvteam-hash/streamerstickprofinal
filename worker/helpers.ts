import { createStorage, StorageConfig } from './storage';
import type { Env } from './index';

export function getStorageConfig(env: Env): StorageConfig {
  return {
    supabaseUrl: env.VITE_SUPABASE_URL,
    supabaseKey: env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_ANON_KEY
  };
}

export function getStorage(env: Env) {
  return createStorage(getStorageConfig(env));
}
