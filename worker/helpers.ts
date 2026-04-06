import { createStorage, StorageConfig } from './storage';
import type { Env } from './index';

export function getSupabaseUrl(env: Env): string {
  const url = (env.VITE_SUPABASE_URL || '').trim();
  if (!url) {
    throw new Error('Supabase URL is not configured.');
  }
  return url;
}

export function getSupabaseServiceKey(env: Env): string {
  const key =
    env.SUPABASE_SERVICE_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_ROLL_KEY ||
    '';
  if (!key.trim()) {
    throw new Error('Supabase service key is not configured.');
  }
  return key;
}

export function getStorageConfig(env: Env): StorageConfig {
  return {
    supabaseUrl: getSupabaseUrl(env),
    supabaseKey: getSupabaseServiceKey(env),
  };
}

export function getStorage(env: Env) {
  return createStorage(getStorageConfig(env));
}
