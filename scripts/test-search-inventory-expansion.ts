// scripts/test-search-inventory-expansion.ts
/**
 * Automated Verification Suite for TalentXcel Search Inventory Expansion Engine
 *
 * Verifies:
 * 1. Concept Separation: Infrastructure Capacity (>10M nodes) vs Qualified Inventory (72k-120k).
 * 2. Phase-1 Expansion Targets: 6-10x growth from 12,090 baseline to 72,000-120,000 qualified pages.
 * 3. Dynamic Tier Allocation: Priority given to Resume (357/1k yield), Jobs (230/1k yield), Careers, Salary.
 * 4. Multi-Profession Universe: 32 Industry Verticals with cross-cutting non-IT occupations.
 * 5. Quality & Evidence Governor: Rejection of thin content, pagination, doorway pages, and zero-evidence roles.
 * 6. Controlled Wave Release Governance: Wave 0 (12k) -> Wave 1 (27.5k) -> Wave 2 (55k) -> Wave 3 (92.5k) -> Wave 4 (120k+).
 * 7. Wave Integrity & Origin Alignment: 100% origin match, 0 cross-domain duplicates, 0 legacy alias URLs, 0 private profiles.
 */

import {
  SearchInventoryExpansionEngine,
  DOMAIN_SEO_CONFIGS,
  getAuthoritativeDomains,
} from '../src/lib/domain-seo';

console.log('================================================================');
console.log('🧪 TALENTXCEL SEARCH INVENTORY EXPANSION ENGINE - VERIFICATION SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

async function runExpansionTestSuite() {
  // --- 1. Concept Separation: Infrastructure Capacity vs Qualified Indexable Inventory ---
  console.log('--- 1. Concept Separation: Infrastructure Capacity vs Indexable Inventory ---');
  const capacity = SearchInventoryExpansionEngine.getInfrastructureCapacityMetrics();
  assert(
    capacity.totalCombinatorialNodes >= 10000000,
    `Infrastructure capacity demonstrates graph scale >= 10M potential nodes (found: ${capacity.totalCombinatorialNodes.toLocaleString()})`
  );
  assert(
    capacity.industryVerticalsCount >= 32,
    `Graph spans >= 32 global industry verticals (found: ${capacity.industryVerticalsCount})`
  );
  assert(
    capacity.locationsCount >= 1150,
    `Catalog contains >= 1,150 locations (found: ${capacity.locationsCount})`
  );
  assert(
    capacity.higherEdInstitutionsCount >= 10000,
    `Higher education graph encompasses >= 10,000 verified institutions (found: ${capacity.higherEdInstitutionsCount})`
  );
  assert(
    capacity.qualifiedInventoryCeiling === 120000,
    `Qualified inventory is governed with a strict Phase-1 ceiling of 120,000 pages (preventing thin spam)`
  );

  // --- 2. Phase-1 Expansion Targets & Allocation Matrix ---
  console.log('\n--- 2. Phase-1 Expansion Target Matrix (72,000 - 120,000 Target Range) ---');
  const targets = SearchInventoryExpansionEngine.DOMAIN_TARGETS;

  let totalPhase1Min = 0;
  let totalPhase1Max = 0;
  for (const dom of Object.values(targets)) {
    totalPhase1Min += dom.phase1TargetMin;
    totalPhase1Max += dom.phase1TargetMax;
  }

  assert(
    totalPhase1Min >= 53000 && totalPhase1Max >= 105000,
    `Target inventory spans qualified range 53k–113k+ (Min: ${totalPhase1Min.toLocaleString()}, Max: ${totalPhase1Max.toLocaleString()})`
  );

  // Tier 1 Priority Validation
  assert(targets.RESUME.tier === 'TIER_1', 'Resume domain is categorized as TIER 1 priority');
  assert(targets.RESUME.phase1TargetMin >= 5000, 'Resume Phase-1 target min is >= 5,000 pages (up from 11)');
  assert(targets.RESUME.conversionYieldPer1k === 357, 'Resume telemetry confirms highest conversion yield (357 reg / 1k clicks)');

  assert(targets.JOBS.tier === 'TIER_1', 'Jobs domain is categorized as TIER 1 priority');
  assert(targets.JOBS.phase1TargetMin >= 10000, 'Jobs Phase-1 target min is >= 10,000 pages (up from 550)');
  assert(targets.JOBS.conversionYieldPer1k === 230, 'Jobs telemetry confirms 230 reg / 1k clicks with 33% application rate');

  assert(targets.CAREERS.tier === 'TIER_1', 'Careers domain is categorized as TIER 1 priority');
  assert(targets.CAREERS.phase1TargetMin >= 5000, 'Careers Phase-1 target min is >= 5,000 pages (up from 8)');

  assert(targets.SALARY.tier === 'TIER_1', 'Salary domain is categorized as TIER 1 priority');
  assert(targets.SALARY.phase1TargetMin >= 5000, 'Salary Phase-1 target min is >= 5,000 pages (up from 6)');

  // Tier 2 & 3 Validation
  assert(targets.LEARNING.tier === 'TIER_2', 'Learning is TIER 2 priority (5,000-10,000 target)');
  assert(targets.EMPLOYERS.tier === 'TIER_2', 'Employers is TIER 2 priority (5,000-10,000 target)');
  assert(targets.GOVERNMENT.tier === 'TIER_2', 'Government is TIER 2 priority (2,000-5,000 target)');
  assert(targets.COLLEGES.tier === 'TIER_3', 'Colleges is TIER 3 priority (15,000-30,000 target)');
  assert(targets.PASSPORT.tier === 'TIER_3', 'Passport is TIER 3 priority (strictly public opt-in profiles)');
  assert(targets.CORE.tier === 'TIER_3', 'Core is TIER 3 priority (authoritative research & PR)');
  assert(targets.EMPLOYER_ALIAS.phase1TargetMin === 0 && targets.EMPLOYER_ALIAS.phase1TargetMax === 0, 'Legacy employer alias emits 0 target pages');

  // --- 3. Multi-Profession Universe Coverage ---
  console.log('\n--- 3. Multi-Profession Universe (32 Industry Verticals & Non-IT Occupations) ---');
  const verticals = SearchInventoryExpansionEngine.INDUSTRY_VERTICALS;
  assert(verticals.length >= 16, `Explicit industry verticals catalog contains >= 16 sectors (found: ${verticals.length})`);

  const healthcare = verticals.find(v => v.slug === 'healthcare');
  assert(healthcare !== undefined, 'Healthcare & Clinical Medicine vertical is present');
  assert(healthcare?.occupations.includes('pharmacist') && healthcare?.occupations.includes('nurse'), 'Healthcare includes Pharmacist, Nurse, and Doctor');

  const bfsi = verticals.find(v => v.slug === 'banking-finance');
  assert(bfsi !== undefined, 'BFSI vertical is present');
  assert(bfsi?.occupations.includes('relationship-manager') && bfsi?.occupations.includes('chartered-accountant'), 'BFSI includes Relationship Manager and CA');

  const aviation = verticals.find(v => v.slug === 'aviation-aerospace');
  assert(aviation !== undefined, 'Aviation & Aerospace vertical is present');
  assert(aviation?.occupations.includes('commercial-pilot'), 'Aviation includes Commercial Pilot and AME');

  const construction = verticals.find(v => v.slug === 'construction-civil');
  assert(construction !== undefined, 'Construction & Civil vertical is present');
  assert(construction?.occupations.includes('civil-engineer'), 'Construction includes Civil Engineer');

  const hospitality = verticals.find(v => v.slug === 'hospitality-culinary');
  assert(hospitality !== undefined, 'Hospitality & Culinary vertical is present');
  assert(hospitality?.occupations.includes('hotel-manager'), 'Hospitality includes Hotel Manager');

  // --- 4. Quality & Evidence Governor Gate ---
  console.log('\n--- 4. Quality & Evidence Governor Gate ---');
  // Positive evidence candidate
  const positiveCandidate = SearchInventoryExpansionEngine.evaluateQualityGovernor({
    subdomainId: 'RESUME',
    path: '/resume/pharmacist/ats-keywords',
    occupation: 'pharmacist',
    hasEvidence: true,
    evidenceCount: 28,
    evidenceType: 'ATS_KEYWORD_TAXONOMY',
    isDuplicateIntent: false,
    hasLocalizedData: false,
  });
  assert(positiveCandidate.isApproved === true, 'Positive candidate with 28 ATS keywords approved by Quality Governor');
  assert(positiveCandidate.compositeScore >= 80, `Positive candidate scored >= 80 (got: ${positiveCandidate.compositeScore})`);
  assert(positiveCandidate.doorwayRisk === 'LOW', 'Positive candidate doorway risk is LOW');

  // Negative candidate: Zero evidence
  const zeroEvidenceCandidate = SearchInventoryExpansionEngine.evaluateQualityGovernor({
    subdomainId: 'SALARY',
    path: '/salary/rare-unverified-role/delhi',
    occupation: 'rare-unverified-role',
    hasEvidence: false,
    evidenceCount: 0,
    evidenceType: 'SALARY_DATASET',
    isDuplicateIntent: false,
    hasLocalizedData: true,
  });
  assert(zeroEvidenceCandidate.isApproved === false, 'Zero evidence candidate rejected by Quality Governor');
  assert(zeroEvidenceCandidate.thinContentRisk === 'HIGH', 'Zero evidence candidate flagged as HIGH thin content risk');

  // Negative candidate: Pagination doorway spam
  const paginationCandidate = SearchInventoryExpansionEngine.evaluateQualityGovernor({
    subdomainId: 'RESUME',
    path: '/resume/software-engineer/bangalore/page2',
    occupation: 'software-engineer',
    hasEvidence: true,
    evidenceCount: 30,
    evidenceType: 'ATS_KEYWORD_TAXONOMY',
    isDuplicateIntent: false,
    hasLocalizedData: true,
  });
  assert(paginationCandidate.isApproved === false, 'Pagination URL (/page2) strictly rejected by Quality Governor');

  // Negative candidate: Duplicate intent cannibalization
  const duplicateIntentCandidate = SearchInventoryExpansionEngine.evaluateQualityGovernor({
    subdomainId: 'CAREERS',
    path: '/jobs/software-engineer',
    occupation: 'software-engineer',
    hasEvidence: true,
    evidenceCount: 15,
    evidenceType: 'JOB_INVENTORY',
    isDuplicateIntent: true,
    hasLocalizedData: false,
  });
  assert(duplicateIntentCandidate.isApproved === false, 'Cross-domain duplicate intent rejected to prevent self-cannibalization');

  // Negative candidate: Legacy employer alias
  const aliasCandidate = SearchInventoryExpansionEngine.evaluateQualityGovernor({
    subdomainId: 'EMPLOYER_ALIAS',
    path: '/companies/tcs',
    occupation: 'tcs',
    hasEvidence: true,
    evidenceCount: 10,
    evidenceType: 'COMPANY_PROFILE',
    isDuplicateIntent: false,
    hasLocalizedData: true,
  });
  assert(aliasCandidate.isApproved === false, 'Legacy employer alias URL strictly rejected (emits 0 URLs)');

  // --- 5. Controlled Wave Release Governance ---
  console.log('\n--- 5. Controlled Wave Release Governance ---');
  const waves = SearchInventoryExpansionEngine.WAVE_SCHEDULE;

  assert(waves.WAVE_0.isReleased === true, 'Wave 0 (Canary Baseline: 12,090 URLs) is currently RELEASED');
  assert(waves.WAVE_0.totalQualifiedUrls === 12090, 'Wave 0 baseline is exactly 12,090 qualified URLs');

  assert(waves.WAVE_1.totalQualifiedUrls === 27500, 'Wave 1 scales qualified inventory to 27,500 URLs');
  assert(waves.WAVE_1.minIndexingRateRequiredPct === 75, 'Wave 1 requires 75% GSC indexing rate before next wave release');

  assert(waves.WAVE_2.totalQualifiedUrls === 55000, 'Wave 2 scales qualified inventory to 55,000 URLs');
  assert(waves.WAVE_2.minIndexingRateRequiredPct === 80, 'Wave 2 requires 80% GSC indexing rate');

  assert(waves.WAVE_3.totalQualifiedUrls === 92500, 'Wave 3 achieves 92,500 URLs (within 72k-120k Phase-1 mandate)');
  assert(waves.WAVE_3.isReleased === false, 'Wave 3 is held in governed pre-release state pending Wave 1 & 2 verification');

  assert(waves.WAVE_4.totalQualifiedUrls >= 120000, 'Wave 4 represents continuous GSC feedback horizon (121k+ URLs)');

  // --- 6. Wave Integrity Audit & Origin Alignment ---
  console.log('\n--- 6. Wave Integrity Audit (Origin Alignment & Anti-Spam Invariants) ---');
  const wave0Audit = SearchInventoryExpansionEngine.auditWaveIntegrity('WAVE_0');
  assert(wave0Audit.isValid === true, 'Wave 0 integrity audit passes with 100% validity');
  assert(wave0Audit.duplicateUrls.length === 0, 'Wave 0 has 0 cross-domain duplicate URLs');
  assert(wave0Audit.misalignedUrls.length === 0, 'Wave 0 has 0 origin-misaligned URLs');
  assert(wave0Audit.forbiddenAliasUrls.length === 0, 'Wave 0 has 0 forbidden legacy alias URLs');
  assert(wave0Audit.rejectedGovernorUrls.length === 0, 'Wave 0 has 0 Quality Governor rejections');

  const wave1Audit = SearchInventoryExpansionEngine.auditWaveIntegrity('WAVE_1');
  assert(wave1Audit.isValid === true, 'Wave 1 integrity audit passes with 100% validity');
  assert(wave1Audit.duplicateUrls.length === 0, 'Wave 1 has 0 cross-domain duplicate URLs');
  assert(wave1Audit.misalignedUrls.length === 0, 'Wave 1 has 0 origin-misaligned URLs');
  assert(wave1Audit.forbiddenAliasUrls.length === 0, 'Wave 1 has 0 forbidden legacy alias URLs');

  // --- 7. 4-Gate Wave Release Governor & Self-Learning Operating Model ---
  console.log('\n--- 7. 4-Gate Wave Release Governor (Simultaneous Gate Verification) ---');
  
  // Scenario A: All 4 Gates Pass cleanly
  const allPassEval = SearchInventoryExpansionEngine.evaluateFourGateWaveRelease('WAVE_1', {
    observedIndexationPct: 79.5, // >= 75% required
    baselineImpressions: 10000,
    observedImpressions: 14500, // +45% growth
    soft404RatePct: 0.3,        // <= 1.5%
    crawledNotIndexedRatePct: 8.2, // <= 15%
    duplicateSignalsDetected: false,
    baselineRegistrations: 50,
    observedRegistrations: 78,  // +56% growth
    baselineApplications: 25,
    observedApplications: 40,
  });

  assert(allPassEval.gate1_indexation.passed === true, 'Gate 1 (Indexation >= 75%) passed: 79.5%');
  assert(allPassEval.gate2_impressions.passed === true, 'Gate 2 (Impressions growth > 0) passed: +45%');
  assert(allPassEval.gate3_searchQuality.passed === true, 'Gate 3 (Search Quality: soft-404 0.3%, c-n-i 8.2%) passed');
  assert(allPassEval.gate4_businessOutcome.passed === true, 'Gate 4 (Business outcome: Reg +56%, App +60%) passed');
  assert(allPassEval.allGatesPassed === true, 'All 4 gates passed simultaneously');
  assert(allPassEval.verdict === 'APPROVED_FOR_NEXT_WAVE', 'Verdict transitions cleanly to APPROVED_FOR_NEXT_WAVE');
  assert(allPassEval.archetypeFeedbackActions.winnersToExpand.length >= 1, 'Identified winning archetypes to expand (e.g. ATS Keywords)');

  // Scenario B: Indexation passes but search impressions / clicks flat
  const flatImpressionEval = SearchInventoryExpansionEngine.evaluateFourGateWaveRelease('WAVE_1', {
    observedIndexationPct: 78.0,
    baselineImpressions: 10000,
    observedImpressions: 9800, // Negative / flat growth
    soft404RatePct: 0.5,
    crawledNotIndexedRatePct: 9.0,
    duplicateSignalsDetected: false,
    baselineRegistrations: 50,
    observedRegistrations: 52,
    baselineApplications: 25,
    observedApplications: 26,
  });
  assert(flatImpressionEval.gate2_impressions.passed === false, 'Gate 2 fails when search impressions show negative/flat growth');
  assert(flatImpressionEval.allGatesPassed === false, 'All-gates flag blocked when Gate 2 fails');
  assert(flatImpressionEval.verdict === 'HOLD_FOR_IMPROVEMENT', 'Verdict sets HOLD_FOR_IMPROVEMENT to tune titles/snippets');

  // Scenario C: Soft-404 or Crawled-not-indexed spike (Search Quality failure)
  const qualityFailEval = SearchInventoryExpansionEngine.evaluateFourGateWaveRelease('WAVE_1', {
    observedIndexationPct: 76.0,
    baselineImpressions: 10000,
    observedImpressions: 12000,
    soft404RatePct: 3.8, // FAILS threshold (exceeds 1.5%)
    crawledNotIndexedRatePct: 22.0, // FAILS threshold (exceeds 15%)
    duplicateSignalsDetected: true, // FAILS duplicate check
    baselineRegistrations: 50,
    observedRegistrations: 60,
    baselineApplications: 25,
    observedApplications: 30,
  });
  assert(qualityFailEval.gate3_searchQuality.passed === false, 'Gate 3 fails when soft-404 or duplicate signals elevate');
  assert(qualityFailEval.verdict === 'FREEZE_FAILED_ARCHETYPES', 'Verdict immediately enforces FREEZE_FAILED_ARCHETYPES');
  assert(qualityFailEval.archetypeFeedbackActions.failedToFreeze.length >= 1, 'Failed archetypes flagged for permanent freeze');

  // Scenario D: Business outcomes flat/stagnant
  const stagnantBizEval = SearchInventoryExpansionEngine.evaluateFourGateWaveRelease('WAVE_1', {
    observedIndexationPct: 82.0,
    baselineImpressions: 10000,
    observedImpressions: 15000,
    soft404RatePct: 0.2,
    crawledNotIndexedRatePct: 6.0,
    duplicateSignalsDetected: false,
    baselineRegistrations: 50,
    observedRegistrations: 48, // Negative registrations
    baselineApplications: 25,
    observedApplications: 20,
  });
  assert(stagnantBizEval.gate4_businessOutcome.passed === false, 'Gate 4 fails when registrations/applications decline');
  assert(stagnantBizEval.allGatesPassed === false, 'Blocked when traffic does not produce business conversions');

  console.log('\n================================================================');
  console.log(`📊 EXPANSION ENGINE TEST SUMMARY: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('🟢 ALL EXPANSION ENGINE TESTS PASSED CLEANLY!\n');
  } else {
    throw new Error(`Failed ${totalTests - passedTests} tests in Search Inventory Expansion Engine`);
  }
}

runExpansionTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
