const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function getHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

const fwdPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114170000_txc_sanitized_public_profiles_view.sql');
const rbPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114170000_txc_sanitized_public_profiles_view_rollback.sql');

console.log('=== MIGRATION ARTIFACTS CHECKSUM ===');
console.log('Forward file:', fwdPath);
console.log('Forward SHA-256:', getHash(fwdPath));
console.log('Rollback file:', rbPath);
console.log('Rollback SHA-256:', getHash(rbPath));

console.log('\n=== FORWARD SQL CONTENTS ===');
console.log(fs.readFileSync(fwdPath, 'utf8'));

console.log('\n=== ROLLBACK SQL CONTENTS ===');
console.log(fs.readFileSync(rbPath, 'utf8'));
