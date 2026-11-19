const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function main() {
  console.log('========================================================================');
  console.log('GATE 6: ROLLBACK AND FRONTEND COMPATIBILITY VERIFICATION');
  console.log('========================================================================\n');

  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // Login Candidate 1
  const { data: authA } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userA_id = authA.user.id;

  // Login Recruiter
  const { data: authRec } = await anonClient.auth.signInWithPassword({
    email: 'audit_rec1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientRec = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authRec.session.access_token}` } },
    auth: { persistSession: false }
  });

  let passed = 0;
  let total = 0;
  function assert(name, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} Details: ${details}`);
    }
  }

  // 1. Test frontend queries on Fully Migrated Schema
  console.log('--- 1. TESTING QUERIES ON FULLY MIGRATED SCHEMA ---');
  // 1.1 Candidate profile self-read
  const { data: selfProf, error: errSelf } = await clientA.from('profiles').select('id, full_name, headline, email, phone').eq('id', userA_id).single();
  assert('1.1 Owner can query own profile including private contact info', errSelf === null && selfProf?.id === userA_id, JSON.stringify(errSelf));

  // 1.2 Candidate profile update via allowed columns
  const testHeadline = `Staff Engineer Compat Test ${Date.now()}`;
  const { error: errUp } = await clientA.from('profiles').update({ headline: testHeadline }).eq('id', userA_id);
  assert('1.2 Owner can update own profile using user-editable fields', errUp === null, JSON.stringify(errUp));

  // 1.3 Public profile view works for consented candidate
  await clientA.rpc('set_public_profile_consent', { p_granted: true, p_visibility: 'public', p_source: 'user_privacy_dashboard' });
  const { data: pubProf, error: errPub } = await anonClient.from('public_profiles').select('*').eq('id', userA_id).maybeSingle();
  assert('1.3 Anonymous visitor can query public_profiles for consented candidate', errPub === null && pubProf?.id === userA_id, JSON.stringify(errPub));

  // 1.4 Recruiter applicant view works
  const { data: appProf, error: errApp } = await clientRec.from('applicant_profiles').select('*').eq('candidate_id', userA_id).maybeSingle();
  assert('1.4 Recruiter can query applicant_profiles for applied candidate', errApp === null && appProf?.candidate_id === userA_id, JSON.stringify(errApp));

  // 2. Perform Migration B Rollback
  console.log('\n--- 2. EXECUTING MIGRATION B ROLLBACK ---');
  const rollbackSqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model_rollback.sql');
  const rollbackSql = fs.readFileSync(rollbackSqlPath, 'utf8');

  // Verify rollback SQL has NO unsafe grants
  assert('2.1 Rollback does NOT re-grant service_role mutation on consents', !rollbackSql.includes('GRANT INSERT, UPDATE, DELETE ON TABLE public.candidate_privacy_consents TO service_role'));
  assert('2.2 Rollback does NOT re-grant TRUNCATE on profiles', !rollbackSql.includes('GRANT TRUNCATE ON public.profiles'));

  // Record consent count before rollback
  const consentsBefore = await runSql(`SELECT count(*)::int as c FROM public.candidate_privacy_consents;`, 'staging');
  const eventsBefore = await runSql(`SELECT count(*)::int as c FROM public.candidate_consent_events;`, 'staging');

  // Apply Rollback SQL
  runSql(rollbackSql, 'staging');

  // 3. Test Rollback State
  console.log('\n--- 3. TESTING QUERIES ON ROLLBACK SCHEMA ---');
  // 3.1 Specialized views cleanly dropped
  const { error: errConnDropped } = await clientA.from('connection_profiles').select('*');
  const isConnDropped = errConnDropped !== null && (errConnDropped.code === 'PGRST205' || errConnDropped.code === '42P01' || errConnDropped.message.includes('Could not find') || errConnDropped.message.includes('does not exist'));
  assert('3.1 connection_profiles view is dropped in rollback schema', isConnDropped, JSON.stringify(errConnDropped));

  const { error: errAppDropped } = await clientRec.from('applicant_profiles').select('*');
  const isAppDropped = errAppDropped !== null && (errAppDropped.code === 'PGRST205' || errAppDropped.code === '42P01' || errAppDropped.message.includes('Could not find') || errAppDropped.message.includes('does not exist'));
  assert('3.2 applicant_profiles view is dropped in rollback schema', isAppDropped, JSON.stringify(errAppDropped));

  // 3.3 public_profiles view survives (Migration A baseline)
  const { data: pubRollback, error: errPubRollback } = await anonClient.from('public_profiles').select('*').eq('id', userA_id).maybeSingle();
  assert('3.3 public_profiles view remains active under Migration A baseline', errPubRollback === null && pubRollback?.id === userA_id, JSON.stringify(errPubRollback));

  // 3.4 Consent and audit records completely preserved
  const consentsAfter = await runSql(`SELECT count(*)::int as c FROM public.candidate_privacy_consents;`, 'staging');
  const eventsAfter = await runSql(`SELECT count(*)::int as c FROM public.candidate_consent_events;`, 'staging');
  assert('3.4 100% of candidate consent records preserved through rollback', consentsAfter[0]?.c === consentsBefore[0]?.c && consentsAfter[0]?.c > 0, `Before: ${consentsBefore[0]?.c}, After: ${consentsAfter[0]?.c}`);
  assert('3.4 100% of consent audit events preserved through rollback', eventsAfter[0]?.c === eventsBefore[0]?.c && eventsAfter[0]?.c > 0, `Before: ${eventsBefore[0]?.c}, After: ${eventsAfter[0]?.c}`);

  // 3.5 Base table public.profiles remains protected (NOT reverted to permissive public access)
  const freshAnonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: anonData, error: errAnonBase } = await freshAnonClient.from('profiles').select('*');
  const isAnonBlocked = (errAnonBase !== null && (errAnonBase.code === '42501' || errAnonBase.message.includes('permission denied'))) || (anonData && anonData.length === 0);
  assert('3.5 Anonymous direct access to public.profiles remains STRICTLY BLOCKED', isAnonBlocked, JSON.stringify({ errAnonBase, anonDataLength: anonData?.length }));

  // 4. Re-apply Forward Migration B to restore staging to full target state
  console.log('\n--- 4. RESTORING FORWARD MIGRATION B ---');
  const forwardSqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model.sql');
  const forwardSql = fs.readFileSync(forwardSqlPath, 'utf8');
  runSql(forwardSql, 'staging');

  const { data: appRestored, error: errRestored } = await clientRec.from('applicant_profiles').select('*').eq('candidate_id', userA_id).maybeSingle();
  assert('4.1 Forward Migration B cleanly re-applies and restores all views', errRestored === null && appRestored?.candidate_id === userA_id);

  console.log(`\nGATE 6 RESULTS: ${passed} / ${total} TESTS PASSED.`);
}

main().catch(e => console.error(e));
