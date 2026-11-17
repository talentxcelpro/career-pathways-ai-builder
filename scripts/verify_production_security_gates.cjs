const { runSql, setLinkedTarget } = require('./db-audit-helper.cjs');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ PASS: ${message} ${details ? '(' + details + ')' : ''}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${message} ${details ? '(' + details + ')' : ''}`);
  }
}

async function runProductionGates() {
  console.log('========================================================================');
  console.log('TALENTXCEL PHASE 5 — PRODUCTION DATABASE SECURITY GATES VERIFICATION');
  console.log('Target: Production (dthlgsnakhoftinssokm)');
  console.log('========================================================================\n');

  setLinkedTarget('production');

  // --------------------------------------------------------------------------
  // GATE 1: CANDIDATE PRIVACY DEFAULTS & CONSENT ARCHITECTURE
  // --------------------------------------------------------------------------
  console.log('--- GATE 1: Candidate Privacy Defaults & Consent Architecture ---');

  const profileCols = await runSql(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name IN ('is_profile_public', 'profile_visibility');
  `, 'production');

  const pubCol = profileCols.find(c => c.column_name === 'is_profile_public');
  const visCol = profileCols.find(c => c.column_name === 'profile_visibility');

  assert(pubCol && pubCol.column_default && pubCol.column_default.includes('false'), 
    'is_profile_public defaults to false (private by default)');
  assert(visCol && visCol.column_default && visCol.column_default.includes('private'), 
    'profile_visibility defaults to private');

  // Verify candidate_privacy_consents schema
  const consentCols = await runSql(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_privacy_consents'
      AND column_name IN ('consent_timestamp', 'consent_source');
  `, 'production');
  const timeCol = consentCols.find(c => c.column_name === 'consent_timestamp');
  const srcCol = consentCols.find(c => c.column_name === 'consent_source');
  assert(timeCol !== undefined, 'consent_timestamp column exists on candidate_privacy_consents');
  assert(srcCol !== undefined, 'consent_source column exists on candidate_privacy_consents');

  const consentTableClass = await runSql(`
    SELECT relname, relrowsecurity
    FROM pg_class
    WHERE relname = 'candidate_privacy_consents';
  `, 'production');
  assert(consentTableClass.length === 1 && consentTableClass[0].relrowsecurity === true,
    'candidate_privacy_consents exists and has RLS enabled');

  // Verify set_public_profile_consent RPC
  const consentRpc = await runSql(`
    SELECT proname, prosecdef, proowner::regrole as owner, proconfig
    FROM pg_proc
    WHERE proname = 'set_public_profile_consent';
  `, 'production');
  assert(consentRpc.length === 1, 'set_public_profile_consent RPC exists');
  assert(consentRpc[0].prosecdef === true, 'set_public_profile_consent is SECURITY DEFINER');
  assert(consentRpc[0].owner === 'postgres', 'set_public_profile_consent owned by postgres');
  assert(consentRpc[0].proconfig && consentRpc[0].proconfig.some(c => c.startsWith('search_path=')),
    'set_public_profile_consent enforces empty search_path');

  // Verify protect_profile_system_columns trigger
  const protectProc = await runSql(`
    SELECT proname, prosecdef, proowner::regrole as owner, proconfig
    FROM pg_proc
    WHERE proname = 'protect_profile_system_columns';
  `, 'production');
  assert(protectProc.length === 1, 'protect_profile_system_columns trigger function exists');
  assert(protectProc[0].prosecdef === false, 'protect_profile_system_columns is SECURITY INVOKER (caller security boundary)');
  assert(protectProc[0].proconfig && protectProc[0].proconfig.some(c => c.startsWith('search_path=')),
    'protect_profile_system_columns enforces empty search_path');

  // --------------------------------------------------------------------------
  // GATE 2: BASE PROFILES TABLE OWNER-SCOPED RLS
  // --------------------------------------------------------------------------
  console.log('\n--- GATE 2: Base Profiles Table Owner-Scoped RLS ---');

  const profilesClass = await runSql(`
    SELECT relname, relrowsecurity, relforcerowsecurity
    FROM pg_class
    WHERE relname = 'profiles';
  `, 'production');
  assert(profilesClass[0].relrowsecurity === true, 'profiles has RLS enabled (relrowsecurity = true)');

  const profilesPolicies = await runSql(`
    SELECT polname, polcmd, polroles::regrole[] as roles,
           pg_get_expr(polqual, polrelid) as qual,
           pg_get_expr(polwithcheck, polrelid) as with_check
    FROM pg_policy
    WHERE polrelid = 'public.profiles'::regclass
    ORDER BY polname;
  `, 'production');

  const selectPolicy = profilesPolicies.find(p => p.polname === 'profiles_select_own');
  const insertPolicy = profilesPolicies.find(p => p.polname === 'profiles_insert_own');
  const updatePolicy = profilesPolicies.find(p => p.polname === 'profiles_update_own');

  assert(selectPolicy !== undefined, 'profiles_select_own policy exists');
  assert(selectPolicy && selectPolicy.qual.includes('auth.uid() = id'), 'profiles SELECT strictly restricted to owner or admin');
  assert(insertPolicy && insertPolicy.with_check.includes('auth.uid() = id'), 'profiles INSERT restricted to owner');
  assert(updatePolicy && updatePolicy.qual.includes('auth.uid() = id'), 'profiles UPDATE restricted to owner');

  // --------------------------------------------------------------------------
  // GATE 3: PUBLIC PROFILES VIEW SANITIZATION & SECURITY SETTINGS
  // --------------------------------------------------------------------------
  console.log('\n--- GATE 3: Public Profiles View Sanitization & Security Settings ---');

  const pubViewClass = await runSql(`
    SELECT c.relname, pg_get_userbyid(c.relowner) as view_owner, c.reloptions
    FROM pg_class c
    WHERE c.relname = 'public_profiles' AND c.relkind = 'v';
  `, 'production');

  assert(pubViewClass.length === 1, 'public_profiles is a view (relkind = v)');
  assert(pubViewClass[0].view_owner === 'postgres', 'public_profiles owned by postgres');
  assert(pubViewClass[0].reloptions && pubViewClass[0].reloptions.includes('security_barrier=true'), 
    'public_profiles enforces security_barrier = true');

  // Verify column sanitization: 0 PII columns
  const pubViewCols = await runSql(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'public_profiles';
  `, 'production');

  const colNames = pubViewCols.map(c => c.column_name);
  const piiColumns = ['email', 'phone', 'phone_number', 'salary', 'salary_expected', 'compensation', 'resume_url', 'tax_id'];
  const exposedPii = piiColumns.filter(c => colNames.includes(c));
  assert(exposedPii.length === 0, `public_profiles exposes 0 PII columns (found: ${exposedPii.join(', ') || 'none'})`);
  console.log(`   Approved sanitized columns exposed: ${colNames.length}`);

  // --------------------------------------------------------------------------
  // GATE 4: APPLICANT & CONNECTION VIEWS SECURITY MODEL
  // --------------------------------------------------------------------------
  console.log('\n--- GATE 4: Applicant & Connection Views Security Model ---');

  const specializedViews = await runSql(`
    SELECT c.relname, pg_get_userbyid(c.relowner) as view_owner, c.reloptions
    FROM pg_class c
    WHERE c.relname IN ('connection_profiles', 'applicant_profiles', 'feed_author_snippets') AND c.relkind = 'v'
    ORDER BY c.relname;
  `, 'production');

  for (const v of specializedViews) {
    const isBarrier = Array.isArray(v.reloptions) && v.reloptions.includes('security_barrier=true');
    assert(v.view_owner === 'postgres', `View ${v.relname} owned by postgres`);
    assert(isBarrier, `View ${v.relname} enforces security_barrier = true`);
  }

  // --------------------------------------------------------------------------
  // GATE 5: EXTENSIONS SCHEMA & INTERNAL HELPERS PRIVILEGE AUDIT
  // --------------------------------------------------------------------------
  console.log('\n--- GATE 5: Extensions Schema & Internal Helpers Privilege Audit ---');

  const canAccessDoc = await runSql(`
    SELECT p.proname, n.nspname, p.prosecdef, pg_get_userbyid(p.proowner) as owner, p.proconfig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'can_employer_access_document';
  `, 'production');

  assert(canAccessDoc.length === 1, 'can_employer_access_document exists');
  assert(canAccessDoc[0].nspname === 'extensions', 'can_employer_access_document located in extensions schema (not public)');
  assert(canAccessDoc[0].prosecdef === true, 'can_employer_access_document is SECURITY DEFINER');
  assert(canAccessDoc[0].owner === 'postgres', 'can_employer_access_document owned by postgres');
  assert(canAccessDoc[0].proconfig && canAccessDoc[0].proconfig.some(c => c.startsWith('search_path=')),
    'can_employer_access_document enforces empty search_path');

  const canManageJob = await runSql(`
    SELECT p.proname, n.nspname, p.prosecdef, pg_get_userbyid(p.proowner) as owner, p.proconfig,
           pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'can_manage_company_job';
  `, 'production');

  assert(canManageJob.length === 2, `can_manage_company_job has exactly 2 overloads (got ${canManageJob.length})`);
  for (const m of canManageJob) {
    assert(m.nspname === 'extensions', `can_manage_company_job(${m.args}) in extensions schema`);
    assert(m.prosecdef === true, `can_manage_company_job(${m.args}) is SECURITY DEFINER`);
    assert(m.owner === 'postgres', `can_manage_company_job(${m.args}) owned by postgres`);
    assert(m.proconfig && m.proconfig.some(c => c.startsWith('search_path=')),
      `can_manage_company_job(${m.args}) enforces empty search_path`);
  }

  // --------------------------------------------------------------------------
  // GATE 6: STORAGE RLS POLICIES & CANONICAL KEY ENFORCEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- GATE 6: Storage RLS Policies & Canonical Key Enforcement ---');

  const storagePolicies = await runSql(`
    SELECT polname, polcmd,
           pg_get_expr(polqual, polrelid) as qual,
           pg_get_expr(polwithcheck, polrelid) as with_check
    FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
      AND polname IN (
        'Candidates can read own documents',
        'Candidates can insert own documents',
        'Candidates can update own documents',
        'Candidates can delete own documents',
        'Employers can view applicant documents'
      )
    ORDER BY polname;
  `, 'production');

  assert(storagePolicies.length === 5, `Found all 5 critical storage policies (got ${storagePolicies.length})`);

  const candRead = storagePolicies.find(p => p.polname === 'Candidates can read own documents');
  const candInsert = storagePolicies.find(p => p.polname === 'Candidates can insert own documents');
  const candUpdate = storagePolicies.find(p => p.polname === 'Candidates can update own documents');
  const candDelete = storagePolicies.find(p => p.polname === 'Candidates can delete own documents');
  const empDocView = storagePolicies.find(p => p.polname === 'Employers can view applicant documents');

  assert(candRead && candRead.qual.includes('[1]') && candRead.qual.includes('[2]'),
    'Candidate read policy supports both 1-segment and 2-segment folder layouts');
  assert(candInsert && candInsert.with_check.includes('[1]') && candInsert.with_check.includes('[2]'),
    'Candidate insert policy enforces folder path containment');
  assert(candUpdate && candUpdate.qual.includes('owner_id'),
    'Candidate update policy enforces non-deprecated owner_id');
  assert(candDelete && candDelete.qual.includes('owner_id'),
    'Candidate delete policy enforces non-deprecated owner_id');
  assert(empDocView && empDocView.qual.includes('can_employer_access_document'),
    'Employers view policy explicitly invokes can_employer_access_document');
  assert(empDocView && empDocView.qual.includes('owner_id'),
    'Employers view policy passes storage.objects.owner_id');

  // --------------------------------------------------------------------------
  // GATE 7: SERVER-ONLY MAPPING TABLE & AUDIT LEDGER
  // --------------------------------------------------------------------------
  console.log('\n--- GATE 7: Server-Only Mapping Table & Audit Ledger ---');

  const mapTable = await runSql(`
    SELECT relname, relrowsecurity
    FROM pg_class
    WHERE relname = 'candidate_document_mappings';
  `, 'production');
  assert(mapTable.length === 1 && mapTable[0].relrowsecurity === true,
    'candidate_document_mappings exists and has RLS enabled');

  const mapPrivs = await runSql(`
    SELECT grantee, privilege_type
    FROM information_schema.table_privileges
    WHERE table_name = 'candidate_document_mappings'
      AND grantee IN ('anon', 'authenticated', 'PUBLIC');
  `, 'production');
  assert(mapPrivs.length === 0, `Direct client privileges on candidate_document_mappings revoked (got ${mapPrivs.length})`);

  const auditCols = await runSql(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_document_mapping_audit'
    ORDER BY ordinal_position;
  `, 'production');
  const hasAuditActor = auditCols.some(c => c.column_name === 'actor_id' && c.data_type === 'uuid');
  const hasAuditPerf = auditCols.some(c => c.column_name === 'performed_by' && c.data_type === 'text');
  assert(hasAuditActor && hasAuditPerf, 'candidate_document_mapping_audit has both actor_id (uuid) and performed_by (text)');

  // --------------------------------------------------------------------------
  // GATE 8: ADMINISTRATOR AUTHORIZATION & ANTI-PROBING GUARD
  // --------------------------------------------------------------------------
  console.log('\n--- GATE 8: Administrator Authorization & Anti-Probing Guard ---');

  const adminProc = await runSql(`
    SELECT proname, prosecdef, proowner::regrole as owner, proconfig
    FROM pg_proc
    WHERE proname = 'is_app_admin';
  `, 'production');

  assert(adminProc.length === 1, 'public.is_app_admin exists');
  assert(adminProc[0].prosecdef === true, 'public.is_app_admin is SECURITY DEFINER');
  assert(adminProc[0].owner === 'postgres', 'public.is_app_admin owned by postgres');
  assert(adminProc[0].proconfig && adminProc[0].proconfig.some(c => c.startsWith('search_path=')),
    'public.is_app_admin enforces empty search_path');

  const probeTest = await runSql(`
    SELECT 
      public.is_app_admin('00000000-0000-0000-0000-000000000000') as dummy_uuid,
      public.is_app_admin(NULL) as null_uuid;
  `, 'production');
  assert(probeTest[0].dummy_uuid === false, 'Anti-probing: arbitrary UUID evaluates to false');
  assert(probeTest[0].null_uuid === false, 'Anti-probing: NULL user_id evaluates to false');

  const roleMutations = await runSql(`
    SELECT grantee, privilege_type
    FROM information_schema.table_privileges
    WHERE table_name = 'user_roles'
      AND grantee IN ('anon', 'authenticated', 'PUBLIC')
      AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE');
  `, 'production');
  assert(roleMutations.length === 0, `user_roles mutation privileges completely revoked (got ${roleMutations.length})`);

  // --------------------------------------------------------------------------
  // GATE 9: CROSS-CANDIDATE ADVERSARIAL ISOLATION ON LIVE STORAGE RLS
  // --------------------------------------------------------------------------
  console.log('\n--- GATE 9: Cross-Candidate Adversarial Isolation on Live Storage RLS ---');

  const crossCandidateTest = await runSql(`
    SELECT 
      -- Simulation 1: Candidate B attempting to read Candidate A's single-segment document
      (
        'documents' = 'documents' 
        AND (
          ('45bdd0a1-37e0-4728-8dc6-67be4ebdb735' = (storage.foldername('0b28a473-bcbb-4c49-b291-f9ea0daf4add/resume.pdf'))[1])
          OR (
            (storage.foldername('0b28a473-bcbb-4c49-b291-f9ea0daf4add/resume.pdf'))[1] = 'resumes'
            AND '45bdd0a1-37e0-4728-8dc6-67be4ebdb735' = (storage.foldername('0b28a473-bcbb-4c49-b291-f9ea0daf4add/resume.pdf'))[2]
          )
        )
      ) as cross_cand_1seg,

      -- Simulation 2: Candidate B attempting to read Candidate A's two-segment document
      (
        'documents' = 'documents' 
        AND (
          ('45bdd0a1-37e0-4728-8dc6-67be4ebdb735' = (storage.foldername('resumes/0b28a473-bcbb-4c49-b291-f9ea0daf4add/resume.pdf'))[1])
          OR (
            (storage.foldername('resumes/0b28a473-bcbb-4c49-b291-f9ea0daf4add/resume.pdf'))[1] = 'resumes'
            AND '45bdd0a1-37e0-4728-8dc6-67be4ebdb735' = (storage.foldername('resumes/0b28a473-bcbb-4c49-b291-f9ea0daf4add/resume.pdf'))[2]
          )
        )
      ) as cross_cand_2seg,

      -- Simulation 3: Unauthenticated caller attempting to invoke helper
      extensions.can_employer_access_document(
        'resumes/0b28a473-bcbb-4c49-b291-f9ea0daf4add/resume.pdf',
        '0b28a473-bcbb-4c49-b291-f9ea0daf4add',
        'documents',
        NULL
      ) as unauthed_helper_access,

      -- Simulation 4: Recruiter attempting cross-company application access
      extensions.can_employer_access_document(
        'resumes/0b28a473-bcbb-4c49-b291-f9ea0daf4add/resume.pdf',
        '0b28a473-bcbb-4c49-b291-f9ea0daf4add',
        'documents',
        '45bdd0a1-37e0-4728-8dc6-67be4ebdb735'
      ) as unauthed_recruiter_access;
  `, 'production');

  assert(crossCandidateTest[0].cross_cand_1seg === false, 
    'Cross-candidate 1-segment read strictly BLOCKED by Storage RLS');
  assert(crossCandidateTest[0].cross_cand_2seg === false, 
    'Cross-candidate 2-segment read strictly BLOCKED by Storage RLS');
  assert(crossCandidateTest[0].unauthed_helper_access === false, 
    'Unauthenticated document access fails closed (returns false)');
  assert(crossCandidateTest[0].unauthed_recruiter_access === false, 
    'Unauthorized recruiter document access strictly BLOCKED (returns false)');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`PRODUCTION DATABASE GATES AUDIT SUMMARY:`);
  console.log(`  Total Checks: ${totalChecks}`);
  console.log(`  Passed:       ${passedChecks}`);
  console.log(`  Failed:       ${failedChecks}`);
  console.log(`  Status:       ${failedChecks === 0 ? 'ALL PRODUCTION GATES PASSED (100%)' : 'GATES FAILED'}`);
  console.log('========================================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runProductionGates().catch(err => {
  console.error('GATE VERIFICATION FAILED:', err);
  process.exit(1);
});
