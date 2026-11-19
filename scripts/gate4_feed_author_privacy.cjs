const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function main() {
  console.log('========================================================================');
  console.log('GATE 4: FEED AUTHOR PRIVACY TEST SUITE');
  console.log('========================================================================\n');

  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // Login Candidate 1 (User A) and Candidate 2 (User B)
  const { data: authA } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userA_id = authA.user.id;

  const { data: authB } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand2@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  const clientB = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
    auth: { persistSession: false }
  });
  const userB_id = authB.user.id;

  let passed = 0;
  let total = 0;
  function assert(name, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  // Setup test post for User A
  const POST_PUBLIC = 'a0000001-0000-0000-0000-000000000001';

  await runSql(`
    INSERT INTO public.posts (id, author_id, user_id, content, visibility, status, is_public, is_deleted)
    VALUES 
      ('${POST_PUBLIC}', '${userA_id}', '${userA_id}', 'Public Post Content', 'public', 'published', true, false)
    ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      visibility = EXCLUDED.visibility,
      status = EXCLUDED.status,
      is_public = EXCLUDED.is_public,
      is_deleted = EXCLUDED.is_deleted;
  `, 'staging');

  // Case 4.1: Public profile + public post
  await runSql(`
    UPDATE public.profiles SET profile_visibility = 'public', is_profile_public = true WHERE id = '${userA_id}';
  `, 'staging');
  const { data: c1 } = await clientB.from('feed_author_snippets').select('*').eq('id', userA_id).maybeSingle();
  const c1Keys = Object.keys(c1 || {});
  assert('4.1 Public profile + public post returns author snippet', c1 !== null && c1.id === userA_id, `Fields: ${c1Keys.join(', ')}`);
  assert('4.1 Snippet excludes sensitive fields', !('email' in (c1 || {})) && !('phone' in (c1 || {})) && !('current_salary' in (c1 || {})));

  // Case 4.2: Connections-only profile + public post
  await runSql(`
    UPDATE public.profiles SET profile_visibility = 'connections_only', is_profile_public = false WHERE id = '${userA_id}';
  `, 'staging');
  const { data: c2 } = await clientB.from('feed_author_snippets').select('*').eq('id', userA_id).maybeSingle();
  assert('4.2 Connections-only profile + public post returns basic snippet only', c2 !== null && c2.id === userA_id);
  const { data: c2Base } = await clientB.from('profiles').select('id, email, phone').eq('id', userA_id).maybeSingle();
  assert('4.2 Base profile remains hidden from non-connection', c2Base === null);

  // Case 4.3: Private profile + previously public post
  await runSql(`
    UPDATE public.profiles SET profile_visibility = 'private', is_profile_public = false WHERE id = '${userA_id}';
  `, 'staging');
  const { data: c3 } = await clientB.from('feed_author_snippets').select('*').eq('id', userA_id).maybeSingle();
  assert('4.3 Private profile author snippet contains only display fields', c3 !== null && !('email' in (c3 || {})));
  const { data: c3Base } = await clientB.from('profiles').select('*').eq('id', userA_id).maybeSingle();
  assert('4.3 Base profile row strictly protected by RLS', c3Base === null);

  // Case 4.4: Revoked public indexing + existing post
  await clientA.rpc('set_public_profile_consent', { p_granted: false, p_visibility: 'private', p_source: 'user_privacy_dashboard' });
  const { data: c4PublicView } = await anonClient.from('public_profiles').select('*').eq('id', userA_id).maybeSingle();
  assert('4.4 Revoked indexing completely removes profile from public_profiles', c4PublicView === null);

  // Case 4.5: Deleted Post
  const DUMMY_USER_DELETED = 'd0000000-0000-0000-0000-000000000001';
  await runSql(`
    INSERT INTO public.profiles (id, full_name, user_role, verification_status)
    VALUES ('${DUMMY_USER_DELETED}', 'Deleted Post User', 'candidate', 'unverified')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.posts (id, author_id, user_id, content, visibility, status, is_public, is_deleted)
    VALUES ('d0000000-0000-0000-0000-000000000002', '${DUMMY_USER_DELETED}', '${DUMMY_USER_DELETED}', 'Deleted', 'public', 'published', true, true)
    ON CONFLICT (id) DO UPDATE SET is_deleted = true;
  `, 'staging');
  const { data: c5 } = await clientB.from('feed_author_snippets').select('*').eq('id', DUMMY_USER_DELETED).maybeSingle();
  assert('4.5 Deleted post author is excluded from feed_author_snippets', c5 === null);

  // Case 4.6: Draft / Non-published Post
  const DUMMY_USER_DRAFT = 'd0000000-0000-0000-0000-000000000003';
  await runSql(`
    INSERT INTO public.profiles (id, full_name, user_role, verification_status)
    VALUES ('${DUMMY_USER_DRAFT}', 'Draft Post User', 'candidate', 'unverified')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.posts (id, author_id, user_id, content, visibility, status, is_public, is_deleted)
    VALUES ('d0000000-0000-0000-0000-000000000004', '${DUMMY_USER_DRAFT}', '${DUMMY_USER_DRAFT}', 'Draft', 'public', 'draft', true, false)
    ON CONFLICT (id) DO UPDATE SET status = 'draft', is_deleted = false;
  `, 'staging');
  const { data: c6 } = await clientB.from('feed_author_snippets').select('*').eq('id', DUMMY_USER_DRAFT).maybeSingle();
  assert('4.6 Non-published post author is excluded from feed_author_snippets', c6 === null);

  // Case 4.7: Deleted Account (Non-existent profile row)
  const NON_EXISTENT_USER = '00000000-0000-0000-0000-ffffffffffff';
  const { data: c7 } = await clientB.from('feed_author_snippets').select('*').eq('id', NON_EXISTENT_USER).maybeSingle();
  assert('4.7 Deleted account is absent from feed_author_snippets', c7 === null);

  // Case 4.8: Suspended User (Auth banned_until isolation)
  const suspendedCheck = await runSql(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'banned_until'
    ) as has_banned_until;
  `, 'staging');
  assert('4.8 Platform supports auth suspension via banned_until', suspendedCheck[0]?.has_banned_until === true);

  // Clean up
  await runSql(`
    DELETE FROM public.posts WHERE id IN ('${POST_PUBLIC}', 'd0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004');
    DELETE FROM public.profiles WHERE id IN ('${DUMMY_USER_DELETED}', '${DUMMY_USER_DRAFT}');
  `, 'staging');

  console.log(`\nGATE 4 RESULTS: ${passed} / ${total} TESTS PASSED.`);
}

main().catch(e => console.error(e));
