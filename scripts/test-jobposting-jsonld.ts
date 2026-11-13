// scripts/test-jobposting-jsonld.ts
// Automated Tests for JobPosting JSON-LD Schema
// Required fields, description fidelity, date validation, and salary unit compliance

import { buildJobPostingSchema, RawJobData } from '../src/lib/seo/jobPostingSchema';
import { validateJobPosting, checkSchemaContentConsistency } from '../src/lib/seo/jobPostingValidator';

const VALID_CURRENCIES = new Set(['INR', 'USD', 'AED', 'SAR', 'QAR', 'OMR', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD']);
const VALID_UNITS = new Set(['YEAR', 'MONTH', 'WEEK', 'DAY', 'HOUR']);

export function runJobPostingJsonLdTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(testName: string, condition: boolean, detail?: string) {
    if (condition) {
      passed++;
    } else {
      failed++;
      errors.push(`FAIL: ${testName} - ${detail || 'Assertion failed'}`);
    }
  }

  // --- TEST 1: Required Fields Enforcement ---
  const validJob: RawJobData = {
    id: 'test-job-001',
    title: 'Senior Distributed Systems Engineer',
    company_name: 'Stripe Global',
    location: 'Bangalore, Karnataka, India',
    location_city: 'Bangalore',
    posted_at: '2026-10-01T08:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    description: 'We are seeking an experienced distributed systems engineer to scale our global core transaction pipeline.',
    employment_type: 'Full-time',
    salary_min: 3500000,
    salary_max: 5500000,
    salary_currency: 'INR',
    is_active: true,
    external_url: 'https://stripe.com/careers/test-job-001'
  };

  const schema = buildJobPostingSchema(validJob);
  assert('Schema is generated for valid job', schema !== null);
  if (schema) {
    assert('Schema has valid context', schema['@context'] === 'https://schema.org/' || schema['@context'] === 'https://schema.org');
    assert('Schema type is JobPosting', schema['@type'] === 'JobPosting');
    assert('Required field: title', typeof schema.title === 'string' && schema.title.length >= 3);
    assert('Required field: description', typeof schema.description === 'string' && schema.description.length >= 30);
    assert('Required field: hiringOrganization.name', typeof schema.hiringOrganization?.name === 'string' && schema.hiringOrganization.name.length >= 2);
    assert('Required field: datePosted', /^\d{4}-\d{2}-\d{2}/.test(schema.datePosted));
    assert('Required field: jobLocation or TELECOMMUTE', !!schema.jobLocation || schema.jobLocationType === 'TELECOMMUTE');
  }

  // --- TEST 2: Description Matches Visible Text (No Fabrication) ---
  assert('Description matches raw job description', schema?.description === validJob.description);
  assert('Schema content consistency check passes', checkSchemaContentConsistency(validJob, schema!));

  const tamperedSchema = { ...schema, title: 'Completely Different Title' };
  assert('Consistency validator rejects mismatched title', !checkSchemaContentConsistency(validJob, tamperedSchema));

  // --- TEST 3: Date Validation (Valid ISO, no future fabrication, validThrough >= datePosted) ---
  const postedDate = new Date(schema?.datePosted);
  assert('datePosted is valid parseable date', !isNaN(postedDate.getTime()));

  if (schema?.validThrough) {
    const expiryDate = new Date(schema.validThrough);
    assert('validThrough is valid parseable date', !isNaN(expiryDate.getTime()));
    assert('validThrough is after or equal to datePosted', expiryDate.getTime() >= postedDate.getTime());
  }

  // Test that missing posted_at causes validation to fail-closed
  const jobWithoutDate: RawJobData = {
    ...validJob,
    id: 'test-job-no-date',
    posted_at: null,
    date_posted: null,
    source_posted_at: null
  };
  const validationNoDate = validateJobPosting(jobWithoutDate);
  assert('Validator rejects job without posted_at', !validationNoDate.isGoogleEligible);
  assert('buildJobPostingSchema returns null when posted_at is missing (Adjustment 5)', buildJobPostingSchema(jobWithoutDate) === null);

  // --- TEST 4: Salary Units & Currency Compliance ---
  if (schema?.baseSalary) {
    const salary = schema.baseSalary;
    assert('Salary has MonetaryAmount type', salary['@type'] === 'MonetaryAmount');
    assert('Salary currency is valid 3-letter ISO code', VALID_CURRENCIES.has(salary.currency));
    assert('Salary value exists', typeof salary.value === 'object' && salary.value !== null);
    assert('Salary unitText is valid (YEAR/MONTH/HOUR)', VALID_UNITS.has(salary.value.unitText));
    assert('Salary minValue > 0', salary.value.minValue > 0);
    assert('Salary maxValue >= minValue', salary.value.maxValue >= salary.value.minValue);
  }

  // --- TEST 5: International Currency & UAE/US Role Compliance ---
  const uaeJob: RawJobData = {
    ...validJob,
    id: 'test-uae-001',
    location: 'Dubai, United Arab Emirates',
    location_city: 'Dubai',
    salary_currency: 'AED',
    salary_min: 240000,
    salary_max: 360000
  };
  const uaeSchema = buildJobPostingSchema(uaeJob);
  assert('UAE job schema generates successfully', uaeSchema !== null);
  if (uaeSchema?.baseSalary) {
    assert('UAE salary currency is AED', uaeSchema.baseSalary.currency === 'AED');
    assert('UAE salary unitText is YEAR', uaeSchema.baseSalary.value.unitText === 'YEAR');
  }

  const usJob: RawJobData = {
    ...validJob,
    id: 'test-us-001',
    location: 'San Francisco, CA, United States',
    location_city: 'San Francisco',
    salary_currency: 'USD',
    salary_min: 140000,
    salary_max: 190000
  };
  const usSchema = buildJobPostingSchema(usJob);
  assert('US job schema generates successfully', usSchema !== null);
  if (usSchema?.baseSalary) {
    assert('US salary currency is USD', usSchema.baseSalary.currency === 'USD');
    assert('US salary unitText is YEAR', usSchema.baseSalary.value.unitText === 'YEAR');
  }

  // --- TEST 6: Expired / Inactive Job Fail-Closed Policy (Adjustment 4) ---
  const inactiveJob: RawJobData = {
    ...validJob,
    id: 'test-inactive-001',
    is_active: false
  };
  assert('Inactive job is not Google eligible', !validateJobPosting(inactiveJob).isGoogleEligible);
  assert('Inactive job generates null schema (no stale indexing)', buildJobPostingSchema(inactiveJob) === null);

  const closedStatusJob: RawJobData = {
    ...validJob,
    id: 'test-closed-001',
    job_status: 'closed'
  };
  assert('Closed job is not Google eligible', !validateJobPosting(closedStatusJob).isGoogleEligible);
  assert('Closed job generates null schema', buildJobPostingSchema(closedStatusJob) === null);

  return { passed, failed, errors };
}

// Execute standalone if called directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('test-jobposting-jsonld')) {
  console.log('Running automated JobPosting JSON-LD test suite...');
  const result = runJobPostingJsonLdTests();
  console.log(`Passed: ${result.passed}`);
  console.log(`Failed: ${result.failed}`);
  if (result.failed > 0) {
    console.error('Test Failures:');
    result.errors.forEach(e => console.error(' ', e));
    process.exit(1);
  } else {
    console.log('✅ ALL JobPosting JSON-LD tests passed!');
  }
}
