export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/get-db-url') {
      const dbUrl = env.DATABASE_URL || 'NOT_SET';
      const allKeys = Object.keys(env).filter(k => typeof env[k] === 'string' || typeof env[k] === 'number');
      const envDump = {};
      for (const k of allKeys) {
        const v = String(env[k]);
        envDump[k] = v.length > 20 ? v.substring(0, 20) + '...' : v;
      }
      return new Response(JSON.stringify({ 
        exists: !!env.DATABASE_URL, 
        value: dbUrl,
        allKeys: allKeys,
        envDump: envDump,
        envType: typeof env.DATABASE_URL,
      }, null, 2), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    return new Response('Migration worker. Go to /get-db-url', { status: 200 });
  }
};
