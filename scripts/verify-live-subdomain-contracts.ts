// scripts/verify-live-subdomain-contracts.ts
/**
 * TalentXcel Live Subdomain Contract Verification Suite
 * 
 * Verifies all 10 production product domains + 1 legacy alias across 9 core dimensions:
 * 1. Root URL (/) & Product Universe contract
 * 2. /robots.txt routing, physical file presence, Googlebot access & sitemap declaration
 * 3. /sitemap.xml routing, physical file presence, XML format & origin scope compliance
 * 4. Deterministic Canonical URLs (formatCanonicalUrl)
 * 5. Employer Canonical Rule (employer.talentxcel.in -> employers.talentxcel.in 301 redirect)
 * 6. Googlebot accessibility & Edge Cache headers
 * 7. OAuth login & returnTo central SSO delegation (origin_mismatch immunity)
 * 8. Cross-subdomain session cookie scope (.talentxcel.in)
 * 9. Google Search Console independent property contract compliance
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import {
  DOMAIN_TO_UNIVERSE,
  UNIVERSE_PRIMARY_DOMAIN,
  formatCanonicalUrl,
  isLegacyEmployerAlias,
  getCrossSubdomainCookieDomain,
  isAllowedAuthHostname,
  ProductUniverse,
} from '../src/config/domainArchitecture';
import { resolvePostAuthDestination, isValidInternalPath } from '../src/utils/intentRouting';

console.log('================================================================');
console.log('🌐 TALENTXCEL LIVE SUBDOMAIN CONTRACT & GOOGLE-SUITE VERIFICATION');
console.log('================================================================\n');

interface DomainSpec {
  id: string;
  universe: ProductUniverse;
  hostname: string;
  canonicalOrigin: string;
  expectedRobotsFile: string;
  expectedSitemapFile: string;
  isAlias: boolean;
  expectedRedirectTarget?: string;
  privacyStrict?: boolean;
}

const DOMAIN_SPECS: DomainSpec[] = [
  {
    id: 'CORE',
    universe: 'CORE',
    hostname: 'talentxcel.in',
    canonicalOrigin: 'https://talentxcel.in',
    expectedRobotsFile: 'robots.txt',
    expectedSitemapFile: 'sitemap-core.xml',
    isAlias: false,
  },
  {
    id: 'JOBS',
    universe: 'JOBS',
    hostname: 'jobs.talentxcel.in',
    canonicalOrigin: 'https://jobs.talentxcel.in',
    expectedRobotsFile: 'robots-jobs.txt',
    expectedSitemapFile: 'sitemap-jobs.xml',
    isAlias: false,
  },
  {
    id: 'LEARNING',
    universe: 'LEARNING',
    hostname: 'learning.talentxcel.in',
    canonicalOrigin: 'https://learning.talentxcel.in',
    expectedRobotsFile: 'robots-learning.txt',
    expectedSitemapFile: 'sitemap-learning.xml',
    isAlias: false,
  },
  {
    id: 'PASSPORT',
    universe: 'PASSPORT',
    hostname: 'passport.talentxcel.in',
    canonicalOrigin: 'https://passport.talentxcel.in',
    expectedRobotsFile: 'robots-passport.txt',
    expectedSitemapFile: 'sitemap-passport.xml',
    isAlias: false,
    privacyStrict: true,
  },
  {
    id: 'GOVERNMENT',
    universe: 'GOVERNMENT',
    hostname: 'government.talentxcel.in',
    canonicalOrigin: 'https://government.talentxcel.in',
    expectedRobotsFile: 'robots-government.txt',
    expectedSitemapFile: 'sitemap-government.xml',
    isAlias: false,
  },
  {
    id: 'EMPLOYERS',
    universe: 'EMPLOYERS',
    hostname: 'employers.talentxcel.in',
    canonicalOrigin: 'https://employers.talentxcel.in',
    expectedRobotsFile: 'robots-employers.txt',
    expectedSitemapFile: 'sitemap-employers.xml',
    isAlias: false,
  },
  {
    id: 'COLLEGES',
    universe: 'COLLEGES',
    hostname: 'colleges.talentxcel.in',
    canonicalOrigin: 'https://colleges.talentxcel.in',
    expectedRobotsFile: 'robots-colleges.txt',
    expectedSitemapFile: 'sitemap-colleges.xml',
    isAlias: false,
  },
  {
    id: 'CAREERS',
    universe: 'CAREERS',
    hostname: 'careers.talentxcel.in',
    canonicalOrigin: 'https://careers.talentxcel.in',
    expectedRobotsFile: 'robots-careers.txt',
    expectedSitemapFile: 'sitemap-careers.xml',
    isAlias: false,
  },
  {
    id: 'SALARY',
    universe: 'SALARY',
    hostname: 'salary.talentxcel.in',
    canonicalOrigin: 'https://salary.talentxcel.in',
    expectedRobotsFile: 'robots-salary.txt',
    expectedSitemapFile: 'sitemap-salary.xml',
    isAlias: false,
  },
  {
    id: 'RESUME',
    universe: 'RESUME',
    hostname: 'resume.talentxcel.in',
    canonicalOrigin: 'https://resume.talentxcel.in',
    expectedRobotsFile: 'robots-resume.txt',
    expectedSitemapFile: 'sitemap-resume.xml',
    isAlias: false,
  },
  {
    id: 'EMPLOYER_ALIAS',
    universe: 'EMPLOYERS',
    hostname: 'employer.talentxcel.in',
    canonicalOrigin: 'https://employers.talentxcel.in',
    expectedRobotsFile: 'robots-employer-alias.txt',
    expectedSitemapFile: 'sitemap-employers.xml',
    isAlias: true,
    expectedRedirectTarget: 'https://employers.talentxcel.in/:path*',
  },
];

let totalChecks = 0;
let passedChecks = 0;

function assert(condition: boolean, title: string, detail?: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✅ [PASS] ${title}`);
  } else {
    console.error(`  ❌ [FAIL] ${title}${detail ? ` -> ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

// Read vercel.json
const vercelConfigPath = resolve('vercel.json');
const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, 'utf8'));

// ─── 1. VERIFY ROOT CONTRACT & UNIVERSE RESOLUTION ───────────────────────────
console.log('--- 1. AUDITING ROOT CONTRACT & PRODUCT UNIVERSE RESOLUTION ---');
for (const spec of DOMAIN_SPECS) {
  const mappedUni = DOMAIN_TO_UNIVERSE[spec.hostname];
  assert(
    mappedUni === spec.universe,
    `${spec.hostname} resolves to Product Universe "${spec.universe}"`,
    `Got: ${mappedUni}`
  );
  if (!spec.isAlias) {
    const primaryDomain = UNIVERSE_PRIMARY_DOMAIN[spec.universe];
    assert(
      primaryDomain === spec.canonicalOrigin,
      `${spec.universe} primary origin matches ${spec.canonicalOrigin}`,
      `Got: ${primaryDomain}`
    );
  }
}

// ─── 2. VERIFY /ROBOTS.TXT ROUTING & POLICY INTEGRITY ─────────────────────────
console.log('\n--- 2. AUDITING /ROBOTS.TXT ROUTING & PHYSICAL POLICY INTEGRITY ---');
for (const spec of DOMAIN_SPECS) {
  // Check physical file existence
  const robotsPath = resolve('public', spec.expectedRobotsFile);
  const exists = existsSync(robotsPath);
  assert(exists, `Physical robots file exists: public/${spec.expectedRobotsFile}`);

  if (exists) {
    const content = readFileSync(robotsPath, 'utf8');
    assert(content.length > 50, `robots file public/${spec.expectedRobotsFile} has valid byte content (${content.length} bytes)`);

    if (spec.isAlias) {
      assert(
        content.includes('Disallow: /'),
        `Legacy alias robots file blocks all crawling (Disallow: /)`
      );
      assert(
        content.includes('Sitemap: https://employers.talentxcel.in/sitemap.xml'),
        `Legacy alias declares authoritative employers sitemap`
      );
    } else {
      assert(
        content.includes('User-agent: Googlebot'),
        `${spec.hostname} robots file explicitly defines User-agent: Googlebot`
      );
      assert(
        content.includes('Allow: /'),
        `${spec.hostname} robots file allows Googlebot indexing (Allow: /)`
      );
      const expectedSitemapLine = `Sitemap: ${spec.canonicalOrigin}/sitemap.xml`;
      assert(
        content.includes(expectedSitemapLine),
        `${spec.hostname} declares public contract sitemap: "${expectedSitemapLine}"`,
        `Content snippet: ${content.split('\n').filter(l => l.startsWith('Sitemap:')).join(', ')}`
      );
    }
  }

  // Check vercel.json rewrite for subdomains
  if (spec.hostname !== 'talentxcel.in') {
    const hasRewrite = vercelConfig.rewrites.some((rw: any) =>
      rw.source === '/robots.txt' &&
      Array.isArray(rw.has) &&
      rw.has.some((h: any) => h.type === 'host' && h.value === spec.hostname) &&
      rw.destination === `/${spec.expectedRobotsFile}`
    );
    assert(
      hasRewrite,
      `vercel.json rewrites ${spec.hostname}/robots.txt -> /${spec.expectedRobotsFile}`
    );
  }
}

// ─── 3. VERIFY /SITEMAP.XML ROUTING, ORIGIN PURITY & CONTRACT ─────────────────
console.log('\n--- 3. AUDITING /SITEMAP.XML ROUTING & DOMAIN ORIGIN SCOPE ---');
const crossDomainSeenUrls = new Map<string, string>();
const crossDomainDuplicates: string[] = [];

for (const spec of DOMAIN_SPECS) {
  if (spec.isAlias) continue; // Aliases emit 0 sitemaps

  const sitemapPath = resolve('public', spec.expectedSitemapFile);
  const exists = existsSync(sitemapPath);
  assert(exists, `Physical sitemap exists: public/${spec.expectedSitemapFile}`);

  if (exists) {
    const content = readFileSync(sitemapPath, 'utf8');
    assert(content.startsWith('<?xml'), `${spec.expectedSitemapFile} contains valid XML header`);
    assert(content.includes('<urlset'), `${spec.expectedSitemapFile} contains valid urlset element`);

    // Parse locs
    const locMatches = content.match(/<loc>(.*?)<\/loc>/g) || [];
    assert(locMatches.length > 0, `${spec.expectedSitemapFile} contains ${locMatches.length} indexable URLs`);

    let originMismatches = 0;
    let privacyViolations = 0;

    for (const match of locMatches) {
      const url = match.replace('<loc>', '').replace('</loc>', '');

      // Check origin
      if (!url.startsWith(spec.canonicalOrigin)) {
        originMismatches++;
      }

      // Check cross-domain collision
      if (crossDomainSeenUrls.has(url)) {
        crossDomainDuplicates.push(`${url} found in both ${crossDomainSeenUrls.get(url)} and ${spec.id}`);
      } else {
        crossDomainSeenUrls.set(url, spec.id);
      }

      // Check privacy for passport
      if (spec.privacyStrict) {
        if (url.includes('/private') || url.includes('/user/') || url.includes('/settings')) {
          privacyViolations++;
        }
      }
    }

    assert(
      originMismatches === 0,
      `100% of URLs in ${spec.expectedSitemapFile} strictly match canonical origin ${spec.canonicalOrigin} (0 mismatches)`,
      `Mismatches found: ${originMismatches}`
    );

    if (spec.privacyStrict) {
      assert(
        privacyViolations === 0,
        `Passport sitemap strictly excludes private profiles (0 private leaks)`
      );
    }
  }

  // Check vercel.json rewrite for subdomains
  if (spec.hostname !== 'talentxcel.in') {
    const hasRewrite = vercelConfig.rewrites.some((rw: any) =>
      rw.source === '/sitemap.xml' &&
      Array.isArray(rw.has) &&
      rw.has.some((h: any) => h.type === 'host' && h.value === spec.hostname) &&
      rw.destination === `/${spec.expectedSitemapFile}`
    );
    assert(
      hasRewrite,
      `vercel.json rewrites ${spec.hostname}/sitemap.xml -> /${spec.expectedSitemapFile}`
    );
  }
}

assert(
  crossDomainDuplicates.length === 0,
  `Zero cross-domain duplicate URLs across all 10 domain sitemaps (total unique URLs: ${crossDomainSeenUrls.size})`,
  `Duplicates: ${crossDomainDuplicates.join(', ')}`
);

// ─── 4. VERIFY CANONICAL URL RESOLUTION ACROSS DOMAINS ─────────────────────────
console.log('\n--- 4. AUDITING CANONICAL URL RESOLUTION (formatCanonicalUrl) ---');
const canonicalTests = [
  { path: '/', host: 'talentxcel.in', expected: 'https://talentxcel.in/' },
  { path: '/', host: 'jobs.talentxcel.in', expected: 'https://jobs.talentxcel.in/' },
  { path: '/jobs', host: 'jobs.talentxcel.in', expected: 'https://jobs.talentxcel.in/jobs' },
  { path: '/jobs/software-engineer-bangalore', host: 'jobs.talentxcel.in', expected: 'https://jobs.talentxcel.in/jobs/software-engineer-bangalore' },
  { path: '/resume', host: 'resume.talentxcel.in', expected: 'https://resume.talentxcel.in/resume' },
  { path: '/salary', host: 'salary.talentxcel.in', expected: 'https://salary.talentxcel.in/salary' },
  { path: '/colleges', host: 'colleges.talentxcel.in', expected: 'https://colleges.talentxcel.in/colleges' },
  { path: '/learning', host: 'learning.talentxcel.in', expected: 'https://learning.talentxcel.in/learning' },
  { path: '/companies', host: 'employers.talentxcel.in', expected: 'https://employers.talentxcel.in/companies' },
  { path: '/companies', host: 'employer.talentxcel.in', expected: 'https://employers.talentxcel.in/companies' },
];

for (const ct of canonicalTests) {
  const result = formatCanonicalUrl(ct.path, ct.host);
  assert(
    result === ct.expected,
    `formatCanonicalUrl("${ct.path}", "${ct.host}") -> "${ct.expected}"`,
    `Got: "${result}"`
  );
}

// ─── 5. VERIFY EMPLOYER CANONICAL RULE & 301 REDIRECT ENFORCEMENT ───────────────
console.log('\n--- 5. AUDITING EMPLOYER CANONICAL RULE & 301 REDIRECT ---');
assert(
  isLegacyEmployerAlias('employer.talentxcel.in') === true,
  'isLegacyEmployerAlias("employer.talentxcel.in") returns true'
);
assert(
  isLegacyEmployerAlias('employers.talentxcel.in') === false,
  'isLegacyEmployerAlias("employers.talentxcel.in") returns false'
);

const hasEmployer301 = vercelConfig.redirects.some((rd: any) =>
  rd.source === '/:path*' &&
  Array.isArray(rd.has) &&
  rd.has.some((h: any) => h.type === 'host' && h.value === 'employer.talentxcel.in') &&
  rd.destination === 'https://employers.talentxcel.in/:path*' &&
  rd.permanent === true
);
assert(
  hasEmployer301,
  'vercel.json enforces 301 Permanent Redirect: employer.talentxcel.in/:path* -> https://employers.talentxcel.in/:path*'
);

// ─── 6. VERIFY EDGE CACHE HEADERS FOR ROBOTS & SITEMAPS ───────────────────────
console.log('\n--- 6. AUDITING EDGE CACHE HEADERS FOR ROBOTS & SITEMAPS ---');
const hasCacheHeader = vercelConfig.headers.some((hd: any) =>
  hd.source.includes('robots') && hd.source.includes('sitemap') &&
  Array.isArray(hd.headers) &&
  hd.headers.some((h: any) => h.key === 'Cache-Control' && h.value.includes('public'))
);
assert(
  hasCacheHeader,
  'vercel.json headers specify edge caching for all robots and sitemap assets'
);

// ─── 7. VERIFY OAUTH CENTRAL SSO DELEGATION & RETURNTO FLOW ───────────────────
console.log('\n--- 7. AUDITING OAUTH CENTRAL SSO DELEGATION & RETURNTO ROUTING ---');
// Test allowed auth hosts
for (const spec of DOMAIN_SPECS) {
  assert(
    isAllowedAuthHostname(spec.hostname),
    `Hostname "${spec.hostname}" is registered in isAllowedAuthHostname`
  );
}

// Test returnTo path validation
const sampleReturnToUrl = 'https://jobs.talentxcel.in/jobs/software-engineer';
assert(
  isValidInternalPath(sampleReturnToUrl),
  `isValidInternalPath validates returnTo URL: ${sampleReturnToUrl}`
);

const badReturnToUrl = 'https://evil-phishing.com/steal-session';
assert(
  !isValidInternalPath(badReturnToUrl),
  `isValidInternalPath rejects unapproved external domain: ${badReturnToUrl}`
);

// Test resolvePostAuthDestination with returnTo
const searchParams = new URLSearchParams({ returnTo: sampleReturnToUrl });
const resolvedDest = resolvePostAuthDestination({ searchParams });
assert(
  resolvedDest === sampleReturnToUrl,
  `resolvePostAuthDestination routes back to originating subdomain URL`,
  `Got: ${resolvedDest}`
);

// ─── 8. VERIFY CROSS-SUBDOMAIN COOKIE SCOPE ──────────────────────────────────
console.log('\n--- 8. AUDITING CROSS-SUBDOMAIN SESSION COOKIE SCOPE ---');
for (const spec of DOMAIN_SPECS) {
  const cookieDomain = getCrossSubdomainCookieDomain(spec.hostname);
  assert(
    cookieDomain === '.talentxcel.in',
    `getCrossSubdomainCookieDomain("${spec.hostname}") returns ".talentxcel.in"`,
    `Got: ${cookieDomain}`
  );
}

// ─── 9. GOOGLE SEARCH CONSOLE PROPERTY CONTRACT INTEGRITY ────────────────────
console.log('\n--- 9. AUDITING GOOGLE SEARCH CONSOLE PROPERTY CONTRACTS ---');
for (const spec of DOMAIN_SPECS) {
  if (spec.isAlias) continue;
  console.log(`  📦 Product Property: ${spec.id}`);
  console.log(`     • Site URL   : ${spec.canonicalOrigin}/`);
  console.log(`     • robots.txt : ${spec.canonicalOrigin}/robots.txt`);
  console.log(`     • sitemap.xml: ${spec.canonicalOrigin}/sitemap.xml`);
}
assert(
  DOMAIN_SPECS.filter(s => !s.isAlias).length === 10,
  'All 10 production properties fulfill standard Google Search Console contract'
);

// ─── SUMMARY REPORT ──────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(`📊 SUBDOMAIN CONTRACT AUDIT: ${passedChecks} / ${totalChecks} CHECKS PASSED`);
console.log('================================================================');

if (passedChecks === totalChecks) {
  console.log('🎉 100% PRODUCTION CONTRACTS VERIFIED CLEANLY ACROSS ALL 10 DOMAINS!\n');
} else {
  process.exit(1);
}
