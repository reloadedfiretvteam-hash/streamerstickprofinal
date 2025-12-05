import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. ' +
      'Main site will load, but analytics/admin features are disabled.',
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-key-placeholder',
);

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  period?: string;
  billing_period?: string;
  features: string[];
  popular?: boolean;
  is_popular?: boolean;
  active: boolean;
  display_order?: number;
}

const BUCKET_NAME_MAPPINGS: Record<string, string> = {
  'imiges': 'images',
  'imagees': 'images',
  'imags': 'images',
  'image': 'images',
};

function normalizeBucketName(bucket: string): string {
  const lowerBucket = bucket.toLowerCase();
  
  if (lowerBucket in BUCKET_NAME_MAPPINGS) {
    const normalized = BUCKET_NAME_MAPPINGS[lowerBucket];
    if (import.meta.env.DEV) {
      console.debug(
        `[getStorageUrl] Bucket name normalized: '${bucket}' -> '${normalized}'`
      );
    }
    return normalized;
  }
  
  return bucket;
}

export function getStorageUrl(bucket: string, path: string): string {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  
  const bucketOverride = import.meta.env.VITE_STORAGE_BUCKET_NAME;
  
  let actualBucket: string;
  if (bucketOverride) {
    actualBucket = normalizeBucketName(bucketOverride);
  } else {
    actualBucket = normalizeBucketName(bucket);
  }
  
  let cleanPath = path;
  while (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  
  return `${supabaseUrl}/storage/v1/object/public/${actualBucket}/${encodedPath}`;
}
