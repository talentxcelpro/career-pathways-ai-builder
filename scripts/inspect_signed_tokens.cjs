const { runSql } = require('./db-audit-helper.cjs');

const sql = `
  SELECT id, profile_picture_url, profile_photo_url, cover_image_url
  FROM public.profiles
  WHERE (profile_picture_url ILIKE '%token%' OR profile_picture_url ILIKE '%signature%' OR profile_picture_url ILIKE '%expires%')
     OR (profile_photo_url ILIKE '%token%' OR profile_photo_url ILIKE '%signature%' OR profile_photo_url ILIKE '%expires%')
     OR (cover_image_url ILIKE '%token%' OR cover_image_url ILIKE '%signature%' OR cover_image_url ILIKE '%expires%');
`;

const res = runSql(sql, 'staging');
console.log('Profiles with signed token parameters:', JSON.stringify(res, null, 2));
