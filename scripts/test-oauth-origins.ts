/**
 * scripts/test-oauth-origins.ts
 *
 * Automated OAuth Origin & Multi-Domain Auth Architecture Test Suite for TalentXcel
 *
 * Tests compliance with Google OAuth 2.0 Policies and TalentXcel Multi-Domain Constraints:
 * 1. All production origins are represented.
 * 2. No wildcard origins in Google Authorized JavaScript Origins.
 * 3. No HTTP production origins (all HTTPS).
 * 4. No duplicate auth configuration entries.
 * 5. No invalid redirect URIs.
 * 6. No unapproved hostnames allowed through validators.
 * 7. Open redirect protection.
 * 8. Cookie domain resolution.
 */

import {
  AUTH_ALLOWED_HOSTNAMES,
  GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS,
  GOOGLE_OAUTH_AUTHORIZED_REDIRECT_URIS,
  isAllowedAuthHostname,
  isAllowedAuthOrigin,
  getCrossSubdomainCookieDomain,
  DOMAIN_TO_UNIVERSE,
  UNIVERSE_ROOT_PATHS,
} from '../src/config/domainArchitecture';

import { isValidInternalPath } from '../src/utils/intentRouting';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
  }
}

console.log('================================================================');
console.log('🧪 TALENTXCEL OAUTH ORIGINS & MULTI-DOMAIN AUTH TEST SUITE');
console.log('================================================================\n');

// ── TEST GROUP 1: Production Hostnames Coverage ─────────────────────────────
console.log('Test Group 1: Production Hostname Allowlist Coverage');

const REQUIRED_HOSTNAMES = [
  'talentxcel.in',
  'www.talentxcel.in',
  'jobs.talentxcel.in',
  'learning.talentxcel.in',
  'passport.talentxcel.in',
  'government.talentxcel.in',
  'employers.talentxcel.in',
  'employer.talentxcel.in',
  'colleges.talentxcel.in',
  'careers.talentxcel.in',
  'salary.talentxcel.in',
  'resume.talentxcel.in',
];

for (const host of REQUIRED_HOSTNAMES) {
  assert(
    AUTH_ALLOWED_HOSTNAMES.includes(host),
    `Hostname registered: ${host}`
  );
}

// ── TEST GROUP 2: Google Authorized JavaScript Origins ──────────────────────
console.log('\nTest Group 2: Google Authorized JavaScript Origins Policy Compliance');

// 2.1 All required origins are present
for (const host of REQUIRED_HOSTNAMES) {
  const expectedOrigin = `https://${host}`;
  assert(
    GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS.includes(expectedOrigin),
    `Origin registered: ${expectedOrigin}`
  );
}

// 2.2 No wildcard origins (Google OAuth Policy strictly forbids wildcards)
for (const origin of GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS) {
  assert(
    !origin.includes('*'),
    `No wildcard in origin: ${origin}`
  );
}

// 2.3 No HTTP origins in production
for (const origin of GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS) {
  assert(
    origin.startsWith('https://'),
    `Origin is secure HTTPS: ${origin}`
  );
}

// 2.4 No paths or trailing slashes (Google policy requires scheme + host only)
for (const origin of GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS) {
  const url = new URL(origin);
  assert(
    url.pathname === '/' && !origin.endsWith('/'),
    `Origin has no path or trailing slash: ${origin}`
  );
}

// 2.5 No duplicate origins
const uniqueOrigins = new Set(GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS);
assert(
  uniqueOrigins.size === GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS.length,
  'No duplicate entries in GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS'
);

// ── TEST GROUP 3: Google Authorized Redirect URIs ───────────────────────────
console.log('\nTest Group 3: Google Authorized Redirect URIs Compliance');

// 3.1 Primary Supabase callback
assert(
  GOOGLE_OAUTH_AUTHORIZED_REDIRECT_URIS.includes('https://dthlgsnakhoftinssokm.supabase.co/auth/v1/callback'),
  'Primary Supabase OAuth callback is present'
);

// 3.2 All redirect URIs are valid HTTPS URLs with path
for (const uri of GOOGLE_OAUTH_AUTHORIZED_REDIRECT_URIS) {
  assert(
    uri.startsWith('https://') && !uri.includes('*'),
    `Redirect URI is valid HTTPS without wildcard: ${uri}`
  );
}

// 3.3 No duplicate redirect URIs
const uniqueRedirects = new Set(GOOGLE_OAUTH_AUTHORIZED_REDIRECT_URIS);
assert(
  uniqueRedirects.size === GOOGLE_OAUTH_AUTHORIZED_REDIRECT_URIS.length,
  'No duplicate entries in GOOGLE_OAUTH_AUTHORIZED_REDIRECT_URIS'
);

// ── TEST GROUP 4: Hostname & Origin Validation Functions ────────────────────
console.log('\nTest Group 4: Hostname & Origin Validator Assertions');

// 4.1 Validates all production hosts
for (const host of REQUIRED_HOSTNAMES) {
  assert(isAllowedAuthHostname(host), `isAllowedAuthHostname approves ${host}`);
  assert(isAllowedAuthOrigin(`https://${host}`), `isAllowedAuthOrigin approves https://${host}`);
}

// 4.2 Rejects unauthorized hostnames
const FORBIDDEN_HOSTS = [
  'evil.com',
  'talentxcel.in.attacker.com',
  'phishing-talentxcel.in',
  'fake-jobs.talentxcel.com',
  'talentxcel.co',
];

for (const host of FORBIDDEN_HOSTS) {
  assert(!isAllowedAuthHostname(host), `isAllowedAuthHostname rejects unauthorized host: ${host}`);
  assert(!isAllowedAuthOrigin(`https://${host}`), `isAllowedAuthOrigin rejects unauthorized origin: https://${host}`);
}

// 4.3 Allows local dev
assert(isAllowedAuthHostname('localhost'), 'isAllowedAuthHostname allows localhost');
assert(isAllowedAuthHostname('127.0.0.1'), 'isAllowedAuthHostname allows 127.0.0.1');
assert(isAllowedAuthHostname('localhost:8080'), 'isAllowedAuthHostname handles localhost with port');

// ── TEST GROUP 5: Open Redirect & Return URL Protection ─────────────────────
console.log('\nTest Group 5: Open Redirect & Return URL Validation');

// 5.1 Valid internal relative paths
assert(isValidInternalPath('/jobs'), 'Allows /jobs');
assert(isValidInternalPath('/career-dashboard'), 'Allows /career-dashboard');
assert(isValidInternalPath('/resume/ats-check'), 'Allows /resume/ats-check');
assert(isValidInternalPath('/jobs/software-engineer/bangalore'), 'Allows nested job path');

// 5.2 Valid absolute URLs on TalentXcel domains
assert(
  isValidInternalPath('https://jobs.talentxcel.in/jobs/software-engineer'),
  'Allows absolute URL on jobs.talentxcel.in'
);
assert(
  isValidInternalPath('https://learning.talentxcel.in/courses/ai'),
  'Allows absolute URL on learning.talentxcel.in'
);

// 5.3 Blocks untrusted domains (open redirect attack)
assert(!isValidInternalPath('https://evil.com/steal-token'), 'Blocks open redirect to evil.com');
assert(!isValidInternalPath('//evil.com/phish'), 'Blocks protocol-relative redirect //evil.com');
assert(!isValidInternalPath('javascript:alert(1)'), 'Blocks javascript: URI');

// 5.4 Blocks auth loops
assert(!isValidInternalPath('/auth/login'), 'Blocks auth loop /auth/login');
assert(!isValidInternalPath('/login'), 'Blocks auth loop /login');
assert(!isValidInternalPath('https://talentxcel.in/auth/login'), 'Blocks absolute auth loop');

// ── TEST GROUP 6: Cross-Subdomain Cookie Domain Resolution ──────────────────
console.log('\nTest Group 6: Cross-Subdomain Cookie Domain Resolution');

assert(getCrossSubdomainCookieDomain('talentxcel.in') === '.talentxcel.in', 'Cookie domain for talentxcel.in is .talentxcel.in');
assert(getCrossSubdomainCookieDomain('jobs.talentxcel.in') === '.talentxcel.in', 'Cookie domain for jobs.talentxcel.in is .talentxcel.in');
assert(getCrossSubdomainCookieDomain('employer.talentxcel.in') === '.talentxcel.in', 'Cookie domain for employer.talentxcel.in is .talentxcel.in');
assert(getCrossSubdomainCookieDomain('localhost') === undefined, 'Cookie domain for localhost is undefined');
assert(getCrossSubdomainCookieDomain('preview.vercel.app') === undefined, 'Cookie domain for vercel.app preview is undefined');

// ── FINAL SUMMARY ───────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
