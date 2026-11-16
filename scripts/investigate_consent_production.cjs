const { runSql } = require('./db-audit-helper.cjs');

console.log('=== INVESTIGATING USER CONSENT & VISIBILITY ON PRODUCTION ===');

// 1. Column defaults for visibility columns
const colDefaults = runSql(`
  SET statement_timeout = '10s';
  SELECT column_name, data_type, column_default, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
    AND column_name IN ('is_profile_public', 'profile_visibility', 'passport_visibility', 'user_type', 'user_role');
`, 'production');
console.log('Column definitions:', JSON.stringify(colDefaults, null, 2));

// 2. Distribution of profile_visibility
const profileVisDist = runSql(`
  SET statement_timeout = '10s';
  SELECT profile_visibility, count(*)
  FROM public.profiles
  GROUP BY profile_visibility;
`, 'production');
console.log('profile_visibility distribution:', JSON.stringify(profileVisDist, null, 2));

// 3. Compare is_profile_public vs profile_visibility
const crossVisDist = runSql(`
  SET statement_timeout = '10s';
  SELECT 
    is_profile_public,
    profile_visibility,
    count(*)
  FROM public.profiles
  GROUP BY is_profile_public, profile_visibility;
`, 'production');
console.log('Cross visibility distribution:', JSON.stringify(crossVisDist, null, 2));

// 4. Inspect passport_visibility sample
const passportSample = runSql(`
  SET statement_timeout = '10s';
  SELECT passport_visibility, count(*)
  FROM public.profiles
  GROUP BY passport_visibility;
`, 'production');
console.log('passport_visibility distribution:', JSON.stringify(passportSample, null, 2));
