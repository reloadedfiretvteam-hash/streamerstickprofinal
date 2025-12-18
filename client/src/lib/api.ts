// Simple API client - always uses relative URLs for Cloudflare Worker
export function getApiBase(): string {
  // Always use relative URLs - the Cloudflare Worker handles all API routes
  return '';
}

export async function apiCall(endpoint: string, options?: RequestInit): Promise<Response> {
  // Always use relative URLs to hit the Cloudflare Worker API
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
}
