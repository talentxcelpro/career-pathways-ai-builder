// scripts/test-jobmatch-e2e-suite.cjs
// Comprehensive E2E Verification Suite for JobMatch OS
const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(url, key);

let total = 0;
let passed = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ [FAIL] ${name}: ${e.message}`);
  }
}

async function asyncTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ [FAIL] ${name}: ${e.message}`);
  }
}

async function runSuite() {
  console.log('='.repeat(75));
  console.log('JOBMATCH OS — COMPREHENSIVE END-TO-END VERIFICATION SUITE');
  console.log('='.repeat(75));

  console.log('\n[SECTION 1: DATABASE & INVENTORY AUDIT]');
  await asyncTest('Live Supabase jobs count exceeds 2,000 verified vacancies', async () => {
    const { count, error } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true);
    assert.ifError(error);
    assert(count && count >= 2000, `Expected >=2000 active jobs, got ${count}`);
    console.log(`      Verified: ${count} active vacancies in database`);
  });

  await asyncTest('Live vacancies contain external_url and valid schema attributes', async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company_name, location, external_url, is_active')
      .eq('is_active', true)
      .limit(5);
    assert.ifError(error);
    assert(data && data.length === 5, 'Expected 5 sample jobs');
    assert(data[0].external_url, 'First sample job missing external_url');
    console.log(`      Sample Job: "${data[0].title}" at ${data[0].company_name}`);
  });

  console.log('\n[SECTION 2: CANDIDATE TALENT POOL AUDIT]');
  await asyncTest('Supabase profiles table contains indexed candidate talent pool', async () => {
    const { data, count, error } = await supabase.from('profiles').select('id, full_name, headline, skills', { count: 'exact' }).limit(5);
    assert.ifError(error);
    assert(count && count > 500, `Expected >500 profiles, got ${count}`);
    assert(data && data.length > 0, 'No profiles returned');
    console.log(`      Verified: ${count} real candidate profiles indexed in talent graph`);
  });

  console.log('\n[SECTION 3: AI MATCH ENGINE DETERMINISTIC LOGIC]');
  test('Skills overlap & compatibility score computation works accurately', () => {
    const { calculateJobMatch } = require('../src/services/jobs/aiJobMatchEngine.ts');
    const mockCandidate = {
      fullName: 'Aarav Sharma',
      title: 'Full Stack Developer',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      experienceYears: 4,
      currentLocation: 'Bengaluru',
      openToRemote: true
    };
    const mockJob = {
      id: 'job-123',
      title: 'Senior Frontend Engineer',
      skills_required: ['React', 'TypeScript', 'Tailwind CSS'],
      min_experience: 3,
      max_experience: 6,
      location: 'Bengaluru',
      is_remote: true
    };

    const match = calculateJobMatch(mockCandidate, mockJob);
    assert(match.score >= 80, `Expected high score >= 80, got ${match.score}`);
    assert(match.matchedSkills.includes('React'), 'React should be in matchedSkills');
    assert(match.matchedSkills.includes('TypeScript'), 'TypeScript should be in matchedSkills');
    assert(match.missingSkills.includes('Tailwind CSS'), 'Tailwind CSS should be in missingSkills');
    assert(match.matchReasons.length > 0, 'Should have match reasons');
    console.log(`      Score: ${match.score}%, Tier: ${match.tier}, Matched: ${match.matchedSkills.join(', ')}`);
  });

  console.log('\n[SECTION 4: CONVERSATIONAL NATURAL LANGUAGE PARSER]');
  test('NLP query parser extracts filters accurately', () => {
    const { parseNaturalLanguageQuery } = require('../src/services/jobs/aiJobMatchEngine.ts');
    const res = parseNaturalLanguageQuery('Find remote React or Python roles in Bangalore paying over 20 LPA');
    assert.strictEqual(res.workModeFilter, 'remote', 'Should detect remote work mode');
    assert.strictEqual(res.cityFilter, 'bangalore', 'Should detect bangalore city');
    assert.strictEqual(res.minSalaryLakhs, 20, 'Should detect 20 LPA min salary');
    assert(res.parsedKeywords.includes('react') || res.parsedKeywords.includes('python'), 'Should extract react/python keywords');
    console.log(`      Extracted: City=${res.cityFilter}, Mode=${res.workModeFilter}, MinCTC=₹${res.minSalaryLakhs}L, Keywords=${res.parsedKeywords.join(', ')}`);
  });

  console.log('\n[SECTION 5: INTERVIEW PREP GENERATOR]');
  test('Interview prep coach generates targeted technical & STAR questions', () => {
    const { generateInterviewPrep } = require('../src/services/jobs/aiJobMatchEngine.ts');
    const questions = generateInterviewPrep('Senior SRE Engineer', ['Kubernetes', 'Prometheus'], 'PhonePe');
    assert.strictEqual(questions.length, 3, 'Expected 3 interview question categories');
    assert(questions[0].question.includes('Kubernetes'), 'Technical question should reference primary skill');
    assert(questions[1].question.includes('PhonePe'), 'Architecture question should reference company name');
    assert(questions[2].suggestedFramework.includes('STAR'), 'Behavioral question should provide STAR framework');
    console.log(`      Generated: ${questions.map(q => q.category).join(' | ')}`);
  });

  console.log('\n' + '='.repeat(75));
  console.log(`E2E SUITE RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log('='.repeat(75));
}

runSuite().catch(console.error);
