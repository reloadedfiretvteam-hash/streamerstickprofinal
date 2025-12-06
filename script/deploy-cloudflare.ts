import * as fs from 'fs';
import * as path from 'path';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const PROJECT_NAME = 'streamerstickprofinal';

async function getFiles(dir: string, baseDir: string = dir): Promise<Array<{path: string, content: Buffer}>> {
  const files: Array<{path: string, content: Buffer}> = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        path: relativePath,
        content: fs.readFileSync(fullPath)
      });
    }
  }
  
  return files;
}

async function deploy() {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }

  console.log('Collecting files from dist/...');
  const distPath = path.join(process.cwd(), 'dist');
  const files = await getFiles(distPath);
  console.log(`Found ${files.length} files to upload`);

  const formData = new FormData();
  
  for (const file of files) {
    const blob = new Blob([file.content]);
    formData.append(file.path, blob, file.path);
  }

  console.log('Uploading to Cloudflare Pages...');
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: formData
    }
  );

  const result = await response.json();
  
  if (result.success) {
    console.log('Deployment successful!');
    console.log('URL:', result.result?.url || 'Check Cloudflare dashboard');
  } else {
    console.error('Deployment failed:', JSON.stringify(result.errors, null, 2));
  }
}

deploy().catch(console.error);
