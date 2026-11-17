const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  console.log('--- Production Schema Pre-Existing Object Audit ---');
  
  // Check if public_profiles exists
  const publicProfiles = await runSql(`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'public_profiles';
  `, 'production');
  console.log('public_profiles view exists in production:', publicProfiles.length > 0);

  // Check if candidate_document_mappings exists
  const docMappings = await runSql(`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'candidate_document_mappings';
  `, 'production');
  console.log('candidate_document_mappings table exists in production:', docMappings.length > 0);

  // Check if set_public_profile_consent RPC exists
  const consentRpc = await runSql(`
    SELECT proname FROM pg_proc WHERE proname = 'set_public_profile_consent';
  `, 'production');
  console.log('set_public_profile_consent exists in production:', consentRpc.length > 0);

  // Check if can_employer_access_document exists
  const storageRpc = await runSql(`
    SELECT proname, pronamespace::regnamespace as schema FROM pg_proc WHERE proname = 'can_employer_access_document';
  `, 'production');
  console.log('can_employer_access_document exists in production:', storageRpc);

  // Check profiles columns (is_profile_public, profile_visibility, consent_timestamp)
  const profileCols = await runSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name IN ('is_profile_public', 'profile_visibility', 'consent_timestamp', 'consent_source');
  `, 'production');
  console.log('Profiles consent columns in production:', profileCols);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
