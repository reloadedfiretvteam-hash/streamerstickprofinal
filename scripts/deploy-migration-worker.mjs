import { createHash } from 'crypto';

const CF_KEY = process.env.CLOUDFLARE_API_TOKEN;
const ACCT = process.env.CLOUDFLARE_ACCOUNT_ID;
const PROJECT = process.env.CLOUDFLARE_PROJECT_NAME || 'streamerstickpro-live';

const workerScript = `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/get-db-url') {
      const dbUrl = env.DATABASE_URL || 'NOT_SET';
      return new Response(JSON.stringify({ exists: !!env.DATABASE_URL, value: dbUrl }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    return new Response('Migration worker ready', { status: 200 });
  }
};
`;

const indexHtml = '<html><body>OK</body></html>';

function hashContent(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function main() {
  if (process.env.ALLOW_DANGEROUS_DB_EXPORT !== '1') {
    console.error('Refusing to run: set ALLOW_DANGEROUS_DB_EXPORT=1 to execute this script.');
    process.exit(1);
  }
  if (!CF_KEY || !ACCT) {
    console.error('Missing required env vars: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID');
    process.exit(1);
  }
  const h = { 'Authorization': `Bearer ${CF_KEY}`, 'Content-Type': 'application/json' };
  
  const files = {
    '/_worker.js': workerScript,
    '/index.html': indexHtml,
  };
  
  // Step 1: Create upload JWT token
  console.log('Creating upload session...');
  const manifest = {};
  for (const [path, content] of Object.entries(files)) {
    manifest[path] = hashContent(content);
  }
  
  // Upload files first
  const uploadRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCT}/pages/projects/${PROJECT}/file`,
    {
      method: 'POST',
      headers: h,
      body: JSON.stringify(Object.values(manifest)),
    }
  );
  const uploadResult = await uploadRes.json();
  console.log('Upload session:', uploadResult.success, uploadResult.result ? 'got JWT' : '');
  
  if (uploadResult.result?.jwt) {
    // Upload actual files using the JWT
    const jwt = uploadResult.result.jwt;
    
    for (const [path, content] of Object.entries(files)) {
      const hash = manifest[path];
      const formData = new FormData();
      formData.append(hash, new Blob([content]), path);
      
      const fileRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCT}/pages/projects/${PROJECT}/file/${hash}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${jwt}` },
          body: formData,
        }
      );
      console.log(`Upload ${path}: ${fileRes.status}`);
    }
  }
  
  // Step 2: Create deployment with manifest
  console.log('Creating deployment...');
  const deployRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCT}/pages/projects/${PROJECT}/deployments`,
    {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ manifest }),
    }
  );
  
  const result = await deployRes.json();
  console.log('Deploy success:', result.success);
  
  if (result.result) {
    const deployUrl = result.result.url;
    console.log('Deployment URL:', deployUrl);
    
    // Wait for deployment
    console.log('Waiting 30s for deployment to be ready...');
    await new Promise(r => setTimeout(r, 30000));
    
    // Try to get the DB URL from the deployment
    const urls = [
      deployUrl + '/get-db-url',
      'https://streamstickpro.pages.dev/get-db-url',
    ];
    
    for (const url of urls) {
      console.log(`Trying: ${url}`);
      try {
        const res = await fetch(url, { redirect: 'follow' });
        const text = await res.text();
        console.log(`  Status: ${res.status}, Body: ${text.substring(0, 200)}`);
        if (res.ok) {
          try {
            const data = JSON.parse(text);
            if (data.exists && data.value) {
              console.log('\n=== DATABASE_URL FOUND ===');
              console.log(data.value);
              console.log('========================');
              return;
            }
          } catch {}
        }
      } catch (err) {
        console.log(`  Error: ${err.message}`);
      }
    }
  } else {
    console.log('Errors:', JSON.stringify(result.errors));
  }
}

main().catch(console.error);
