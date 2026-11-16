const { runSql } = require('./db-audit-helper.cjs');

console.log('=== INSPECTING AVATAR & IMAGE URL FORMATS ON PRODUCTION ===');

const samples = runSql(`
  SET statement_timeout = '10s';
  SELECT 
    id,
    CASE 
      WHEN profile_picture_url IS NOT NULL THEN substring(profile_picture_url from 1 for 60)
      ELSE NULL 
    END AS avatar_sample,
    CASE 
      WHEN cover_image_url IS NOT NULL THEN substring(cover_image_url from 1 for 60)
      ELSE NULL 
    END AS cover_sample
  FROM public.profiles
  WHERE profile_picture_url IS NOT NULL OR cover_image_url IS NOT NULL
  LIMIT 10;
`, 'production');

console.log('Sample image URL patterns:', JSON.stringify(samples, null, 2));

const bucketCheck = runSql(`
  SET statement_timeout = '10s';
  SELECT 
    CASE 
      WHEN profile_picture_url ILIKE '%/storage/v1/object/public/%' THEN 'public_endpoint'
      WHEN profile_picture_url ILIKE '%/storage/v1/object/authenticated/%' THEN 'auth_endpoint'
      WHEN profile_picture_url ILIKE 'http%' THEN 'external_http'
      WHEN profile_picture_url IS NULL THEN 'null'
      ELSE 'other'
    END AS url_type,
    count(*)
  FROM public.profiles
  GROUP BY 1;
`, 'production');

console.log('Avatar URL endpoint distribution:', JSON.stringify(bucketCheck, null, 2));
