const { runSql } = require('./db-audit-helper.cjs');

const sql = `
  SELECT 
    id,
    profile_picture_url,
    profile_photo_url,
    cover_image_url
  FROM public.profiles
  WHERE profile_picture_url IS NOT NULL 
     OR profile_photo_url IS NOT NULL 
     OR cover_image_url IS NOT NULL
  LIMIT 20;
`;

const res = runSql(sql, 'staging');
console.log('Sample image URLs on staging:', JSON.stringify(res, null, 2));
