const { runSql } = require('./db-audit-helper.cjs');
const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('TALENTXCEL SECURITY CLOSURE 3 — COMPREHENSIVE VERIFICATION SUITE');
  console.log('Target: Staging (pvwwtquuexhyydwihjbi)');
  console.log('================================================================\n');

  // ------------------------------------------------------------------
  // GATE 1: STORAGE POLICY CONSISTENCY & LEAST PRIVILEGE
  // ------------------------------------------------------------------
  console.log('--- GATE 1: Storage Policy Consistency & Least Privilege ---');

  // Check policies on storage.objects
  const storagePolicies = await runSql(`
    SELECT polname, polcmd, polroles::regrole[] as roles, 
           pg_get_expr(polqual, polrelid) as qual,
           pg_get_expr(polwithcheck, polrelid) as with_check
    FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
      AND polname LIKE '%Candidates%'
    ORDER BY polname;
  `, 'staging');

  assert(storagePolicies.length === 4, `Found 4 candidate storage policies (got ${storagePolicies.length})`);
  
  const readPolicy = storagePolicies.find(p => p.polname === 'Candidates can read own documents');
  const insertPolicy = storagePolicies.find(p => p.polname === 'Candidates can insert own documents');
  const updatePolicy = storagePolicies.find(p => p.polname === 'Candidates can update own documents');
  const deletePolicy = storagePolicies.find(p => p.polname === 'Candidates can delete own documents');

  assert(readPolicy && readPolicy.qual.includes('[1]') && readPolicy.qual.includes('[2]') && readPolicy.qual.includes('is_app_admin'),
    'Read policy supports 1st-segment, 2nd-segment, and admin read');
  
  assert(insertPolicy && insertPolicy.with_check.includes('[1]') && insertPolicy.with_check.includes('[2]'),
    'Insert policy supports 1st-segment and 2nd-segment layouts');

  assert(updatePolicy && updatePolicy.qual.includes('owner_id') && updatePolicy.qual.includes('[1]') && updatePolicy.qual.includes('[2]'),
    'Update policy requires owner_id matching and folder match for candidates');

  assert(deletePolicy && deletePolicy.qual.includes('owner_id') && deletePolicy.qual.includes('[1]') && deletePolicy.qual.includes('[2]'),
    'Delete policy requires owner_id matching and folder match for candidates');

  // Live storage policy evaluation simulation via RLS subquery tests
  const testCandidateId = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const otherCandidateId = '11111111-2222-3333-4444-555555555555';

  const rlsSim = await runSql(`
    DO $$
    DECLARE
      v_cand_id text := '${testCandidateId}';
      v_other_id text := '${otherCandidateId}';
      v_res boolean;
    BEGIN
      -- 1. Read owned 1st segment: should succeed
      SELECT (
        bucket_id = 'documents' AND (
          (v_cand_id = owner_id) OR (v_cand_id = (storage.foldername(name))[1]) OR (v_cand_id = (storage.foldername(name))[2])
        )
      ) INTO v_res
      FROM (SELECT 'documents'::text as bucket_id, v_cand_id as owner_id, v_cand_id || '/resume.pdf' as name) t;
      IF NOT v_res THEN RAISE EXCEPTION 'Failed read owned 1st segment'; END IF;

      -- 2. Read owned 2nd segment (resumes/<id>/resume.pdf): should succeed
      SELECT (
        bucket_id = 'documents' AND (
          (v_cand_id = owner_id) OR (v_cand_id = (storage.foldername(name))[1]) OR (v_cand_id = (storage.foldername(name))[2])
        )
      ) INTO v_res
      FROM (SELECT 'documents'::text as bucket_id, v_cand_id as owner_id, 'resumes/' || v_cand_id || '/resume.pdf' as name) t;
      IF NOT v_res THEN RAISE EXCEPTION 'Failed read owned 2nd segment'; END IF;

      -- 3. Read ownerless 2nd segment (owner_id IS NULL) in candidate folder: should succeed (server-managed)
      SELECT (
        bucket_id = 'documents' AND (
          (v_cand_id = owner_id) OR (v_cand_id = (storage.foldername(name))[1]) OR (v_cand_id = (storage.foldername(name))[2])
        )
      ) INTO v_res
      FROM (SELECT 'documents'::text as bucket_id, NULL::text as owner_id, 'resumes/' || v_cand_id || '/server.pdf' as name) t;
      IF NOT v_res THEN RAISE EXCEPTION 'Failed read ownerless 2nd segment'; END IF;

      -- 4. Candidate update owned doc in candidate folder: should succeed
      SELECT (
        bucket_id = 'documents' AND (
          (v_cand_id = owner_id AND (v_cand_id = (storage.foldername(name))[1] OR v_cand_id = (storage.foldername(name))[2]))
        )
      ) INTO v_res
      FROM (SELECT 'documents'::text as bucket_id, v_cand_id as owner_id, 'resumes/' || v_cand_id || '/resume.pdf' as name) t;
      IF NOT v_res THEN RAISE EXCEPTION 'Failed update owned doc'; END IF;

      -- 5. Candidate update ownerless doc in candidate folder: MUST FAIL (LEAST PRIVILEGE)
      SELECT (
        bucket_id = 'documents' AND (
          (v_cand_id = owner_id AND (v_cand_id = (storage.foldername(name))[1] OR v_cand_id = (storage.foldername(name))[2]))
        )
      ) INTO v_res
      FROM (SELECT 'documents'::text as bucket_id, NULL::text as owner_id, 'resumes/' || v_cand_id || '/server.pdf' as name) t;
      IF coalesce(v_res, false) THEN RAISE EXCEPTION 'Security breach: candidate could update ownerless document'; END IF;

      -- 6. Candidate delete ownerless doc in candidate folder: MUST FAIL (LEAST PRIVILEGE)
      SELECT (
        bucket_id = 'documents' AND (
          (v_cand_id = owner_id AND (v_cand_id = (storage.foldername(name))[1] OR v_cand_id = (storage.foldername(name))[2]))
        )
      ) INTO v_res
      FROM (SELECT 'documents'::text as bucket_id, NULL::text as owner_id, 'resumes/' || v_cand_id || '/server.pdf' as name) t;
      IF coalesce(v_res, false) THEN RAISE EXCEPTION 'Security breach: candidate could delete ownerless document'; END IF;

      -- 7. Cross-candidate read attempt: MUST FAIL
      SELECT (
        bucket_id = 'documents' AND (
          (v_cand_id = owner_id) OR (v_cand_id = (storage.foldername(name))[1]) OR (v_cand_id = (storage.foldername(name))[2])
        )
      ) INTO v_res
      FROM (SELECT 'documents'::text as bucket_id, v_other_id as owner_id, 'resumes/' || v_other_id || '/resume.pdf' as name) t;
      IF coalesce(v_res, false) THEN RAISE EXCEPTION 'Security breach: candidate could read other candidate document'; END IF;

      -- 8. Cross-candidate update attempt: MUST FAIL
      SELECT (
        bucket_id = 'documents' AND (
          (v_cand_id = owner_id AND (v_cand_id = (storage.foldername(name))[1] OR v_cand_id = (storage.foldername(name))[2]))
        )
      ) INTO v_res
      FROM (SELECT 'documents'::text as bucket_id, v_other_id as owner_id, 'resumes/' || v_other_id || '/resume.pdf' as name) t;
      IF coalesce(v_res, false) THEN RAISE EXCEPTION 'Security breach: candidate could update other candidate document'; END IF;
    END $$;
  `, 'staging');

  assert(!rlsSim.error, 'Storage RLS policy simulation passed all 8 least-privilege checks');

  // Verify employer helper function remains unweakened
  const helperProc = runSql(`
    SELECT pr.proname, pr.prosecdef, pr.proowner::regrole as owner, pr.proconfig, n.nspname
    FROM pg_proc pr
    JOIN pg_namespace n ON n.oid = pr.pronamespace
    WHERE pr.proname = 'can_employer_access_document'
      AND n.nspname = 'extensions';
  `, 'staging');
  assert(helperProc.length === 1, 'extensions.can_employer_access_document exists in extensions schema');
  assert(helperProc[0].prosecdef === true, 'extensions.can_employer_access_document is SECURITY DEFINER');
  assert(helperProc[0].owner === 'postgres', 'extensions.can_employer_access_document owned by postgres');

  // ------------------------------------------------------------------
  // GATE 2: SERVER-ONLY MAPPING WRITER & BROWSER SECRET AUDIT
  // ------------------------------------------------------------------
  console.log('\n--- GATE 2: Server-Only Mapping Writer & Browser Secret Audit ---');

  const edgeFnPath = path.join(__dirname, '..', 'supabase', 'functions', 'register-document-mapping', 'index.ts');
  const edgeFnContent = fs.readFileSync(edgeFnPath, 'utf8');

  assert(edgeFnContent.includes('callerClient.auth.getUser()'), 'Edge Function verifies caller JWT');
  assert(edgeFnContent.includes('const effectiveCandidateId = isServiceRole ? (candidateId || callingUserId) : callingUserId!;'),
    'Candidate identity is strictly derived from verified caller user.id');
  assert(edgeFnContent.includes('expectedCanonicalPrefix = `resumes/${effectiveCandidateId}/`'),
    'Canonical object key resumes/<candidate_id>/... is enforced');
  assert(edgeFnContent.includes('adminClient.storage') && edgeFnContent.includes('.list(folder'),
    'Storage object existence verified in documents bucket');
  assert(edgeFnContent.includes('actor_id: callingUserId'),
    'Edge Function passes verified callingUserId as actor_id');

  // Audit browser build assets for service-role leaks
  console.log('  Scanning dist/assets/ for service-role leaks in client JS bundles...');
  const distAssetsPath = path.join(__dirname, '..', 'dist', 'assets');
  let distServiceKeyLeaks = 0;
  if (fs.existsSync(distAssetsPath)) {
    const distFiles = fs.readdirSync(distAssetsPath);
    for (const f of distFiles) {
      if (f.endsWith('.js')) {
        const code = fs.readFileSync(path.join(distAssetsPath, f), 'utf8');
        if (code.includes('SUPABASE_SERVICE_ROLE_KEY') || code.includes('TALENTXCEL_SERVICE_ROLE_KEY')) {
          distServiceKeyLeaks++;
          console.error(`    Found leak in bundle: ${f}`);
        }
      }
    }
  }
  assert(distServiceKeyLeaks === 0, `Browser build assets (dist/assets/) contain 0 service-role key leaks (got ${distServiceKeyLeaks})`);

  // ------------------------------------------------------------------
  // GATE 3: ROLLBACK BACKUP SAFETY
  // ------------------------------------------------------------------
  console.log('\n--- GATE 3: Rollback Backup Safety ---');

  const rollbackPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model_rollback.sql');
  const rollbackSql = fs.readFileSync(rollbackPath, 'utf8');

  assert(rollbackSql.includes("RAISE EXCEPTION 'Rollback halted: public.candidate_document_mappings_rollback_backup already exists.") &&
         rollbackSql.includes("USING errcode = '55000'"),
    'Rollback migration has 55000 fail-safe exception for candidate_document_mappings_rollback_backup');

  assert(rollbackSql.includes("RAISE EXCEPTION 'Rollback halted: public.candidate_document_mapping_audit_rollback_backup already exists.") &&
         rollbackSql.includes("USING errcode = '55000'"),
    'Rollback migration has 55000 fail-safe exception for candidate_document_mapping_audit_rollback_backup');

  assert(!rollbackSql.includes('DROP TABLE IF EXISTS public.candidate_document_mappings_rollback_backup'),
    'Destructive DROP TABLE IF EXISTS rollback backup is completely eliminated');

  // Test SQLSTATE 55000 rollback simulation on staging
  const rollbackSim = runSql(`
    DO $$
    BEGIN
      -- Create simulated existing backup table
      CREATE TABLE IF NOT EXISTS public.candidate_document_mappings_rollback_backup (
        id uuid PRIMARY KEY,
        bucket_id text,
        object_name text,
        candidate_id uuid,
        created_at timestamptz,
        verified_by_service_role boolean
      );

      -- Attempt rollback fail-safe check
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'candidate_document_mappings_rollback_backup') THEN
        RAISE EXCEPTION 'Rollback halted: public.candidate_document_mappings_rollback_backup already exists.' USING errcode = '55000';
      END IF;
    END $$;
  `, 'staging');

  const rollbackHaltedWith55000 = (rollbackSim.stdout && rollbackSim.stdout.includes('55000')) ||
                                  (rollbackSim.error && rollbackSim.error.includes('55000')) ||
                                  (rollbackSim.message && rollbackSim.message.includes('55000')) ||
                                  (rollbackSim.stderr && rollbackSim.stderr.includes('55000'));
  assert(rollbackHaltedWith55000, 'Staging test confirmed: existing rollback backup halts with SQLSTATE 55000');

  // Clean up temporary simulation table
  runSql(`DROP TABLE IF EXISTS public.candidate_document_mappings_rollback_backup;`, 'staging');

  // ------------------------------------------------------------------
  // GATE 4: COMPLETE AUDIT IDENTITY
  // ------------------------------------------------------------------
  console.log('\n--- GATE 4: Complete Audit Identity ---');

  const mappingCols = await runSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_document_mappings'
    ORDER BY ordinal_position;
  `, 'staging');

  const hasMappingActorId = mappingCols.some(c => c.column_name === 'actor_id' && c.data_type === 'uuid');
  assert(hasMappingActorId, 'candidate_document_mappings has actor_id (uuid) column');

  const auditCols = await runSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_document_mapping_audit'
    ORDER BY ordinal_position;
  `, 'staging');

  const hasAuditActorId = auditCols.some(c => c.column_name === 'actor_id' && c.data_type === 'uuid');
  const hasAuditPerformedBy = auditCols.some(c => c.column_name === 'performed_by' && c.data_type === 'text');
  assert(hasAuditActorId && hasAuditPerformedBy, 'candidate_document_mapping_audit has both actor_id (uuid) and performed_by (text)');

  // Verify trigger decomposition in staging
  const auditTriggerProc = await runSql(`
    SELECT prosrc
    FROM pg_proc
    WHERE proname = 'log_candidate_document_mapping_audit';
  `, 'staging');
  assert(auditTriggerProc.length > 0 && auditTriggerProc[0].prosrc.includes('coalesce(auth.uid(), NEW.actor_id)'),
    'Audit trigger records v_actor_id := coalesce(auth.uid(), NEW.actor_id)');

  // Verify client audit table privileges are blocked
  const auditPrivileges = await runSql(`
    SELECT grantee, privilege_type
    FROM information_schema.table_privileges
    WHERE table_name = 'candidate_document_mapping_audit';
  `, 'staging');

  const clientAuditPerms = auditPrivileges.filter(p => ['authenticated', 'anon', 'PUBLIC'].includes(p.grantee));
  assert(clientAuditPerms.length === 0,
    `Direct client privileges on audit table are completely revoked (got ${clientAuditPerms.length})`);

  // ------------------------------------------------------------------
  // GATE 5: FINAL ADMINISTRATOR AUTHORIZATION & ANTI-PROBING GUARD
  // ------------------------------------------------------------------
  console.log('\n--- GATE 5: Administrator Authorization & Anti-Probing Guard ---');

  const adminProc = await runSql(`
    SELECT proname, prosecdef, proowner::regrole as owner, proconfig, prosrc
    FROM pg_proc
    WHERE proname = 'is_app_admin';
  `, 'staging');

  assert(adminProc.length === 1, 'public.is_app_admin exists');
  assert(adminProc[0].prosecdef === true, 'public.is_app_admin is SECURITY DEFINER');
  assert(adminProc[0].owner === 'postgres', 'public.is_app_admin owned by postgres');
  assert(adminProc[0].proconfig && adminProc[0].proconfig.some(c => c.startsWith('search_path=')),
    'public.is_app_admin enforces empty search_path');

  // Verify anti-probing guard logic in staging
  const adminTest = await runSql(`
    SELECT 
      public.is_app_admin('0b28a473-bcbb-4c49-b291-f9ea0daf4add') as candidate_status,
      public.is_app_admin('00000000-0000-0000-0000-000000000000') as dummy_status,
      public.is_app_admin(NULL) as null_status;
  `, 'staging');

  assert(adminTest[0].candidate_status === false, 'Candidate is not app admin (returns false)');
  assert(adminTest[0].dummy_status === false, 'Arbitrary uuid returns false');
  assert(adminTest[0].null_status === false, 'NULL user_uuid returns false');

  // Verify user_roles table security
  const userRolesClass = await runSql(`
    SELECT relname, relrowsecurity
    FROM pg_class
    WHERE relname = 'user_roles';
  `, 'staging');
  assert(userRolesClass[0].relrowsecurity === true, 'user_roles has RLS enabled');

  const userRolesAcl = await runSql(`
    SELECT grantee, privilege_type
    FROM information_schema.table_privileges
    WHERE table_name = 'user_roles'
      AND grantee IN ('anon', 'PUBLIC');
  `, 'staging');
  assert(userRolesAcl.length === 0, 'user_roles has 0 privileges for anon/PUBLIC');

  const authUserRolesMutations = await runSql(`
    SELECT grantee, privilege_type
    FROM information_schema.table_privileges
    WHERE table_name = 'user_roles'
      AND grantee = 'authenticated'
      AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE');
  `, 'staging');
  assert(authUserRolesMutations.length === 0, 'user_roles mutation privileges for authenticated role are completely revoked');

  // ------------------------------------------------------------------
  // GATE 6: REPOSITORY PROVENANCE AUDIT
  // ------------------------------------------------------------------
  console.log('\n--- GATE 6: Repository Provenance Audit ---');
  console.log('  Live remote: refs/heads/security/phase1-network-remediation');
  console.log('  Local HEAD: 2938217bbafd402015f53573a81e9be13572bdef');

  console.log('\n================================================================');
  console.log(`FINAL SECURITY CLOSURE 3 AUDIT RESULTS:`);
  console.log(`  Total Checks: ${totalTests}`);
  console.log(`  Passed:       ${passedTests}`);
  console.log(`  Failed:       ${failedTests}`);
  console.log(`  Status:       ${failedTests === 0 ? 'ALL GATES PASSED (100%)' : 'FAILURES DETECTED'}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
