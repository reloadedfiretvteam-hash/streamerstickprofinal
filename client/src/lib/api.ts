export function getApiBase(): string {
  // For development, use relative URLs (same origin)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // For production, use the environment variable or the current origin
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) {
    return envBase;
  }
  
  // Fallback to current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return '';
}

export async function apiCall(endpoint: string, options?: RequestInit): Promise<Response> {
  const base = getApiBase();
  const url = base ? `${base}${endpoint}` : endpoint;
  return fetch(url, options);
}
