const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const { runSql } = require('./db-audit-helper.cjs');

const STAGING_URL = "https://pvwwtquuexhyydwihjbi.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzU5MjU3NiwiZXhwIjoyMTA5MTY4NTc2fQ.fnYAXFI51Rpc6-GrnKN2Ui-Cyj_6K0aundMWZi0oJEI";

const adminClient = createClient(STAGING_URL, SERVICE_KEY, { auth: { persistSession: false } });
const anonClient = createClient(STAGING_URL, ANON_KEY, { auth: { persistSession: false } });

function httpReq(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(STAGING_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      headers: {
        'apikey': ANON_KEY,
        ...headers
      }
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runHttpSuite() {
  console.log('========================================================================');
  console.log('TALENTXCEL PHASE 1 HTTP SECURITY REGRESSION SUITE (STAGING)');
  console.log('Target: ' + STAGING_URL);
  console.log('========================================================================\n');

  console.log('>>> [1/3] Authenticating Test Users via GoTrue...');
  const users = [
    { key: 'userA', email: 'audit_cand1@talentxcel-audit.local' },
    { key: 'userB', email: 'audit_cand2@talentxcel-audit.local' },
    { key: 'userC', email: 'audit_rec1@talentxcel-audit.local' }
  ];
  const authTokens = {};

  for (const u of users) {
    const { data: sessionData, error } = await anonClient.auth.signInWithPassword({
      email: u.email,
      password: "AuditPassword123!Secure"
    });
    if (error || !sessionData?.session) {
      throw new Error(`Failed to sign in ${u.email}: ${error?.message}`);
    }
    authTokens[u.key] = {
      userId: sessionData.user.id,
      token: sessionData.session.access_token
    };
  }
  console.log('Tokens obtained successfully for User A, User B, User C.\n');

  const userA = authTokens.userA;
  const userB = authTokens.userB;
  const userC = authTokens.userC;

  const publicPostId = '11111111-1111-1111-1111-111111111111';
  const draftPostId = '22222222-2222-2222-2222-222222222222';
  const deletedPostId = '33333333-3333-3333-3333-333333333333';
  const privatePostId = '44444444-4444-4444-4444-444444444444';
  const privateGroupId = '99999999-9999-9999-9999-999999999999';
  const privateGroupPostId = '88888888-8888-8888-8888-888888888888';

  console.log('>>> [2/3] Setting Up Test Fixtures in Staging DB...');
  const setupSql = `
    DELETE FROM public.posts WHERE id IN ('${publicPostId}', '${draftPostId}', '${deletedPostId}', '${privatePostId}');
    DELETE FROM public.group_posts WHERE id = '${privateGroupPostId}';
    DELETE FROM public.group_memberships WHERE group_id = '${privateGroupId}';
    DELETE FROM public.groups WHERE id = '${privateGroupId}';
    DELETE FROM public.connections WHERE (requester_id = '${userA.userId}' AND recipient_id = '${userB.userId}') OR (requester_id = '${userB.userId}' AND recipient_id = '${userA.userId}');
    DELETE FROM public.post_saves WHERE post_id = '${publicPostId}';

    -- 1. Public published post authored by User B
    INSERT INTO public.posts (id, author_id, user_id, content, status, is_public, visibility, is_deleted, created_at)
    VALUES ('${publicPostId}', '${userB.userId}', '${userB.userId}', 'Live Public Announcement', 'published', true, 'public', false, now());

    -- 2. Draft post authored by User B
    INSERT INTO public.posts (id, author_id, user_id, content, status, is_public, visibility, is_deleted, created_at)
    VALUES ('${draftPostId}', '${userB.userId}', '${userB.userId}', 'Unpublished Secret Draft', 'draft', false, 'private', false, now());

    -- 3. Soft deleted post authored by User B
    INSERT INTO public.posts (id, author_id, user_id, content, status, is_public, visibility, is_deleted, created_at)
    VALUES ('${deletedPostId}', '${userB.userId}', '${userB.userId}', 'Deprecated Post', 'published', true, 'public', true, now());

    -- 4. Private post authored by User B
    INSERT INTO public.posts (id, author_id, user_id, content, status, is_public, visibility, is_deleted, created_at)
    VALUES ('${privatePostId}', '${userB.userId}', '${userB.userId}', 'Confidential User B Post', 'published', false, 'private', false, now());

    -- 5. User B bookmarks Public Post
    INSERT INTO public.post_saves (user_id, post_id)
    VALUES ('${userB.userId}', '${publicPostId}');

    -- 6. Setup Private Group owned by User A
    INSERT INTO public.groups (id, name, privacy, creator_id)
    VALUES ('${privateGroupId}', 'Confidential Leadership Group', 'private', '${userA.userId}');

    INSERT INTO public.group_memberships (group_id, user_id, role, status)
    VALUES ('${privateGroupId}', '${userA.userId}', 'owner', 'accepted');

    INSERT INTO public.group_posts (id, group_id, author_id, content)
    VALUES ('${privateGroupPostId}', '${privateGroupId}', '${userA.userId}', 'Strictly Confidential Internal Memo');
  `;
  runSql(setupSql, 'staging');
  console.log('Fixtures established.\n');

  console.log('>>> [3/3] Executing 11-Point HTTP Matrix...');
  const matrix = [];

  // TEST 1: anon draft reads
  const t1 = await httpReq('GET', `/rest/v1/posts?id=eq.${draftPostId}`, { 'Authorization': `Bearer ${ANON_KEY}` });
  const t1Passed = Array.isArray(t1.body) && t1.body.length === 0;
  matrix.push({
    testNumber: 1,
    name: 'anon: GET posts?status=eq.draft',
    httpStatus: t1.status,
    expected: '0 rows returned',
    actual: `${Array.isArray(t1.body) ? t1.body.length : 'error'} rows returned`,
    status: t1Passed ? 'PASS' : 'FAIL'
  });

  // TEST 2: anon deleted reads
  const t2 = await httpReq('GET', `/rest/v1/posts?id=eq.${deletedPostId}`, { 'Authorization': `Bearer ${ANON_KEY}` });
  const t2Passed = Array.isArray(t2.body) && t2.body.length === 0;
  matrix.push({
    testNumber: 2,
    name: 'anon: GET posts?is_deleted=eq.true',
    httpStatus: t2.status,
    expected: '0 rows returned',
    actual: `${Array.isArray(t2.body) ? t2.body.length : 'error'} rows returned`,
    status: t2Passed ? 'PASS' : 'FAIL'
  });

  // TEST 3: anon private reads
  const t3 = await httpReq('GET', `/rest/v1/posts?id=eq.${privatePostId}`, { 'Authorization': `Bearer ${ANON_KEY}` });
  const t3Passed = Array.isArray(t3.body) && t3.body.length === 0;
  matrix.push({
    testNumber: 3,
    name: 'anon: GET posts?visibility=eq.private',
    httpStatus: t3.status,
    expected: '0 rows returned',
    actual: `${Array.isArray(t3.body) ? t3.body.length : 'error'} rows returned`,
    status: t3Passed ? 'PASS' : 'FAIL'
  });

  // TEST 4: feed RPC with victim UUID
  const t4 = await httpReq('POST', `/rest/v1/rpc/get_network_feed_v2`, { 'Authorization': `Bearer ${ANON_KEY}` }, { p_user_id: userB.userId });
  const t4Feed = Array.isArray(t4.body) ? t4.body : [];
  const t4HasDraft = t4Feed.some(p => p.id === draftPostId);
  const t4HasDeleted = t4Feed.some(p => p.id === deletedPostId);
  const t4HasPrivate = t4Feed.some(p => p.id === privatePostId);
  const t4PublicPost = t4Feed.find(p => p.id === publicPostId);
  const t4Passed = t4.status === 200 && !t4HasDraft && !t4HasDeleted && !t4HasPrivate && t4PublicPost && t4PublicPost.is_saved === false;
  matrix.push({
    testNumber: 4,
    name: 'anon: POST rpc/get_network_feed_v2 (victim UUID)',
    httpStatus: t4.status,
    expected: '0 drafts, 0 deleted, 0 private, is_saved: false',
    actual: `draft=${t4HasDraft}, deleted=${t4HasDeleted}, private=${t4HasPrivate}, is_saved=${t4PublicPost?.is_saved}`,
    status: t4Passed ? 'PASS' : 'FAIL'
  });

  // TEST 5: user A PATCH of user B's post
  const t5 = await httpReq('PATCH', `/rest/v1/posts?id=eq.${publicPostId}`, {
    'Authorization': `Bearer ${userA.token}`,
    'Prefer': 'return=representation'
  }, { content: 'Malicious Overwrite by User A' });
  const t5Rows = Array.isArray(t5.body) ? t5.body.length : 0;
  const t5Passed = (t5.status === 200 && t5Rows === 0) || t5.status === 403 || t5.status === 404;
  matrix.push({
    testNumber: 5,
    name: 'user A: PATCH post owned by user B',
    httpStatus: t5.status,
    expected: '0 rows updated (blocked by RLS)',
    actual: `${t5Rows} rows updated`,
    status: t5Passed ? 'PASS' : 'FAIL'
  });

  // TEST 6: user A DELETE of user B's post
  const t6 = await httpReq('DELETE', `/rest/v1/posts?id=eq.${publicPostId}`, {
    'Authorization': `Bearer ${userA.token}`,
    'Prefer': 'return=representation'
  });
  const t6Rows = Array.isArray(t6.body) ? t6.body.length : 0;
  const t6Passed = (t6.status === 200 && t6Rows === 0) || t6.status === 403 || t6.status === 404;
  matrix.push({
    testNumber: 6,
    name: 'user A: DELETE post owned by user B',
    httpStatus: t6.status,
    expected: '0 rows deleted (blocked by RLS)',
    actual: `${t6Rows} rows deleted`,
    status: t6Passed ? 'PASS' : 'FAIL'
  });

  // TEST 7: spoofed insert (user A inserts with author_id = user B)
  const t7 = await httpReq('POST', `/rest/v1/posts`, {
    'Authorization': `Bearer ${userA.token}`,
    'Prefer': 'return=representation'
  }, {
    author_id: userB.userId,
    user_id: userB.userId,
    content: 'Spoofed Post',
    status: 'published'
  });
  const t7Passed = t7.status === 400 || t7.status === 403 || (t7.body && t7.body.code === '42501');
  matrix.push({
    testNumber: 7,
    name: 'user A: INSERT post with author_id = user B',
    httpStatus: t7.status,
    expected: '403 Forbidden / 42501 RLS check violation',
    actual: `HTTP ${t7.status}: ${t7.body?.message || t7.body?.code || 'rejected'}`,
    status: t7Passed ? 'PASS' : 'FAIL'
  });

  // TEST 8: profiles PII: anon attempts to read email, phone, resume_url from base profiles
  const t8 = await httpReq('GET', `/rest/v1/profiles?select=id,email,phone,resume_url&limit=3`, {
    'Authorization': `Bearer ${ANON_KEY}`
  });
  const t8Rows = Array.isArray(t8.body) ? t8.body.length : 0;
  const t8Passed = t8Rows === 0 || t8.status === 403;
  matrix.push({
    testNumber: 8,
    name: 'anon: GET profiles (PII fields email, phone)',
    httpStatus: t8.status,
    expected: '0 rows returned or 403 Forbidden',
    actual: `${t8Rows} rows returned (status: ${t8.status})`,
    status: t8Passed ? 'PASS' : 'FAIL'
  });

  // TEST 9: group self-join: unrelated user attempts to self-insert as accepted/owner into private group
  const t9 = await httpReq('POST', `/rest/v1/group_memberships`, {
    'Authorization': `Bearer ${userC.token}`,
    'Prefer': 'return=representation'
  }, {
    group_id: privateGroupId,
    user_id: userC.userId,
    role: 'owner',
    status: 'accepted'
  });
  const t9Passed = t9.status === 400 || t9.status === 403 || (t9.body && t9.body.code === '42501');
  matrix.push({
    testNumber: 9,
    name: 'user C: self-insert as owner/accepted in private group',
    httpStatus: t9.status,
    expected: '403 Forbidden / 42501 RLS violation',
    actual: `HTTP ${t9.status}: ${t9.body?.message || t9.body?.code || 'rejected'}`,
    status: t9Passed ? 'PASS' : 'FAIL'
  });

  // TEST 10: private group post read: unauthorized user attempts to read private group post
  const t10 = await httpReq('GET', `/rest/v1/group_posts?group_id=eq.${privateGroupId}`, {
    'Authorization': `Bearer ${userC.token}`
  });
  const t10Rows = Array.isArray(t10.body) ? t10.body.length : 0;
  const t10Passed = t10Rows === 0;
  matrix.push({
    testNumber: 10,
    name: 'user C: GET private group_posts',
    httpStatus: t10.status,
    expected: '0 rows returned',
    actual: `${t10Rows} rows returned`,
    status: t10Passed ? 'PASS' : 'FAIL'
  });

  // TEST 11: storage: private documents not readable by unrelated user / anon
  // Real HTTP check: attempt to download private document object
  const t11 = await httpReq('GET', `/storage/v1/object/authenticated/documents/confidential-salary.pdf`, {
    'Authorization': `Bearer ${ANON_KEY}`
  });
  // Anon should be denied (400, 401, 403, or 404, NEVER 200)
  const t11Passed = t11.status !== 200;
  matrix.push({
    testNumber: 11,
    name: 'storage: anon access to private documents bucket',
    httpStatus: t11.status,
    expected: 'Non-200 (access denied)',
    actual: `HTTP ${t11.status} (${t11.body?.message || t11.body?.error || 'access restricted'})`,
    status: t11Passed ? 'PASS' : 'FAIL'
  });

  console.log('\n--- Tearing Down Test Fixtures ---');
  const teardownSql = `
    DELETE FROM public.posts WHERE id IN ('${publicPostId}', '${draftPostId}', '${deletedPostId}', '${privatePostId}');
    DELETE FROM public.group_posts WHERE id = '${privateGroupPostId}';
    DELETE FROM public.group_memberships WHERE group_id = '${privateGroupId}';
    DELETE FROM public.groups WHERE id = '${privateGroupId}';
    DELETE FROM public.connections WHERE (requester_id = '${userA.userId}' AND recipient_id = '${userB.userId}') OR (requester_id = '${userB.userId}' AND recipient_id = '${userA.userId}');
    DELETE FROM public.post_saves WHERE post_id = '${publicPostId}';
  `;
  runSql(teardownSql, 'staging');
  console.log('Teardown complete.\n');

  console.log('========================================================================');
  console.log('HTTP MATRIX EXECUTION RESULTS:');
  console.log('========================================================================');
  console.log(JSON.stringify(matrix, null, 2));
}

runHttpSuite().catch(console.error);
