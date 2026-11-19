const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

async function inspectGate3() {
  console.log('========================================================================');
  console.log('GATE 3: APPLICANT DOCUMENT SECURITY & STORAGE IMPLEMENTATION AUDIT');
  console.log('========================================================================\n');

  // 1. Inspect applicant_profiles view definition regarding resume_url, cover_letter, ai_match_score
  console.log('--- 1. VIEW DEFINITION OF applicant_profiles ---');
  const viewDef = await runSql(`
    SELECT pg_get_viewdef('public.applicant_profiles'::regclass, true) as definition;
  `, 'staging');
  console.log(viewDef[0]?.definition);

  // 2. Inspect job_applications columns
  console.log('\n--- 2. COLUMNS OF public.job_applications ---');
  const appCols = await runSql(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'job_applications'
    ORDER BY ordinal_position;
  `, 'staging');
  console.log(JSON.stringify(appCols, null, 2));

  // 3. Inspect storage buckets
  console.log('\n--- 3. STORAGE BUCKETS CONFIGURATION ---');
  const buckets = await runSql(`
    SELECT id, name, public, file_size_limit, allowed_mime_types
    FROM storage.buckets;
  `, 'staging');
  console.log(JSON.stringify(buckets, null, 2));

  // 4. Inspect storage.objects RLS policies
  console.log('\n--- 4. STORAGE.OBJECTS RLS POLICIES ---');
  const storagePolicies = await runSql(`
    SELECT polname, polcmd, polroles::regrole[], polqual, polwithcheck
    FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass;
  `, 'staging');
  console.log(JSON.stringify(storagePolicies, null, 2));
}

inspectGate3().catch(e => console.error(e));
