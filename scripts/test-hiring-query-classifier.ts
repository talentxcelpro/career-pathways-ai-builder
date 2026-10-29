import assert from 'node:assert/strict';
import {
  classifyHiringQuery,
  classifyQuestionIntent,
  normalizeQuery,
  hiringQueryTestPhrases,
} from '../src/lib/seo/hiringQueryClassifier';

const expectIntent = (query: string, intent: string) => assert.equal(classifyHiringQuery(query).intent, intent, query);

// 1. Core Category Assertions
expectIntent('best hiring platform for startups', 'comparison');
expectIntent('talent discovery platform', 'commercial');
expectIntent('recruitment software for small business', 'commercial');
expectIntent('applicant tracking system for free', 'commercial');
expectIntent('AI recruitment software', 'commercial');
expectIntent('free recruiting app', 'commercial');
expectIntent('Naukri alternative', 'comparison');
expectIntent('LinkedIn vs Naukri', 'comparison');
expectIntent('how does an ATS work?', 'informational');
expectIntent('what is talent discovery?', 'informational');
expectIntent('TalentXcel hiring platform', 'branded');
expectIntent('software engineer jobs', 'careers');
expectIntent('weather tomorrow', 'unrelated');
expectIntent('best salary prediction tool', 'unrelated');

// 2. Normalization & Spelling Typo Coverage
const punctuationVariant = classifyHiringQuery('Naukri alternatives!!!');
assert.equal(punctuationVariant.normalizedQuery, 'naukri alternatives');
assert.equal(punctuationVariant.intent, 'comparison');
assert.equal(normalizeQuery('recuitment software'), 'recruitment software');
assert.equal(normalizeQuery('recrutment softwere'), 'recruitment software');
assert.equal(normalizeQuery('naurkri alternative'), 'naukri alternative');
assert.equal(normalizeQuery('naukeri alternatives'), 'naukri alternatives');
assert.equal(normalizeQuery('talant discovery platfrom'), 'talent discovery platform');
assert.equal(normalizeQuery('applicante tracking system'), 'applicant tracking system');

// 3. PAA Question-Intent Classifier Assertions
const q1 = classifyQuestionIntent('How does an ATS work?');
assert.equal(q1.isQuestion, true);
assert.equal(q1.questionType, 'how');

const q2 = classifyQuestionIntent('what is talent discovery');
assert.equal(q2.isQuestion, true);
assert.equal(q2.questionType, 'what');

const q3 = classifyQuestionIntent('Which is the best hiring platform in India?');
assert.equal(q3.isQuestion, true);
assert.equal(q3.questionType, 'which');

const q4 = classifyQuestionIntent('Why is Gen Z struggling to get jobs?');
assert.equal(q4.isQuestion, true);
assert.equal(q4.questionType, 'why');

const q5 = classifyQuestionIntent('Can AI replace recruiters?');
assert.equal(q5.isQuestion, true);
assert.equal(q5.questionType, 'can');

const q6 = classifyQuestionIntent('Difference between ATS and CRM?');
assert.equal(q6.isQuestion, true);
assert.equal(q6.questionType, 'comparison');

const q7 = classifyQuestionIntent('software engineer jobs');
assert.equal(q7.isQuestion, false);
assert.equal(q7.questionType, null);

// 4. Fixture phrases verification
assert.ok(hiringQueryTestPhrases.length >= 15);
assert.ok(hiringQueryTestPhrases.every((phrase) => classifyHiringQuery(phrase).intent));

// 5. Google Search Screenshot PAA & PASF Opportunities Checklist
const screenshotCases: Array<[string, string, string]> = [
  ['Which is the best hiring platform in India?', 'comparison', '/hire'],
  ['What is the best app to find talent?', 'comparison', '/talent'],
  ['What are the best recruitment software options in India?', 'comparison', '/hire'],
  ['How do I earn Rs 30,000 per month from home?', 'careers', '/jobs'],
  ['Why is Gen Z struggling to get jobs?', 'informational', '/resources'],
  ['What apps can I get paid daily?', 'informational', '/resources'],
  ['Which is better than Naukri?', 'comparison', '/hire'],
  ['What is the best free recruiting app?', 'comparison', '/hire'],
  ['What are the top 5 recruitment companies in India?', 'comparison', '/hire'],
  ['Which ATS is best for HR?', 'comparison', '/hire'],
  ['Which AI is best for recruitment?', 'comparison', '/hire'],
  ['TalentXcel salary', 'branded', '/salary'],
  ['TalentXcel careers', 'branded', '/careers'],
  // Additional PASF & Variations
  ['sites like naukri for hiring', 'comparison', '/hire'],
  ['free applicant tracking system for startups', 'commercial', '/hire'],
  ['best talent discovery platform', 'comparison', '/talent'],
  ['recruitment software for small business', 'commercial', '/hire'],
  ['how does an ATS work?', 'informational', '/resources'],
  ['what is talent discovery?', 'informational', '/resources'],
];

for (const [query, intent, page] of screenshotCases) {
  const result = classifyHiringQuery(query);
  assert.equal(result.intent, intent, `Intent mismatch for "${query}"`);
  assert.equal(result.page, page, `Page mapping mismatch for "${query}"`);
  // Anti-doorway invariant: do not generate thin doorway pages
  assert.equal(result.eligibleForIndexablePage, false, `eligibleForIndexablePage must be false for "${query}"`);
  assert.ok(result.reason.length > 0, `Reason must be populated for "${query}"`);
}

// 6. Case & Punctuation Insensitivity
assert.equal(classifyHiringQuery('WHICH IS THE BEST HIRING PLATFORM IN INDIA!!!').page, '/hire');
assert.equal(classifyHiringQuery('Naukri-alternative').intent, 'comparison');
assert.equal(classifyHiringQuery('TalentXcel-careers').page, '/careers');
assert.equal(classifyHiringQuery('  what   are  the  top  5  recruitment  companies  in  india ?  ').intent, 'comparison');

// 7. Negative / Excluded Cases (zero false positives, zero thin content doorway creation)
const negativeCases = [
  'weather tomorrow',
  'best salary prediction tool',
  'fifa world cup schedule',
  'how to bake chocolate cake',
  'cryptocurrency price today',
];

for (const query of negativeCases) {
  const result = classifyHiringQuery(query);
  assert.equal(result.intent, 'unrelated', `Expected unrelated for "${query}"`);
  assert.equal(result.page, null, `Expected null page for "${query}"`);
  assert.equal(result.eligibleForIndexablePage, false, `Must not be eligible for "${query}"`);
}

console.log(`✓ Hiring query classifier tests passed (${hiringQueryTestPhrases.length + screenshotCases.length + negativeCases.length} fixture queries & edge cases verified).`);
