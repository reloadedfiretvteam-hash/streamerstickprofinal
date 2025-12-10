import { fetchProducts, fetchBlogPosts } from './supabase';

export function getApiBase(): string {
  // For development, use relative URLs (same origin)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // For production, use same-origin (static site)
  return '';
}

// Helper to create a Response-like object from Supabase data
function createJsonResponse(data: any, ok: boolean = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

export async function apiCall(endpoint: string, options?: RequestInit): Promise<Response> {
  // In production, use direct Supabase queries for read operations
  if (!import.meta.env.DEV) {
    // Handle products endpoint
    if (endpoint === '/api/products' || endpoint.startsWith('/api/products')) {
      const result = await fetchProducts();
      return createJsonResponse(result, result.success);
    }
    
    // Handle blog posts endpoint
    if (endpoint === '/api/blog/posts' || endpoint.startsWith('/api/blog/posts')) {
      const result = await fetchBlogPosts();
      return createJsonResponse(result, result.success);
    }
  }
  
  // For development or other endpoints, use fetch
  const base = getApiBase();
  const url = base ? `${base}${endpoint}` : endpoint;
  return fetch(url, options);
}
