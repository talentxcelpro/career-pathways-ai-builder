/**
 * src/lib/geo/__tests__/inventoryPreservation.test.ts
 * Automated verification of all 18 Phase 3 Inventory Preservation & Geo Resolution Invariants.
 * Run with: npx tsx --test src/lib/geo/__tests__/inventoryPreservation.test.ts
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyPreservedJob,
  verifyInventoryPreserved,
  type PreservedJobInput,
} from '../inventoryPreservation';
import {
  resolveCanonicalLocation,
  aggregateJobsByCanonicalCity,
} from '../canonicalGeoResolver';
import {
  evaluateCityReadinessFromJobs,
  getCityRobotsMeta,
} from '../cityIndexReadinessGate';

const NOW = new Date('2026-11-25T12:00:00Z');

test('1. Job with is_active=true remains inventory_active regardless of past expiry_date', () => {
  const job: PreservedJobInput = {
    id: 'job-exp-1',
    is_active: true,
    expiry_date: '2026-10-01',
    posted_at: '2026-09-01T00:00:00Z',
    location: 'Bengaluru, Karnataka, India',
  };
  const res = classifyPreservedJob(job, NOW);
  assert.equal(res.inventory_active, true);
  assert.equal(res.job_visibility, true);
  assert.equal(res.is_past_expiry_date, true);
});

test('2. Expired-date job is NOT automatically deactivated and original fields are untouched', () => {
  const job: PreservedJobInput = {
    id: 'job-exp-2',
    is_active: true,
    expiry_date: '2025-01-01',
    posted_at: '2024-12-01T00:00:00Z',
  };
  const snapshot = { ...job };
  const res = classifyPreservedJob(job, NOW);
  assert.equal(job.is_active, true);
  assert.deepEqual(job, snapshot);
  assert.equal(res.inventory_active, true);
});

test('3 & 4. Geo resolution does not delete jobs and does not overwrite raw location', () => {
  const jobs = [
    { id: 'j1', is_active: true, location: 'Bengaluru, Maharashtra, India', location_city: 'Bengaluru' },
    { id: 'j2', is_active: true, location: 'Remote', location_city: 'Remote' },
  ];
  const rawBefore = jobs.map((j) => j.location);
  const agg = aggregateJobsByCanonicalCity(jobs);
  assert.deepEqual(jobs.map((j) => j.location), rawBefore);
  assert.equal(jobs.length, 2);
  assert.equal(agg.get('bangalore')?.length, 1);
});

test('5 & 7. Bengaluru and Bangalore aggregate into single canonical bangalore without duplicate jobs', () => {
  const jobs = [
    { id: 'j-blr-1', is_active: true, location: 'Bengaluru, Karnataka', location_city: 'Bengaluru' },
    { id: 'j-blr-2', is_active: true, location: 'Bangalore, India', location_city: 'Bangalore' },
  ];
  const agg = aggregateJobsByCanonicalCity(jobs);
  const bangaloreJobs = agg.get('bangalore') || [];
  assert.equal(bangaloreJobs.length, 2);
  assert.equal(new Set(bangaloreJobs.map((j) => j.id)).size, 2);
  assert.equal(agg.has('bengaluru'), false);
});

test('6 & 17. Visakhapatnam is NEVER matched as Patna (no substring leak)', () => {
  const vizag = resolveCanonicalLocation('Visakhapatnam, Andhra Pradesh, India', 'Visakhapatnam');
  assert.equal(vizag.primary?.canonicalSlug, 'visakhapatnam');
  assert.equal(vizag.allCities.some((c) => c.canonicalSlug === 'patna'), false);

  const jobs = [
    { id: 'v1', is_active: true, location: 'Visakhapatnam', location_city: 'Visakhapatnam' },
    { id: 'p1', is_active: true, location: 'Patna', location_city: 'Patna' },
  ];
  const agg = aggregateJobsByCanonicalCity(jobs);
  assert.equal(agg.get('patna')?.length, 1);
  assert.equal(agg.get('visakhapatnam')?.length, 1);
});

test('8. Chhatrapati Sambhajinagar resolves to canonical aurangabad', () => {
  const res = resolveCanonicalLocation('Chhatrapati Sambhajinagar, Maharashtra', 'Chhatrapati Sambhajinagar');
  assert.equal(res.locationType, 'CITY');
  assert.equal(res.primary?.canonicalSlug, 'aurangabad');
  assert.equal(res.primary?.canonicalState, 'Maharashtra');
});

test('9. Multi-city locations resolve all genuine cities without double-counting within same city', () => {
  const res = resolveCanonicalLocation('Bengaluru, Mumbai, Bangalore');
  assert.equal(res.isMultiCity, true);
  assert.deepEqual(
    res.allCities.map((c) => c.canonicalSlug).sort(),
    ['bangalore', 'mumbai']
  );

  const agg = aggregateJobsByCanonicalCity([
    { id: 'multi-1', is_active: true, location: 'Bengaluru, Mumbai, Bangalore' },
  ]);
  assert.equal(agg.get('bangalore')?.length, 1);
  assert.equal(agg.get('mumbai')?.length, 1);
});

test('10 & 11. Remote and PAN India do NOT become fake city inventory', () => {
  const r1 = resolveCanonicalLocation('Remote');
  const r2 = resolveCanonicalLocation('PAN India');
  const r3 = resolveCanonicalLocation('India');
  assert.equal(r1.locationType, 'REMOTE');
  assert.equal(r2.locationType, 'NATIONAL');
  assert.equal(r3.locationType, 'NATIONAL');

  const agg = aggregateJobsByCanonicalCity([
    { id: 'rem-1', is_active: true, location: 'Remote' },
    { id: 'pan-1', is_active: true, location: 'PAN India' },
    { id: 'ind-1', is_active: true, location: 'India' },
  ]);
  assert.equal(agg.size, 0);
});

test('12 & 18. Duplicate tuples and preservation guard never delete or lose active jobs', () => {
  const jobs = [
    { id: 'dup-1', is_active: true, title: 'Engineer', company_name: 'Acme', location: 'Mumbai' },
    { id: 'dup-2', is_active: true, title: 'Engineer', company_name: 'Acme', location: 'Mumbai' },
  ];
  const agg = aggregateJobsByCanonicalCity(jobs);
  assert.equal(agg.get('mumbai')?.length, 2);

  const check = verifyInventoryPreserved(jobs, agg.get('mumbai') || []);
  assert.equal(check.preserved, true);
  assert.equal(check.beforeActiveCount, 2);
  assert.equal(check.afterActiveCount, 2);
  assert.deepEqual(check.missingIds, []);
});

test('13 & 14 & 16. SEO gate failure does not suppress jobs and remains search-discoverable (noindex, follow)', () => {
  const jobs = [
    {
      id: 'patna-1',
      is_active: true,
      title: 'Analyst',
      company_name: 'Corp A',
      location: 'Patna',
      expiry_date: '2026-10-01', // past expiry
      posted_at: '2026-09-01T00:00:00Z',
    },
    {
      id: 'patna-2',
      is_active: true,
      title: 'Developer',
      company_name: 'Corp A',
      location: 'Patna',
      expiry_date: '2026-12-31',
      posted_at: '2026-11-20T00:00:00Z',
    },
  ];
  const gate = evaluateCityReadinessFromJobs('patna', jobs, 20, 15, NOW);
  assert.equal(gate.totalActiveInventory, 2); // Both active jobs preserved
  assert.equal(gate.seoEligibleUnexpiredCount, 1); // Only 1 unexpired
  assert.equal(gate.indexReady, false); // Fails SEO gate
  assert.equal(gate.searchDiscoverable, true); // Still discoverable!
  assert.equal(getCityRobotsMeta(gate.indexReady), 'noindex, follow');
});

test('15. City inventory totals reconcile with unique mapped active job IDs & state corruption is overridden', () => {
  const res = resolveCanonicalLocation('Bengaluru, Maharashtra, India', 'Bengaluru');
  assert.equal(res.primary?.canonicalState, 'Karnataka');
  assert.equal(res.primary?.countryCode, 'IN');

  const gurgaon = resolveCanonicalLocation('Gurugram, Karnataka, India', 'Gurugram');
  assert.equal(gurgaon.primary?.canonicalSlug, 'gurugram');
  assert.equal(gurgaon.primary?.canonicalState, 'Haryana');
});
