/**
 * TALENTXCEL — PHASE 3 GATE 3C
 * Unit Tests: Evidence-Aware ATS Explanation Layer
 * src/lib/resume/__tests__/gate3c.test.ts
 *
 * Tests cover all 10 required Gate 3C test categories:
 *   1. Strong assessment evidence (score unchanged, lineage attached)
 *   2. Certification evidence (score unchanged, cert lineage attached)
 *   3. Work experience evidence (score unchanged, exp lineage attached)
 *   4. Resume-only claim (score unchanged, USER_CLAIMED_RESUME attached)
 *   5. No evidence case (matched in ATS, but no proof: score unchanged, UNVERIFIED)
 *   6. Stale assessment case (score unchanged, marked DECAYED EVIDENCE)
 *   7. Multiple evidence sources (hierarchy preserved, score unchanged)
 *   8. Source vs AI-inferred requirement (requirementSource tag verified)
 *   9. Candidate ownership mismatch (other candidate assessment rejected)
 *   10. Phase 1 Score Non-Inflation Verification (score before === score after)
 *
 * Run: npx tsx src/lib/resume/__tests__/gate3c.test.ts
 */

import { attachEvidenceToATSResult } from '../evidenceAwareATS';
import { ATSAnalysisResult } from '../atsEngine';
import { normalizeResumeContent } from '../normalizeResumeContent';

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
// Mock Fixtures
// ---------------------------------------------------------------------------

const mockATSResult: ATSAnalysisResult = {
  version: '1.0',
  analyzedAt: '2026-08-14T12:00:00Z',
  resumeId: 'res-100',
  jobId: 'job-100',
  variantDetected: 'V2_CORE_UNIFIED',
  normalizationWarnings: [],
  score: 82.5,
  breakdown: {
    mustHaveCoverage: 85,
    preferredCoverage: 70,
    experienceAlignment: 80,
    hardSkillMatch: 90,
    semanticMatch: 75,
    assessmentEvidence: 88,
    overall: 82.5,
  },
  requirements: [
    {
      requirement: 'Python',
      requirementClass: 'MUST_HAVE',
      matchType: 'EXACT',
      candidateEvidence: ['Listed under skills'],
      confidence: 'HIGH',
      reason: 'Exact match found in resume skills',
    },
    {
      requirement: 'AWS',
      requirementClass: 'MUST_HAVE',
      matchType: 'EXACT',
      candidateEvidence: ['Listed under skills'],
      confidence: 'HIGH',
      reason: 'Exact match found in resume skills',
    },
    {
      requirement: 'Docker',
      requirementClass: 'SKILL',
      matchType: 'NORMALIZED',
      candidateEvidence: ['Listed in work experience'],
      confidence: 'HIGH',
      reason: 'Found in role description',
    },
    {
      requirement: 'Figma',
      requirementClass: 'SKILL',
      matchType: 'EXACT',
      candidateEvidence: ['Listed in resume skills'],
      confidence: 'HIGH',
      reason: 'Self-reported skill claim',
    },
  ],
  experienceAlignment: {
    requiredYears: 3,
    estimatedCandidateYears: 4,
    gap: 1,
    titleAlignment: 'EXACT',
    titleReason: 'Senior Engineer',
    recencyScore: 100,
  },
  assessmentEvidence: [],
  gaps: [],
  deterministicMatchCount: 4,
  semanticMatchCount: 0,
  dataIntegrityVerified: true,
};

const mockResume = normalizeResumeContent({
  personal_info: { full_name: 'Alex' },
  work_experience: [
    { job_title: 'Senior Engineer', company: 'TechCorp', start_date: '2020-01-01', end_date: '2024-01-01', technologies: ['Docker'] }
  ],
  skills: ['Python', 'AWS', 'Figma'],
}).normalized;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

await test('T01 — Strong assessment evidence attaches lineage without altering ATS score', () => {
  const context = {
    userId: 'user-100',
    resume: mockResume,
    assessmentAttempts: [
      { id: 'att-py', user_id: 'user-100', assessment_id: 'py', skill_name: 'Python', score: 94, passed: true, completed_at: new Date().toISOString() }
    ],
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, context);

  // Score preservation check
  assertEqual(enriched.score, 82.5, 'Phase 1 ATS score unchanged');
  assertEqual(enriched.breakdown.overall, 82.5, 'Phase 1 breakdown overall unchanged');

  // Lineage check
  const pyReq = enriched.requirements.find(r => r.requirement === 'Python')!;
  assertEqual(pyReq.evidenceLineage.trustTier, 'ASSESSMENT_VERIFIED', 'Python trust tier');
  assertEqual(pyReq.evidenceLineage.trustLabel, 'HIGH', 'Python trust label HIGH');
  assert(pyReq.evidenceLineage.explanation.includes('94%'), 'score 94% in explanation');
});

await test('T02 — Platform certification attaches certification lineage without altering ATS score', () => {
  const context = {
    userId: 'user-100',
    resume: mockResume,
    skillCertifications: [
      { id: 'cert-aws', user_id: 'user-100', skill_id: 'aws', skill_name: 'AWS', score: 96, certification_level: 'Architect', is_verified: true, issued_at: new Date().toISOString() }
    ],
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, context);

  assertEqual(enriched.score, 82.5, 'Phase 1 ATS score unchanged');

  const awsReq = enriched.requirements.find(r => r.requirement === 'AWS')!;
  assertEqual(awsReq.evidenceLineage.primaryEvidenceSource, 'skill_certifications', 'cert is primary source');
  assertEqual(awsReq.evidenceLineage.trustLabel, 'HIGH', 'cert trust label HIGH');
});

await test('T03 — Work experience evidence attaches calculated experience lineage', () => {
  const context = {
    userId: 'user-100',
    resume: mockResume, // Docker 4 yrs in experience
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, context);

  const dockerReq = enriched.requirements.find(r => r.requirement === 'Docker')!;
  assertEqual(dockerReq.evidenceLineage.trustTier, 'SYSTEM_DERIVED', 'Docker trust tier SYSTEM_DERIVED');
  assertEqual(dockerReq.evidenceLineage.primaryEvidenceSource, 'work_experience', 'Docker primary source work_experience');
  assertEqual(enriched.score, 82.5, 'Phase 1 ATS score unchanged');
});

await test('T04 — Resume-only skill claim attaches USER_CLAIMED_RESUME with UNVERIFIED explanation', () => {
  const context = {
    userId: 'user-100',
    resume: mockResume, // Figma is in skills list only
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, context);

  const figmaReq = enriched.requirements.find(r => r.requirement === 'Figma')!;
  assertEqual(figmaReq.evidenceLineage.trustTier, 'USER_CLAIMED_RESUME', 'Figma trust tier USER_CLAIMED_RESUME');
  assertEqual(figmaReq.evidenceLineage.trustLabel, 'LOW', 'Figma trust label LOW');
  assert(figmaReq.evidenceLineage.explanation.includes('NO VERIFIED ASSESSMENT OR PLATFORM CERTIFICATION ON RECORD'), 'clear unverified text');
  assertEqual(enriched.score, 82.5, 'Phase 1 ATS score unchanged');
});

await test('T05 — No evidence case does NOT downgrade Phase 1 match score or matchType', () => {
  const context = {
    userId: 'user-100',
    resume: normalizeResumeContent({ personal_info: { full_name: 'Alex' } }).normalized, // No skills/experience
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, context);

  const pyReq = enriched.requirements.find(r => r.requirement === 'Python')!;
  assertEqual(pyReq.matchType, 'EXACT', 'Phase 1 matchType EXACT preserved');
  assertEqual(pyReq.evidenceLineage.trustLabel, 'UNVERIFIED', 'trust label UNVERIFIED');
  assertEqual(enriched.score, 82.5, 'Phase 1 ATS score 100% preserved (not downgraded)');
});

await test('T06 — Stale assessment attaches [DECAYED EVIDENCE] tag without altering score', () => {
  const staleDate = new Date();
  staleDate.setMonth(staleDate.getMonth() - 30); // 30 months ago

  const context = {
    userId: 'user-100',
    assessmentAttempts: [
      { id: 'att-py-old', user_id: 'user-100', assessment_id: 'py', skill_name: 'Python', score: 95, passed: true, completed_at: staleDate.toISOString() }
    ],
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, context);

  const pyReq = enriched.requirements.find(r => r.requirement === 'Python')!;
  assertEqual(pyReq.evidenceLineage.isDecayed, true, 'isDecayed = true');
  assert(pyReq.evidenceLineage.evidenceSummary.includes('[DECAYED EVIDENCE]'), 'DECAYED EVIDENCE in summary');
  assertEqual(enriched.score, 82.5, 'Phase 1 ATS score unchanged');
});

await test('T07 — Multiple evidence sources hierarchy sorting preserved', () => {
  const context = {
    userId: 'user-100',
    resume: mockResume,
    assessmentAttempts: [
      { id: 'att-py', user_id: 'user-100', assessment_id: 'py', skill_name: 'Python', score: 90, passed: true, completed_at: new Date().toISOString() }
    ],
    skillCertifications: [
      { id: 'cert-py', user_id: 'user-100', skill_id: 'py', skill_name: 'Python', score: 98, certification_level: 'Master', is_verified: true, issued_at: new Date().toISOString() }
    ],
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, context);

  const pyReq = enriched.requirements.find(r => r.requirement === 'Python')!;
  assertEqual(pyReq.evidenceLineage.primaryEvidenceSource, 'skill_certifications', 'cert is primary source');
  assert(pyReq.evidenceLineage.sources.length >= 2, 'supporting sources captured');
  assertEqual(enriched.score, 82.5, 'Phase 1 ATS score unchanged');
});

await test('T08 — Source vs AI-inferred requirement tag attached accurately', () => {
  const sourceMap = {
    'Python': 'SOURCE_PROVIDED' as const,
    'AWS': 'AI_INFERRED' as const,
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, { userId: 'user-100', resume: mockResume }, sourceMap);

  const pyReq = enriched.requirements.find(r => r.requirement === 'Python')!;
  const awsReq = enriched.requirements.find(r => r.requirement === 'AWS')!;

  assertEqual(pyReq.requirementSource, 'SOURCE_PROVIDED', 'Python tagged SOURCE_PROVIDED');
  assertEqual(awsReq.requirementSource, 'AI_INFERRED', 'AWS tagged AI_INFERRED');
});

await test('T09 — Candidate ownership mismatch guard (other user assessment rejected)', () => {
  const context = {
    userId: 'user-actual-100',
    assessmentAttempts: [
      { id: 'att-other', user_id: 'user-other-200', assessment_id: 'py', skill_name: 'Python', score: 100, passed: true, completed_at: new Date().toISOString() }
    ],
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, context);

  const pyReq = enriched.requirements.find(r => r.requirement === 'Python')!;
  assertEqual(pyReq.evidenceLineage.isEvidenceFound, false, 'other candidate assessment rejected');
  assertEqual(pyReq.evidenceLineage.trustLabel, 'UNVERIFIED', 'trust label UNVERIFIED');
});

await test('T10 — Phase 1 Score Non-Inflation Verification (score before === score after 100%)', () => {
  const context = {
    userId: 'user-100',
    resume: mockResume,
    assessmentAttempts: [
      { id: 'att-py', user_id: 'user-100', assessment_id: 'py', skill_name: 'Python', score: 100, passed: true, completed_at: new Date().toISOString() },
      { id: 'att-aws', user_id: 'user-100', assessment_id: 'aws', skill_name: 'AWS', score: 100, passed: true, completed_at: new Date().toISOString() },
    ],
    skillCertifications: [
      { id: 'cert-py', user_id: 'user-100', skill_id: 'py', skill_name: 'Python', score: 100, certification_level: 'Master', is_verified: true, issued_at: new Date().toISOString() }
    ],
  };

  const enriched = attachEvidenceToATSResult(mockATSResult, context);

  // CRITICAL AUDIT ASSERTION: Score before must equal Score after EXACTLY
  assertEqual(enriched.score, mockATSResult.score, 'Score before === Score after');
  assertEqual(enriched.breakdown.overall, mockATSResult.breakdown.overall, 'Breakdown overall before === Breakdown overall after');
  assertEqual(enriched.breakdown.mustHaveCoverage, mockATSResult.breakdown.mustHaveCoverage, 'MustHaveCoverage unchanged');
  assertEqual(enriched.breakdown.assessmentEvidence, mockATSResult.breakdown.assessmentEvidence, 'AssessmentEvidence breakdown unchanged');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('\n' + '='.repeat(60));
console.log('GATE 3C UNIT TEST RESULTS');
console.log('='.repeat(60));
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log(`TOTAL:  ${passed + failed}`);

if (failures.length > 0) {
  console.log('\nFailed assertions:');
  failures.forEach(f => console.log(f));
}

console.log('\nGATE 3C UNIT TESTS:', failed === 0 ? '✅ PASS' : '❌ FAIL');
if (failed > 0) process.exit(1);
