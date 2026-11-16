const fs = require('fs');
const { runSql } = require('./db-audit-helper.cjs');

const sql = fs.readFileSync('supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view.sql', 'utf8');

console.log('Applying redesigned affirmative consent Migration A to staging (pvwwtquuexhyydwihjbi)...');
const res = runSql(sql, 'staging');
console.log('Apply result:', JSON.stringify(res, null, 2));
