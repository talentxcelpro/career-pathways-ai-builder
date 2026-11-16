const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const photos = await runSql(`
    SELECT id, profile_picture_url, profile_photo_url, cover_image_url
    FROM public.profiles
    WHERE profile_picture_url IS NOT NULL 
       OR profile_photo_url IS NOT NULL 
    LIMIT 10;
  `, 'staging');
  console.log('SAMPLE PROFILE PHOTOS (STAGING):', JSON.stringify(photos, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
