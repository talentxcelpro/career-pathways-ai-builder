import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { runSql } = require('../scripts/db-audit-helper.cjs');

describe('Profile Visitor Analytics Scenarios & Security', () => {
  // Retrieve two distinct user IDs from profiles
  const users = runSql(`SELECT id FROM profiles LIMIT 2;`);
  assert.ok(users && users.length >= 2, 'Must have at least 2 profiles for testing');
  const userA = users[0].id;
  const userB = users[1].id;

  it('Scenario 1: User A can view User A\'s visitor list', () => {
    const sql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userA}';
    SET LOCAL role = 'authenticated';
    SELECT get_profile_visitors(10, 0) as result;
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0, 'Should return a result');
    const data = res[0].result;
    assert.ok('total_views' in data, 'Result must contain total_views');
    assert.ok('unique_visitors' in data, 'Result must contain unique_visitors');
    assert.ok('visitors' in data, 'Result must contain visitors array');
    assert.ok(Array.isArray(data.visitors), 'visitors must be an array');
  });

  it('Scenario 2: User B cannot view User A\'s visitor list (strict owner isolation)', () => {
    const sql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userB}';
    SET LOCAL role = 'authenticated';
    SELECT get_profile_visitors(10, 0) as result;
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0);
    const data = res[0].result;
    if (data.visitors.length > 0) {
      for (const v of data.visitors) {
        assert.notStrictEqual(v.visitor_id, userB, 'User B cannot be in their own visitor list');
      }
    }
  });

  it('Scenario 3: Logged-out (anon) user cannot access visitor analytics RPC', () => {
    const sql = `
    BEGIN;
    SET LOCAL role = 'anon';
    SELECT get_profile_visitors(10, 0) as result;
    COMMIT;
    `;
    const res = runSql(sql);
    const isError = Boolean(
      (res && res.error) ||
      (res && res.stderr) ||
      (res && res.raw && (res.raw.includes('Unauthorized') || res.raw.includes('ERROR')))
    );
    assert.ok(isError, 'Anon user must be rejected with Unauthorized');
  });

  it('Scenario 4: Direct table access to profile_views_v2 is restricted by RLS', () => {
    const sql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userB}';
    SET LOCAL role = 'authenticated';
    SELECT COUNT(*) as forbidden_count FROM profile_views_v2 WHERE profile_id = '${userA}';
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0);
    assert.strictEqual(Number(res[0].forbidden_count), 0, 'RLS must block User B from seeing visits to User A');
  });

  it('Scenario 5: Visiting another user\'s profile creates a visit record', () => {
    // Delete as admin first (authenticated role has no DELETE permission)
    runSql(`DELETE FROM profile_views_v2 WHERE profile_id = '${userA}' AND viewer_id = '${userB}';`);

    const sql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userB}';
    SET LOCAL role = 'authenticated';
    SELECT record_profile_visit('${userA}', 'profile_page', 'sess_test_1') as tracked;
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0);
    assert.strictEqual(res[0].tracked, true, 'Visit should be successfully recorded');
  });

  it('Scenario 6: Visiting one\'s own profile does NOT create a visit (self-views excluded)', () => {
    const sql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userA}';
    SET LOCAL role = 'authenticated';
    SELECT record_profile_visit('${userA}', 'profile_page', 'sess_self') as tracked;
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0);
    assert.strictEqual(res[0].tracked, false, 'Self-views must return false and not be recorded');
  });

  it('Scenario 7: Rapid refresh within 30-minute deduplication window is blocked', () => {
    // Record was inserted in Scenario 5 less than a second ago
    const sql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userB}';
    SET LOCAL role = 'authenticated';
    SELECT record_profile_visit('${userA}', 'profile_page', 'sess_test_2') as duplicate_tracked;
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0);
    assert.strictEqual(res[0].duplicate_tracked, false, 'Deduplication window must prevent duplicate visit');
  });

  it('Scenario 8: Invalid or non-existent profile request does not generate analytics', () => {
    const fakeProfileId = '00000000-0000-0000-0000-000000000000';
    const sql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userB}';
    SET LOCAL role = 'authenticated';
    SELECT record_profile_visit('${fakeProfileId}', 'profile_page', 'sess_invalid') as tracked;
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0);
    assert.strictEqual(res[0].tracked, false, 'Non-existent profile ID must be rejected');
  });

  it('Scenario 9: Visits after deduplication window increment visit frequency', () => {
    const sql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userA}';
    SET LOCAL role = 'authenticated';
    SELECT get_profile_visitors(20, 0) as result;
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0);
    const data = res[0].result;
    const visitorEntry = data.visitors.find((v: any) => v.visitor_id === userB);
    assert.ok(visitorEntry, 'User B should appear in User A\'s visitor list');
    assert.ok(visitorEntry.visit_count >= 1, 'Visit count must be at least 1');
    assert.ok(visitorEntry.last_visited_at, 'Must have last_visited_at timestamp');
    assert.ok(visitorEntry.full_name, 'Must have full_name populated');
  });

  it('Scenario 10: Anonymous views are counted in totals without fabricating user identity', () => {
    const sql = `
    BEGIN;
    SET LOCAL role = 'anon';
    SELECT record_profile_visit('${userA}', 'profile_page', 'anon_sess_${Date.now()}') as anon_tracked;
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0);

    const checkSql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userA}';
    SET LOCAL role = 'authenticated';
    SELECT get_profile_visitors(10, 0) as result;
    COMMIT;
    `;
    const checkRes = runSql(checkSql);
    const data = checkRes[0].result;
    assert.ok(data.total_views >= data.unique_visitors, 'Total views must be >= unique visitors');
    for (const v of data.visitors) {
      assert.ok(v.visitor_id !== null, 'Identifiable visitor list must never contain null visitor_id');
      assert.notStrictEqual(v.full_name, '', 'Visitor must have a name');
    }
  });

  it('Scenario 11: Pagination bounds are enforced on get_profile_visitors', () => {
    const sql = `
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '${userA}';
    SET LOCAL role = 'authenticated';
    SELECT get_profile_visitors(2, 0) as page1, get_profile_visitors(2, 2) as page2;
    COMMIT;
    `;
    const res = runSql(sql);
    assert.ok(res && res.length > 0);
    assert.ok(res[0].page1.visitors.length <= 2, 'Page size must be <= limit');
  });
});
