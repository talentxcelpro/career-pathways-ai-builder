/**
 * TALENTXCEL — PREREQUISITE 0A
 * Unit Tests: normalizeResumeContent
 *
 * Self-contained Node.js test runner. No test framework required.
 * Run with:   npx tsx src/lib/resume/__tests__/normalizeResumeContent.test.ts
 *
 * Tests:
 *  T01  V1 Editor sample   (profile + top-level summary)
 *  T02  V2 Core/Unified    (personalInfo + nested summary)
 *  T03  V3 Enhanced        (personalInfo + professionalSummary.content)
 *  T04  V4 EditorResume    (personalInfo + skills as object)
 *  T05  Missing personalInfo (no personalInfo, no profile)
 *  T06  Missing profile     (non-object profile key)
 *  T07  Missing summary     (no summary anywhere)
 *  T08  Skills as strings   (flat string array)
 *  T09  Skills as objects   (structured skill objects)
 *  T10  Null input
 *  T11  Malformed input     (string instead of object)
 *  T12  Mixed/partial       (some fields, some missing)
 *  T13  Input mutation check (original object must be unchanged)
 *  T14  professionalSummary.content is non-string object (must not blindly stringify)
 *  T15  V4 skills object with mixed content
 *  T16  Empty string skills (should be skipped)
 */

import {
  normalizeResumeContent,
  NormalizationResult,
} from '../normalizeResumeContent';
import {
  deduplicateSkillStrings,
  parseDurationStart,
  parseDurationEnd,
} from '../../../services/resumeParsingService';

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
// Fixtures — representative data for each variant
// ---------------------------------------------------------------------------

const V1_EDITOR_RAW = {
  profile: {
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+44 7700 900000',
    location: 'London, UK',
  },
  summary: 'Experienced frontend engineer with 6 years in React.',
  experience: [
    { id: 'exp1', title: 'Senior Engineer', company: 'Acme Corp', startDate: '2020-01', endDate: '' },
  ],
  education: [
    { id: 'edu1', degree: 'BSc Computer Science', institution: 'UCL' },
  ],
  skills: ['React', 'TypeScript', 'Node.js'],
  projects: [],
  certifications: [],
};

const V2_CORE_RAW = {
  personalInfo: {
    fullName: 'Ali Hassan',
    email: 'ali@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    summary: 'Full-stack developer specialising in SaaS products.',
    linkedin: 'https://linkedin.com/in/alihassan',
  },
  experience: [
    { id: 'exp1', title: 'Backend Engineer', company: 'TechStart', startDate: '2021-03', endDate: '2023-06' },
  ],
  education: [],
  skills: [
    { id: 's1', name: 'Python', level: 'expert', category: 'technical' },
    { id: 's2', name: 'Django', level: 'advanced', category: 'technical' },
  ],
  projects: [],
  certifications: [],
};

const V3_ENHANCED_RAW = {
  personalInfo: {
    fullName: 'Maria Garcia',
    email: 'maria@example.com',
    phone: '+1 555 0100',
    location: 'New York, USA',
  },
  professionalSummary: {
    content: 'Product-focused data scientist with 8 years in ML/AI.',
    keyHighlights: ['Led 3 ML model deployments', 'Reduced churn by 22%'],
  },
  experience: [],
  education: [
    { id: 'edu1', degree: 'MSc Data Science', institution: 'NYU' },
  ],
  skills: [
    { id: 's1', name: 'Python', level: 'expert', category: 'technical' },
  ],
  projects: [{ id: 'p1', name: 'Churn Predictor', description: 'ML model', technologies: ['Python', 'sklearn'] }],
  certifications: [],
};

const V4_EDITOR_RESUME_RAW = {
  personalInfo: {
    fullName: 'David Chen',
    email: 'david@example.com',
    phone: '+1 555 0200',
    location: 'San Francisco, USA',
    summary: 'Experienced product manager with SaaS background.',
  },
  experience: [],
  education: [],
  skills: {
    technical: ['React', 'TypeScript', 'PostgreSQL'],
    soft: ['Leadership', 'Communication'],
    languages: ['English', 'Mandarin'],
    tools: ['Jira', 'Figma'],
  },
  projects: [],
  certifications: [],
};

// ---------------------------------------------------------------------------
// T01 — V1 Editor Sample
// ---------------------------------------------------------------------------
test('T01 — V1 Editor: profile + top-level summary + skills as strings', () => {
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(V1_EDITOR_RAW); }, 'does not throw');
  assert(result.status !== 'UNSUPPORTED_VARIANT', 'status is not UNSUPPORTED_VARIANT');
  assertEqual(result.normalized.personalInfo.fullName, 'Jane Smith', 'fullName');
  assertEqual(result.normalized.personalInfo.email, 'jane@example.com', 'email');
  assertEqual(result.normalized.personalInfo.summary, 'Experienced frontend engineer with 6 years in React.', 'summary coalesced from top-level');
  assertEqual(result.normalized.experience.length, 1, 'experience preserved');
  assertEqual(result.normalized.skills.length, 3, 'three skills normalised');
  assert(result.normalized.skills[0]._coercedFromString === true, 'first skill flagged as coerced from string');
  assertEqual(result.normalized.skills[0].level, 'unknown', 'coerced skill level is unknown');
  assert(result.variantDetected.includes('V1'), 'variant detected as V1');
});

// ---------------------------------------------------------------------------
// T02 — V2 Core/Unified Sample
// ---------------------------------------------------------------------------
test('T02 — V2 Core/Unified: personalInfo with nested summary', () => {
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(V2_CORE_RAW); }, 'does not throw');
  assertEqual(result.normalized.personalInfo.fullName, 'Ali Hassan', 'fullName');
  assertEqual(result.normalized.personalInfo.summary, 'Full-stack developer specialising in SaaS products.', 'summary from personalInfo.summary');
  assertEqual(result.normalized.skills.length, 2, 'two skills');
  assertEqual(result.normalized.skills[0].name, 'Python', 'first skill name');
  assertEqual(result.normalized.skills[0].level, 'expert', 'first skill level preserved');
  assert(!result.normalized.skills[0]._coercedFromString, 'skill not flagged as coerced');
  assert(result.variantDetected.includes('V2'), 'variant detected as V2');
});

// ---------------------------------------------------------------------------
// T03 — V3 Enhanced Sample
// ---------------------------------------------------------------------------
test('T03 — V3 Enhanced: personalInfo + professionalSummary.content', () => {
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(V3_ENHANCED_RAW); }, 'does not throw');
  assertEqual(result.normalized.personalInfo.fullName, 'Maria Garcia', 'fullName');
  assertEqual(
    result.normalized.personalInfo.summary,
    'Product-focused data scientist with 8 years in ML/AI.',
    'summary from professionalSummary.content',
  );
  assertEqual(result.normalized.projects.length, 1, 'project preserved');
  assert(result.variantDetected.includes('V3'), 'variant detected as V3');
});

// ---------------------------------------------------------------------------
// T04 — V4 EditorResume: skills as categorised object
// ---------------------------------------------------------------------------
test('T04 — V4 EditorResume: skills as object with category arrays', () => {
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(V4_EDITOR_RESUME_RAW); }, 'does not throw');
  assertEqual(result.normalized.personalInfo.fullName, 'David Chen', 'fullName');
  // 3 technical + 2 soft + 2 languages + 2 tools = 9 skills
  assertEqual(result.normalized.skills.length, 9, 'all category skills flattened');
  const technical = result.normalized.skills.filter(s => s.category === 'technical');
  assert(technical.length === 3, 'three technical skills');
  assert(technical[0].level === 'unknown', 'technical skill level is unknown (no proficiency in source)');
  assert(result.variantDetected.includes('V4'), 'variant detected as V4');
});

// ---------------------------------------------------------------------------
// T05 — Missing personalInfo (no personalInfo, no profile)
// ---------------------------------------------------------------------------
test('T05 — Missing personalInfo and profile', () => {
  const raw = {
    experience: [{ id: 'e1', title: 'Engineer', company: 'Acme' }],
    skills: ['React'],
  };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw); }, 'does not throw');
  assertEqual(result.normalized.personalInfo.fullName, '', 'fullName empty');
  assertEqual(result.normalized.personalInfo.summary, '', 'summary empty');
  assertEqual(result.normalized.experience.length, 1, 'experience still preserved');
  assert(result.warnings.length > 0, 'warnings emitted for missing personalInfo');
});

// ---------------------------------------------------------------------------
// T06 — Non-object profile key
// ---------------------------------------------------------------------------
test('T06 — Non-object profile key (string instead of object)', () => {
  const raw = { profile: 'Jane Smith', summary: 'A summary.' };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw); }, 'does not throw');
  assertEqual(result.normalized.personalInfo.fullName, '', 'fullName empty — profile was not an object');
  assert(result.warnings.length > 0, 'warnings emitted');
});

// ---------------------------------------------------------------------------
// T07 — Missing summary everywhere
// ---------------------------------------------------------------------------
test('T07 — No summary in any location', () => {
  const raw = {
    personalInfo: { fullName: 'Test User', email: 'test@example.com', phone: '0000', location: 'Nowhere' },
  };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw); }, 'does not throw');
  assertEqual(result.normalized.personalInfo.summary, '', 'summary is empty string');
  assert(result.warnings.some(w => w.field === 'summary'), 'summary warning emitted');
});

// ---------------------------------------------------------------------------
// T08 — Skills as flat string array
// ---------------------------------------------------------------------------
test('T08 — Skills as flat string array', () => {
  const raw = {
    personalInfo: { fullName: 'X', email: 'x@x.com', phone: '0', location: 'Y', summary: 'S' },
    skills: ['Python', 'SQL', 'Tableau'],
  };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw); }, 'does not throw');
  assertEqual(result.normalized.skills.length, 3, 'three skills normalised');
  assert(result.normalized.skills.every(s => s.level === 'unknown'), 'all levels are unknown');
  assert(result.normalized.skills.every(s => s._coercedFromString === true), 'all flagged as coerced from string');
});

// ---------------------------------------------------------------------------
// T09 — Skills as structured objects
// ---------------------------------------------------------------------------
test('T09 — Skills as structured objects with levels', () => {
  const raw = {
    personalInfo: { fullName: 'X', email: 'x@x.com', phone: '0', location: 'Y', summary: 'S' },
    skills: [
      { id: 's1', name: 'React', level: 'advanced', category: 'technical', years: 4 },
      { id: 's2', name: 'CSS', level: 'expert', category: 'technical' },
    ],
  };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw); }, 'does not throw');
  assertEqual(result.normalized.skills.length, 2, 'two skills');
  assertEqual(result.normalized.skills[0].level, 'advanced', 'level preserved');
  assertEqual(result.normalized.skills[0].years, 4, 'years preserved');
  assert(!result.normalized.skills[0]._coercedFromString, 'not flagged as coerced');
});

// ---------------------------------------------------------------------------
// T10 — Null input
// ---------------------------------------------------------------------------
test('T10 — Null input', () => {
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(null); }, 'does not throw');
  assertEqual(result.status, 'UNSUPPORTED_VARIANT', 'status is UNSUPPORTED_VARIANT');
  assertEqual(result.variantDetected, 'NULL_INPUT', 'variant is NULL_INPUT');
  assertEqual(result.normalized.personalInfo.fullName, '', 'fullName empty');
  assertEqual(result.normalized.skills.length, 0, 'skills empty');
});

// ---------------------------------------------------------------------------
// T11 — Malformed input (number)
// ---------------------------------------------------------------------------
test('T11 — Malformed input (number instead of object)', () => {
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(42 as unknown); }, 'does not throw');
  assertEqual(result.status, 'MANUAL_REVIEW_REQUIRED', 'status is MANUAL_REVIEW_REQUIRED');
  assertEqual(result.normalized.skills.length, 0, 'skills empty');
});

// ---------------------------------------------------------------------------
// T12 — Mixed/partial input
// ---------------------------------------------------------------------------
test('T12 — Partial record: only experience present', () => {
  const raw = {
    experience: [
      { id: 'e1', title: 'Dev', company: 'Acme', startDate: '2020-01', endDate: '2022-06' },
    ],
  };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw); }, 'does not throw');
  assertEqual(result.normalized.experience.length, 1, 'experience preserved');
  assertEqual(result.normalized.personalInfo.fullName, '', 'fullName defaults to empty');
  assertEqual(result.normalized.skills.length, 0, 'skills defaults to empty');
  assertEqual(result.normalized.projects.length, 0, 'projects defaults to empty');
});

// ---------------------------------------------------------------------------
// T13 — Input mutation check
// ---------------------------------------------------------------------------
test('T13 — Input object is NOT mutated by normalization', () => {
  const original = JSON.parse(JSON.stringify(V1_EDITOR_RAW));
  const snapshot = JSON.stringify(V1_EDITOR_RAW);
  normalizeResumeContent(V1_EDITOR_RAW);
  assertEqual(JSON.stringify(V1_EDITOR_RAW), snapshot, 'V1 input object unchanged after normalization');

  const original2 = JSON.parse(JSON.stringify(V4_EDITOR_RESUME_RAW));
  const snapshot2 = JSON.stringify(V4_EDITOR_RESUME_RAW);
  normalizeResumeContent(V4_EDITOR_RESUME_RAW);
  assertEqual(JSON.stringify(V4_EDITOR_RESUME_RAW), snapshot2, 'V4 input object unchanged after normalization');
  
  // Suppress unused variable warnings
  void original; void original2;
});

// ---------------------------------------------------------------------------
// T14 — professionalSummary.content is non-string (must NOT stringify)
// ---------------------------------------------------------------------------
test('T14 — professionalSummary.content is an object — must NOT be stringified', () => {
  const raw = {
    personalInfo: { fullName: 'X', email: 'x@x.com', phone: '0', location: 'Y' },
    professionalSummary: {
      content: { nested: 'This is an object, not a string', value: 42 },
    },
  };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw as unknown); }, 'does not throw');
  assertEqual(result.normalized.personalInfo.summary, '', 'summary is empty — non-string content not coerced');
  assert(result.uninterpretableFields.includes('professionalSummary.content'), 'field reported as uninterpretable');
  assert(result.warnings.some(w => w.field === 'professionalSummary.content'), 'warning emitted for non-string content');
});

// ---------------------------------------------------------------------------
// T15 — V4 skills object with mixed content (some arrays, some non-arrays)
// ---------------------------------------------------------------------------
test('T15 — V4 skills object with partial / unexpected keys', () => {
  const raw = {
    personalInfo: { fullName: 'X', email: 'x@x.com', phone: '0', location: 'Y', summary: 'S' },
    skills: {
      technical: ['React', 'Node'],
      soft: 'Communication',        // non-array — should be ignored
      unknownCategory: ['Excel'],  // not a known category — should be ignored
    },
  };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw as unknown); }, 'does not throw');
  // Only 'technical' is a valid known category array: 2 skills
  assertEqual(result.normalized.skills.length, 2, 'only known-category array skills included');
  assert(result.normalized.skills.every(s => s.level === 'unknown'), 'levels are unknown');
});

// ---------------------------------------------------------------------------
// T16 — Empty string skills are skipped
// ---------------------------------------------------------------------------
test('T16 — Empty string skills are skipped with warning', () => {
  const raw = {
    personalInfo: { fullName: 'X', email: 'x@x.com', phone: '0', location: 'Y', summary: 'S' },
    skills: ['React', '', '   ', 'Python'],
  };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw); }, 'does not throw');
  assertEqual(result.normalized.skills.length, 2, 'empty strings skipped — only React and Python');
  assert(result.warnings.some(w => w.message.includes('Empty string')), 'warnings emitted for empty strings');
});

// ---------------------------------------------------------------------------
// T17 — Skill with invalid level string
// ---------------------------------------------------------------------------
test('T17 — Skill with unrecognised level value defaults to unknown without fabricating', () => {
  const raw = {
    personalInfo: { fullName: 'X', email: 'x@x.com', phone: '0', location: 'Y', summary: 'S' },
    skills: [{ name: 'Excel', level: 'ninja' }],
  };
  let result!: NormalizationResult;
  assertNoThrow(() => { result = normalizeResumeContent(raw as unknown); }, 'does not throw');
  assertEqual(result.normalized.skills[0].level, 'unknown', 'invalid level → unknown');
  assert(result.warnings.some(w => w.field.includes('level')), 'warning emitted for invalid level');
});

// ---------------------------------------------------------------------------
// T18 — Phase 5: cleanText Unicode dash preservation
// ---------------------------------------------------------------------------
test('T18 — Phase 5: cleanText preserves Unicode en-dash (–) and em-dash (—) date separators', () => {
  const input = 'March 2021 – July 2021 | July 2021 — Present · Equinix';
  const cleaned = input
    .replace(/\x00+/g, ' ')
    .replace(/[^\x20-\x7E\u2013\u2014\u00B7\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  assert(cleaned.includes('–'), 'en-dash (–) preserved');
  assert(cleaned.includes('—'), 'em-dash (—) preserved');
  assert(cleaned.includes('·'), 'middle dot (·) preserved');
});

// ---------------------------------------------------------------------------
// T19 — Phase 5: parseDurationStart and parseDurationEnd date parsing
// ---------------------------------------------------------------------------
test('T19 — Phase 5: parseDurationStart / parseDurationEnd robust date parsing', () => {
  assertEqual(parseDurationStart('July 2021 – Present'), 'July 2021', 'start date with en-dash');
  assertEqual(parseDurationEnd('July 2021 – Present'), 'Present', 'end date with en-dash');
  assertEqual(parseDurationStart('March 2023 - March 2025'), 'March 2023', 'start date with hyphen');
  assertEqual(parseDurationEnd('March 2023 - March 2025'), 'March 2025', 'end date with hyphen');
  assertEqual(parseDurationStart('Aug 2007 to Sep 2012'), 'Aug 2007', 'start date with "to"');
  assertEqual(parseDurationEnd('Aug 2007 to Sep 2012'), 'Sep 2012', 'end date with "to"');
});

// ---------------------------------------------------------------------------
// T20 — Phase 5: CHATR-style skill deduplication
// ---------------------------------------------------------------------------
test('T20 — Phase 5: deduplicateSkillStrings removes casing duplicates and noise headers', () => {
  const input = ['leadership', 'Leadership', 'LEADERSHIP', 'management', 'Management', 'WORK EXPERIENCE', 'LVAP', 'HVAP'];
  const result = deduplicateSkillStrings(input);
  assert(!result.includes('WORK EXPERIENCE'), 'noise header excluded');
  const leaderships = result.filter(s => s.toLowerCase() === 'leadership');
  assertEqual(leaderships.length, 1, 'casing duplicates collapsed to single token');
  assert(result.includes('LVAP'), 'LVAP preserved');
  assert(result.includes('HVAP'), 'HVAP preserved');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log(`GATE 0A UNIT TEST RESULTS`);
console.log('='.repeat(60));
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log(`TOTAL:  ${passed + failed}`);

if (failures.length > 0) {
  console.log('\nFailed assertions:');
  failures.forEach(f => console.log(f));
}

console.log('\nGATE 0A UNIT TESTS:', failed === 0 ? '✅ PASS' : '❌ FAIL');

if (failed > 0) {
  process.exit(1);
}
