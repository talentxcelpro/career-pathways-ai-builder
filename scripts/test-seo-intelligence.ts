/**
 * UDX v4.0 — SEO Intelligence & Control Plane Unit Verification Suite
 * 
 * Tests:
 * 1. IntentUniverse normalization & clustering
 * 2. SEODecisionEngine 13-action routing & anti-fabrication guards
 * 3. MetricsEngine IRR & SDR calculations
 * 4. ContentGovernor programmatic safety & self-correction
 * 5. ForesightEngine trajectory projection & lead time
 * 6. AgentDiscoveryLayer machine-discoverable catalog
 */

import {
  IntentUniverseEngine,
  QuerySignal,
  SEODecisionEngine,
  MetricsEngine,
  ContentGovernor,
  ForesightEngine,
  AgentDiscoveryLayer,
} from '../src/lib/udx/seo';

async function runSEOIntelligenceTests() {
  console.log('\n===================================================================');
  console.log(' UDX v4.0 — SEO INTELLIGENCE & CONTROL PLANE VERIFICATION');
  console.log('===================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ [PASS] ${testName}`);
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
    }
  }

  // ── TEST 1: IntentUniverse Normalization & Clustering ────────────────────────
  console.log('[TEST GROUP 1] IntentUniverse Engine');
  const rawQuery = '  Frontend Developer Jobs in Varanasi!!! 2026 ';
  const normalized = IntentUniverseEngine.normalizeQuery(rawQuery);
  assert(normalized === 'frontend developer jobs in varanasi 2026', 'Normalizes query text cleanly');

  const testSignals: QuerySignal[] = [
    {
      signalId: 'sig-1',
      rawQuery: 'frontend developer jobs in varanasi',
      normalizedQuery: 'frontend developer jobs in varanasi',
      source: 'GSC',
      impressions: 2500,
      clicks: 120,
      ctr: 0.048,
      avgPosition: 4.2,
      country: 'IN',
      observedAt: '2026-02-01T00:00:00Z',
      confidence: 0.95,
      evidenceId: 'EVID-TEST-1',
    },
    {
      signalId: 'sig-2',
      rawQuery: 'react developer opening varanasi',
      normalizedQuery: 'react developer opening varanasi',
      source: 'INTERNAL_SEARCH',
      impressions: 1800,
      clicks: 95,
      ctr: 0.052,
      avgPosition: 3.8,
      country: 'IN',
      observedAt: '2026-02-05T00:00:00Z',
      confidence: 0.92,
      evidenceId: 'EVID-TEST-2',
    },
  ];

  const clusteredIntent = IntentUniverseEngine.clusterSignalsToIntent(
    'Frontend developer job in Varanasi with verified salary',
    'CAREER',
    testSignals,
    16,
    ['/jobs?role=frontend-developer&location=Varanasi&verified=true'],
    ['/jobs?role=frontend-developer&location=Varanasi&verified=true']
  );

  assert(clusteredIntent.demand.totalImpressions === 4300, 'Aggregates impressions accurately (4300)');
  assert(clusteredIntent.geography.city === 'Varanasi', 'Detects geographic entity correctly (Varanasi)');
  assert(clusteredIntent.supply.status === 'SUPPLY_BALANCED', 'Correctly evaluates supply status as SUPPLY_BALANCED');

  // ── TEST 2: SEODecisionEngine & Anti-Fabrication Safeguard ───────────────────
  console.log('\n[TEST GROUP 2] SEODecisionEngine & Anti-Fabrication Safeguards');
  
  // Case A: Zero verified supply intent
  const zeroSupplyIntent = IntentUniverseEngine.clusterSignalsToIntent(
    'Blockchain developer jobs in Varanasi',
    'CAREER',
    testSignals,
    0, // ZERO verified supply!
    []
  );
  const zeroSupplyDecision = SEODecisionEngine.evaluate(zeroSupplyIntent);
  assert(zeroSupplyDecision.action === 'DO_NOT_BUILD', 'Anti-fabrication guard assigns DO_NOT_BUILD on zero supply');
  assert(zeroSupplyDecision.antiFabricationTriggered === true, 'Anti-fabrication flag is explicitly TRUE');
  assert(zeroSupplyDecision.routingTarget !== undefined, 'Routes user to verified alternative pathway');

  // Case B: ATS Tool Intent
  const atsIntent = IntentUniverseEngine.clusterSignalsToIntent(
    'ATS resume calibration checker for React and Node.js developer',
    'CAREER',
    testSignals,
    1,
    ['/tools/resume-checker'],
    ['/tools/resume-checker']
  );
  const atsDecision = SEODecisionEngine.evaluate(atsIntent);
  assert(atsDecision.action === 'BUILD_TOOL', 'Correctly routes diagnostic/eval intent to BUILD_TOOL instead of content');
  assert(atsDecision.typology === 'ACTION', 'Classifies typology as ACTION');

  // Case C: Statutory Business Registration Intent
  const bizIntent = IntentUniverseEngine.clusterSignalsToIntent(
    'Incorporate private limited company in India SPICe+',
    'BUSINESS',
    testSignals,
    1,
    ['https://www.mca.gov.in'],
    ['https://www.mca.gov.in']
  );
  const bizDecision = SEODecisionEngine.evaluate(bizIntent);
  assert(bizDecision.action === 'CREATE_BUSINESS_PATH', 'Routes statutory compliance to CREATE_BUSINESS_PATH');
  assert(bizDecision.typology === 'TRANSACTION', 'Classifies typology as TRANSACTION');

  // ── TEST 3: MetricsEngine (IRR, SDR, QIC, ADS) ──────────────────────────────
  console.log('\n[TEST GROUP 3] MetricsEngine (IRR, SDR, QIC, ADS)');
  
  const irr = MetricsEngine.calculateIRR({
    expressed: 10000,
    understood: 9600,
    relevantPaths: 9000,
    actionsExecuted: 6000,
    outcomesRecorded: 4500,
    verifiedOutcomes: 3600,
  });
  assert(irr.intentUnderstandingRate === 0.96, 'Intent Understanding Rate = 96.0%');
  assert(irr.pathRelevanceRate === 0.938, 'Path Relevance Rate = 93.8%');
  assert(irr.verifiedOutcomeRate === 0.8, 'Verified Outcome Rate = 80.0%');
  assert(irr.compositeIRR === 0.36, 'Composite IRR = 36.0%');

  const sdr = MetricsEngine.calculateSDR({
    totalResolvedObjectives: 1000,
    directResolutionWithoutSearchCount: 820,
    totalTraditionalStepsRequired: 7000,
    actualUDXStepsRequired: 1600,
    externalClicksCount: 150,
    agentAutomatedActions: 300,
  });
  assert(sdr.searchDisplacementRate === 0.82, 'Search Displacement Rate = 82.0%');
  assert(sdr.avgManualStepsSaved === 5.4, 'Manual steps saved = 5.4 steps');

  // ── TEST 4: ContentGovernor Programmatic Safety ──────────────────────────────
  console.log('\n[TEST GROUP 4] ContentGovernor & Programmatic Safety');
  
  const spamTemplateCheck = ContentGovernor.validateProposedSurface({
    urlPath: '/jobs/varanasi/react-developers-for-hire',
    intentId: 'intent-test',
    verifiedSupplyCount: 1, // Less than 3 for city template!
    hasFirstPartyEvidence: true,
    isCityTemplate: true,
  });
  assert(spamTemplateCheck.allowed === false, 'Blocks thin city x keyword template spam (supply < 3)');
  assert(spamTemplateCheck.violations.some(v => v.includes('CITY_TEMPLATE_SPAM')), 'Identifies CITY_TEMPLATE_SPAM violation');

  const zeroSupplyCheck = ContentGovernor.validateProposedSurface({
    urlPath: '/jobs/varanasi/blockchain',
    intentId: 'intent-test-2',
    verifiedSupplyCount: 0,
    hasFirstPartyEvidence: false,
    isCityTemplate: false,
  });
  assert(zeroSupplyCheck.allowed === false, 'Strictly blocks proposed surface with zero supply');

  // ── TEST 5: ForesightEngine Trajectory & Lead Time ───────────────────────────
  console.log('\n[TEST GROUP 5] ForesightEngine & Pre-Demand Lead Time');
  
  const trajectory = ForesightEngine.projectTrajectory({
    ...clusteredIntent,
    stage: 'MAINSTREAM',
    firstObservedAt: '2025-10-12T00:00:00Z',
  });
  assert(trajectory.intentLeadTimeDays !== undefined && trajectory.intentLeadTimeDays > 50, 'Calculates empirical Intent Lead Time (>50 days)');
  assert(trajectory.leadingIndicators.length > 0, 'Extracts leading indicators from telemetry mix');

  // ── TEST 6: AgentDiscoveryLayer Machine Catalog ──────────────────────────────
  console.log('\n[TEST GROUP 6] AgentDiscoveryLayer Machine Discoverability');
  
  const catalog = AgentDiscoveryLayer.getCatalog();
  assert(catalog.entities.length >= 5, 'Exposes >= 5 machine-discoverable entities');
  assert(catalog.apiEndpoint === '/api/udx/resolve', 'Binds to /api/udx/resolve');

  const resolvedAgentEntities = AgentDiscoveryLayer.resolveAgentQuery('plumbing');
  assert(resolvedAgentEntities.length > 0, 'Resolves agent query for "plumbing" to verified trade guild dispatch');
  assert(resolvedAgentEntities[0].capabilities.includes('2_HR_SLA'), 'Entity exposes structured machine capabilities (2_HR_SLA)');

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n===================================================================');
  console.log(` VERIFICATION COMPLETE: ${passedTests} / ${totalTests} CHECKS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log('===================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runSEOIntelligenceTests().catch(err => {
  console.error('[FATAL] SEO Intelligence test failed:', err);
  process.exit(1);
});
