// Script to check and configure Supabase storage buckets
// Uses the Supabase service key from environment

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const BUCKET_NAME = process.env.VITE_STORAGE_BUCKET_NAME || 'imiges';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials. Need VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAndFixStorage() {
  console.log('='.repeat(60));
  console.log('SUPABASE STORAGE AUDIT');
  console.log('='.repeat(60));
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Target Bucket:', BUCKET_NAME);
  console.log('');

  // List all buckets
  console.log('1. Listing all buckets...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('   Error listing buckets:', listError.message);
    return;
  }
  
  console.log('   Found buckets:', buckets?.map(b => b.name).join(', ') || 'none');
  
  // Check if target bucket exists
  const targetBucket = buckets?.find(b => b.name === BUCKET_NAME);
  
  if (!targetBucket) {
    console.log('\n2. Creating bucket "' + BUCKET_NAME + '"...');
    const { data: newBucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4'],
      fileSizeLimit: 52428800 // 50MB
    });
    
    if (createError) {
      console.error('   Error creating bucket:', createError.message);
    } else {
      console.log('   Successfully created bucket:', BUCKET_NAME);
    }
  } else {
    console.log('\n2. Bucket "' + BUCKET_NAME + '" exists');
    console.log('   Public:', targetBucket.public);
    console.log('   Created:', targetBucket.created_at);
    
    // Make sure it's public
    if (!targetBucket.public) {
      console.log('   Updating bucket to be public...');
      const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
        public: true
      });
      if (updateError) {
        console.error('   Error updating bucket:', updateError.message);
      } else {
        console.log('   Bucket is now public');
      }
    }
  }
  
  // List files in bucket
  console.log('\n3. Listing files in bucket...');
  const { data: files, error: filesError } = await supabase.storage.from(BUCKET_NAME).list('', {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' }
  });
  
  if (filesError) {
    console.error('   Error listing files:', filesError.message);
  } else if (files && files.length > 0) {
    console.log('   Root level items:');
    for (const file of files) {
      if (file.id) {
        const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name).data.publicUrl;
        console.log('   - ' + file.name + ' (size: ' + (file.metadata?.size || 'folder') + ')');
      } else {
        console.log('   - ' + file.name + '/ (folder)');
        // List folder contents
        const { data: folderFiles } = await supabase.storage.from(BUCKET_NAME).list(file.name, { limit: 50 });
        if (folderFiles && folderFiles.length > 0) {
          for (const ff of folderFiles.slice(0, 5)) {
            console.log('     - ' + file.name + '/' + ff.name);
          }
          if (folderFiles.length > 5) {
            console.log('     ... and ' + (folderFiles.length - 5) + ' more files');
          }
        }
      }
    }
  } else {
    console.log('   No files found in bucket');
  }
  
  // Check for expected folders
  console.log('\n4. Checking expected folder structure...');
  const expectedFolders = ['firesticks', 'iptv', 'backgrounds', 'sports'];
  
  for (const folder of expectedFolders) {
    const { data: folderContents, error: folderError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder, { limit: 10 });
    
    if (folderError) {
      console.log('   - ' + folder + '/: ERROR - ' + folderError.message);
    } else if (folderContents && folderContents.length > 0) {
      console.log('   - ' + folder + '/: OK (' + folderContents.length + ' files)');
    } else {
      console.log('   - ' + folder + '/: EMPTY (no files)');
    }
  }
  
  // Generate public URL examples
  console.log('\n5. Public URL pattern:');
  console.log('   ' + SUPABASE_URL + '/storage/v1/object/public/' + BUCKET_NAME + '/<path>');
  
  console.log('\n' + '='.repeat(60));
  console.log('STORAGE AUDIT COMPLETE');
  console.log('='.repeat(60));
}

checkAndFixStorage().catch(console.error);
