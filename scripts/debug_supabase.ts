
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseId = process.env.SUPABASE_ID;
const supabaseUrl = process.env.SUPABASE_URL || (supabaseId ? `https://${supabaseId}.supabase.co` : '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE; // Must use service role for admin tasks

console.log('--- Configuration ---');
console.log('Supabase ID:', supabaseId);
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key Present:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
  console.log('\n--- Buckets List ---');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  console.log(`Found ${buckets?.length || 0} buckets:`);
  buckets?.forEach(b => console.log(` - ${b.name} (public: ${b.public})`));

  const bucketName = 'resumes';
  const bucket = buckets?.find(b => b.name === bucketName);

  if (!bucket) {
    console.error(`\n❌ Bucket '${bucketName}' DOES NOT EXIST.`);
    console.log(`Attempting to create '${bucketName}' bucket...`);
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880
    });
    
    if (createError) {
      console.error('Failed to create bucket:', createError);
    } else {
      console.log('✅ Bucket created successfully.');
    }
  } else {
    console.log(`\n✅ Bucket '${bucketName}' exists.`);
    if (!bucket.public) {
      console.warn(`⚠️ Bucket '${bucketName}' is PRIVATE. Public URLs will not work.`);
      console.log('Attempting to update to PUBLIC...');
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true
      });
      if (updateError) {
         console.error('Failed to update bucket:', updateError);
      } else {
         console.log('✅ Bucket updated to PUBLIC.');
      }
    } else {
      console.log(`✅ Bucket '${bucketName}' is PUBLIC.`);
    }
  }

  // Test Upload
  console.log('\n--- Test Upload ---');
  const testFileName = 'test-debug-' + Date.now() + '.txt';
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(testFileName, 'Hello World', { contentType: 'text/plain' });

  if (uploadError) {
    console.error('Upload failed:', uploadError);
  } else {
    console.log('Upload successful:', uploadData);
    
    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(testFileName);
    console.log('Generated Public URL:', publicData.publicUrl);
    
    // Clean up
    await supabase.storage.from(bucketName).remove([testFileName]);
    console.log('Cleaned up test file.');
  }

}

runDiagnostics().catch(console.error);
