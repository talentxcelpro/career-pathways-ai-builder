const fs = require('fs');
const { runSql } = require('./db-audit-helper.cjs');

console.log('=== TESTING ROLLBACK ON STAGING ===');
const rollbackSql = fs.readFileSync('supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view_rollback.sql', 'utf8');
const rbRes = runSql(rollbackSql, 'staging');
console.log('Rollback execution result:', JSON.stringify(rbRes, null, 2));

const checkView = runSql(`SELECT count(*) as cnt FROM information_schema.views WHERE table_name = 'public_profiles';`, 'staging');
const checkConsents = runSql(`SELECT count(*) as cnt FROM information_schema.tables WHERE table_name = 'candidate_privacy_consents';`, 'staging');
const checkDefaults = runSql(`SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('is_profile_public', 'profile_visibility');`, 'staging');

console.log('View count after rollback:', checkView[0]?.cnt);
console.log('Consents table count after rollback:', checkConsents[0]?.cnt);
console.log('Restored column defaults:', JSON.stringify(checkDefaults, null, 2));

console.log('\n=== RE-APPLYING FORWARD MIGRATION TO STAGING ===');
const fwdSql = fs.readFileSync('supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view.sql', 'utf8');
const fwdRes = runSql(fwdSql, 'staging');
console.log('Forward re-apply result:', JSON.stringify(fwdRes, null, 2));

const finalCheck = runSql(`SELECT count(*) as cnt FROM information_schema.views WHERE table_name = 'public_profiles';`, 'staging');
console.log('View exists after re-apply:', finalCheck[0]?.cnt === '1' || finalCheck[0]?.cnt === 1 ? 'YES' : 'NO');
