#!/usr/bin/env tsx
/**
 * Create IndexNow key file for verification
 * 
 * IndexNow requires a key file at: https://streamstickpro.com/{KEY}.txt
 * This script creates that file in the public directory.
 */

import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '59748a36d4494392a7d863abcf2d3b52';
const KEY_FILE_NAME = `${INDEXNOW_KEY}.txt`;

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  const keyFilePath = path.join(publicDir, KEY_FILE_NAME);

  // Ensure public directory exists
  if (!existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true });
    console.log(`✅ Created public directory: ${publicDir}`);
  }

  // Write key file
  try {
    await writeFile(keyFilePath, INDEXNOW_KEY, 'utf-8');
    console.log(`✅ Created IndexNow key file: ${KEY_FILE_NAME}`);
    console.log(`   Location: ${keyFilePath}`);
    console.log(`   URL: https://streamstickpro.com/${KEY_FILE_NAME}`);
    console.log(`   Content: ${INDEXNOW_KEY}`);
  } catch (error: any) {
    console.error(`❌ Error creating key file: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
