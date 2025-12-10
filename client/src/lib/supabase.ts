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
  'images': 'imiges',
  'imagees': 'imiges',
  'imags': 'imiges',
  'image': 'imiges',
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

export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatPriceDisplay(cents: number): string {
  return `$${formatPrice(cents)}`;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

// Direct database queries for production (bypasses API layer)
export async function fetchProducts() {
  try {
    const { data, error } = await supabase
      .from('realProducts')
      .select('*');
    
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Failed to fetch products:', err);
    return { success: false, data: [], error: err.message };
  }
}

export async function fetchBlogPosts(publishedOnly = true) {
  try {
    let query = supabase.from('blogPosts').select('*');
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    let posts = data || [];
    
    // Map Supabase column names to expected format and filter
    posts = posts.map((post: any) => ({
      ...post,
      // Handle both naming conventions
      published: post.published ?? post.is_published ?? true,
      createdAt: post.createdAt ?? post.published_at ?? post.created_at ?? new Date().toISOString(),
    })).filter((post: any) => !publishedOnly || post.published);
    
    // Sort by date descending
    posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { success: true, data: posts };
  } catch (err: any) {
    console.error('Failed to fetch blog posts:', err);
    return { success: false, data: [], error: err.message };
  }
}

export async function fetchBlogPostBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('blogPosts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to fetch blog post:', err);
    return { success: false, data: null, error: err.message };
  }
}
