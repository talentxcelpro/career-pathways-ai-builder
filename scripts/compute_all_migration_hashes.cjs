const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const files = [
  'supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view.sql',
  'supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view_rollback.sql',
  'supabase/migrations/20261114190000_txc_migration_b_secure_profiles_access_model.sql',
  'supabase/migrations/20261114190000_txc_migration_b_secure_profiles_access_model_rollback.sql'
];

console.log('========================================================================');
console.log('MIGRATION ARTIFACT SHA-256 HASHES & FILE SIZES');
console.log('========================================================================\n');

for (const f of files) {
  const fullPath = path.resolve(f);
  if (!fs.existsSync(fullPath)) {
    console.error(`File missing: ${f}`);
    continue;
  }
  const bytes = fs.readFileSync(fullPath);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  const lines = bytes.toString('utf8').split('\n').length;
  console.log(`File: ${f}`);
  console.log(`  Size: ${bytes.length} bytes | Lines: ${lines}`);
  console.log(`  SHA-256: ${hash}\n`);
}
