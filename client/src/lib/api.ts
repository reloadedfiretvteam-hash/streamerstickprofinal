export function getApiBase(): string {
  // For development, use relative URLs (same origin)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // For production on Cloudflare Pages, use same-origin (empty string)
  // The Cloudflare Worker handles /api/* routes directly
  // No external backend dependency needed
  return '';
}

export async function apiCall(endpoint: string, options?: RequestInit): Promise<Response> {
  const base = getApiBase();
  const url = base ? `${base}${endpoint}` : endpoint;
  return fetch(url, options);
}
