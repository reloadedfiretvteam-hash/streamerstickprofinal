export function getApiBase(): string {
  // For development, use relative URLs (same origin)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // For production, use the environment variable if set
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) {
    return envBase;
  }
  
  // Hardcoded fallback for Cloudflare Pages deployment
  // This ensures API calls always go to the correct backend server
  // regardless of whether environment variables are configured
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If running on pages.dev or any production domain, use the backend server
    if (hostname.includes('pages.dev') || 
        hostname.includes('streamstickpro') ||
        hostname.includes('streamerstickpro') ||
        !hostname.includes('localhost')) {
      return 'https://secure.streamstickpro.com';
    }
  }
  
  return '';
}

export async function apiCall(endpoint: string, options?: RequestInit): Promise<Response> {
  const base = getApiBase();
  const url = base ? `${base}${endpoint}` : endpoint;
  return fetch(url, options);
}
