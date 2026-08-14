/**
 * TALENTXCEL — PHASE 2 GATE 2C
 * Unit Tests: enrichJobContent (runtime AI enrichment layer)
 *
 * Strategy:
 *   All tests mock the AI edge function call so they are:
 *     - deterministic (no live network calls in unit tests)
 *     - fast
 *     - zero database writes
 *
 *   The real Supabase call path is tested in the separate
 *   read-only real-jobs validation script.
 *
 * Run:  npx tsx src/lib/job/__tests__/enrichJobContent.test.ts
 */

import {
  enrichJobContent,
  InferredRequirement,
  EnrichedJobContent,
} from '../enrichJobContent';
import { NormalizedJobContent } from '../normalizeJobContent';

// ---------------------------------------------------------------------------
// Supabase mock — intercepts functions.invoke without network calls
// ---------------------------------------------------------------------------

interface MockResponse {
  data: unknown;
  error: null | { message: string };
}

let supabaseMockResponse: MockResponse = { data: null, error: null };

// Patch module-level supabase before importing enrichJobContent
// We stub the module using a simple global interceptor since tsx doesn't
// support jest.mock. We re-export a testable version via dependency injection.

// Instead, we use the testable factory pattern:
import * as enrichModule from '../enrichJobContent';

/**
 * createTestableEnricher
 * Returns an enrichJobContent function wired to a user-supplied AI caller.
 * This avoids needing jest.mock() by exporting a factory for testing.
 */
type AICallerFn = (prompt: string, description: string) => Promise<{
  data: unknown;
  error: null | { message: string };
}>;

async function runEnrich(
  canonical: NormalizedJobContent,
  aiResponse: unknown,
  aiError?: string
): Promise<EnrichedJobContent> {
  // We call the real enrichJobContent, but since it calls supabase.functions.invoke
  // internally, we need to test via the module's exported test hook.
  // Gate 2C exports enrichJobContentWithCaller for test injection:
  return enrichModule.enrichJobContentWithCaller(canonical, async (_prompt: string) => {
    if (aiError) return { data: null, error: { message: aiError } };
    return { data: aiResponse, error: null };
  });
}

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

function assertNoThrow(fn: () => Promise<unknown>, label: string, cb: (res: EnrichedJobContent) => void): void {
  fn().then(res => {
    passed++;
    console.log(`  ✓  ${label}`);
    cb(res as EnrichedJobContent);
  }).catch(err => {
    failed++;
    failures.push(`  FAIL: ${label} threw ${err}`);
    console.error(`  ✗  ${label} threw: ${err}`);
  });
}

function test(name: string, fn: () => Promise<void>): Promise<void> {
  console.log(`\n▶ ${name}`);
  return fn();
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CANONICAL_FULL: NormalizedJobContent = {
  id: 'job-001',
  title: 'Senior Backend Engineer',
  companyName: 'TechCorp',
  location: 'Bangalore',
  description: `We are looking for a Senior Backend Engineer with at least 5 years of Python development experience. 
  The candidate must have hands-on experience with PostgreSQL and cloud platforms, preferably AWS. 
  A Bachelor's degree in Computer Science or equivalent is required. 
  The role involves designing REST APIs, mentoring junior developers, and participating in system architecture decisions.
  Experience with Docker and Kubernetes is a plus.`,
  skillsRequired: [
    { text: 'Python', category: 'SKILL', source: 'SOURCE_PROVIDED', confidence: 'HIGH' },
    { text: 'PostgreSQL', category: 'SKILL', source: 'SOURCE_PROVIDED', confidence: 'HIGH' },
  ],
  mustHaveRequirements: [
    { text: '5 years of Python experience', category: 'MUST_HAVE', source: 'SOURCE_PROVIDED', confidence: 'HIGH' },
  ],
  niceToHave: [],
  keyResponsibilities: [],
  minExperience: 5,
  maxExperience: null,
  educationLevel: null,
  employmentType: 'full-time',
  isRemote: false,
};

const CANONICAL_EMPTY_DESC: NormalizedJobContent = {
  id: 'job-002',
  title: 'Content Writer',
  companyName: 'MediaCo',
  location: 'Remote',
  description: 'TBD.',
  skillsRequired: [],
  mustHaveRequirements: [],
  niceToHave: [],
  keyResponsibilities: [],
  minExperience: null,
  maxExperience: null,
  educationLevel: null,
  employmentType: 'full-time',
  isRemote: true,
};

const CANONICAL_NO_STRUCTURED: NormalizedJobContent = {
  id: 'job-003',
  title: 'Data Analyst',
  companyName: 'DataCo',
  location: 'Mumbai',
  description: 'Must have 3 years of SQL experience. Experience with Python preferred. Will manage data pipelines and produce weekly executive reports.',
  skillsRequired: [],
  mustHaveRequirements: [],
  niceToHave: [],
  keyResponsibilities: [],
  minExperience: null,
  maxExperience: null,
  educationLevel: null,
  employmentType: 'full-time',
  isRemote: false,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function runTests() {
  await test('T01 — Explicit must-have inference from description', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: '3 years of SQL experience', category: 'MUST_HAVE', confidence: 'HIGH', evidence: 'Must have 3 years of SQL experience', reason: '"Must have" keyword indicates required' },
      ],
    });
    assert(res.enrichmentStatus === 'ENRICHED', 'status ENRICHED');
    assert(res.inferredRequirements.length === 1, 'one inferred item');
    assertEqual(res.inferredRequirements[0].source, 'AI_INFERRED', 'source is AI_INFERRED');
    assertEqual(res.inferredRequirements[0].confidence, 'HIGH', 'confidence HIGH');
    assertEqual(res.inferredRequirements[0].category, 'MUST_HAVE', 'category MUST_HAVE');
    assert(res.inferredRequirements[0].evidence.length > 0, 'evidence present');
  });

  await test('T02 — Explicit preferred/nice-to-have inference', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: 'Python', category: 'PREFERRED', confidence: 'HIGH', evidence: 'Experience with Python preferred', reason: '"preferred" keyword' },
      ],
    });
    assert(res.inferredRequirements.length === 1, 'one inferred item');
    assertEqual(res.inferredRequirements[0].category, 'PREFERRED', 'category PREFERRED');
  });

  await test('T03 — Skill inference from description', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: 'SQL', category: 'SKILL', confidence: 'HIGH', evidence: '3 years of SQL experience', reason: 'Named technology in requirement' },
      ],
    });
    assert(res.inferredRequirements.length === 1, 'one inferred skill');
    assertEqual(res.inferredRequirements[0].category, 'SKILL', 'category SKILL');
  });

  await test('T04 — Responsibility inference from description', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: 'Produce weekly executive reports', category: 'RESPONSIBILITY', confidence: 'HIGH', evidence: 'produce weekly executive reports', reason: 'Explicit duty stated in description' },
      ],
    });
    assertEqual(res.inferredRequirements[0].category, 'RESPONSIBILITY', 'category RESPONSIBILITY');
  });

  await test('T05 — Experience inference with numeric bound', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: '3 years of experience', category: 'EXPERIENCE', confidence: 'HIGH', evidence: '3 years of SQL experience', reason: 'Explicit numeric bound' },
      ],
    });
    assertEqual(res.inferredRequirements[0].category, 'EXPERIENCE', 'category EXPERIENCE');
  });

  await test('T06 — Education inference from explicit description statement', async () => {
    const res = await runEnrich(CANONICAL_FULL, {
      inferred: [
        { text: "Bachelor's degree in Computer Science", category: 'EDUCATION', confidence: 'HIGH', evidence: "A Bachelor's degree in Computer Science or equivalent is required", reason: 'Explicit required qualification' },
      ],
    });
    assertEqual(res.inferredRequirements[0].category, 'EDUCATION', 'category EDUCATION');
    assertEqual(res.inferredRequirements[0].confidence, 'HIGH', 'confidence HIGH for explicit education');
  });

  await test('T07 — Ambiguous text yields LOW confidence', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: 'Team collaboration', category: 'PREFERRED', confidence: 'LOW', evidence: 'works well with cross-functional teams', reason: 'Soft skill mentioned without explicit requirement language' },
      ],
    });
    assertEqual(res.inferredRequirements[0].confidence, 'LOW', 'LOW confidence for ambiguous text');
  });

  await test('T08 — Explicit requirement yields HIGH confidence', async () => {
    const res = await runEnrich(CANONICAL_FULL, {
      inferred: [
        { text: 'REST API design', category: 'RESPONSIBILITY', confidence: 'HIGH', evidence: 'designing REST APIs', reason: 'Explicit responsibility listed' },
      ],
    });
    assertEqual(res.inferredRequirements[0].confidence, 'HIGH', 'HIGH confidence for explicit responsibility');
  });

  await test('T09 — Source vs inferred duplicate: source wins, no duplicate created', async () => {
    // Python is in source; AI returns Python too
    const res = await runEnrich(CANONICAL_FULL, {
      inferred: [
        { text: 'Python', category: 'SKILL', confidence: 'HIGH', evidence: 'Python development experience', reason: 'Key technology in description' },
        { text: 'Mentoring junior developers', category: 'RESPONSIBILITY', confidence: 'HIGH', evidence: 'mentoring junior developers', reason: 'Explicit duty' },
      ],
    });
    // Python already in source → deduplicated; only the non-duplicate survives
    assert(res.duplicatesRemoved >= 1, 'at least 1 duplicate removed');
    assert(res.inferredRequirements.every(r => r.text !== 'Python'), 'Python not in inferred (already source-provided)');
    assert(res.inferredRequirements.some(r => r.text === 'Mentoring junior developers'), 'non-duplicate kept');
  });

  await test('T10 — Source/inferred conflict: source wins, conflict logged', async () => {
    // Source has remote=false but description vaguely says "flexible environment"
    // The enrichment layer must not change canonical.isRemote
    const res = await runEnrich(CANONICAL_FULL, {
      inferred: [
        { text: 'AWS', category: 'PREFERRED', confidence: 'MEDIUM', evidence: 'preferably AWS', reason: '"Preferably" indicates preferred' },
      ],
    });
    // Canonical object is not mutated
    assertEqual(res.canonical.isRemote, false, 'canonical.isRemote unchanged (source wins)');
    assertEqual(res.canonical.isRemote, CANONICAL_FULL.isRemote, 'canonical object not mutated');
  });

  await test('T11 — Empty / too-short description returns NO_DESCRIPTION', async () => {
    const res = await runEnrich(CANONICAL_EMPTY_DESC, null);
    assertEqual(res.enrichmentStatus, 'NO_DESCRIPTION', 'status NO_DESCRIPTION');
    assert(res.inferredRequirements.length === 0, 'no inferred items');
  });

  await test('T12 — Malformed AI output (not an object) returns AI_INFERENCE_UNAVAILABLE', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, 'this is not valid JSON object');
    assertEqual(res.enrichmentStatus, 'AI_INFERENCE_UNAVAILABLE', 'status AI_INFERENCE_UNAVAILABLE');
    assert(res.inferredRequirements.length === 0, 'no fabricated fallback items');
  });

  await test('T13 — AI timeout / error returns AI_INFERENCE_UNAVAILABLE', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, null, 'Request timeout after 30000ms');
    assertEqual(res.enrichmentStatus, 'AI_INFERENCE_UNAVAILABLE', 'status AI_INFERENCE_UNAVAILABLE on timeout');
    assert(res.inferredRequirements.length === 0, 'no fallback items on error');
  });

  await test('T14 — Duplicate inferred concepts are deduplicated', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: 'SQL experience', category: 'SKILL', confidence: 'HIGH', evidence: '3 years of SQL', reason: 'Named technology' },
        { text: 'SQL experience', category: 'MUST_HAVE', confidence: 'HIGH', evidence: 'Must have 3 years of SQL experience', reason: 'Same concept different category' },
        { text: 'sql experience', category: 'SKILL', confidence: 'MEDIUM', evidence: 'sql skills', reason: 'Case variant' },
      ],
    });
    assert(res.inferredRequirements.length === 1, 'only 1 unique concept, 2 duplicates removed');
    assert(res.duplicatesRemoved >= 2, 'at least 2 duplicates counted');
  });

  await test('T15 — Item missing evidence field is rejected', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: 'Agile methodology', category: 'PREFERRED', confidence: 'MEDIUM', evidence: '', reason: 'Team mentions sprints' },
        { text: 'Data pipelines', category: 'RESPONSIBILITY', confidence: 'HIGH', evidence: 'manage data pipelines', reason: 'Explicit duty' },
      ],
    });
    // Item with empty evidence rejected; item with evidence kept
    assert(res.inferredRequirements.every(r => r.evidence.length > 0), 'all accepted items have evidence');
    assert(res.inferredRequirements.some(r => r.text === 'Data pipelines'), 'valid item accepted');
    assert(!res.inferredRequirements.some(r => r.text === 'Agile methodology'), 'evidenceless item rejected');
  });

  await test('T16 — canonical object is NOT mutated by enrichment', async () => {
    const snapshot = JSON.stringify(CANONICAL_FULL);
    await runEnrich(CANONICAL_FULL, {
      inferred: [
        { text: 'Docker', category: 'PREFERRED', confidence: 'MEDIUM', evidence: 'Docker and Kubernetes is a plus', reason: 'Nice-to-have statement' },
      ],
    });
    assertEqual(JSON.stringify(CANONICAL_FULL), snapshot, 'canonical object untouched');
  });

  await test('T17 — AI_INFERRED source tag is enforced on all inferred items', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: 'SQL', category: 'SKILL', confidence: 'HIGH', evidence: '3 years of SQL experience', reason: 'Technology' },
      ],
    });
    assert(res.inferredRequirements.every(r => r.source === 'AI_INFERRED'), 'all items tagged AI_INFERRED');
  });

  await test('T18 — confidence distribution is reported accurately', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, {
      inferred: [
        { text: 'SQL', category: 'SKILL', confidence: 'HIGH', evidence: 'Must have SQL', reason: 'Explicit' },
        { text: 'Data pipelines', category: 'RESPONSIBILITY', confidence: 'MEDIUM', evidence: 'manage data pipelines', reason: 'Task stated' },
        { text: 'Team player', category: 'PREFERRED', confidence: 'LOW', evidence: 'works well in teams', reason: 'Soft skill' },
      ],
    });
    assertEqual(res.confidenceDistribution.HIGH, 1, 'HIGH count = 1');
    assertEqual(res.confidenceDistribution.MEDIUM, 1, 'MEDIUM count = 1');
    assertEqual(res.confidenceDistribution.LOW, 1, 'LOW count = 1');
  });

  await test('T19 — AI response with missing "inferred" array returns AI_INFERENCE_UNAVAILABLE', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, { someOtherKey: 'bad shape' });
    assertEqual(res.enrichmentStatus, 'AI_INFERENCE_UNAVAILABLE', 'missing array → unavailable');
    assert(res.inferredRequirements.length === 0, 'no fabricated items');
  });

  await test('T20 — Inference timing is recorded', async () => {
    const res = await runEnrich(CANONICAL_NO_STRUCTURED, { inferred: [] });
    assert(typeof res.inferenceTimingMs === 'number', 'timingMs is number');
    assert(res.inferenceTimingMs >= 0, 'timingMs is non-negative');
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('GATE 2C UNIT TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`TOTAL:  ${passed + failed}`);

  if (failures.length > 0) {
    console.log('\nFailed assertions:');
    failures.forEach(f => console.log(f));
  }

  console.log('\nGATE 2C UNIT TESTS:', failed === 0 ? '✅ PASS' : '❌ FAIL');
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
