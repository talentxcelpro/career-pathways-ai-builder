const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function getHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

const fwdPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114170000_txc_affirmative_consent_and_public_profiles_view.sql');
const rbPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114170000_txc_affirmative_consent_and_public_profiles_view_rollback.sql');

console.log('=== REDESIGNED MIGRATION A ARTIFACTS CHECKSUMS ===');
console.log('Forward file:', fwdPath);
console.log('Forward SHA-256:', getHash(fwdPath));
console.log('Rollback file:', rbPath);
console.log('Rollback SHA-256:', getHash(rbPath));
