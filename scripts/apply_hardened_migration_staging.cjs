const fs = require('fs');
const path = require('path');
const { runSql } = require('./db-audit-helper.cjs');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114170000_txc_affirmative_consent_and_public_profiles_view.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

console.log('[APPLY] Applying hardened migration to STAGING (pvwwtquuexhyydwihjbi)...');
const result = runSql(migrationSql, 'staging');
console.log('[APPLY RESULT]:', JSON.stringify(result, null, 2));
