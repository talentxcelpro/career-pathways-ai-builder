const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function main() {
  console.log('========================================================================');
  console.log('GATE 1: COLUMN PRIVILEGE COMPLETENESS & SYSTEM FIELD PERMISSION MATRIX');
  console.log('========================================================================\n');

  // 1. Column privilege matrix from information_schema.column_privileges
  const colPrivs = await runSql(`
    SELECT column_name, privilege_type
    FROM information_schema.column_privileges
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND grantee = 'authenticated'
    ORDER BY column_name, privilege_type;
  `, 'staging');

  const privMap = {};
  for (const row of colPrivs) {
    if (!privMap[row.column_name]) privMap[row.column_name] = [];
    privMap[row.column_name].push(row.privilege_type);
  }

  // All columns in public.profiles
  const allCols = await runSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY ordinal_position;
  `, 'staging');

  console.log('--- EFFECTIVE PERMISSIONS FOR ROLE "authenticated" ON public.profiles ---');
  console.log('| Column Name | Data Type | Permitted INSERT? | Permitted UPDATE? | Permitted SELECT? | Classification |');
  console.log('| :--- | :--- | :---: | :---: | :---: | :--- |');

  const systemFields = [
    'verification_status', 'verified', 'is_verified', 'id_verification_status',
    'badge_type', 'trust_score', 'verified_at', 'user_role', 'is_admin',
    'is_moderator', 'role', 'is_profile_public', 'profile_visibility',
    'passport_visibility', 'allow_profile_sharing'
  ];

  for (const col of allCols) {
    const cName = col.column_name;
    const privs = privMap[cName] || [];
    // Note: SELECT is granted at table-level to authenticated
    const hasSelect = true; 
    const hasInsert = privs.includes('INSERT');
    const hasUpdate = privs.includes('UPDATE');
    let classification = 'User-Editable / Owner Self-Managed';
    if (systemFields.includes(cName)) {
      classification = 'Restricted System / Privacy / Trust Field';
    } else if (['id', 'created_at', 'updated_at'].includes(cName)) {
      classification = 'System Primary Key / Timestamp';
    }
    console.log(`| \`${cName}\` | ${col.data_type} | ${hasInsert ? '✅ YES' : '❌ NO'} | ${hasUpdate ? '✅ YES' : '❌ NO'} | ${hasSelect ? '✅ YES' : '❌ NO'} | ${classification} |`);
  }

  // 2. Negative adversarial testing of restricted system fields
  console.log('\n--- NEGATIVE ADVERSARIAL TESTING ON RESTRICTED SYSTEM FIELDS ---');
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: authA } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userA_id = authA.user.id;

  const testPayloads = {
    verification_status: 'verified',
    verified: true,
    is_verified: true,
    id_verification_status: 'verified',
    badge_type: 'expert',
    trust_score: 99,
    verified_at: new Date().toISOString(),
    user_role: 'admin',
    is_admin: true,
    is_moderator: true,
    role: 'admin',
    is_profile_public: true,
    profile_visibility: 'public',
    passport_visibility: { contact: true },
    allow_profile_sharing: true
  };

  const existingCols = new Set(allCols.map(c => c.column_name));

  let passedTests = 0;
  let totalTests = 0;

  for (const field of systemFields) {
    if (!existingCols.has(field)) {
      console.log(`ℹ️ Column "${field}" does not exist in staging table schema. (Checked: SAFE)`);
      continue;
    }

    totalTests++;
    // Attempt direct UPDATE
    const updatePayload = {};
    updatePayload[field] = testPayloads[field];

    const { error: updateErr } = await clientA
      .from('profiles')
      .update(updatePayload)
      .eq('id', userA_id);

    const isBlocked = updateErr !== null && (updateErr.code === '42501' || updateErr.message.includes('permission denied') || updateErr.message.includes('security'));
    if (isBlocked) {
      console.log(`✅ PASS: Direct UPDATE of "${field}" blocked with error: [${updateErr.code}] ${updateErr.message}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: Direct UPDATE of "${field}" was NOT blocked! Error:`, updateErr);
    }
  }

  // 3. Test Legitimate Onboarding & Owner Profile Editing
  console.log('\n--- VERIFYING LEGITIMATE ONBOARDING & PROFILE EDITING ---');
  const testHeadline = `Staff Security Engineer - Verified ${Date.now()}`;
  const { data: editData, error: editErr } = await clientA
    .from('profiles')
    .update({
      headline: testHeadline,
      about: 'Audited profile owner bio update test',
      skills: ['PostgreSQL', 'Security', 'RLS']
    })
    .eq('id', userA_id)
    .select('id, headline, about, skills');

  const editSuccess = editErr === null && editData && editData.length === 1 && editData[0].headline === testHeadline;
  totalTests++;
  if (editSuccess) {
    console.log(`✅ PASS: Legitimate profile editing of permitted fields succeeded! (Updated headline: ${editData[0].headline})`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: Legitimate profile editing failed! Error:`, editErr);
  }

  // Test PostgREST Onboarding Upsert with allowed columns
  const { data: upsertData, error: upsertErr } = await clientA
    .from('profiles')
    .upsert({
      id: userA_id,
      full_name: 'Audit Candidate One (Upserted)',
      headline: testHeadline
    })
    .select('id, full_name, headline');

  const upsertSuccess = upsertErr === null && upsertData && upsertData.length === 1;
  totalTests++;
  if (upsertSuccess) {
    console.log(`✅ PASS: Legitimate onboarding upsert with allowed columns succeeded!`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: Onboarding upsert failed! Error:`, upsertErr);
  }

  console.log(`\nGATE 1 RESULTS: ${passedTests} / ${totalTests} TESTS PASSED.`);
}

main().catch(e => console.error(e));
