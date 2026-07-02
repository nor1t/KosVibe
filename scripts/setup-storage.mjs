/**
 * One-time setup script to create Supabase Storage buckets.
 *
 * Run this once:
 *   node scripts/setup-storage.mjs
 *
 * Requires: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
 *
 * Note: If bucket creation fails due to permission errors, you may need
 * to create the buckets manually in the Supabase Dashboard:
 *   Storage → New Bucket → name: "avatars" (public), "story-images" (public), "event-images" (public)
 * Then run the RLS policies SQL from supabase/migrations/20260702010000_sprint13_storage_buckets.sql
 * in the Supabase SQL Editor.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

console.log(`Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

const buckets = [
  {
    id: 'avatars',
    name: 'avatars',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  },
  {
    id: 'story-images',
    name: 'Story Images',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  },
  {
    id: 'event-images',
    name: 'Event Images',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  },
];

async function createBuckets() {
  console.log('\n--- Creating Storage Buckets ---\n');

  for (const bucket of buckets) {
    console.log(`Creating bucket: ${bucket.id}...`);
    try {
      const { data, error } = await supabase.storage.createBucket(
        bucket.id,
        {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes,
        }
      );

      if (error) {
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`  ✓ Bucket "${bucket.id}" already exists.`);
        } else {
          console.error(`  ✗ Failed to create bucket "${bucket.id}":`, error.message);
          console.log('  → You may need to create it manually in Supabase Dashboard → Storage.');
        }
      } else {
        console.log(`  ✓ Bucket "${bucket.id}" created.`);
      }
    } catch (err) {
      console.error(`  ✗ Error creating bucket "${bucket.id}":`, err.message);
    }
  }

  console.log('\n--- Running RLS Policies ---\n');
  console.log('Paste the RLS policies from:');
  console.log('  supabase/migrations/20260702010000_sprint13_storage_buckets.sql');
  console.log('into the Supabase SQL Editor (https://supabase.com/dashboard/project/rrpfxhptjmdjuoxhldpz/sql/new)');
  console.log('\nOr run: supabase db push');
}

createBuckets();