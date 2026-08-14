/**
 * TALENTXCEL — PHASE 2 GATE 2B
 * Unit Tests: normalizeJobContent
 *
 * Self-contained Node.js test runner. No external test framework required.
 * Run with:   npx tsx src/lib/job/__tests__/normalizeJobContent.test.ts
 *
 * Tests:
 *  T01  CSV-shaped job
 *  T02  Scraper-shaped job
 *  T03  Admin-shaped job
 *  T04  Employer-form-shaped job
 *  T05  Existing jobs-table-shaped record
 *  T06  Null / undefined input
 *  T07  Partial job
 *  T08  Skills as array
 *  T09  Skills as delimited string (comma, semicolon, pipe)
 *  T10  Missing requirements (defaults to empty arrays without fabricating)
 *  T11  Numeric experience (min/max as numbers)
 *  T12  Numeric-string experience ("3" -> 3)
 *  T13  Missing education (defaults to null)
 *  T14  Duplicate requirements (case-insensitive deduplication check)
 *  T15  Input object non-mutation check
 *  T16  Malformed root input (number/boolean)
 *  T17  Experience level string preserved without creating fake numbers
 *  T18  Coalesce job_title when title is missing
 *  T19  Coalesce company when company_name is missing
 *  T20  Remote location detection from location string
 *  T21  Provenance tag verification (source: SOURCE_PROVIDED, confidence: HIGH)
 *  T22  Object array skills handling
 *  T23  Employment type normalization ("full_time" -> "full-time")
 *  T24  Whitespace-heavy delimited string handling
 *  T25  Zero LLM / zero AI inference verification (no fabricated fields)
 */

import {
  normalizeJobContent,
  JobNormalizationResult,
} from '../normalizeJobContent';

// ---------------------------------------------------------------------------
// Minimal assertion helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    failed++;
    failures.push(`  FAIL: ${message}`);
    console.error(`  ✗  ${message}`);
  } else {
    passed++;
    console.log(`  ✓  ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  assert(ok, `${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertNoThrow(fn: () => void, label: string): void {
  try {
    fn();
    passed++;
    console.log(`  ✓  ${label}`);
  } catch (err) {
    failed++;
    failures.push(`  FAIL: ${label} threw ${err}`);
    console.error(`  ✗  ${label} threw: ${err}`);
  }
}

function test(name: string, fn: () => void): void {
  console.log(`\n▶ ${name}`);
  fn();
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CSV_JOB_RAW = {
  title: 'SEO Content Writer',
  company_name: 'TalentXcel Services',
  location: 'Noida, India',
  description: 'Looking for a skilled content writer with SEO expertise.',
  employment_type: 'full_time',
  experience_level: 'fresher',
  salary_min: 250000,
  salary_max: 350000,
  skills_required: 'SEO, Content Writing, Copywriting|Blogging; Editorial',
  batchName: 'Multi-City Batch',
};

const SCRAPER_JOB_RAW = {
  title: 'React Developer',
  company: 'TechCorp',
  location: 'Remote',
  description: 'Build modern user interfaces with React and TypeScript.',
  job_type: 'contract',
  experience_level: 'mid',
  url: 'https://example.com/job/123',
  salary: '₹12,000,000',
};

const ADMIN_JOB_RAW = {
  title: 'IT Operations Associate',
  company_name: 'TalentXcel',
  location: 'Mumbai',
  description: 'Monitor IT operations and assist enterprise users.',
  employment_type: 'full_time',
  experience_level: 'fresher',
  skills_required: ['Linux', 'Windows', 'ITSM', 'Networking'],
  job_tags: ['IT Support', 'Fresher'],
  benefits: ['Mentorship', 'Health Insurance'],
  posted_by: 'user-uuid-123',
};

const EMPLOYER_FORM_RAW = {
  job_title: 'Product Manager',
  company_name: 'SaaS Inc',
  location: 'Bangalore',
  description: 'Lead product roadmap for enterprise SaaS products.',
  job_type: 'full-time',
  experience_level: 'senior-level',
};

const JOBS_TABLE_RAW = {
  id: 'job-uuid-999',
  title: 'Senior Full Stack Engineer',
  company_name: 'Global Tech',
  location: 'Hyderabad',
  description: 'Architect scalable web applications.',
  skills_required: ['Node.js', 'React', 'PostgreSQL'],
  must_have_requirements: ['5+ years JS experience', 'BSc Computer Science'],
  nice_to_have: ['AWS Certification', 'Docker'],
  key_responsibilities: ['Design REST APIs', 'Lead sprint planning'],
  min_experience: 5,
  max_experience: 8,
  education_level: 'Bachelor Degree',
  employment_type: 'full-time',
  is_remote: true,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('T01 — CSV-shaped job normalization', () => {
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(CSV_JOB_RAW); }, 'does not throw');
  assertEqual(res.normalized.title, 'SEO Content Writer', 'title');
  assertEqual(res.normalized.companyName, 'TalentXcel Services', 'companyName');
  assertEqual(res.normalized.skillsRequired.length, 5, 'parsed delimited skills: 5 skills');
  assertEqual(res.normalized.skillsRequired[0].text, 'SEO', 'first skill text');
  assertEqual(res.variantDetected.includes('BULK_CSV'), true, 'variant CSV detected');
});

test('T02 — Scraper-shaped job normalization', () => {
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(SCRAPER_JOB_RAW); }, 'does not throw');
  assertEqual(res.normalized.title, 'React Developer', 'title');
  assertEqual(res.normalized.companyName, 'TechCorp', 'company from company property');
  assertEqual(res.normalized.isRemote, true, 'isRemote derived from location "Remote"');
  assertEqual(res.variantDetected.includes('SCRAPER'), true, 'variant Scraper detected');
});

test('T03 — Admin-shaped job normalization', () => {
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(ADMIN_JOB_RAW); }, 'does not throw');
  assertEqual(res.normalized.title, 'IT Operations Associate', 'title');
  assertEqual(res.normalized.skillsRequired.length, 4, 'skills from array');
  assertEqual(res.normalized.skillsRequired[0].text, 'Linux', 'first skill');
  assertEqual(res.variantDetected.includes('ADMIN_UPLOAD'), true, 'variant Admin detected');
});

test('T04 — Employer-form-shaped job normalization', () => {
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(EMPLOYER_FORM_RAW); }, 'does not throw');
  assertEqual(res.normalized.title, 'Product Manager', 'title from job_title');
  assertEqual(res.normalized.companyName, 'SaaS Inc', 'companyName');
  assertEqual(res.normalized.employmentType, 'full-time', 'employmentType');
  assertEqual(res.variantDetected.includes('EMPLOYER_FORM'), true, 'variant Employer form detected');
});

test('T05 — Existing jobs-table-shaped record normalization', () => {
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(JOBS_TABLE_RAW); }, 'does not throw');
  assertEqual(res.normalized.id, 'job-uuid-999', 'id preserved');
  assertEqual(res.normalized.mustHaveRequirements.length, 2, 'mustHaveRequirements parsed');
  assertEqual(res.normalized.niceToHave.length, 2, 'niceToHave parsed');
  assertEqual(res.normalized.keyResponsibilities.length, 2, 'keyResponsibilities parsed');
  assertEqual(res.normalized.minExperience, 5, 'minExperience parsed');
  assertEqual(res.normalized.maxExperience, 8, 'maxExperience parsed');
  assertEqual(res.normalized.educationLevel, 'Bachelor Degree', 'educationLevel parsed');
  assertEqual(res.normalized.isRemote, true, 'isRemote boolean preserved');
  assertEqual(res.variantDetected.includes('JOBS_TABLE'), true, 'variant Jobs Table detected');
});

test('T06 — Null and undefined input', () => {
  let resNull!: JobNormalizationResult;
  let resUndef!: JobNormalizationResult;
  assertNoThrow(() => { resNull = normalizeJobContent(null); }, 'null does not throw');
  assertNoThrow(() => { resUndef = normalizeJobContent(undefined); }, 'undefined does not throw');

  assertEqual(resNull.status, 'UNSUPPORTED_VARIANT', 'null status');
  assertEqual(resNull.normalized.title, '', 'empty title for null');
  assertEqual(resUndef.status, 'UNSUPPORTED_VARIANT', 'undefined status');
});

test('T07 — Partial job (only title and company)', () => {
  const raw = { title: 'Junior QA Engineer', company_name: 'TestLabs' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.title, 'Junior QA Engineer', 'title');
  assertEqual(res.normalized.skillsRequired.length, 0, 'skills empty');
  assertEqual(res.normalized.mustHaveRequirements.length, 0, 'mustHave empty');
  assertEqual(res.normalized.minExperience, null, 'minExperience null');
});

test('T08 — Skills as array of strings', () => {
  const raw = { title: 'Dev', company_name: 'Co', skills_required: ['Python', 'Django', 'REST'] };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.skillsRequired.length, 3, 'three skills');
  assertEqual(res.normalized.skillsRequired[0].text, 'Python', 'first skill');
});

test('T09 — Skills as delimited string (comma, semicolon, pipe)', () => {
  const raw = { title: 'Dev', company_name: 'Co', skills_required: 'Python, Django; REST|Docker' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.skillsRequired.length, 4, 'four skills');
  assertEqual(res.normalized.skillsRequired[3].text, 'Docker', 'fourth skill');
});

test('T10 — Missing requirements default to [] without fabricating', () => {
  const raw = { title: 'Designer', company_name: 'DesignCo', description: 'Create UI designs.' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.mustHaveRequirements, [], 'mustHave empty array');
  assertEqual(res.normalized.niceToHave, [], 'niceToHave empty array');
  assertEqual(res.normalized.keyResponsibilities, [], 'responsibilities empty array');
});

test('T11 — Numeric experience (min/max as numbers)', () => {
  const raw = { title: 'Lead', company_name: 'Co', min_experience: 3, max_experience: 6 };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.minExperience, 3, 'minExperience=3');
  assertEqual(res.normalized.maxExperience, 6, 'maxExperience=6');
});

test('T12 — Numeric-string experience ("3" -> 3)', () => {
  const raw = { title: 'Lead', company_name: 'Co', min_experience: '3', max_experience: '6 years' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.minExperience, 3, 'minExperience parsed from "3"');
  assertEqual(res.normalized.maxExperience, 6, 'maxExperience parsed from "6 years"');
});

test('T13 — Missing education defaults to null', () => {
  const raw = { title: 'Dev', company_name: 'Co' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.educationLevel, null, 'educationLevel is null');
});

test('T14 — Duplicate requirements deduplication check', () => {
  const raw = {
    title: 'Dev',
    company_name: 'Co',
    skills_required: ['React', 'react', 'REACT', 'TypeScript'],
    must_have_requirements: ['5 years experience', '5 Years Experience'],
  };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.skillsRequired.length, 2, 'skills deduplicated from 4 to 2');
  assertEqual(res.normalized.mustHaveRequirements.length, 1, 'mustHave deduplicated from 2 to 1');
});

test('T15 — Input object non-mutation check', () => {
  const original = JSON.parse(JSON.stringify(CSV_JOB_RAW));
  const snapshot = JSON.stringify(CSV_JOB_RAW);
  normalizeJobContent(CSV_JOB_RAW);
  assertEqual(JSON.stringify(CSV_JOB_RAW), snapshot, 'raw input object untouched');
  void original;
});

test('T16 — Malformed root input (number/boolean)', () => {
  let resNum!: JobNormalizationResult;
  let resBool!: JobNormalizationResult;
  assertNoThrow(() => { resNum = normalizeJobContent(12345 as any); }, 'number does not throw');
  assertNoThrow(() => { resBool = normalizeJobContent(true as any); }, 'boolean does not throw');
  assertEqual(resNum.status, 'MANUAL_REVIEW_REQUIRED', 'number status');
  assertEqual(resBool.status, 'MANUAL_REVIEW_REQUIRED', 'boolean status');
});

test('T17 — Experience level string preserved without creating fake numeric experience', () => {
  const raw = { title: 'Junior Dev', company_name: 'Co', experience_level: 'fresher' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.experienceLevel, 'fresher', 'experienceLevel string preserved');
  assertEqual(res.normalized.minExperience, null, 'minExperience remains null (no fake number created)');
});

test('T18 — Coalesce job_title when title is missing', () => {
  const raw = { job_title: 'Architect', company_name: 'Co' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.title, 'Architect', 'title coalesced from job_title');
});

test('T19 — Coalesce company when company_name is missing', () => {
  const raw = { title: 'Architect', company: 'GlobalCorp' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.companyName, 'GlobalCorp', 'companyName coalesced from company');
});

test('T20 — Remote location detection from location string', () => {
  const raw = { title: 'Dev', company_name: 'Co', location: 'Remote, India' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.isRemote, true, 'isRemote true from location string');
});

test('T21 — Provenance tag verification (source: SOURCE_PROVIDED, confidence: HIGH)', () => {
  const raw = { title: 'Dev', company_name: 'Co', skills_required: ['React'] };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  const skill = res.normalized.skillsRequired[0];
  assertEqual(skill.source, 'SOURCE_PROVIDED', 'provenance source');
  assertEqual(skill.confidence, 'HIGH', 'provenance confidence');
});

test('T22 — Object array skills handling', () => {
  const raw = {
    title: 'Dev',
    company_name: 'Co',
    skills_required: [{ text: 'Python' }, { name: 'Django' }, { title: 'SQL' }],
  };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw as any); }, 'does not throw');
  assertEqual(res.normalized.skillsRequired.length, 3, 'three object skills parsed');
  assertEqual(res.normalized.skillsRequired[0].text, 'Python', 'first text');
  assertEqual(res.normalized.skillsRequired[1].text, 'Django', 'second text');
});

test('T23 — Employment type normalization ("full_time" -> "full-time")', () => {
  const raw = { title: 'Dev', company_name: 'Co', employment_type: 'full_time' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.employmentType, 'full-time', 'normalized to full-time');
});

test('T24 — Whitespace-heavy delimited string handling', () => {
  const raw = { title: 'Dev', company_name: 'Co', skills_required: '  React  ,   Node.js   |  PostgreSQL  ' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.skillsRequired[0].text, 'React', 'first trimmed skill');
  assertEqual(res.normalized.skillsRequired[1].text, 'Node.js', 'second trimmed skill');
  assertEqual(res.normalized.skillsRequired[2].text, 'PostgreSQL', 'third trimmed skill');
});

test('T25 — Zero LLM / zero AI inference verification', () => {
  const raw = { title: 'Data Scientist', company_name: 'AI Co', description: 'Requires PhD in ML and 5 years Python.' };
  let res!: JobNormalizationResult;
  assertNoThrow(() => { res = normalizeJobContent(raw); }, 'does not throw');
  assertEqual(res.normalized.educationLevel, null, 'educationLevel NOT inferred from description prose');
  assertEqual(res.normalized.minExperience, null, 'minExperience NOT inferred from description prose');
  assertEqual(res.normalized.mustHaveRequirements.length, 0, 'mustHave NOT inferred from description prose');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log(`GATE 2B UNIT TEST RESULTS`);
console.log('='.repeat(60));
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log(`TOTAL:  ${passed + failed}`);

if (failures.length > 0) {
  console.log('\nFailed assertions:');
  failures.forEach(f => console.log(f));
}

console.log('\nGATE 2B UNIT TESTS:', failed === 0 ? '✅ PASS' : '❌ FAIL');

if (failed > 0) {
  process.exit(1);
}
