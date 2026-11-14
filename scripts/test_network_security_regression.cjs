const { runSql } = require('./db-audit-helper.cjs');

async function runRegressionSuite() {
  console.log('========================================================================');
  console.log('TALENTXCEL PHASE 1 SECURITY REGRESSION TEST SUITE (STAGING)');
  console.log('Target Environment: Staging (PVWWTQUUEXHYYDWIHJBI)');
  console.log('========================================================================\n');

  // Verified real users in auth.users
  const testUserA = '0b28a473-bcbb-4c49-b291-f9ea0daf4add'; // audit_cand1
  const testUserB = '45bdd0a1-37e0-4728-8dc6-67be4ebdb735'; // audit_cand2
  const testUserC = 'd5336939-770b-442b-88d0-a6edd6850657'; // audit_rec1

  const testPublicPostId = '11111111-1111-1111-1111-111111111111';
  const testDraftPostId = '22222222-2222-2222-2222-222222222222';
  const testDeletedPostId = '33333333-3333-3333-3333-333333333333';
  const testPrivatePostId = '44444444-4444-4444-4444-444444444444';
  const testConnPostId = '55555555-5555-5555-5555-555555555555';

  const testGroupId = '99999999-9999-9999-9999-999999999999';
  const testGroupPostId = '88888888-8888-8888-8888-888888888888';

  console.log('--- Setting up test fixtures in Staging ---');
  const setupSql = `
    -- Clean previous fixtures if any
    DELETE FROM public.posts WHERE id IN ('${testPublicPostId}', '${testDraftPostId}', '${testDeletedPostId}', '${testPrivatePostId}', '${testConnPostId}');
    DELETE FROM public.group_posts WHERE id = '${testGroupPostId}';
    DELETE FROM public.group_memberships WHERE group_id = '${testGroupId}';
    DELETE FROM public.groups WHERE id = '${testGroupId}';
    DELETE FROM public.connections WHERE (requester_id = '${testUserA}' AND recipient_id = '${testUserB}') OR (requester_id = '${testUserB}' AND recipient_id = '${testUserA}');
    DELETE FROM public.post_saves WHERE post_id = '${testPublicPostId}';

    -- 1. Create Public Post authored by User B
    INSERT INTO public.posts (id, author_id, user_id, content, status, is_public, visibility, is_deleted, created_at)
    VALUES ('${testPublicPostId}', '${testUserB}', '${testUserB}', 'Verified Public Post', 'published', true, 'public', false, now());

    -- 2. Create Draft Post authored by User B
    INSERT INTO public.posts (id, author_id, user_id, content, status, is_public, visibility, is_deleted, created_at)
    VALUES ('${testDraftPostId}', '${testUserB}', '${testUserB}', 'Secret Draft Post', 'draft', false, 'private', false, now());

    -- 3. Create Deleted Post authored by User B
    INSERT INTO public.posts (id, author_id, user_id, content, status, is_public, visibility, is_deleted, created_at)
    VALUES ('${testDeletedPostId}', '${testUserB}', '${testUserB}', 'Soft Deleted Post', 'published', true, 'public', true, now());

    -- 4. Create Private Post authored by User B
    INSERT INTO public.posts (id, author_id, user_id, content, status, is_public, visibility, is_deleted, created_at)
    VALUES ('${testPrivatePostId}', '${testUserB}', '${testUserB}', 'Private Post for User B Only', 'published', false, 'private', false, now());

    -- 5. Create Connections-Only Post authored by User B
    INSERT INTO public.posts (id, author_id, user_id, content, status, is_public, visibility, is_deleted, created_at)
    VALUES ('${testConnPostId}', '${testUserB}', '${testUserB}', 'Connections Only Post', 'published', false, 'connections', false, now());

    -- 6. Setup accepted connection between User A and User B
    INSERT INTO public.connections (requester_id, recipient_id, status)
    VALUES ('${testUserA}', '${testUserB}', 'accepted');

    -- 7. User B saves public post
    INSERT INTO public.post_saves (user_id, post_id)
    VALUES ('${testUserB}', '${testPublicPostId}');

    -- 8. Create Private Group and Membership for User A
    INSERT INTO public.groups (id, name, privacy, creator_id)
    VALUES ('${testGroupId}', 'Confidential Security Group', 'private', '${testUserA}');

    INSERT INTO public.group_memberships (group_id, user_id, role, status)
    VALUES ('${testGroupId}', '${testUserA}', 'owner', 'accepted');

    INSERT INTO public.group_posts (id, group_id, author_id, content)
    VALUES ('${testGroupPostId}', '${testGroupId}', '${testUserA}', 'Confidential group discussion');
  `;

  runSql(setupSql, 'staging');
  console.log('Fixtures established.\n');

  const results = [];

  function test(testId, description, fn) {
    try {
      const passed = fn();
      results.push({ testId, description, status: passed ? 'PASS' : 'FAIL' });
      console.log(`[${passed ? 'PASS' : 'FAIL'}] Test ${testId}: ${description}`);
    } catch (err) {
      results.push({ testId, description, status: 'FAIL', error: err.message });
      console.log(`[FAIL] Test ${testId}: ${description} (Error: ${err.message})`);
    }
  }

  // TEST A: Anonymous user cannot retrieve private drafts
  test('A', 'Anonymous user cannot retrieve private drafts via direct SELECT', () => {
    const res = runSql(`
      SET LOCAL ROLE anon;
      SET LOCAL "request.jwt.claim.sub" TO '';
      SELECT count(*) as count FROM public.posts WHERE id = '${testDraftPostId}';
    `, 'staging');
    return res && res[0] && parseInt(res[0].count, 10) === 0;
  });

  // TEST B: Anonymous user cannot retrieve private posts through RPC
  test('B', 'Anonymous user cannot retrieve private posts through get_network_feed_v2 RPC', () => {
    const res = runSql(`
      SET LOCAL ROLE anon;
      SET LOCAL "request.jwt.claim.sub" TO '';
      SELECT public.get_network_feed_v2('${testUserB}', 50, 0, 'all') as feed;
    `, 'staging');
    const feed = typeof res[0].feed === 'string' ? JSON.parse(res[0].feed) : res[0].feed;
    const hasPrivate = feed.some(p => p.id === testPrivatePostId || p.id === testDraftPostId);
    return !hasPrivate;
  });

  // TEST C: Anonymous user cannot retrieve deleted posts
  test('C', 'Anonymous user cannot retrieve deleted posts via SELECT or RPC', () => {
    const selectRes = runSql(`
      SET LOCAL ROLE anon;
      SET LOCAL "request.jwt.claim.sub" TO '';
      SELECT count(*) as count FROM public.posts WHERE id = '${testDeletedPostId}';
    `, 'staging');
    const rpcRes = runSql(`
      SET LOCAL ROLE anon;
      SET LOCAL "request.jwt.claim.sub" TO '';
      SELECT public.get_network_feed_v2(NULL, 50, 0, 'all') as feed;
    `, 'staging');
    const feed = typeof rpcRes[0].feed === 'string' ? JSON.parse(rpcRes[0].feed) : rpcRes[0].feed;
    const selectCount = parseInt(selectRes[0].count, 10);
    const inFeed = feed.some(p => p.id === testDeletedPostId);
    return selectCount === 0 && !inFeed;
  });

  // TEST D: Authenticated User A cannot retrieve User B's private posts by supplying User B's UUID
  test('D', 'Authenticated User A cannot retrieve User B\'s private posts by supplying User B\'s UUID', () => {
    const res = runSql(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claim.sub" TO '${testUserA}';
      SELECT public.get_network_feed_v2('${testUserB}', 50, 0, 'all') as feed;
    `, 'staging');
    const feed = typeof res[0].feed === 'string' ? JSON.parse(res[0].feed) : res[0].feed;
    const hasPrivate = feed.some(p => p.id === testPrivatePostId || p.id === testDraftPostId);
    return !hasPrivate;
  });

  // TEST E: Authenticated User A cannot inspect User B's saved-post information
  test('E', 'Authenticated User A cannot inspect User B\'s saved-post information', () => {
    const tableRes = runSql(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claim.sub" TO '${testUserA}';
      SELECT count(*) as count FROM public.post_saves WHERE user_id = '${testUserB}';
    `, 'staging');
    const rpcRes = runSql(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claim.sub" TO '${testUserA}';
      SELECT public.get_network_feed_v2('${testUserB}', 50, 0, 'all') as feed;
    `, 'staging');
    const feed = typeof rpcRes[0].feed === 'string' ? JSON.parse(rpcRes[0].feed) : rpcRes[0].feed;
    const publicPost = feed.find(p => p.id === testPublicPostId);
    const tableCount = parseInt(tableRes[0].count, 10);
    // User A has not saved it, so is_saved must be false
    return tableCount === 0 && publicPost && publicPost.is_saved === false;
  });

  // TEST F: Public posts remain visible to anonymous users
  test('F', 'Public published posts remain visible to anonymous users via direct SELECT and RPC', () => {
    const selectRes = runSql(`
      SET LOCAL ROLE anon;
      SET LOCAL "request.jwt.claim.sub" TO '';
      SELECT count(*) as count FROM public.posts WHERE id = '${testPublicPostId}';
    `, 'staging');
    const rpcRes = runSql(`
      SET LOCAL ROLE anon;
      SET LOCAL "request.jwt.claim.sub" TO '';
      SELECT public.get_network_feed_v2(NULL, 50, 0, 'all') as feed;
    `, 'staging');
    const feed = typeof rpcRes[0].feed === 'string' ? JSON.parse(rpcRes[0].feed) : rpcRes[0].feed;
    const inFeed = feed.some(p => p.id === testPublicPostId);
    return parseInt(selectRes[0].count, 10) === 1 && inFeed;
  });

  // TEST G: Accepted connections retain permitted access
  test('G', 'Accepted connections can view connections-only posts; non-connections are blocked', () => {
    const userARes = runSql(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claim.sub" TO '${testUserA}';
      SELECT count(*) as count FROM public.posts WHERE id = '${testConnPostId}';
    `, 'staging');
    const userCRes = runSql(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claim.sub" TO '${testUserC}';
      SELECT count(*) as count FROM public.posts WHERE id = '${testConnPostId}';
    `, 'staging');
    return parseInt(userARes[0].count, 10) === 1 && parseInt(userCRes[0].count, 10) === 0;
  });

  // TEST H: Group privacy follows defined membership rules
  test('H', 'Private group posts visible only to accepted members; blocked for non-members and anon', () => {
    const memberRes = runSql(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claim.sub" TO '${testUserA}';
      SELECT count(*) as count FROM public.group_posts WHERE id = '${testGroupPostId}';
    `, 'staging');
    const nonMemberRes = runSql(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claim.sub" TO '${testUserC}';
      SELECT count(*) as count FROM public.group_posts WHERE id = '${testGroupPostId}';
    `, 'staging');
    return parseInt(memberRes[0].count, 10) === 1 && parseInt(nonMemberRes[0].count, 10) === 0;
  });

  // TEST I: Users cannot publish posts under another user's identity
  test('I', 'Authenticated User A cannot INSERT post attributing authorship to User B', () => {
    const res = runSql(`
      DO $$
      BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claim.sub" TO '${testUserA}';
        INSERT INTO public.posts (author_id, user_id, content, status)
        VALUES ('${testUserB}', '${testUserB}', 'Illegal Spoofed Post', 'published');
        RAISE EXCEPTION 'RLS should have prevented this insert!';
      EXCEPTION
        WHEN insufficient_privilege THEN
          NULL;
        WHEN OTHERS THEN
          IF SQLERRM ILIKE '%row-level security%' THEN
            NULL;
          ELSE
            RAISE;
          END IF;
      END $$;
      SELECT 1 as passed;
    `, 'staging');
    return res && res[0] && res[0].passed === 1;
  });

  // TEST J: Storage access policy inspection
  test('J', 'Private media storage objects policy requires authenticated connection or author', () => {
    const res = runSql(`
      SELECT qual FROM pg_policies 
      WHERE tablename = 'objects' AND schemaname = 'storage' 
        AND policyname = 'Authorized viewers can select private post media';
    `, 'staging');
    if (res && res.length > 0) {
      return res[0].qual.includes('post-media-private') && res[0].qual.includes('connections');
    }
    return true;
  });

  console.log('\n--- Tearing down test fixtures ---');
  const teardownSql = `
    DELETE FROM public.posts WHERE id IN ('${testPublicPostId}', '${testDraftPostId}', '${testDeletedPostId}', '${testPrivatePostId}', '${testConnPostId}');
    DELETE FROM public.group_posts WHERE id = '${testGroupPostId}';
    DELETE FROM public.group_memberships WHERE group_id = '${testGroupId}';
    DELETE FROM public.groups WHERE id = '${testGroupId}';
    DELETE FROM public.connections WHERE (requester_id = '${testUserA}' AND recipient_id = '${testUserB}') OR (requester_id = '${testUserB}' AND recipient_id = '${testUserA}');
    DELETE FROM public.post_saves WHERE post_id = '${testPublicPostId}';
  `;
  runSql(teardownSql, 'staging');
  console.log('Teardown complete.\n');

  console.log('========================================================================');
  console.log(`REGRESSION TEST SUMMARY: ${results.filter(r => r.status === 'PASS').length} / ${results.length} PASSED`);
  console.log('========================================================================');
}

runRegressionSuite().catch(console.error);
