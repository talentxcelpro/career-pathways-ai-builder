const { runSql } = require('./db-audit-helper.cjs');

async function runReconciliation() {
  console.log('========================================================================');
  console.log('TALENTXCEL GATE 1 — PRODUCTION CONSENT COUNT RECONCILIATION');
  console.log('Target: Production (dthlgsnakhoftinssokm)');
  console.log('========================================================================\n');

  // 1. Exact view definition
  const viewDef = await runSql("SELECT pg_get_viewdef('public.public_profiles'::regclass, true) as def;", 'production');
  console.log('--- 1. Exact public_profiles SQL Definition ---');
  console.log(viewDef[0].def);

  // 2. candidate_privacy_consents schema
  const consentCols = await runSql(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_privacy_consents'
    ORDER BY ordinal_position;
  `, 'production');
  console.log('\n--- 2. candidate_privacy_consents Schema Columns ---');
  console.table(consentCols);

  // 3. Breakdown of consent types and statuses
  const consentBreakdown = await runSql(`
    SELECT 
      consent_type, 
      consent_status, 
      count(*) as row_count,
      count(DISTINCT user_id) as distinct_users,
      count(*) FILTER (WHERE revocation_timestamp IS NOT NULL) as revoked_with_timestamp,
      count(*) FILTER (WHERE revocation_timestamp IS NULL) as active_no_revocation
    FROM public.candidate_privacy_consents
    GROUP BY consent_type, consent_status;
  `, 'production');
  console.log('\n--- 3. Consent Table Breakdown ---');
  console.table(consentBreakdown);

  // 4. Profiles table visibility breakdown
  const profileBreakdown = await runSql(`
    SELECT 
      count(*) as total_profiles,
      count(DISTINCT id) as distinct_profile_ids,
      count(*) FILTER (WHERE is_profile_public = true) as flag_public_true,
      count(*) FILTER (WHERE is_profile_public = false) as flag_public_false,
      count(*) FILTER (WHERE is_profile_public IS NULL) as flag_public_null,
      count(*) FILTER (WHERE profile_visibility = 'public') as vis_public,
      count(*) FILTER (WHERE profile_visibility = 'private') as vis_private,
      count(*) FILTER (WHERE profile_visibility IS NULL) as vis_null
    FROM public.profiles;
  `, 'production');
  console.log('\n--- 4. Profiles Table Breakdown ---');
  console.table(profileBreakdown);

  // 5. public_profiles view counts
  const publicViewCounts = await runSql(`
    SELECT 
      count(*) as view_total_rows,
      count(DISTINCT id) as view_distinct_ids
    FROM public.public_profiles;
  `, 'production');
  console.log('\n--- 5. public_profiles View Row Counts ---');
  console.table(publicViewCounts);

  // 6. Anti-join analysis: public_profiles rows that DO NOT have an explicit granted consent
  const antiJoin = await runSql(`
    SELECT 
      count(*) as total_in_public_view,
      count(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM public.candidate_privacy_consents c
          WHERE c.user_id = pp.id
            AND c.consent_type = 'public_profile_indexing'
            AND c.consent_status = 'granted'
            AND c.revocation_timestamp IS NULL
        )
      ) as has_explicit_granted_consent,
      count(*) FILTER (
        WHERE NOT EXISTS (
          SELECT 1 FROM public.candidate_privacy_consents c
          WHERE c.user_id = pp.id
            AND c.consent_type = 'public_profile_indexing'
        )
      ) as no_consent_record_at_all,
      count(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM public.candidate_privacy_consents c
          WHERE c.user_id = pp.id
            AND c.consent_type = 'public_profile_indexing'
            AND (c.consent_status != 'granted' OR c.revocation_timestamp IS NOT NULL)
        )
      ) as has_non_granted_or_revoked_consent
    FROM public.public_profiles pp;
  `, 'production');
  console.log('\n--- 6. Anti-Join Analysis of public_profiles View Rows ---');
  console.table(antiJoin);

  // 7. Inspect the 52 profiles that have NO consent record: why are they in public_profiles?
  const noConsentProfilesAnalysis = await runSql(`
    SELECT 
      count(*) as total_without_consent,
      min(p.created_at) as earliest_created,
      max(p.created_at) as latest_created,
      count(*) FILTER (WHERE p.is_profile_public = true) as is_public_true,
      count(*) FILTER (WHERE p.profile_visibility = 'public') as vis_public,
      count(*) FILTER (WHERE p.profile_visibility IS NULL) as vis_null
    FROM public.profiles p
    LEFT JOIN public.candidate_privacy_consents c 
      ON c.user_id = p.id AND c.consent_type = 'public_profile_indexing'
    WHERE c.id IS NULL AND p.is_profile_public = true;
  `, 'production');
  console.log('\n--- 7. Profile Records Without Any Consent Row ---');
  console.table(noConsentProfilesAnalysis);

  // 8. Profiles with is_profile_public = false vs consent
  const privateProfileConsentAnalysis = await runSql(`
    SELECT 
      p.is_profile_public,
      p.profile_visibility,
      c.consent_status,
      count(*) as cnt
    FROM public.profiles p
    LEFT JOIN public.candidate_privacy_consents c 
      ON c.user_id = p.id AND c.consent_type = 'public_profile_indexing'
    GROUP BY p.is_profile_public, p.profile_visibility, c.consent_status
    ORDER BY cnt DESC;
  `, 'production');
  console.log('\n--- 8. Combined Matrix: Profile Flags vs Consent Status ---');
  console.table(privateProfileConsentAnalysis);
}

runReconciliation().catch(err => {
  console.error('Reconciliation error:', err);
  process.exit(1);
});
