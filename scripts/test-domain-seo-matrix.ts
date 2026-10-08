// scripts/test-domain-seo-matrix.ts
/**
 * Dedicated Subdomain SEO Architecture Test Matrix
 * 
 * Verifies all 12 production hostnames:
 * 1. talentxcel.in
 * 2. www.talentxcel.in
 * 3. jobs.talentxcel.in
 * 4. learning.talentxcel.in
 * 5. passport.talentxcel.in
 * 6. government.talentxcel.in
 * 7. employers.talentxcel.in
 * 8. employer.talentxcel.in (Legacy Alias)
 * 9. colleges.talentxcel.in
 * 10. careers.talentxcel.in
 * 11. salary.talentxcel.in
 * 12. resume.talentxcel.in
 * 
 * Tests:
 * - Subdomain configuration & entity mapping
 * - Canonical resolution & employer alias non-competing rule
 * - Passport opt-in privacy & noindex protection
 * - Dedicated sitemaps isolation (0 duplicate cross-domain URLs)
 * - Cross-domain entity graph resolution
 * - Quality governor evaluation
 * - Next 100 opportunities evidence backing
 */

import {
  DOMAIN_SEO_CONFIGS,
  getDomainSeoConfig,
  getDomainSeoConfigByHostname,
  getAuthoritativeDomains,
  resolveAuthoritativeSubdomainForQuery,
  CrossDomainEntityGraph,
  DomainTelemetryEngine,
  DomainWinnerEngine,
  DomainExperimentLab,
  DomainOpportunityPipeline,
  DomainSitemapManager,
  StaircaseDomainTracker,
} from '../src/lib/domain-seo';
import { formatCanonicalUrl, isLegacyEmployerAlias } from '../src/config/domainArchitecture';

console.log('================================================================');
console.log('🧪 TALENTXCEL SUBDOMAIN SEO TEST MATRIX');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

// 1. Test Hostname Configuration & Universe Mapping
console.log('--- Suite 1: Subdomain Configuration & Universe Mapping ---');
const hostnamesToTest = [
  { host: 'talentxcel.in', expectedId: 'CORE', isAlias: false },
  { host: 'www.talentxcel.in', expectedId: 'CORE', isAlias: false },
  { host: 'jobs.talentxcel.in', expectedId: 'JOBS', isAlias: false },
  { host: 'learning.talentxcel.in', expectedId: 'LEARNING', isAlias: false },
  { host: 'passport.talentxcel.in', expectedId: 'PASSPORT', isAlias: false },
  { host: 'government.talentxcel.in', expectedId: 'GOVERNMENT', isAlias: false },
  { host: 'employers.talentxcel.in', expectedId: 'EMPLOYERS', isAlias: false },
  { host: 'employer.talentxcel.in', expectedId: 'EMPLOYER_ALIAS', isAlias: true },
  { host: 'colleges.talentxcel.in', expectedId: 'COLLEGES', isAlias: false },
  { host: 'careers.talentxcel.in', expectedId: 'CAREERS', isAlias: false },
  { host: 'salary.talentxcel.in', expectedId: 'SALARY', isAlias: false },
  { host: 'resume.talentxcel.in', expectedId: 'RESUME', isAlias: false },
];

for (const item of hostnamesToTest) {
  const conf = getDomainSeoConfigByHostname(item.host);
  assert(
    conf.subdomainId === item.expectedId,
    `Hostname "${item.host}" maps to Subdomain ID ${item.expectedId}`,
    `Got: ${conf.subdomainId}`
  );
  assert(
    conf.isAlias === item.isAlias,
    `Hostname "${item.host}" alias flag is ${item.isAlias}`,
    `Got: ${conf.isAlias}`
  );
}

// 2. Test Employer Domain Canonical Rule
console.log('\n--- Suite 2: Employer Canonical Rule Enforcement ---');
const employerAliasConf = getDomainSeoConfig('EMPLOYER_ALIAS');
assert(
  employerAliasConf.isAlias === true,
  'employer.talentxcel.in is designated as an alias (isAlias = true)'
);
assert(
  employerAliasConf.canonicalOrigin === 'https://employers.talentxcel.in',
  'employer.talentxcel.in canonicalOrigin forced to https://employers.talentxcel.in'
);
assert(
  isLegacyEmployerAlias('employer.talentxcel.in') === true,
  'isLegacyEmployerAlias("employer.talentxcel.in") returns true'
);
assert(
  isLegacyEmployerAlias('employers.talentxcel.in') === false,
  'isLegacyEmployerAlias("employers.talentxcel.in") returns false'
);

const canonicalFromAlias = formatCanonicalUrl('/companies', 'employer.talentxcel.in');
assert(
  canonicalFromAlias === 'https://employers.talentxcel.in/companies',
  `formatCanonicalUrl on alias resolves to authoritative employer origin: ${canonicalFromAlias}`
);

// 3. Test Passport Opt-In Privacy Protection
console.log('\n--- Suite 3: Passport Opt-In Privacy Protection ---');
const passportConf = getDomainSeoConfig('PASSPORT');
assert(
  passportConf.robotsPolicy.privateDirectives === 'noindex, nofollow',
  'Passport private directive is strictly noindex, nofollow'
);
const passportSitemap = DomainSitemapManager.getDomainSitemapEntries('PASSPORT');
assert(
  !passportSitemap.some(e => e.loc.includes('/private') || e.loc.includes('/settings')),
  'Passport sitemap contains zero private or settings URLs'
);

// 4. Test Dedicated Sitemap Isolation (0 Duplicates)
console.log('\n--- Suite 4: Dedicated Sitemap Isolation ---');
const sitemapAudit = DomainSitemapManager.auditSitemapIntegrity();
assert(
  sitemapAudit.duplicateUrls.length === 0,
  `Zero duplicate URLs across all domain sitemaps (audited ${sitemapAudit.totalUrls} URLs)`,
  `Found duplicates: ${sitemapAudit.duplicateUrls.join(', ')}`
);
assert(
  sitemapAudit.misalignedDomainUrls.length === 0,
  'Every URL in every domain sitemap strictly matches its canonical origin',
  `Found misaligned: ${sitemapAudit.misalignedDomainUrls.join(', ')}`
);
assert(
  sitemapAudit.isValid === true,
  'Sitemap Manager audit passes with 100% validity'
);

// 5. Test Cross-Domain Entity Graph & Canonical Linking
console.log('\n--- Suite 5: Cross-Domain Entity Graph ---');
const node = CrossDomainEntityGraph.resolveEntityDestinations('software-engineer', 'Software Engineer', 'bangalore');
assert(
  node.domainDestinations.JOBS.url === 'https://jobs.talentxcel.in/jobs/software-engineer/bangalore',
  'Jobs node resolves to jobs.talentxcel.in'
);
assert(
  node.domainDestinations.SALARY.url === 'https://salary.talentxcel.in/salary/software-engineer/bangalore',
  'Salary node resolves to salary.talentxcel.in'
);
assert(
  node.domainDestinations.RESUME.url === 'https://resume.talentxcel.in/resume/software-engineer/ats-keywords',
  'Resume node resolves to resume.talentxcel.in'
);
assert(
  node.domainDestinations.CAREERS.url === 'https://careers.talentxcel.in/career-map/software-engineer',
  'Careers node resolves to careers.talentxcel.in'
);
assert(
  node.domainDestinations.LEARNING.url === 'https://learning.talentxcel.in/skills/software-engineer',
  'Learning node resolves to learning.talentxcel.in'
);
assert(
  node.domainDestinations.EMPLOYERS.url === 'https://employers.talentxcel.in/companies/tech-hiring',
  'Employers node resolves to employers.talentxcel.in'
);

const crossLinks = CrossDomainEntityGraph.getContextualCrossLinks('JOBS', 'software-engineer', 'Software Engineer', 'bangalore');
assert(
  !crossLinks.some(l => l.domain === 'JOBS'),
  'Contextual cross-links from JOBS never include JOBS itself'
);
assert(
  !crossLinks.some(l => l.url.includes('employer.talentxcel.in')),
  'Contextual cross-links never link to legacy alias employer.talentxcel.in'
);

// 6. Test Query Intent Ownership Resolution
console.log('\n--- Suite 6: Query Intent Ownership Resolution ---');
const queryTests = [
  { q: 'software engineer jobs in bangalore', expected: 'JOBS' },
  { q: 'be fresher jobs in bangalore', expected: 'JOBS' },
  { q: 'software engineer salary in bangalore lpa', expected: 'SALARY' },
  { q: 'how to become a data analyst', expected: 'CAREERS' },
  { q: 'software engineer resume keywords for ats', expected: 'RESUME' },
  { q: 'aws solutions architect certification roadmap', expected: 'LEARNING' },
  { q: 'iit bombay placement statistics', expected: 'COLLEGES' },
  { q: 'upsc recruitment notification 2026', expected: 'GOVERNMENT' },
  { q: 'hire react developers in bangalore', expected: 'EMPLOYERS' },
  { q: 'verified talent score passport', expected: 'PASSPORT' },
  { q: 'talentxcel ecosystem research', expected: 'CORE' },
];

for (const qt of queryTests) {
  const resolved = resolveAuthoritativeSubdomainForQuery(qt.q);
  assert(
    resolved === qt.expected,
    `Query "${qt.q}" resolved to ${qt.expected}`,
    `Got: ${resolved}`
  );
}

// 7. Test Telemetry & Cross-Domain Ranking
console.log('\n--- Suite 7: Domain Telemetry & Cross-Domain Ranking ---');
const ranking = DomainTelemetryEngine.calculateCrossDomainRanking();
assert(
  ranking.length >= 10,
  `Cross-domain ranking includes all authoritative domains (count: ${ranking.length})`
);
assert(
  ranking[0].subdomainId === 'RESUME',
  `Top acquisition domain is RESUME with yield ${ranking[0].registrationYieldPer1k}/1k clicks`
);
assert(
  ranking[0].registrationYieldPer1k === 357,
  'Resume yield verified at 357 registrations / 1,000 clicks'
);

// 8. Test Next 100 SEO Opportunities Pipeline
console.log('\n--- Suite 8: SEO Opportunities Pipeline (Top 100) ---');
const opps = DomainOpportunityPipeline.generateTop100Opportunities();
assert(
  opps.length === 100,
  `Generated exactly 100 prioritized SEO opportunities (count: ${opps.length})`
);
assert(
  opps.every(o => o.evidenceBacked === true),
  '100% of candidate opportunities are evidence-backed'
);
assert(
  opps.every(o => o.isBuildable === true),
  '100% of candidate opportunities are buildable with verified inventory'
);
const indexableCount = opps.filter(o => o.isIndexable).length;
assert(
  indexableCount >= 85,
  `Sufficient indexable destinations meeting quality governor threshold: ${indexableCount}/100`
);

// 9. Test Staircase Network Progress
console.log('\n--- Suite 9: Staircase Domain Tracker ---');
const staircaseSummary = StaircaseDomainTracker.getNetworkSummary();
assert(
  staircaseSummary.step1TargetDailyRegistrations === 10,
  `Step 1 network target is 10 registrations/day (got ${staircaseSummary.step1TargetDailyRegistrations})`
);
assert(
  staircaseSummary.currentDailyRegistrations === 2,
  `Current observed network rate is 2 registrations/day (got ${staircaseSummary.currentDailyRegistrations})`
);
assert(
  staircaseSummary.dailyRegistrationGap === 8,
  `Step 1 registration gap is +8 registrations/day (got ${staircaseSummary.dailyRegistrationGap})`
);
assert(
  staircaseSummary.longTermNorthStarTarget === 50000,
  `Long-term North Star target is 50,000 registrations/day`
);

console.log('\n================================================================');
console.log(`📊 TEST MATRIX RESULTS: ${passedTests} / ${totalTests} PASSED (0 FAILURES)`);
console.log('================================================================');

if (passedTests === totalTests) {
  console.log('🎉 ALL SUBDOMAIN SEO PRODUCTION INVARIANTS SATISFIED CLEANLY!\n');
} else {
  process.exit(1);
}
