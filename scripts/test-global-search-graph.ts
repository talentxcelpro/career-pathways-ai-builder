// scripts/test-global-search-graph.ts
/**
 * TalentXcel Global Search Graph & Search Universe Operating System Test Suite
 *
 * Verifies:
 * 1. Global Location Hierarchy & Deterministic Alias Resolution (India, UAE, UK, USA, Singapore)
 * 2. 30 Search Universes Intent Classification & Product Grouping
 * 3. Search Opportunity Engine & Multi-Factor Opportunity Scoring
 * 4. Free Interactive Career Tools Conversion Funnel Mapping
 * 5. Strict Content Contracts across Primary Page Archetypes
 */

import { GlobalLocationResolver } from '../src/lib/seo/searchUniverse/globalLocationResolver';
import { SearchUniverseRegistry, SEARCH_UNIVERSES_CATALOG } from '../src/lib/seo/searchUniverse/searchUniverseRegistry';
import { SearchOpportunityEngine } from '../src/lib/seo/searchUniverse/searchOpportunityEngine';
import { ContentContractEngine } from '../src/lib/seo/searchUniverse/contentContractEngine';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
    failed++;
  }
}

async function runGlobalSearchGraphTests() {
  console.log('================================================================');
  console.log('🌍 TALENTXCEL GLOBAL SEARCH GRAPH & SEARCH UNIVERSE TEST SUITE');
  console.log('================================================================\n');

  console.log('--- 1. Testing Global Location Hierarchy & Alias Normalization ---');

  // Alias Resolution Tests
  const locBlr = GlobalLocationResolver.resolve('blr');
  assert(locBlr?.canonicalName === 'Bangalore', 'Alias "blr" resolves to Bangalore');
  assert(locBlr?.countryCode === 'IN', 'Bangalore country code is IN');

  const locBombay = GlobalLocationResolver.resolve('bombay');
  assert(locBombay?.canonicalName === 'Mumbai', 'Colloquial "bombay" resolves to Mumbai');

  const locDxb = GlobalLocationResolver.resolve('dxb');
  assert(locDxb?.canonicalName === 'Dubai', 'Airport code "dxb" resolves to Dubai');
  assert(locDxb?.currency === 'AED', 'Dubai currency resolved to AED');

  const locNyc = GlobalLocationResolver.resolve('nyc');
  assert(locNyc?.canonicalName === 'New York City', 'Acronym "nyc" resolves to New York City');
  assert(locNyc?.countryCode === 'US', 'NYC country code is US');

  const locLondon = GlobalLocationResolver.resolve('lon');
  assert(locLondon?.canonicalName === 'London', 'Alias "lon" resolves to London');
  assert(locLondon?.currency === 'GBP', 'London currency resolved to GBP');

  const locWfh = GlobalLocationResolver.resolve('wfh');
  assert(locWfh?.canonicalName === 'Remote Worldwide', 'Abbreviation "wfh" resolves to Remote Worldwide');

  // Query Extraction Tests
  const extracted = GlobalLocationResolver.extractFromQuery('software engineer jobs in bangalore');
  assert(extracted.location?.canonicalName === 'Bangalore', 'Extracted Bangalore from raw search query');
  assert(extracted.cleanQuery.includes('software engineer jobs'), 'Query cleanly partitioned without location noise');

  const extractedDubai = GlobalLocationResolver.extractFromQuery('senior python developer salary in dubai');
  assert(extractedDubai.location?.canonicalName === 'Dubai', 'Extracted Dubai from query');

  console.log('\n--- 2. Testing 31 Search Universes Registry & Intent Classification ---');
  const allUniverses = SearchUniverseRegistry.getAllUniverses();
  assert(allUniverses.length === 31, `Exactly 31 Search Universes registered (found ${allUniverses.length})`);

  // Verify Product Surface alignment with screenshot
  const findAJobUniverses = allUniverses.filter(u => u.productGroup === 'FIND_A_JOB');
  assert(findAJobUniverses.length >= 7, 'FIND_A_JOB product surface covers Jobs, Government Jobs, ATS, Remote, Freshers, etc.');

  const buildCareerUniverses = allUniverses.filter(u => u.productGroup === 'BUILD_MY_CAREER');
  assert(buildCareerUniverses.length >= 10, 'BUILD_MY_CAREER covers Passport, Map, Skills, Salary, Rankings, Colleges, Placements, etc.');

  const hireTalentUniverses = allUniverses.filter(u => u.productGroup === 'HIRE_TALENT');
  assert(hireTalentUniverses.length >= 2, 'HIRE_TALENT covers Talent Discovery, Recruiter Intelligence & Industries');

  // Classification Tests
  assert(SearchUniverseRegistry.classifyUniverse('software engineer jobs in pune') === 'JOBS', 'Classified JOBS intent');
  assert(SearchUniverseRegistry.classifyUniverse('upsc sarkari job 2026') === 'GOVERNMENT_JOBS', 'Classified GOVERNMENT_JOBS intent');
  assert(SearchUniverseRegistry.classifyUniverse('free ats resume score checker') === 'ATS_CHECKER', 'Classified ATS_CHECKER intent');
  assert(SearchUniverseRegistry.classifyUniverse('software engineer resume template word') === 'RESUME_TEMPLATES', 'Classified RESUME_TEMPLATES intent');
  assert(SearchUniverseRegistry.classifyUniverse('senior developer resume examples') === 'RESUME_EXAMPLES', 'Classified RESUME_EXAMPLES intent');
  assert(SearchUniverseRegistry.classifyUniverse('iit delhi placement report 2026') === 'PLACEMENTS', 'Classified PLACEMENTS intent');
  assert(SearchUniverseRegistry.classifyUniverse('software engineer salary in dubai') === 'SALARY', 'Classified SALARY intent');
  assert(SearchUniverseRegistry.classifyUniverse('python developer career roadmap') === 'CAREER_MAP', 'Classified CAREER_MAP intent');
  assert(SearchUniverseRegistry.classifyUniverse('react native interview questions and answers') === 'INTERVIEW_QUESTIONS', 'Classified INTERVIEW_QUESTIONS intent');

  console.log('\n--- 3. Testing Search Opportunity Engine & Opportunity Scoring ---');

  // Case A: High-Intent + High-Inventory (Software Engineer in Bangalore: 38 jobs)
  const oppHighIntent = SearchOpportunityEngine.evaluateOpportunity({
    keyword: 'software engineer jobs in bangalore',
    normalizedQuery: 'software engineer jobs bangalore',
    universeId: 'JOBS',
    canonicalEntity: 'software-engineer',
    location: locBlr,
    searchDemandScore: 95,
    entityValidityScore: 100,
    inventoryCount: 38,
    dataEvidenceScore: 95,
    uniqueValueScore: 88,
    conversionPotentialScore: 98,
    freshnessScore: 95,
    internalAuthorityScore: 85,
    competitionGapScore: 40,
  });
  assert(oppHighIntent.decision === 'BUILD_DESTINATION', 'High intent + 38 jobs yields BUILD_DESTINATION');
  assert(oppHighIntent.opportunityScore >= 75, `Opportunity score (${oppHighIntent.opportunityScore}) meets >= 75 threshold`);
  assert(oppHighIntent.recommendedUrl === '/jobs/software-engineer/bangalore', 'Recommended URL correctly constructed');

  // Case B: Zero-Inventory Job Combination (Software Engineer in TinyCity: 0 jobs)
  const oppZeroInventory = SearchOpportunityEngine.evaluateOpportunity({
    keyword: 'software engineer jobs in tinycity',
    normalizedQuery: 'software engineer jobs tinycity',
    universeId: 'JOBS',
    canonicalEntity: 'software-engineer',
    searchDemandScore: 10,
    entityValidityScore: 80,
    inventoryCount: 0, // Zero inventory!
    dataEvidenceScore: 5,
    uniqueValueScore: 10,
    conversionPotentialScore: 15,
    freshnessScore: 10,
    internalAuthorityScore: 10,
    competitionGapScore: 10,
  });
  assert(oppZeroInventory.decision === 'DO_NOT_BUILD', 'Zero active inventory yields DO_NOT_BUILD');
  assert(oppZeroInventory.opportunityScore < 40, `Zero inventory score (${oppZeroInventory.opportunityScore}) held below 40`);

  // Case C: Free ATS Tool Destination
  const oppAtsTool = SearchOpportunityEngine.evaluateOpportunity({
    keyword: 'free ats resume score checker online',
    normalizedQuery: 'free ats resume checker online',
    universeId: 'ATS_CHECKER',
    canonicalEntity: 'ats-resume-checker',
    searchDemandScore: 92,
    entityValidityScore: 100,
    inventoryCount: 50,
    dataEvidenceScore: 90,
    uniqueValueScore: 95,
    conversionPotentialScore: 100,
    freshnessScore: 90,
    internalAuthorityScore: 80,
    competitionGapScore: 70,
  });
  assert(oppAtsTool.decision === 'BUILD_DESTINATION', 'Free ATS Tool yields BUILD_DESTINATION');
  assert(oppAtsTool.freeToolConversionPath.includes('Instant ATS Scan'), 'Free ATS Tool conversion path correctly mapped');

  console.log('\n--- 4. Testing Content Contract Engine & Archetype Integrity ---');

  // Validate JOB_ROLE_CITY_PAGE contract
  const validJobData = {
    'Hero & Canonical Intent H1': ['Software Engineer Jobs in Bangalore (38 Vacancies)'],
    'Live Verified Job Inventory': ['Job 1', 'Job 2', 'Job 3', 'Job 4'],
    'Local Compensation Benchmarks': ['P25: 12 LPA', 'P50: 22 LPA', 'P75: 35 LPA'],
    'Top Hiring Companies': ['Google', 'Microsoft', 'Amazon'],
    'Core Technical Skill Demands': ['Python', 'System Design', 'React', 'AWS', 'Docker'],
    'Interactive ATS Match CTA': ['Check My Match Score in 10s'],
    'Related Cities & Sub-Roles': ['Hyderabad', 'Pune', 'Noida', 'Gurgaon'],
  };
  const validationJob = ContentContractEngine.validateContentContract('JOB_ROLE_CITY_PAGE', validJobData);
  assert(validationJob.isValid === true, 'Complete job destination data satisfies JOB_ROLE_CITY_PAGE content contract');

  // Invalidate when thin on mandatory live inventory
  const thinJobData = {
    ...validJobData,
    'Live Verified Job Inventory': ['Single Job'], // Less than min 3!
  };
  const validationThinJob = ContentContractEngine.validateContentContract('JOB_ROLE_CITY_PAGE', thinJobData);
  assert(validationThinJob.isValid === false, 'Thin inventory (< 3 jobs) fails JOB_ROLE_CITY_PAGE content contract');
  assert(validationThinJob.missingModules[0].includes('Live Verified Job Inventory'), 'Contract error specifies missing inventory');

  console.log('\n================================================================');
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGlobalSearchGraphTests().catch(err => {
  console.error('Test suite failed with error:', err);
  process.exit(1);
});
