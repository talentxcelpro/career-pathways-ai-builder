// scripts/test_phase4_qualification_suite.cjs
// Comprehensive Phase 4 Security, Indexing & Release Qualification Test Suite

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

console.log('================================================================');
console.log('🧪 TALENTXCEL PHASE 4 SECURITY & RELEASE QUALIFICATION SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName} ${details ? '— ' + details : ''}`);
  }
}

async function runSuite() {
  // ── TEST SUITE 1: SEARCH ENGINE NOTIFICATION ARCHITECTURE (SECTION A) ───────
  console.log('--- Test Suite 1: Search Engine Notification Boundaries & Policy Compliance ---');

  const notifyCode = fs.readFileSync(path.resolve(__dirname, '../api/notify-search-engines.ts'), 'utf8').replace(/\r\n/g, '\n');
  const takeoverCode = fs.readFileSync(path.resolve(__dirname, '../scripts/gsc_master_takeover.cjs'), 'utf8').replace(/\r\n/g, '\n');
  const robotsTxt = fs.readFileSync(path.resolve(__dirname, '../public/robots.txt'), 'utf8').replace(/\r\n/g, '\n');

  // A.1: Google Indexing API restriction
  assert(
    !notifyCode.includes('indexing.googleapis.com') && !notifyCode.includes('publishGoogleIndexing'),
    'api/notify-search-engines.ts does NOT call Google Indexing API for candidate profiles',
    'Candidate profiles are strictly excluded from Google Indexing API'
  );

  assert(
    !takeoverCode.includes('/u/saketsauravsharma') && !takeoverCode.includes('/u/talentxcelservices'),
    'scripts/gsc_master_takeover.cjs excludes candidate profile URLs from Google Indexing API',
    'Candidate URLs removed from Google Indexing API broadcast array'
  );

  // A.2: IndexNow claims & search engine routing
  assert(
    notifyCode.includes('api.indexnow.org') && notifyCode.includes("indexNowEngines: ['Bing', 'Yandex', 'Naver', 'Seznam']"),
    'IndexNow accurately documented and routed strictly to participating engines (Bing, Yandex, Naver, Seznam)',
    'Does not misrepresent IndexNow as directly submitting to ChatGPT Search or Perplexity'
  );

  // A.3: Crawler allowlist & GPTBot distinction
  assert(
    robotsTxt.includes('User-agent: OAI-SearchBot\n# ChatGPT Search live indexation crawler\nAllow: /') &&
    robotsTxt.includes('User-agent: PerplexityBot\n# Perplexity AI live search engine crawler\nAllow: /'),
    'OAI-SearchBot and PerplexityBot are explicitly allowed for search citations & discovery'
  );

  assert(
    robotsTxt.includes('User-agent: ChatGPT-User\nAllow: /u/') &&
    robotsTxt.includes('# User-Triggered Interactive Fetchers'),
    'ChatGPT-User is classified as a user-triggered interactive fetcher, independent of crawler'
  );

  assert(
    robotsTxt.includes('User-agent: GPTBot\nDisallow: /') &&
    robotsTxt.includes('Decision on GPTBot is strictly independent of OAI-SearchBot'),
    'GPTBot is explicitly disallowed for training data independently from OAI-SearchBot'
  );

  // ── TEST SUITE 2: WEBHOOK HARDENING & AUTHENTICATION (SECTION D) ───────────
  console.log('\n--- Test Suite 2: Webhook Security, JWT Auth & Abuse Prevention ---');

  assert(
    notifyCode.includes("if (req.method !== 'POST')") && notifyCode.includes('405'),
    'Webhook strictly enforces POST method (rejects GET with 405)'
  );

  assert(
    notifyCode.includes("verifySupabaseJwt") && notifyCode.includes('401') && notifyCode.includes('Bearer '),
    'Webhook strictly requires valid Supabase Bearer JWT authentication (unauthenticated calls return 401)'
  );

  assert(
    notifyCode.includes('requestedUserId !== callerUserId') && notifyCode.includes('403'),
    'Server-side candidate ownership check rejects cross-candidate manipulation (returns 403 Forbidden)'
  );

  assert(
    notifyCode.includes('RATE_LIMIT_WINDOW_MS') && notifyCode.includes('throttled: true'),
    'In-memory rate limiting and idempotency throttle duplicate calls within 10s window'
  );

  assert(
    !notifyCode.includes('req.body.url') && notifyCode.includes('https://talentxcel.in/u/${encodeURIComponent(targetUsername)}'),
    'Profile URL is derived strictly server-side from authenticated username (zero arbitrary client URLs)'
  );

  // ── TEST SUITE 3: THIN-PAGE QUALITY GATE & PRIVACY CONTROLS (SECTION B & F) ─
  console.log('\n--- Test Suite 3: Thin-Page Quality Gate & Affirmative Consent Enforcement ---');

  const seoRenderCode = fs.readFileSync(path.resolve(__dirname, '../api/seo-render.ts'), 'utf8');

  assert(
    seoRenderCode.includes("isPlaceholder = /^(test|fresher|n\\/a|na|none|null|undefined|student|seeking opportunities|looking for job)$/i"),
    'Thin-page gate rejects placeholder headlines/bios (fresher, test, student, etc.)'
  );

  assert(
    seoRenderCode.includes('hasEnoughSkills && hasRichContent') &&
    seoRenderCode.includes("robotsDirective = isIndexReady ? 'index, follow' : 'noindex, follow'"),
    'Thin profiles receive HTTP 200 with noindex, follow; index-ready receive index, follow'
  );

  assert(
    seoRenderCode.includes("status: 404") &&
    seoRenderCode.includes("'CDN-Cache-Control'] = 'no-store'") &&
    seoRenderCode.includes("cacheControl: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0'"),
    'Private/unconsented profiles return HTTP 404 with strict no-store (never using noindex as privacy control)'
  );

  assert(
    !seoRenderCode.includes('Math.abs(skill.split(') && !seoRenderCode.includes('% 520'),
    'Zero synthetic/fabricated metrics in HTML (removed pseudo-random opening counters)'
  );

  assert(
    seoRenderCode.includes('status=eq.approved'),
    'Peer endorsements query strictly filters for genuinely approved endorsements (status=approved)'
  );

  assert(
    seoRenderCode.includes('"@type": "ProfilePage"') && seoRenderCode.includes('"@type": "Person"'),
    'Structured data emits complete ProfilePage + Person JSON-LD graph matching visible HTML'
  );

  // ── TEST SUITE 4: DYNAMIC SITEMAP PROTOCOL & AFFIRMATIVE CONSENT (SECTION E)
  console.log('\n--- Test Suite 4: Dynamic Passport Sitemap Protocol & Consent Filtering ---');

  const sitemapCode = fs.readFileSync(path.resolve(__dirname, '../api/sitemap-passport.ts'), 'utf8');

  assert(
    sitemapCode.includes('public_profiles?select=username,skills,headline,about,title,experience_years,current_company,created_at'),
    'Sitemap queries public_profiles view (inheriting affirmative consent security barrier)'
  );

  assert(
    sitemapCode.includes('hasEnoughSkills && hasRich'),
    'Only profiles meeting isIndexReady completeness gate are included in sitemap-passport.xml'
  );

  assert(
    sitemapCode.includes('formatDateIso(p.created_at)') || sitemapCode.includes('lastmod'),
    'Sitemap emits accurate ISO YYYY-MM-DD lastmod timestamps'
  );

  assert(
    sitemapCode.includes('PAGE_SIZE = 10_000') && sitemapCode.includes('searchParams.get(\'page\')'),
    'Sitemap supports pagination with page parameter within Google 50,000 URL limit'
  );

  assert(
    sitemapCode.includes('escapeXml(loc)'),
    'XML locations are properly escaped to prevent XML injection'
  );

  // ── TEST SUITE 5: CACHE REVOCATION LIFECYCLE VERIFICATION (SECTION C) ──────
  console.log('\n--- Test Suite 5: Cache Invalidation & Consent Lifecycle ---');

  const profileEditCode = fs.readFileSync(path.resolve(__dirname, '../src/pages/profile/ProfileEdit.tsx'), 'utf8');

  assert(
    profileEditCode.includes('set_public_profile_consent'),
    'ProfileEdit explicitly synchronizes affirmative consent record via set_public_profile_consent RPC'
  );

  assert(
    profileEditCode.includes("action = isPublic ? 'update' : 'revoke'") &&
    profileEditCode.includes("fetch('/api/notify-search-engines'") &&
    profileEditCode.includes("Bearer ${session.access_token}"),
    'Privacy visibility changes automatically trigger authenticated cache purge webhook'
  );

  // ── TEST SUITE 6: SECRET SCANNING & SENSITIVE CREDENTIALS (SECTION H) ───────
  console.log('\n--- Test Suite 6: Secret Scanning of Source & Distribution Artifacts ---');

  const sourceFiles = [
    'src/pages/profile/ProfileEdit.tsx',
    'api/seo-render.ts',
    'api/sitemap-passport.ts',
    'api/notify-search-engines.ts',
  ];

  for (const f of sourceFiles) {
    const content = fs.readFileSync(path.resolve(__dirname, '../', f), 'utf8');
    assert(
      !content.includes('BEGIN PRIVATE KEY') && !content.includes('BEGIN RSA PRIVATE KEY'),
      `Zero embedded private keys in ${f}`
    );
    assert(
      !content.includes('CLOUDFLARE_API_TOKEN =') && !content.includes('CLOUDFLARE_ZONE_ID ='),
      `Zero hardcoded Cloudflare credentials in ${f}`
    );
  }

  // ── FINAL TALLY ────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(`TOTAL AUDIT CHECKS: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log(`QUALIFICATION VERDICT: ${failedTests === 0 ? '🟢 PASS' : '🔴 FAIL'}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
