import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isJobLive } from '../isJobLive.js';
import { buildJobPostingSchema } from '../jobPostingSchema.js';

const NOW = new Date('2026-11-27T12:00:00Z').getTime();
const FUTURE = '2027-01-15T00:00:00Z';
const PAST = '2026-10-01T00:00:00Z';

describe('isJobLive() table-driven tests', () => {
  const cases: Array<{ name: string; job: any; expected: boolean }> = [
    { name: 'active open published future expires_at', job: { is_active: true, job_status: 'open', status: 'published', expires_at: FUTURE }, expected: true },
    { name: 'active null dates', job: { is_active: true, job_status: null, status: 'active', expires_at: null, application_deadline: null }, expected: true },
    { name: 'is_active false', job: { is_active: false, job_status: 'open', status: 'published', expires_at: FUTURE }, expected: false },
    { name: 'is_active null', job: { is_active: null, job_status: 'open', status: 'published', expires_at: FUTURE }, expected: false },
    { name: 'job_status closed', job: { is_active: true, job_status: 'closed', status: 'published', expires_at: FUTURE }, expected: false },
    { name: 'job_status expired', job: { is_active: true, job_status: 'expired', status: 'published', expires_at: FUTURE }, expected: false },
    { name: 'status expired', job: { is_active: true, job_status: 'open', status: 'expired', expires_at: FUTURE }, expected: false },
    { name: 'status closed', job: { is_active: true, job_status: 'open', status: 'closed', expires_at: FUTURE }, expected: false },
    { name: 'status filled', job: { is_active: true, job_status: 'open', status: 'filled', expires_at: FUTURE }, expected: false },
    { name: 'past expires_at', job: { is_active: true, job_status: 'open', status: 'published', expires_at: PAST }, expected: false },
    { name: 'past application_deadline', job: { is_active: true, job_status: 'open', status: 'published', expires_at: FUTURE, application_deadline: PAST }, expected: false },
    { name: 'past expiry_date is EXCLUDED (stays live)', job: { is_active: true, job_status: 'open', status: 'published', expires_at: FUTURE, expiry_date: PAST }, expected: true },
    { name: 'is_test true is excluded', job: { is_active: true, is_test: true, job_status: 'open', status: 'published', expires_at: FUTURE }, expected: false },
  ];

  for (const c of cases) {
    it(c.name, () => {
      assert.equal(isJobLive(c.job, NOW), c.expected);
    });
  }
});

describe('buildJobPostingSchema() live gate & validThrough guard', () => {
  const baseJob = {
    id: '00356e16-87eb-4c43-8c6e-ffd17bc66177',
    title: 'Software Engineer',
    description: 'Build reliable backend and frontend services across our cloud platform.',
    company_name: 'TalentXcel',
    location: 'Bengaluru, Karnataka, India',
    posted_at: '2026-11-01T00:00:00Z',
    is_active: true,
    job_status: 'open',
    status: 'published',
    external_url: 'https://talentxcel.in/apply/1',
  };

  it('returns null for status=expired even when is_active=true', () => {
    const schema = buildJobPostingSchema({ ...baseJob, status: 'expired', expires_at: FUTURE });
    assert.equal(schema, null);
  });

  it('returns null for past expires_at', () => {
    const schema = buildJobPostingSchema({ ...baseJob, expires_at: PAST });
    assert.equal(schema, null);
  });

  it('emits schema with future validThrough when live', () => {
    const schema = buildJobPostingSchema({ ...baseJob, expires_at: FUTURE });
    assert.ok(schema);
    assert.equal(schema.validThrough, new Date(FUTURE).toISOString());
  });

  it('never emits a past validThrough when expiry_date is past and expires_at is null', () => {
    const schema = buildJobPostingSchema({ ...baseJob, expires_at: null, expiry_date: PAST });
    assert.ok(schema);
    assert.equal(schema.validThrough, undefined);
  });
});
