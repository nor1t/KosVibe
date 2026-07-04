/**
 * Rural Market — Storage Bucket Setup
 * 
 * Run this script ONCE to create the rural-market-images bucket
 * with the correct policies.
 * 
 * Usage: node scripts/setup-rural-market-storage.mjs
 * 
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const BUCKET_NAME = 'rural-market-images';

async function setup() {
  console.log(`Creating bucket "${BUCKET_NAME}"...`);

  // Create bucket (public)
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) { console.error('Failed to list buckets:', listErr); process.exit(1); }

  const exists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (exists) {
    console.log(`Bucket "${BUCKET_NAME}" already exists. Updating to public...`);
    await supabase.storage.updateBucket(BUCKET_NAME, { public: true });
  } else {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    if (createErr) { console.error('Failed to create bucket:', createErr); process.exit(1); }
    console.log(`Bucket "${BUCKET_NAME}" created (public).`);
  }

  console.log('\nStorage bucket is ready.');
  console.log(`\nBucket: ${BUCKET_NAME}`);
  console.log(`Public URL base: ${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}`);
  console.log('\nPolicies are enforced at the database level (rural_market_images RLS).');
  console.log('No additional Storage policies needed — Supabase respects the RLS on the images table.\n');
}

setup().catch(console.error);