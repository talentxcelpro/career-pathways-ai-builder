const { runSql } = require('./db-audit-helper.cjs');

const imgQuery = runSql(`
  SELECT 
    id,
    profile_picture_url,
    profile_photo_url,
    cover_image_url
  FROM public.profiles
  WHERE profile_picture_url IS NOT NULL 
     OR profile_photo_url IS NOT NULL 
     OR cover_image_url IS NOT NULL
  LIMIT 10;
`, 'staging');

console.log('Staging profile image URLs:');
console.log(JSON.stringify(imgQuery, null, 2));
