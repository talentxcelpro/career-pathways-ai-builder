const { runSql } = require('./db-audit-helper.cjs');

const ALLOWED_COLUMNS = [
  'id', 'full_name', 'username', 'title', 'headline', 'about', 'location',
  'profile_picture_url', 'profile_photo_url', 'cover_image_url', 'skills',
  'experience_years', 'industry', 'current_company', 'linkedin_url', 'github_url',
  'portfolio_url', 'website', 'verification_status', 'is_profile_public',
  'created_at', 'updated_at'
];

const prodCols = runSql(`
  SET statement_timeout = '10s';
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'profiles';
`, 'production');

const prodColNames = prodCols.map(c => c.column_name);

console.log('Total columns in production profiles:', prodColNames.length);

const missing = ALLOWED_COLUMNS.filter(c => !prodColNames.includes(c));
console.log('Missing columns from allowlist:', missing);

if (missing.length === 0) {
  console.log('ALL 21 ALLOWLISTED COLUMNS CONFIRMED PRESENT IN PRODUCTION profiles table.');
}
