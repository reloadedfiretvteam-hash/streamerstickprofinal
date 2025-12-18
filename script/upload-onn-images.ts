import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.log('SUPABASE_SERVICE_KEY not found, trying VITE_SUPABASE_ANON_KEY...');
}

const key = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY;
if (!key) {
  console.error('No Supabase key found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, key);

async function uploadImage(localPath: string, remoteName: string) {
  const fullPath = path.join(process.cwd(), localPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }
  
  const fileBuffer = fs.readFileSync(fullPath);
  console.log(`Uploading ${remoteName}...`);
  
  const { data, error } = await supabase.storage
    .from('imiges')
    .upload(remoteName, fileBuffer, {
      contentType: 'image/webp',
      upsert: true
    });
    
  if (error) {
    console.error(`Error uploading ${remoteName}:`, error.message);
  } else {
    console.log(`Uploaded: ${remoteName}`);
  }
}

async function main() {
  await uploadImage('attached_assets/s-l1600onnbok_1766008738774.webp', 'onn-4k-streaming.webp');
  await uploadImage('attached_assets/OIPonnbox4k_1766008832103.webp', 'onn-4k-ultra-hd.webp');
  console.log('Done!');
}

main().catch(console.error);
