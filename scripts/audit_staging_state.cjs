const { runSql } = require('./db-audit-helper.cjs');

async function auditStaging() {
  const audit = await runSql(`
    SELECT
      (SELECT count(*) FROM public.profiles) as profiles_count,
      (SELECT count(*) FROM public.public_profiles) as public_profiles_count,
      (SELECT count(*) FROM public.candidate_privacy_consents) as total_consents_count,
      (SELECT count(*) FROM public.candidate_privacy_consents WHERE consent_type = 'public_profile_indexing' AND consent_status = 'granted' AND revocation_timestamp IS NULL) as active_granted_consents,
      (SELECT count(*) FROM public.candidate_document_mappings) as mappings_count,
      (SELECT count(*) FROM storage.objects WHERE bucket_id = 'documents') as document_objects_count
  `, 'staging');

  console.log('=== STAGING DATABASE AUDIT EVIDENCE ===');
  console.log(JSON.stringify(audit, null, 2));
}

auditStaging().catch(console.error);
