import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadImage() {
  console.log('=== Uploading IPTV Image to Supabase ===\n');
  
  const imagePath = path.join(process.cwd(), 'attached_assets', 'OIF_1764979270800.jpg');
  
  if (!fs.existsSync(imagePath)) {
    console.error('IPTV image not found:', imagePath);
    process.exit(1);
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  const fileName = 'iptv-subscription.jpg';
  
  console.log(`Uploading ${fileName} to Supabase storage...`);
  
  const { data, error } = await supabase.storage
    .from('imiges')
    .upload(fileName, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });
  
  if (error) {
    console.error('Upload error:', error);
    process.exit(1);
  }
  
  console.log('Upload successful:', data);
  
  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/imiges/${fileName}`;
  console.log('\nImage URL:', imageUrl);
  
  return imageUrl;
}

async function updateDatabase(imageUrl) {
  console.log('\n=== Updating IPTV Products in Database ===\n');
  
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    const result = await pool.query(`
      UPDATE real_products 
      SET image_url = $1 
      WHERE category = 'iptv' AND (image_url IS NULL OR image_url = '')
    `, [imageUrl]);
    
    console.log(`Updated ${result.rowCount} IPTV products with image URL`);
    
    const verify = await pool.query(`
      SELECT id, name, image_url FROM real_products WHERE category = 'iptv' LIMIT 5
    `);
    
    console.log('\nSample updated products:');
    verify.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.image_url ? 'Has image' : 'No image'}`);
    });
    
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    const imageUrl = await uploadImage();
    await updateDatabase(imageUrl);
    console.log('\n=== Done! ===');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
