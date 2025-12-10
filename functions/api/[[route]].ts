// Proxy all API requests to Supabase backend
export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  
  // For /api/* routes, proxy to our backend
  if (url.pathname.startsWith('/api/')) {
    try {
      // For now, return a placeholder - the client will handle API calls
      return new Response(
        JSON.stringify({ error: 'API endpoint not configured' }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // For non-API routes, serve the SPA
  return context.next();
};
