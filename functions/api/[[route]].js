// SPA fallback - serve index.html for all non-API routes
export const onRequest = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  
  // API routes would go here if needed
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({ error: 'API endpoint not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // For all other routes, fall through to next handler (static files or index.html)
  return context.next();
};
