export function getApiBase(): string {
  // For development, use relative URLs (same origin)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // For production, use Supabase Edge Functions
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/functions/v1`;
  }
  
  // Fallback to same-origin
  return '';
}

export async function apiCall(endpoint: string, options?: RequestInit): Promise<Response> {
  const base = getApiBase();
  // Map /api/* to Supabase function names
  const functionName = endpoint.replace(/^\/api\//, '').split('/')[0];
  const url = base ? `${base}/${functionName}` : endpoint;
  return fetch(url, options);
}
