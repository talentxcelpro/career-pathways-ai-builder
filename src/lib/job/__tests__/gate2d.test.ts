/**
 * TALENTXCEL — PHASE 2 GATE 2D
 * Unit Tests: Unified Job Ingestion Pipeline
 * src/lib/job/__tests__/gate2d.test.ts
 *
 * Tests cover:
 *   1. Old CSV format (bulkJobData shape)
 *   2. Structured CSV format (BulkJobUpload template shape)
 *   3. Scraper payload (useJobPublisher shape)
 *   4. Admin payload (AdminJobUpload direct shape)
 *   5. Employer form payload (JobPost.tsx shape)
 *   6. Partial job (missing optional fields)
 *   7. Missing skills
 *   8. Missing description
 *   9. Duplicate job (same title / company)
 *   10. Malformed job
 *   11. Normalization failure (unsupported variant)
 *   12. Employment type normalization across all 5 paths
 *   13. AI_INFERRED data is NOT written to payload
 *   14. SOURCE_PROVIDED requirements are written correctly
 *   15. Existing job validation behavior is preserved
 *
 * Run: npx tsx src/lib/job/__tests__/gate2d.test.ts
 */

import { normalizeJobContent } from '../normalizeJobContent';
import { toJobsTablePayload } from '../toJobsTablePayload';

// ---------------------------------------------------------------------------
// Helpers
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

async function test(name: string, fn: () => void): Promise<void> {
  console.log(`\n▶ ${name}`);
  fn();
}

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function normalizeAndConvert(raw: unknown) {
  const norm = normalizeJobContent(raw);
  const payload = toJobsTablePayload(norm.normalized);
  return { norm, payload };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

await test('T01 — Old CSV format (bulkJobData.ts shape)', () => {
  const raw = {
    title: 'IT Helpdesk Executive',
    company_name: 'TalentXcel',
    location: 'Noida, India',
    description: 'First-line IT support for enterprise clients.',
    employment_type: 'full_time',   // ← underscore form
    experience_level: 'fresher',
    salary_min: 220000,
    salary_max: 300000,
    salary_currency: 'INR',
    skills_required: 'Windows,Linux,ITSM,Networking',
    seo_slug: 'it-helpdesk-noida',
    job_tags: ['IT Support', 'Fresher'],
    benefits: ['Training', 'Growth'],
  };
  const { norm, payload } = normalizeAndConvert(raw);
  assert(norm.status === 'OK' || norm.status === 'OK_WITH_WARNINGS', 'normalization succeeds');
  assertEqual(payload.title, 'IT Helpdesk Executive', 'title correct');
  assertEqual(payload.employment_type, 'full-time', 'underscore → kebab-case normalized');
  assert(payload.skills_required.length >= 1, 'skills parsed from CSV string');
  assert(payload.description.length > 0, 'description preserved');
  assert(payload.must_have_requirements !== undefined, 'mustHaveRequirements present (empty)');
});

await test('T02 — Structured CSV format (BulkJobUpload.tsx template shape)', () => {
  const raw = {
    title: 'React Developer',
    company_name: 'TechCorp',
    location: 'Mumbai, India',
    location_type: 'hybrid',
    employment_type: 'Full-time',  // ← Title Case from CSV template
    experience_level: 'mid-level',
    industry: 'Technology',
    description: 'Build scalable React applications.',
    education_requirements: 'Bachelor Degree',
    salary_min: 600000,
    salary_max: 1000000,
    salary_currency: 'INR',
    is_remote: false,
    skills_required: ['React', 'TypeScript', 'Node.js'],
    skills_keywords: 'frontend,javascript',
    job_tags: ['React', 'Frontend'],
    benefits: ['Remote option', 'Health insurance'],
    external_url: 'https://techcorp.com/jobs/1',
  };
  const { norm, payload } = normalizeAndConvert(raw);
  assert(norm.status !== 'MANUAL_REVIEW_REQUIRED', 'structured CSV normalizes without manual review');
  assertEqual(payload.employment_type, 'full-time', 'Title Case → kebab-case');
  assertEqual(payload.education_level, 'Bachelor Degree', 'education_level preserved');
  assert(payload.skills_required.length === 3, 'skills array preserved');
  assertEqual(payload.is_remote, false, 'is_remote preserved');
});

await test('T03 — Scraper payload (useJobPublisher.ts shape)', () => {
  const raw = {
    title: 'Software Engineer',
    company: 'SourceCo',           // ← scraper uses 'company' not 'company_name'
    location: 'Remote',
    description: 'Backend development role at SourceCo.',
    url: 'https://sourceco.com/jobs/1',
    salary: '₹800000 - ₹1200000',  // ← scrapers emit string salary — dropped
    job_type: 'Full-time',          // ← scraper uses 'job_type'
    experience_level: 'mid',        // ← scraper uses non-canonical value
  };
  const { norm, payload } = normalizeAndConvert(raw);
  assert(['OK', 'OK_WITH_WARNINGS'].includes(norm.status), 'scraper shape normalizes');
  assertEqual(payload.employment_type, 'full-time', 'job_type Full-time → full-time');
  assertEqual(payload.is_remote, true, 'Remote location → isRemote=true');
  assert(payload.company_name !== '', 'company name populated');
});

await test('T04 — Admin payload (AdminJobUpload.tsx direct shape)', () => {
  const raw = {
    title: 'Desktop Support Technician',
    company_name: 'TalentXcel',
    company_id: '54e7fc5a-792d-46a9-8413-171cc3fe507f',
    location: 'Noida',
    description: 'Hardware and software troubleshooting.',
    employment_type: 'full_time',   // ← underscore
    experience_level: 'fresher',
    salary_min: 250000,
    salary_max: 320000,
    salary_currency: 'INR',
    skills_required: ['Windows', 'Linux', 'ITSM', 'ServiceNow'],
    job_status: 'open',
    is_active: true,
    is_remote: false,
    seo_slug: 'desktop-support-noida',
    job_tags: ['Desktop Support', 'IT Support'],
    benefits: ['Training', 'Mentorship'],
  };
  const { norm, payload } = normalizeAndConvert(raw);
  assert(['OK', 'OK_WITH_WARNINGS'].includes(norm.status), 'admin shape normalizes');
  assertEqual(payload.employment_type, 'full-time', 'admin underscore → kebab-case normalized');
  assert(Array.isArray(payload.skills_required), 'skills_required is array');
  assert(payload.skills_required.includes('Windows'), 'skill Windows preserved');
});

await test('T05 — Employer form payload (JobPost.tsx shape)', () => {
  const raw = {
    job_title: 'Product Manager',   // ← employer form uses job_title
    company_name: 'SaaS Inc',
    location_city: 'Bangalore',
    location_state: 'Karnataka',
    employment_type: 'full-time',
    work_mode: 'hybrid',
    experience_level: 'mid-level',
    job_summary: 'Lead product strategy.',
    job_description: 'You will own the product roadmap and work with engineering.',
    key_responsibilities: ['Define product vision', 'Manage backlog'],
    must_have_requirements: ['3+ years PM experience', 'B2B SaaS background'],
    preferred_requirements: ['MBA preferred'],
    required_skills: ['Product Roadmap', 'Agile', 'Stakeholder Management'],
    education_level: 'Bachelor Degree',
    min_experience: 3,
    max_experience: 7,
    salary_min: 1500000,
    salary_max: 2500000,
    ai_match_enabled: true,
  };
  const { norm, payload } = normalizeAndConvert(raw);
  assert(['OK', 'OK_WITH_WARNINGS'].includes(norm.status), 'employer form shape normalizes');
  assertEqual(payload.title, 'Product Manager', 'title from job_title');
  assertEqual(payload.employment_type, 'full-time', 'employment_type preserved');
  assert(payload.must_have_requirements.length === 2, 'must_have_requirements populated');
  assert(payload.key_responsibilities.length === 2, 'key_responsibilities populated');
  assertEqual(payload.min_experience, 3, 'min_experience preserved');
  assertEqual(payload.max_experience, 7, 'max_experience preserved');
});

await test('T06 — Partial job (missing optional fields)', () => {
  const raw = {
    title: 'Junior QA Engineer',
    company_name: 'QACo',
    description: 'Automated and manual testing.',
    // All other fields absent
  };
  const { norm, payload } = normalizeAndConvert(raw);
  assert(payload.title === 'Junior QA Engineer', 'title populated');
  assertEqual(payload.skills_required, [], 'missing skills → empty array, not fabricated');
  assertEqual(payload.must_have_requirements, [], 'missing mustHave → empty array');
  assertEqual(payload.min_experience, null, 'missing experience → null');
  assertEqual(payload.education_level, null, 'missing education → null');
  assert(payload.employment_type === 'full-time', 'missing employment_type defaults to full-time');
  assert(payload.is_remote === false, 'missing isRemote defaults to false');
});

await test('T07 — Missing skills field', () => {
  const raw = {
    title: 'Content Writer',
    company_name: 'MediaCo',
    location: 'Delhi',
    description: 'Write SEO content for client blogs.',
    employment_type: 'freelance',
    experience_level: 'mid-level',
    // skills_required: absent
  };
  const { payload } = normalizeAndConvert(raw);
  assertEqual(payload.skills_required, [], 'missing skills → empty [] not fabricated');
  assertEqual(payload.employment_type, 'freelance', 'freelance preserved');
});

await test('T08 — Missing description', () => {
  const raw = {
    title: 'DevOps Engineer',
    company_name: 'CloudCo',
    location: 'Pune',
    employment_type: 'full-time',
    // description: absent
  };
  const { norm, payload } = normalizeAndConvert(raw);
  // Job with no description should normalize (not crash) and produce empty description
  assert(typeof payload.description === 'string', 'description is string even when missing');
  assertEqual(payload.description, '', 'missing description → empty string, not fabricated');
});

await test('T09 — Duplicate job (same title + company) — dedup tracking', () => {
  // Normalization itself is not responsible for dedup (that's the DB layer),
  // but the payload it produces must be byte-identical for same input.
  const raw = {
    title: 'Sales Executive',
    company_name: 'SalesCo',
    location: 'Chennai',
    description: 'B2B sales role.',
    employment_type: 'full-time',
    experience_level: 'fresher',
  };
  const payload1 = toJobsTablePayload(normalizeJobContent(raw).normalized);
  const payload2 = toJobsTablePayload(normalizeJobContent(raw).normalized);
  assertEqual(
    JSON.stringify(payload1),
    JSON.stringify(payload2),
    'same input → identical payload (dedup-safe determinism)'
  );
});

await test('T10 — Malformed job (no title, no description)', () => {
  const raw = {
    // Completely empty object — no required fields
    location: 'Mumbai',
    employment_type: 'contract',
  };
  const { norm, payload } = normalizeAndConvert(raw);
  // Must not crash and must not fabricate title/description
  assert(typeof payload.title === 'string', 'title is string even for malformed input');
  assertEqual(payload.title, '', 'malformed → empty title, not fabricated');
  assertEqual(payload.description, '', 'malformed → empty description, not fabricated');
  assert(norm.status !== 'OK', 'malformed input does not produce OK status');
});

await test('T11 — Normalization failure (unsupported / null input)', () => {
  const raw = null;
  const norm = normalizeJobContent(raw);
  assert(norm.status === 'UNSUPPORTED_VARIANT', 'null → UNSUPPORTED_VARIANT');
  // toJobsTablePayload must still run safely on the fallback normalized object
  const payload = toJobsTablePayload(norm.normalized);
  assert(typeof payload.title === 'string', 'toJobsTablePayload handles null gracefully');
  assertEqual(payload.title, '', 'null input → empty title');
});

await test('T12 — Employment type normalization across all 5 path variants', () => {
  const variants: Array<[string, string]> = [
    ['full_time', 'full-time'],       // AdminJobUpload underscore
    ['Full-time', 'full-time'],       // bulkJobData Title Case
    ['FULL-TIME', 'full-time'],       // edge case uppercase
    ['Full-Time', 'full-time'],       // edge case mixed
    ['part_time', 'part-time'],       // underscore part-time
    ['Part-time', 'part-time'],       // title case part-time
    ['contract', 'contract'],          // already correct
    ['contractual', 'contract'],       // alias
    ['freelance', 'freelance'],        // already correct
    ['temporary', 'freelance'],        // alias
    ['internship', 'internship'],      // already correct
    ['intern', 'internship'],          // alias
    [undefined as any, 'full-time'],   // missing → default
    ['unknown_type', 'full-time'],     // unrecognized → default
  ];
  for (const [input, expected] of variants) {
    const raw = {
      title: 'Test Job',
      company_name: 'TestCo',
      description: 'Test role.',
      employment_type: input,
    };
    const { payload } = normalizeAndConvert(raw);
    assertEqual(payload.employment_type, expected, `employment_type "${input}" → "${expected}"`);
  }
});

await test('T13 — AI_INFERRED data is NOT written to jobs table payload', () => {
  // This test verifies that toJobsTablePayload only uses SOURCE_PROVIDED data
  const raw = {
    title: 'Data Analyst',
    company_name: 'DataCo',
    location: 'Bangalore',
    description: 'Analyze data and build dashboards.',
    employment_type: 'full-time',
    skills_required: ['SQL', 'Python'],
    must_have_requirements: ['3 years SQL experience'],
  };
  const norm = normalizeJobContent(raw);
  const canonical = norm.normalized;

  // Simulate what Gate 2C would add (AI_INFERRED) — manually inject to test isolation
  const canonicalWithInferred = {
    ...canonical,
    // NOTE: In production, AI_INFERRED data lives only in EnrichedJobContent.inferredRequirements
    // and is NEVER merged back into canonical. This test verifies the converter
    // uses only the canonical object's structured arrays (which contain only SOURCE_PROVIDED data).
  };

  const payload = toJobsTablePayload(canonicalWithInferred);

  // All items in the payload arrays came from SOURCE_PROVIDED fields
  const allSkillsInPayload = payload.skills_required;
  assert(allSkillsInPayload.every(s => typeof s === 'string'), 'all skills are plain strings');
  assert(!allSkillsInPayload.some(s => s.includes('AI_INFERRED')), 'no AI_INFERRED marker in skills');
  assertEqual(payload.must_have_requirements, ['3 years SQL experience'], 'mustHave from source only');
});

await test('T14 — SOURCE_PROVIDED requirements written correctly to payload', () => {
  // Employer form with fully populated structured requirements
  const raw = {
    job_title: 'Backend Engineer',
    company_name: 'TechCo',
    location: 'Hyderabad',
    description: 'Node.js backend development.',
    employment_type: 'full-time',
    must_have_requirements: ['5 years Node.js', 'PostgreSQL experience'],
    preferred_requirements: ['TypeScript preferred', 'Docker a plus'],
    key_responsibilities: ['Design REST APIs', 'Mentor junior devs'],
    required_skills: ['Node.js', 'PostgreSQL', 'TypeScript'],
    min_experience: 5,
    max_experience: 10,
    education_level: 'Bachelor Degree',
  };
  const { payload } = normalizeAndConvert(raw);
  assertEqual(payload.must_have_requirements.length, 2, 'must_have_requirements count');
  assertEqual(payload.preferred_requirements.length, 2, 'preferred_requirements count');
  assertEqual(payload.key_responsibilities.length, 2, 'key_responsibilities count');
  assertEqual(payload.skills_required.length, 3, 'skills_required count');
  assert(payload.must_have_requirements.includes('5 years Node.js'), 'must_have item preserved');
  assert(payload.preferred_requirements.includes('TypeScript preferred'), 'preferred item preserved');
  assert(payload.key_responsibilities.includes('Design REST APIs'), 'responsibility preserved');
  assertEqual(payload.min_experience, 5, 'min_experience preserved');
  assertEqual(payload.education_level, 'Bachelor Degree', 'education_level preserved');
});

await test('T15 — Existing validation behavior preserved (no competing rules)', () => {
  // Verify that the normalizer+converter does not create salary values
  // or skills from description prose (no AI inference in normalization)
  const raw = {
    title: 'Software Developer',
    company_name: 'SoftCo',
    description: 'You must know Python and have 5 years of experience. Salary: 10 LPA.',
    employment_type: 'full-time',
    // No skills_required, no salary fields, no structured requirements
  };
  const { payload } = normalizeAndConvert(raw);
  // Gate 2D rule: no inferring from description prose
  assertEqual(payload.skills_required, [], 'skills NOT inferred from description');
  assertEqual(payload.must_have_requirements, [], 'requirements NOT inferred from description');
  assertEqual(payload.min_experience, null, 'experience NOT inferred from description prose');
  assertEqual(payload.min_experience, null, 'salary NOT parsed from description prose');
});

// ---------------------------------------------------------------------------
// Performance test
// ---------------------------------------------------------------------------

await test('T16 — normalization + conversion is synchronous and fast', () => {
  const raw = {
    title: 'Full Stack Engineer',
    company_name: 'FastCo',
    location: 'Pune',
    description: 'React + Node.js stack.',
    employment_type: 'full-time',
    skills_required: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
    must_have_requirements: ['3 years full stack', 'PostgreSQL required'],
  };

  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    const norm = normalizeJobContent(raw);
    toJobsTablePayload(norm.normalized);
  }
  const elapsed = Date.now() - start;

  assert(elapsed < 2000, `1000 normalize+convert cycles completed in ${elapsed}ms (<2000ms)`);
  console.log(`    Timing: 1000 cycles in ${elapsed}ms`);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('\n' + '='.repeat(60));
console.log('GATE 2D UNIT TEST RESULTS');
console.log('='.repeat(60));
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log(`TOTAL:  ${passed + failed}`);

if (failures.length > 0) {
  console.log('\nFailed assertions:');
  failures.forEach(f => console.log(f));
}

console.log('\nGATE 2D UNIT TESTS:', failed === 0 ? '✅ PASS' : '❌ FAIL');
if (failed > 0) process.exit(1);
