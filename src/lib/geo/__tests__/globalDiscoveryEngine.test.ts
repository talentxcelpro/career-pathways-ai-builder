/**
 * src/lib/geo/__tests__/globalDiscoveryEngine.test.ts
 * Automated tests for Global Multi-Dimensional Discovery Engine.
 * Run with: npx tsx --test src/lib/geo/__tests__/globalDiscoveryEngine.test.ts
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DISCOVERY_INDUSTRIES,
  DISCOVERY_SEGMENTS,
  CONSOLIDATED_ROLE_FAMILIES,
  resolveIndustry,
  classifyRoleFamily,
  computeCrawlPriorityScore,
  isFresherJob,
  isInternshipJob,
  evaluateSelectiveClusters,
  buildJobDiscoveryLinks,
  type MultiDimJobRecord,
} from '../globalDiscoveryEngine';

const NOW = new Date('2026-11-25T12:00:00Z');

test('DISCOVERY_INDUSTRIES covers 20 verified industries', () => {
  assert.equal(DISCOVERY_INDUSTRIES.length, 20);
  assert.equal(resolveIndustry('Information Technology')?.slug, 'information-technology');
  assert.equal(resolveIndustry('Banking & Financial Services')?.slug, 'banking-financial-services');
  assert.equal(resolveIndustry('Logistics & Supply Chain')?.slug, 'logistics-supply-chain');
});

test('DISCOVERY_SEGMENTS covers freshers, internships, remote, and national', () => {
  const slugs = DISCOVERY_SEGMENTS.map((s) => s.slug);
  assert.deepEqual(slugs, ['freshers', 'internships', 'remote', 'national']);
});

test('Fresher and internship detection works without mutating jobs', () => {
  const f: MultiDimJobRecord = { id: 'f1', is_active: true, is_fresher_eligible: true, title: 'Graduate Engineer Trainee' };
  const i: MultiDimJobRecord = { id: 'i1', is_active: true, is_internship: true, employment_type: 'Internship' };
  assert.equal(isFresherJob(f), true);
  assert.equal(isInternshipJob(i), true);
});

test('evaluateSelectiveClusters blocks thin combinations from indexing while keeping userDiscoverable=true', () => {
  const jobs: MultiDimJobRecord[] = [
    // Qualified cluster: Information Technology × Remote (6 unexpired, 3 employers, recent)
    ...[1, 2, 3, 4, 5, 6].map((n) => ({
      id: `it-rem-${n}`,
      is_active: true,
      title: `Software Engineer ${n}`,
      company_name: `Company ${n % 3}`,
      industry_domain: 'Information Technology',
      location: 'Remote',
      expiry_date: '2026-12-31',
      posted_at: '2026-11-20T00:00:00Z',
    })),
    // Thin cluster: Legal & Compliance × Pune (only 1 unexpired job)
    {
      id: 'legal-pune-1',
      is_active: true,
      title: 'Legal Counsel',
      company_name: 'LawFirm A',
      industry_domain: 'Legal & Compliance',
      location: 'Pune',
      expiry_date: '2026-12-31',
      posted_at: '2026-11-20T00:00:00Z',
    },
  ];

  const clusters = evaluateSelectiveClusters(jobs, { now: NOW });
  const itRemote = clusters.find((c) => c.industrySlug === 'information-technology' && c.locationSlug === 'remote');
  const legalPune = clusters.find((c) => c.industrySlug === 'legal-compliance' && c.locationSlug === 'pune');

  assert.ok(itRemote);
  assert.equal(itRemote.indexReady, true);
  assert.equal(itRemote.userDiscoverable, true);
  assert.equal(itRemote.totalActiveInventory, 6);

  assert.ok(legalPune);
  assert.equal(legalPune.indexReady, false);
  assert.equal(legalPune.userDiscoverable, true);
});

test('buildJobDiscoveryLinks generates canonical City, Industry, Segment, and Employer links', () => {
  const links = buildJobDiscoveryLinks({
    id: 'j-100',
    is_active: true,
    title: 'Backend Engineer',
    company_name: 'Stripe',
    industry_domain: 'Information Technology',
    location: 'Bengaluru, Karnataka, India',
    location_city: 'Bengaluru',
    is_fresher_eligible: true,
  });

  assert.ok(links.some((l) => l.href === '/locations/bangalore' && l.hubType === 'CITY'));
  assert.ok(links.some((l) => l.href === '/industries/information-technology' && l.hubType === 'INDUSTRY'));
  assert.ok(links.some((l) => l.href === '/jobs?experience=fresher' && l.hubType === 'SEGMENT'));
  assert.ok(links.some((l) => l.href === '/company/stripe' && l.hubType === 'EMPLOYER'));
});

test('CONSOLIDATED_ROLE_FAMILIES and classifyRoleFamily consolidate fragmented titles', () => {
  assert.equal(CONSOLIDATED_ROLE_FAMILIES.length, 15);
  assert.equal(classifyRoleFamily('Senior Backend Engineer (Go/Kubernetes)')?.slug, 'software-engineer');
  assert.equal(classifyRoleFamily('Associate Data Analyst')?.slug, 'data-analyst-scientist');
  assert.equal(classifyRoleFamily('Graduate Engineer Trainee')?.slug, 'graduate-engineer-trainee');
});

test('computeCrawlPriorityScore scores GSC-proven ready hubs higher and blocks unready hubs', () => {
  const readyScore = computeCrawlPriorityScore({
    gscImpressions: 4097,
    gscClicks: 133,
    gscAvgPosition: 2.51,
    unexpiredJobs: 17,
    employers: 2,
    recent30d: 1,
    qualityScore: 84,
    indexReady: true,
  });
  const blockedScore = computeCrawlPriorityScore({
    gscImpressions: 226,
    gscClicks: 12,
    gscAvgPosition: 1.91,
    unexpiredJobs: 0,
    employers: 0,
    recent30d: 0,
    qualityScore: 0,
    indexReady: false,
  });
  assert.ok(readyScore > 50);
  assert.equal(blockedScore, 0);
});
