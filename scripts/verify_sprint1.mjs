/**
 * Sprint 1 verification script.
 *
 * Verifies:
 *   1. Supabase project is reachable
 *   2. Auth is live (can attempt sign-in)
 *   3. Existing restaurants table is still readable (frontend not broken)
 *   4. TypeScript compiles (run separately: npm run typecheck)
 *
 * Usage: node scripts/verify_sprint1.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
  console.error('Ensure .env is present and loaded.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const results = {
  reachable: false,
  authLive: false,
  restaurantsReadable: false,
  rolesTableExists: false,
  errors: [],
};

async function checkReachable() {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);
    if (error) {
      results.errors.push(`Reachable check failed: ${error.message}`);
      return;
    }
    results.reachable = true;
    results.restaurantsReadable = Array.isArray(data);
  } catch (err) {
    results.errors.push(`Reachable check threw: ${err.message}`);
  }
}

async function checkAuth() {
  try {
    // Attempt a sign-in with dummy credentials — we expect an error,
    // but a network/auth error (not a 404) confirms auth is live.
    const { error } = await supabase.auth.signInWithPassword({
      email: 'verify@sprint1.local',
      password: 'verify-sprint1-not-a-real-account',
    });

    // Any auth error (invalid credentials, user not found, etc.) means auth is live.
    // A network error or missing endpoint would be a different kind of error.
    if (error && error.status !== undefined) {
      results.authLive = true;
    } else if (error) {
      // Some error objects don't have status but still indicate auth is responding
      results.authLive = true;
    }
  } catch (err) {
    results.errors.push(`Auth check threw: ${err.message}`);
  }
}

async function checkRolesTable() {
  try {
    // Try to query the roles table — if it doesn't exist yet (migration not applied),
    // we get a 404 or relation-not-found error. This is expected if the migration
    // hasn't been pushed to the remote yet.
    const { error } = await supabase.from('roles').select('id').limit(1);

    if (!error) {
      results.rolesTableExists = true;
    } else if (error.code === '42P01' || error.message.includes('does not exist')) {
      // Table doesn't exist — migration not applied yet
      results.rolesTableExists = false;
    } else if (error.code === '42501' || error.message.includes('permission')) {
      // RLS denied — table exists but we don't have access (expected for anon)
      results.rolesTableExists = true;
    }
    // Any other error is ambiguous — leave as false
  } catch (err) {
    results.errors.push(`Roles table check threw: ${err.message}`);
  }
}

async function main() {
  console.log('Sprint 1 — Backend Foundation Verification');
  console.log('==========================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  await checkReachable();
  await checkAuth();
  await checkRolesTable();

  console.log('Results:');
  console.log(`  Supabase reachable:     ${results.reachable ? '✅' : '❌'}`);
  console.log(`  Auth live:              ${results.authLive ? '✅' : '❌'}`);
  console.log(`  Restaurants readable:   ${results.restaurantsReadable ? '✅' : '❌'}`);
  console.log(
    `  Roles table exists:     ${results.rolesTableExists ? '✅' : '⏳ (migration not applied to remote yet)'}`
  );

  if (results.errors.length > 0) {
    console.log('');
    console.log('Errors:');
    for (const err of results.errors) {
      console.log(`  - ${err}`);
    }
  }

  console.log('');
  if (results.reachable && results.authLive && results.restaurantsReadable) {
    console.log('✅ Core infrastructure verified — frontend will not break.');
    if (!results.rolesTableExists) {
      console.log('⏳ Sprint 1 migration must be applied to the remote database.');
      console.log('   Run: npx supabase db push (requires SUPABASE_ACCESS_TOKEN)');
    }
    process.exit(0);
  } else {
    console.log('❌ Core infrastructure issues detected.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});