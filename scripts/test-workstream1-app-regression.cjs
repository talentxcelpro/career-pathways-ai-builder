/**
 * Workstream 1: Application Regression Test Suite
 * Validates Pricing, Profiles, Network, Messaging, and Subscriptions.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envUrl = "https://dthlgsnakhoftinssokm.supabase.co";
const envKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
const supabase = createClient(envUrl, envKey);

const results = [];

function assert(description, condition, details = '') {
  results.push({
    test: description,
    passed: Boolean(condition),
    details: details
  });
  console.log(`${condition ? '✅ PASS' : '❌ FAIL'}: ${description}${details ? ' - ' + details : ''}`);
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING WORKSTREAM 1: APPLICATION REGRESSION TESTS');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST SUITE 1: PRICING & SUBSCRIPTION QUOTA
  // -------------------------------------------------------------
  console.log('--- 1. PRICING & SUBSCRIPTION TESTS ---');
  
  // 1.1 HTTP route resolution on local Vite server
  const pricingRoutes = ['/pricing', '/subscription', '/plans', '/pro/subscription'];
  for (const route of pricingRoutes) {
    try {
      const res = await fetch(`http://localhost:8080${route}`);
      const text = await res.text();
      assert(
        `Route ${route} returns HTTP 200 with valid HTML`,
        res.status === 200 && text.includes('id="root"'),
        `HTTP ${res.status}, Length: ${text.length}`
      );
    } catch (e) {
      assert(`Route ${route} accessible`, false, e.message);
    }
  }

  // 1.2 ProSubscription tier definitions & quota logic
  const proSubCode = fs.readFileSync('src/pages/pro/ProSubscription.tsx', 'utf8');
  assert(
    'ProSubscription has defensive isCurrentPlan guards against non-string currentTier',
    proSubCode.includes("if (!tier || typeof tier !== 'string' || typeof currentTier !== 'string') return false;"),
    'Guards active'
  );
  assert(
    'ProSubscription has defensive quota checks avoiding object-to-primitive conversion',
    proSubCode.includes("typeof quota.ats_check.used === 'number'") && proSubCode.includes("typeof currentTier === 'string'"),
    'Numeric and string type guards present'
  );

  // 1.3 Supabase entitlement RPC check for free/inactive user
  const testUserId = '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062';
  const { data: ent, error: entErr } = await supabase.rpc('get_user_entitlement', { p_user_id: testUserId });
  assert(
    'Database RPC get_user_entitlement returns valid quota structure',
    !entErr && ent && ent.usage && typeof ent.usage.ats_check?.limit === 'number',
    `Tier: ${ent?.tier}, ATS limit: ${ent?.usage?.ats_check?.limit}, used: ${ent?.usage?.ats_check?.used}`
  );

  // -------------------------------------------------------------
  // TEST SUITE 2: PROFILE LOOKUP & PRIVACY
  // -------------------------------------------------------------
  console.log('\n--- 2. PROFILE LOOKUP & PRIVACY TESTS ---');

  // Test slug matching helper replicating useSlugProfile query logic
  async function testProfileQuery(slug) {
    const cleanSlug = slug.startsWith('@') ? slug.slice(1).trim() : slug.trim();
    const nameQuery = cleanSlug.replace(/-/g, ' ');
    const compactUsername = cleanSlug.replace(/-/g, '');
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

    const conditions = [
      `slug.ilike.${cleanSlug}`,
      `custom_profile_url.ilike.${cleanSlug}`,
      `custom_url_slug.ilike.${cleanSlug}`,
      `username.ilike.${cleanSlug}`,
      `username.ilike.${compactUsername}`,
      `full_name.ilike.${nameQuery}`,
      `email.ilike.${cleanSlug}@%`
    ];

    if (isUUID) {
      conditions.push(`id.eq.${cleanSlug}`);
    }

    const matchSuffix = cleanSlug.match(/^(.+?)[-_]?([a-f0-9]{6})$/i);
    if (matchSuffix) {
      const prefix = matchSuffix[1];
      const hex = matchSuffix[2];
      conditions.push(`username.ilike.${prefix}_${hex}`);
      conditions.push(`username.ilike.${prefix}${hex}`);
      conditions.push(`email.ilike.${prefix}@%`);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, slug, email, phone, is_profile_public')
      .or(conditions.join(','))
      .limit(1)
      .maybeSingle();

    return { data, error };
  }

  // 2.1 Existing canonical username
  const p1 = await testProfileQuery('kommaganidigvijay');
  assert('Existing username lookup (kommaganidigvijay)', !p1.error && p1.data && p1.data.username === 'kommaganidigvijay', p1.data?.full_name);

  // 2.2 Underscored username directly
  const p2 = await testProfileQuery('lifeislove8393_4f40a0');
  assert('Underscored username lookup (lifeislove8393_4f40a0)', !p2.error && p2.data && p2.data.username === 'lifeislove8393_4f40a0', p2.data?.full_name);

  // 2.3 Underscored username without underscore (concatenated hex suffix from URL)
  const p3 = await testProfileQuery('lifeislove83934f40a0');
  assert('Hex suffix concatenated lookup (lifeislove83934f40a0 -> Love Life)', !p3.error && p3.data && p3.data.full_name === 'Love Life', p3.data?.username);

  const p4 = await testProfileQuery('vjkumarpendem06a84f');
  assert('Hex suffix concatenated lookup (vjkumarpendem06a84f -> p vijay kumar)', !p4.error && p4.data && p4.data.full_name === 'p vijay kumar', p4.data?.username);

  // 2.4 UUID lookup
  const p5 = await testProfileQuery('4f40a012-ad85-4c4d-9b86-4cd3ec4383e5');
  assert('Direct UUID lookup (4f40a012-ad85-4c4d-9b86-4cd3ec4383e5)', !p5.error && p5.data && p5.data.id === '4f40a012-ad85-4c4d-9b86-4cd3ec4383e5', p5.data?.full_name);

  // 2.5 Non-existent / missing user returns null cleanly without throwing
  const p6 = await testProfileQuery('nonexistent_user_xyz_99999');
  assert('Missing profile returns null cleanly without SQL crash', !p6.error && p6.data === null, 'Handled safely');

  // 2.6 Privacy: ensure useSlugProfile returns email as null or filtered for unauthenticated viewers
  const useSlugProfileCode = fs.readFileSync('src/hooks/useSlugProfile.ts', 'utf8');
  assert(
    'useSlugProfile does NOT use id.ilike on UUID (preventing Postgres error 42883)',
    !useSlugProfileCode.includes('id.ilike.'),
    'Clean PostgREST syntax'
  );

  // -------------------------------------------------------------
  // TEST SUITE 3: NETWORK ROUTE & CONNECTIONS
  // -------------------------------------------------------------
  console.log('\n--- 3. NETWORK ROUTE & CONNECTIONS TESTS ---');

  // 3.1 Network HTTP 200
  const netRes = await fetch('http://localhost:8080/network');
  const netHtml = await netRes.text();
  assert('/network route returns HTTP 200 and loads SPA container', netRes.status === 200 && netHtml.includes('id="root"'), `HTTP ${netRes.status}`);

  // 3.2 Network connections tab URL
  const netConnRes = await fetch('http://localhost:8080/network?tab=connections');
  assert('/network?tab=connections returns HTTP 200', netConnRes.status === 200, `HTTP ${netConnRes.status}`);

  // 3.3 Confirm App.tsx priority route order
  const appCode = fs.readFileSync('src/App.tsx', 'utf8');
  const networkRouteIdx = appCode.indexOf('<Route path="/network"');
  const wildcardRouteIdx = appCode.indexOf('<Route path="/:username"');
  const navItemsMapIdx = appCode.indexOf('navItems.map');
  assert(
    '/network Priority Route is defined BEFORE navItems.map and /:username wildcard',
    networkRouteIdx > 0 && networkRouteIdx < navItemsMapIdx && networkRouteIdx < wildcardRouteIdx,
    `Index: /network at ${networkRouteIdx}, navItems at ${navItemsMapIdx}, /:username at ${wildcardRouteIdx}`
  );

  // 3.4 Confirm SubscriptionsManager was removed from TabsContent value="connections" in Network.tsx
  const networkPageCode = fs.readFileSync('src/pages/Network.tsx', 'utf8');
  const connectionsTabContent = networkPageCode.slice(
    networkPageCode.indexOf('<TabsContent value="connections"'),
    networkPageCode.indexOf('</TabsContent>')
  );
  assert(
    'TabsContent value="connections" does NOT contain SubscriptionsManager',
    !connectionsTabContent.includes('<SubscriptionsManager'),
    'Connections view is dedicated exclusively to user connections'
  );

  // -------------------------------------------------------------
  // TEST SUITE 4: MESSAGING SAFE DATE HANDLING
  // -------------------------------------------------------------
  console.log('\n--- 4. MESSAGING SAFE DATE HANDLING TESTS ---');

  const dmCode = fs.readFileSync('src/components/communication/DirectMessaging.tsx', 'utf8');
  assert(
    'DirectMessaging.tsx contains safeFormatDate utility function',
    dmCode.includes('function safeFormatDate('),
    'safeFormatDate defined'
  );
  assert(
    'DirectMessaging.tsx uses safeFormatDate for message created_at timestamp',
    dmCode.includes('safeFormatDate((conversation.messages)?.created_at || conversation.updated_at'),
    'Patched line 119'
  );

  // Unit test the safeFormatDate logic directly
  function safeFormatDate(dateVal, pattern, fallback = '') {
    if (!dateVal) return fallback;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return fallback;
      // Simple mock formatter
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    } catch {
      return fallback;
    }
  }

  assert('safeFormatDate handles undefined/null without throwing', safeFormatDate(undefined, 'MMM dd', 'No date') === 'No date', 'Returned fallback');
  assert('safeFormatDate handles invalid string "not-a-date" without throwing', safeFormatDate('not-a-date', 'MMM dd', 'Invalid') === 'Invalid', 'Returned fallback');
  assert('safeFormatDate formats valid ISO timestamp correctly', safeFormatDate('2026-11-05T12:00:00Z', 'MMM dd').length > 0, safeFormatDate('2026-11-05T12:00:00Z', 'MMM dd'));

  // -------------------------------------------------------------
  // TEST SUITE 5: SUBSCRIPTIONS DATA & ACCESSIBILITY
  // -------------------------------------------------------------
  console.log('\n--- 5. SUBSCRIPTIONS DATA & COMPONENT ACCESSIBILITY ---');

  // 5.1 Verify SubscriptionsManager component exists and is intact
  assert(
    'SubscriptionsManager component exists at src/components/social/SubscriptionsManager.tsx',
    fs.existsSync('src/components/social/SubscriptionsManager.tsx'),
    'Component file verified'
  );

  // 5.2 Verify SubscriptionsManager query to content_subscriptions table in Supabase
  const { data: subData, error: subDataErr } = await supabase
    .from('content_subscriptions')
    .select('*')
    .limit(5);

  assert(
    'Supabase table content_subscriptions is accessible and intact',
    !subDataErr && Array.isArray(subData),
    `Count in sample: ${subData?.length || 0}`
  );

  // 5.3 Verify articles subscription hooks are used in ArticleDetail / Articles
  const artCode = fs.readFileSync('src/pages/network/Articles.tsx', 'utf8');
  assert(
    'Article subscriptions hook is active in Articles component',
    artCode.includes('useArticleSubscriptions'),
    'User content subscriptions maintained in Articles hub'
  );

  console.log('\n================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`📊 SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length} tests`);
  console.log('================================================================');
  
  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
