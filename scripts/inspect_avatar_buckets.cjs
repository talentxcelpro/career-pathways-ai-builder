const { runSql } = require('./db-audit-helper.cjs');

const storageUrls = runSql(`
  SET statement_timeout = '10s';
  SELECT 
    substring(profile_picture_url from '/storage/v1/object/public/([^/]+)/') as bucket_name,
    count(*)
  FROM public.profiles
  WHERE profile_picture_url ILIKE '%/storage/v1/object/public/%'
  GROUP BY 1;
`, 'production');

console.log('Buckets for avatar URLs:', JSON.stringify(storageUrls, null, 2));
