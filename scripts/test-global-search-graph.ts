/**
 * TALENTXCEL GLOBAL SEARCH GRAPH ENGINE — VERIFICATION TEST SUITE
 * Script: scripts/test-global-search-graph.ts
 *
 * Verifies:
 * 1. Global Entity & Location Graph (Hierarchy, IDs, Aliases, Cross-border)
 * 2. 6-Tier Occupation Taxonomy & Multi-Currency Compensation Engine
 * 3. Semantic Search Intent Matrix & Anti-Cartesian Validation Engine
 * 4. Evidence Provenance Ledger, 12-Factor Saturation & Freshness TTL Engine
 * 5. Global Page Quality Score (0-100) & 12 Segmented Sitemap Manifests
 * 6. Executive Funnel Telemetry, ₹0 Cash Economics & Growth Wedge Winner Replication
 */

import {
  globalEntityGraph,
  globalOccupationTaxonomy,
  globalIntentMatrix,
  evidenceProvenanceLedger,
  globalIndexationGovernor,
  globalSearchTelemetry,
} from '../src/lib/seo/globalSearchGraph';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
    if (detail) {
      console.error(`    Detail: ${detail}`);
    }
  }
}

console.log('\n================================================================');
console.log('TALENTXCEL GLOBAL SEARCH GRAPH ENGINE: VERIFICATION SUITE');
console.log('================================================================\n');

// ============================================================================
// SUITE 1: GLOBAL ENTITY & LOCATION GRAPH
// ============================================================================
console.log('--- SUITE 1: Global Entity & Location Graph ---');

// 1.1 Root World Node Exists
const worldNode = globalEntityGraph.getLocation('LOC-GLB-WORLD');
assert(!!worldNode && worldNode.level === 'WORLD', 'Root LOC-GLB-WORLD exists with level WORLD');

// 1.2 Country Nodes Exist
const indiaNode = globalEntityGraph.getLocation('LOC-IN');
const usNode = globalEntityGraph.getLocation('LOC-US');
const ukNode = globalEntityGraph.getLocation('LOC-GB');
const uaeNode = globalEntityGraph.getLocation('LOC-AE');
assert(!!indiaNode && indiaNode.countryCode === 'IN', 'India country node (LOC-IN) registered');
assert(!!usNode && usNode.countryCode === 'US', 'US country node (LOC-US) registered');
assert(!!ukNode && ukNode.countryCode === 'GB', 'UK country node (LOC-GB) registered');
assert(!!uaeNode && uaeNode.countryCode === 'AE', 'UAE country node (LOC-AE) registered');

// 1.3 Hierarchy Ancestor Traversal
const bangaloreAncestors = globalEntityGraph.getAncestors('LOC-IN-BLR');
const ancestorIds = bangaloreAncestors.map((a) => a.entityId);
assert(
  ancestorIds.includes('LOC-IN-KA') && (ancestorIds.includes('LOC-IN-COUNTRY') || ancestorIds.includes('LOC-IN')) && ancestorIds.includes('LOC-GLB-WORLD'),
  'Bangalore (LOC-IN-BLR) traverses up to Karnataka, India, and World'
);

// 1.4 Varanasi Telemetry Hero Node
const vnsNode = globalEntityGraph.getLocation('LOC-IN-VNS');
assert(!!vnsNode && vnsNode.canonicalName === 'Varanasi', 'Varanasi (LOC-IN-VNS) location node exists');

// 1.5 Alias Resolution
const resolvedBlr = globalEntityGraph.resolveLocation('Bengaluru');
const resolvedVns1 = globalEntityGraph.resolveLocation('Benares');
const resolvedVns2 = globalEntityGraph.resolveLocation('Kashi');
const resolvedNyc = globalEntityGraph.resolveLocation('New York City');
assert(resolvedBlr?.entityId === 'LOC-IN-BLR', 'Alias "Bengaluru" resolves to LOC-IN-BLR');
assert(resolvedVns1?.entityId === 'LOC-IN-VNS', 'Alias "Benares" resolves to LOC-IN-VNS');
assert(resolvedVns2?.entityId === 'LOC-IN-VNS', 'Alias "Kashi" resolves to LOC-IN-VNS');
assert(resolvedNyc?.entityId === 'LOC-US-NYC', 'Alias "New York City" resolves to LOC-US-NYC');

// 1.6 Global Search Demand Aggregation
const demandMetrics = globalEntityGraph.aggregateDemand('LOC-IN');
assert(demandMetrics.totalJobOpenings > 50000, `India job openings aggregated: ${demandMetrics.totalJobOpenings}`);

// ============================================================================
// SUITE 2: 6-TIER OCCUPATION TAXONOMY & MULTI-CURRENCY COMPENSATION
// ============================================================================
console.log('\n--- SUITE 2: 6-Tier Occupation Taxonomy & Multi-Currency Compensation ---');

// 2.1 Software Engineer Node Exists with Full 6-Tier Mapping
const sweNode = globalOccupationTaxonomy.getOccupation('OCC-SWE');
assert(
  !!sweNode && sweNode.tier === 'OCCUPATION' && sweNode.industryId === 'IND-TECH',
  'Software Engineer (OCC-SWE) mapped to IND-TECH'
);

// 2.2 Healthcare & Finance Occupations
const craNode = globalOccupationTaxonomy.getOccupation('OCC-CRA');
const caNode = globalOccupationTaxonomy.getOccupation('OCC-CA');
assert(!!craNode && craNode.industryId === 'IND-HEALTH', 'Clinical Research Associate (OCC-CRA) mapped to IND-HEALTH');
assert(!!caNode && caNode.industryId === 'IND-FIN', 'Chartered Accountant (OCC-CA) mapped to IND-FIN');

// 2.3 Multi-Currency Baseline Benchmarks
assert(sweNode?.salaryBenchmark?.currency === 'INR', 'India default currency is INR');
assert(sweNode?.salaryBenchmark?.percentileP50 === 18.0, 'SWE Median P50 is 18.0 LPA');
assert(sweNode?.salaryBenchmark?.regionalMultipliers?.['US'] === 5.2, 'US Regional multiplier defined (5.2x)');
assert(sweNode?.salaryBenchmark?.regionalMultipliers?.['GB'] === 4.1, 'GB Regional multiplier defined (4.1x)');
assert(sweNode?.salaryBenchmark?.regionalMultipliers?.['AE'] === 3.8, 'AE Regional multiplier defined (3.8x)');

// 2.4 Fuzzy Role Resolution
const resolvedSweAlias = globalOccupationTaxonomy.resolveOccupation('React Developer');
const resolvedDataAnalyst = globalOccupationTaxonomy.resolveOccupation('Junior Data Analyst');
assert(resolvedSweAlias?.slug === 'software-engineer', 'Alias "React Developer" resolves to software-engineer');
assert(resolvedDataAnalyst?.slug === 'data-analyst', 'Alias "Junior Data Analyst" resolves to data-analyst');


// ============================================================================
// SUITE 3: SEMANTIC SEARCH INTENT MATRIX & ANTI-CARTESIAN VALIDATION
// ============================================================================
console.log('\n--- SUITE 3: Semantic Search Intent Matrix & Anti-Cartesian Validation ---');

// 3.1 Intent Classification
const jobIntent = globalIntentMatrix.classifyIntent('software engineer jobs in bangalore');
const salaryIntent = globalIntentMatrix.classifyIntent('average data analyst salary in kolkata');
const resumeIntent = globalIntentMatrix.classifyIntent('react developer resume ats keywords template');
const learnIntent = globalIntentMatrix.classifyIntent('clinical research associate certification course syllabus');
const govIntent = globalIntentMatrix.classifyIntent('ias officer upsc syllabus exam pattern');

assert(jobIntent.intentType === 'JOB_SEARCH', 'Query classified as JOB_SEARCH');
assert(salaryIntent.intentType === 'SALARY_BENCHMARK', 'Query classified as SALARY_BENCHMARK');
assert(resumeIntent.intentType === 'RESUME_ATS', 'Query classified as RESUME_ATS');
assert(learnIntent.intentType === 'SKILL_ACQUISITION', 'Query classified as SKILL_ACQUISITION');
assert(govIntent.intentType === 'GOVERNMENT_EXAM', 'Query classified as GOVERNMENT_EXAM');

// 3.2 Canonical URL Domain Routing
assert(jobIntent.primaryDomain === 'jobs.talentxcel.in', 'Job search routes to jobs.talentxcel.in');
assert(salaryIntent.primaryDomain === 'salary.talentxcel.in', 'Salary intent routes to salary.talentxcel.in');
assert(resumeIntent.primaryDomain === 'resume.talentxcel.in', 'Resume intent routes to resume.talentxcel.in');
assert(learnIntent.primaryDomain === 'learning.talentxcel.in', 'Learning intent routes to learning.talentxcel.in');
assert(govIntent.primaryDomain === 'government.talentxcel.in', 'Government exam intent routes to government.talentxcel.in');

// 3.3 Anti-Cartesian Explosion Validation
const validPair = globalIntentMatrix.validateCartesianPair('OCC-SWE', 'LOC-IN-BLR');
const absurdPair = globalIntentMatrix.validateCartesianPair('OCC-SWE', 'LOC-IN-RURAL-ISLAND');
assert(validPair.isValid, 'Software Engineer in Bangalore is semantically VALID');
assert(!absurdPair.isValid, 'Software Engineer in Rural Island is flagged as INVALID (Anti-Cartesian gate)');

// ============================================================================
// SUITE 4: EVIDENCE PROVENANCE LEDGER, 12-FACTOR SATURATION & TTL ENGINE
// ============================================================================
console.log('\n--- SUITE 4: Evidence Provenance Ledger, 12-Factor Saturation & TTL ---');

// 4.1 Proven Occupation Saturation
const sweSaturation = evidenceProvenanceLedger.evaluateSaturation('OCC-SWE');
assert(sweSaturation.totalFactors === 12, 'Total evaluated factors equals exactly 12');
assert(sweSaturation.satisfiedFactors === 12, 'Software Engineer satisfies 12/12 factors');
assert(sweSaturation.saturationPercentage === 100.0, 'Software Engineer saturation is 100.0%');
assert(sweSaturation.isEligibleForIndexable, 'Software Engineer is eligible for INDEXABLE');

// 4.2 Candidate Occupation Lacking Factors
const quantumSaturation = evidenceProvenanceLedger.evaluateSaturation('OCC-QUANTUM-COMP');
assert(quantumSaturation.satisfiedFactors < 6, 'Quantum Computing Specialist has < 6 factors');
assert(!quantumSaturation.isEligibleForBuildable, 'Quantum Computing Specialist denied BUILDABLE');
assert(!quantumSaturation.isEligibleForIndexable, 'Quantum Computing Specialist denied INDEXABLE');

// 4.3 Lifecycle State Enforcement
const sweStage = evidenceProvenanceLedger.getLifecycleStage('OCC-SWE');
assert(sweStage === 'PROVEN', 'Software Engineer current lifecycle stage is PROVEN');

// 4.4 Transition Guardrails
const illegalTransition = evidenceProvenanceLedger.transitionLifecycle(
  'OCC-QUANTUM-COMP',
  'INDEXABLE',
  'Attempted forced indexation without evidence'
);
assert(!illegalTransition.success, 'Guardrail blocked INDEXABLE transition for unsaturated entity');

// 4.5 Freshness Audit
const sweAudit = evidenceProvenanceLedger.auditEntity('OCC-SWE');
assert(sweAudit.freshnessHealth === 'FRESH', 'Software Engineer evidence is FRESH');

// ============================================================================
// SUITE 5: GLOBAL PAGE QUALITY SCORE & 12 SEGMENTED SITEMAP MANIFESTS
// ============================================================================
console.log('\n--- SUITE 5: Global Page Quality Score & Segmented Sitemaps ---');

// 5.1 High Quality Page Evaluation
const highQualityEval = globalIndexationGovernor.evaluatePageQuality({
  entityId: 'OCC-SWE',
  targetUrl: 'https://jobs.talentxcel.in/in/bangalore/software-engineer',
  intentType: 'JOB_SEARCH',
  locationId: 'LOC-IN-BLR',
  occupationId: 'OCC-SWE',
  searchImpressions: 497,
  backlinksCount: 15,
});

assert(highQualityEval.isIndexable, 'High-quality saturated page is INDEXABLE');
assert(highQualityEval.robotsMeta === 'index, follow', 'Emits robots meta "index, follow"');
assert(highQualityEval.compositeScore >= 80, `High composite score: ${highQualityEval.compositeScore}/100`);
assert(highQualityEval.recommendation === 'SUBMIT_TO_SITEMAP', 'Recommended for SUBMIT_TO_SITEMAP');

// 5.2 Low Quality / Unsaturated Page Evaluation
const lowQualityEval = globalIndexationGovernor.evaluatePageQuality({
  entityId: 'OCC-QUANTUM-COMP',
  targetUrl: 'https://careers.talentxcel.in/quantum-computing-specialist',
  intentType: 'CAREER_PROGRESSION',
  occupationId: 'OCC-QUANTUM-COMP',
  searchImpressions: 0,
});

assert(!lowQualityEval.isIndexable, 'Unsaturated page is strictly NOINDEX');
assert(lowQualityEval.robotsMeta === 'noindex, follow', 'Emits robots meta "noindex, follow"');
assert(lowQualityEval.gateFailures.length > 0, 'Lists explicit gate failures');

// 5.3 12 Segmented Sitemap Manifests
const sitemapManifests = globalIndexationGovernor.generateSegmentedSitemapManifests();
const sitemapKeys = Object.keys(sitemapManifests);
assert(sitemapKeys.length === 12, 'Generates exactly 12 segmented sitemaps');

// Verify all manifests are validated with zero errors
let allManifestsValid = true;
for (const key of sitemapKeys) {
  const m = sitemapManifests[key as keyof typeof sitemapManifests];
  if (!m.isValidated || m.validationErrors.length > 0) {
    allManifestsValid = false;
    console.error(`Sitemap validation error in ${key}:`, m.validationErrors);
  }
}
assert(allManifestsValid, 'All 12 segmented sitemaps pass strict manifest validation');

// ============================================================================
// SUITE 6: EXECUTIVE TELEMETRY, ZERO CASH ECONOMICS & WINNER REPLICATION
// ============================================================================
console.log('\n--- SUITE 6: Executive Telemetry, Zero Cash Economics & Winner Replication ---');

// 6.1 Funnel Snapshot
const funnel = globalSearchTelemetry.getFunnelSnapshot();
assert(funnel.modeledTotalOpportunities === 1057488000, 'Modeled combinatorial opportunities = 1.057B');
assert(funnel.qualifiedDemandNodes === 124500, 'Qualified demand nodes = 124,500');
assert(funnel.evidenceBackedNodes === 14200, 'Evidence-backed nodes = 14,200');
assert(funnel.buildablePages === 11200, 'Buildable pages = 11,200');
assert(funnel.indexablePages === 8450, 'Indexable pages = 8,450');
assert(funnel.indexedUrlsGSC === 8450, 'Indexed URLs in GSC = 8,450');
assert(funnel.compositeCtr === 2.5, 'Composite CTR = 2.50%');
assert(funnel.signupConversionRate === 10.99, 'Signup rate = 10.99%');

// 6.2 Zero Incremental Cash Economics
const ledger = globalSearchTelemetry.getEconomicLedger();
assert(ledger.costModel === 'ZERO_INCREMENTAL_CASH', 'Cost model is ZERO_INCREMENTAL_CASH');
assert(ledger.actualCashSpend === 0, 'Actual cash spend is ₹0');
assert(ledger.evidenceProductionCashCostPerOccupation === 0, 'Cash cost per occupation is ₹0');
assert(ledger.legacyProjectedCashSpend === 120000, 'Legacy projected spend for 100 occupations = ₹120,000');
assert(ledger.cumulativeCashSavedINR === 120000, 'Cumulative cash saved = ₹120,000');

// 6.3 Proven Telemetry Winners & Replication Wedges
const winners = globalSearchTelemetry.getProvenWinners();
assert(winners.length >= 4, 'Includes at least 4 validated telemetry winner wedges');

const vnsWedge = winners.find((w) => w.wedgeId === 'WEDGE-VNS-JOBS');
assert(!!vnsWedge && vnsWedge.historicalImpressions === 3335, 'Varanasi wedge confirmed with 3,335 impressions');
assert(vnsWedge?.treatmentLiftObserved === 116.0, 'Varanasi 10-second match widget lift confirmed (+116%)');
assert((vnsWedge?.replicationCandidates.length || 0) > 0, 'Varanasi replication candidates generated (Prayagraj, Ayodhya, etc.)');

// 6.4 Scale Projection to 40,000-50,000 Registrations/day
const scalePlan = globalSearchTelemetry.projectScaleTarget(40000);
assert(scalePlan.targetDailySignups === 40000, 'Target daily signups = 40,000');
assert(scalePlan.requiredQualifiedVisitsPerDay > 200000, 'Visits required calculated mathematically');
assert(scalePlan.strategicLever.length >= 4, 'Strategic acquisition levers defined');

// ============================================================================
// TEST SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
