const { runSql } = require('./db-audit-helper.cjs');

async function auditProduction() {
  const audit = await runSql(`
    SELECT
      (SELECT count(*) FROM public.profiles) as profiles_count,
      (SELECT count(*) FROM public.public_profiles) as public_profiles_count,
      (SELECT count(*) FROM public.candidate_privacy_consents) as total_consents_count,
      (SELECT count(*) FROM public.candidate_privacy_consents WHERE consent_type = 'public_profile_indexing' AND consent_status = 'granted' AND revocation_timestamp IS NULL) as active_granted_consents,
      (SELECT count(*) FROM public.candidate_document_mappings) as mappings_count,
      (SELECT count(*) FROM storage.objects WHERE bucket_id = 'documents') as document_objects_count,
      (SELECT max(consent_timestamp) FROM public.candidate_privacy_consents) as latest_consent_ts,
      (SELECT max(created_at) FROM public.profiles) as latest_profile_ts
  `, 'production');

  console.log('=== PRODUCTION DATABASE AUDIT EVIDENCE ===');
  console.log(JSON.stringify(audit, null, 2));
}

auditProduction().catch(console.error);
