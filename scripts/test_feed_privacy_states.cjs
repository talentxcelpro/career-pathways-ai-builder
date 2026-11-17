const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function runFeedPrivacySuite() {
  console.log('========================================================================');
  console.log('TALENTXCEL FEED AUTHOR PRIVACY ACROSS 4 STATES TEST SUITE');
  console.log(`Target: Staging (${STAGING_REF})`);
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(id, desc, condition, details = '') {
    if (condition) {
      console.log(`✅ PASS: [${id}] ${desc} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: [${id}] ${desc} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  const unauthedClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const authHelper = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // 1. Authenticate Candidate A (Author) & Candidate B (Observer)
  const { data: authA } = await authHelper.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    auth: { persistSession: false }
  });
  const author_id = authA.user.id;

  const { data: authB } = await authHelper.auth.signInWithPassword({
    email: 'audit_cand2@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientB = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
    auth: { persistSession: false }
  });
  const observer_id = authB.user.id;

  // 2. Ensure Author has published public post
  const POST_ID = 'c0000000-0000-0000-0000-000000000001';
  await runSql(`
    INSERT INTO public.posts (id, author_id, user_id, content, is_deleted, is_public, visibility, status)
    VALUES ('${POST_ID}', '${author_id}', '${author_id}', 'Public engineering insights on system architecture', false, true, 'public', 'published')
    ON CONFLICT (id) DO UPDATE SET author_id = '${author_id}', user_id = '${author_id}', is_deleted = false, is_public = true, visibility = 'public', status = 'published';
  `, 'staging');

  // Establish connection between Author and Observer
  const CONN_ID = 'c1111111-1111-1111-1111-111111111111';
  await runSql(`
    INSERT INTO public.connections (id, requester_id, recipient_id, status)
    VALUES ('${CONN_ID}', '${author_id}', '${observer_id}', 'accepted')
    ON CONFLICT (id) DO UPDATE SET status = 'accepted';
  `, 'staging');

  console.log('Test author established:', author_id);

  // --------------------------------------------------------------------------
  // STATE 1: PUBLIC PROFILE (Consent: Granted, Visibility: Public)
  // --------------------------------------------------------------------------
  console.log('\n--- STATE 1: PUBLIC PROFILE (Granted / Public) ---');
  await clientA.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'profile_settings'
  });

  const { data: feedState1 } = await clientB
    .from('feed_author_snippets')
    .select('*')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-01', 'State 1 (Public): Author display snippet present in feed_author_snippets', feedState1?.id === author_id);
  assert('TEST-FEED-02', 'State 1 (Public): Snippet exposes only safe display fields (no email/phone/resume/salary)', 
    feedState1 && !feedState1.email && !feedState1.phone && !feedState1.resume_url && !feedState1.preferred_salary_min);

  const { data: pubState1 } = await unauthedClient
    .from('public_profiles')
    .select('id, full_name')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-03', 'State 1 (Public): Profile indexable in public_profiles view for anon', pubState1?.id === author_id);

  // --------------------------------------------------------------------------
  // STATE 2: CONNECTIONS-ONLY PROFILE (Consent: Revoked, Visibility: Connections-Only)
  // --------------------------------------------------------------------------
  console.log('\n--- STATE 2: CONNECTIONS-ONLY PROFILE (Revoked / Connections-Only) ---');
  await clientA.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'connections_only',
    p_source: 'profile_settings'
  });

  const { data: feedState2 } = await clientB
    .from('feed_author_snippets')
    .select('*')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-04', 'State 2 (Connections-Only): Public post remains attributable in feed_author_snippets', feedState2?.id === author_id);

  const { data: pubState2 } = await unauthedClient
    .from('public_profiles')
    .select('id')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-05', 'State 2 (Connections-Only): Profile is STRICTLY HIDDEN from public_profiles', pubState2 === null);

  const { data: connState2 } = await clientB
    .from('connection_profiles')
    .select('id')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-06', 'State 2 (Connections-Only): Profile accessible to accepted connection in connection_profiles', connState2?.id === author_id);

  // --------------------------------------------------------------------------
  // STATE 3: PRIVATE PROFILE (Consent: Revoked, Visibility: Private)
  // --------------------------------------------------------------------------
  console.log('\n--- STATE 3: PRIVATE PROFILE (Revoked / Private) ---');
  await clientA.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'profile_settings'
  });

  const { data: feedState3 } = await clientB
    .from('feed_author_snippets')
    .select('*')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-07', 'State 3 (Private): Public post remains attributable in feed_author_snippets', feedState3?.id === author_id);

  const { data: pubState3 } = await unauthedClient
    .from('public_profiles')
    .select('id')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-08', 'State 3 (Private): Profile is STRICTLY HIDDEN from public_profiles', pubState3 === null);

  const { data: connState3 } = await clientB
    .from('connection_profiles')
    .select('id')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-09', 'State 3 (Private): Profile is STRICTLY HIDDEN from connections in connection_profiles', connState3 === null);

  const { data: baseState3 } = await clientB
    .from('profiles')
    .select('id')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-10', 'State 3 (Private): Base profiles table blocks non-owner query (owner-only RLS)', baseState3 === null);

  // --------------------------------------------------------------------------
  // STATE 4: EXPLICIT CONSENT REVOCATION VIA PRIVACY DASHBOARD
  // --------------------------------------------------------------------------
  console.log('\n--- STATE 4: EXPLICIT CONSENT REVOCATION VIA DASHBOARD ---');
  await clientA.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });

  const { data: feedState4 } = await clientB
    .from('feed_author_snippets')
    .select('*')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-11', 'State 4 (Explicit Revocation): Public post remains attributable in feed_author_snippets', feedState4?.id === author_id);

  // --------------------------------------------------------------------------
  // POST DELETION TEST: Author deletes post -> Snippet removed
  // --------------------------------------------------------------------------
  console.log('\n--- POST DELETION TEST ---');
  await runSql(`
    UPDATE public.posts SET is_deleted = true WHERE id = '${POST_ID}';
  `, 'staging');

  const { data: feedDeleted } = await clientB
    .from('feed_author_snippets')
    .select('id')
    .eq('id', author_id)
    .maybeSingle();
  assert('TEST-FEED-12', 'Post soft-deleted (is_deleted = true): Snippet IMMEDIATELY disappears from feed_author_snippets', feedDeleted === null);

  // Restore post & public consent for subsequent regression tests
  await runSql(`
    UPDATE public.posts SET is_deleted = false WHERE id = '${POST_ID}';
  `, 'staging');
  await clientA.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'profile_settings'
  });

  console.log('\n========================================================================');
  console.log(`FEED PRIVACY SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runFeedPrivacySuite().catch(err => {
  console.error('Feed privacy suite fatal error:', err);
  process.exit(1);
});
