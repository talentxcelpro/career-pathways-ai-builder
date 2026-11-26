// scripts/test-search-demand-intelligence.ts
// Comprehensive Phase 17 Verification Suite: normalization, dedup, classification, canonical routing,
// explainable 7-factor scoring, GSC A-I opportunity detection, qualification gates, internal linking,
// 25 content briefs, and streaming SQLite ingestion restartability + idempotency.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  assignExecutionPriorityTier,
  buildEmpiricalCtrCohorts,
  classifyCannibalizationCluster,
  classifyKeyword,
  classifyPageFeedback,
  computeKeywordFingerprint,
  consolidateExecutionQueue,
  describeEvidenceStatus,
  detectGscOpportunities,
  detectPhase12Regressions,
  evaluateCtrRecovery,
  evaluateKeywordQuality,
  evaluatePageQualification,
  FastTaxonomyMatcher,
  generateCompliantDiscoverySeeds,
  generateContentBrief,
  generateCtrMetadataCandidates,
  generateInternalLinkRecommendations,
  getPositionBand,
  isPlausibleCandidateCombination,
  normalizeKeyword,
  planExecutionBatches,
  scoreOpportunity,
  SEO_OPPORTUNITY_TYPES,
  StreamingClusterAggregator,
  summarizeGscMonitoring,
  transitionActionGovernance,
  transitionPhase4Action,
  UNIFIED_30_INDUSTRIES,
  validateScoringWeights,
} from '../src/lib/seo/demandIntelligence/index';
import { isNoindexPath } from '../src/config/seo';
import { runIngest1mCorpus } from './search-intelligence/ingest-1m-corpus';
import { openWarehouse } from './search-intelligence/sqliteWarehouse';

async function runTests() {
  let passed = 0;
  const test = (name: string, fn: () => void | Promise<void>) =>
    Promise.resolve(fn()).then(() => {
      passed += 1;
      console.log(`PASS: ${name}`);
    });

  await test('1. Normalization & regional variant preservation (CV vs Resume, Fresher, Spam rejection)', () => {
    const fresher = normalizeKeyword('  Software Engineer Jobs in Bangalore for Freshers! ');
    assert.equal(fresher.isValid, true);
    assert.ok(fresher.normalizedKeyword.includes('fresher'));

    const ukCv = normalizeKeyword('graduate developer cv template uk');
    const usRes = normalizeKeyword('graduate developer resume template usa');
    assert.notEqual(ukCv.keywordHash, usRes.keywordHash);
    assert.equal(computeKeywordFingerprint('abc'), computeKeywordFingerprint('abc'));

    const urlSpam = normalizeKeyword('http://malicious.site free jobs');
    const phoneSpam = normalizeKeyword('call 9876543210 for job');
    assert.equal(urlSpam.isValid, false);
    assert.equal(phoneSpam.isValid, false);
  });

  await test('2. Taxonomy coverage (>= 30 industries & compliant LinkedIn/Naukri/Indeed seeds)', () => {
    assert.ok(UNIFIED_30_INDUSTRIES.length >= 30, `Expected >=30 industries, got ${UNIFIED_30_INDUSTRIES.length}`);
    const seeds = generateCompliantDiscoverySeeds();
    const sources = new Set(seeds.map((s) => s.sourceType));
    assert.ok(sources.has('TAXONOMY_EXPANSION_LINKEDIN_INSPIRED'));
    assert.ok(sources.has('TAXONOMY_EXPANSION_NAUKRI_INSPIRED'));
    assert.ok(sources.has('TAXONOMY_EXPANSION_INDEED_INSPIRED'));
  });

  await test('3. Multi-dimensional classification & canonical route fixing (fixes legacy /career/ CSV mappings)', () => {
    const ats = classifyKeyword('free ats resume checker online');
    assert.ok(ats);
    assert.equal(ats.searchIntent, 'resume_ats');
    assert.equal(ats.recommendedDestination, '/resume/ats-check');
    assert.equal(ats.recommendedCanonicalUrl, 'https://talentxcel.in/resume/ats-check');

    const roleCity = classifyKeyword('Senior Python Software Engineer remote jobs in Bengaluru');
    assert.ok(roleCity);
    assert.equal(roleCity.jobRoleSlug, 'software-engineer');
    assert.equal(roleCity.skillSlug, 'python');
    assert.equal(roleCity.citySlug, 'bangalore');
    assert.equal(roleCity.countryCode, 'IN');
    assert.equal(roleCity.seniority, 'senior');
    assert.equal(roleCity.workMode, 'remote');
    assert.ok(roleCity.entities.length >= 3);

    const salary = classifyKeyword('data analyst salary in india');
    assert.ok(salary);
    assert.equal(salary.searchIntent, 'salary_benchmark');
    assert.equal(salary.recommendedDestination, '/salary/data-analyst');
    assert.equal(salary.recommendedCanonicalUrl, 'https://salary.talentxcel.in/salary/data-analyst');

    // Regression tests: English preposition "in" must NOT shadow target countries UAE/UK/US,
    // and ecosystem intents (colleges, government jobs) must map to their dedicated hubs.
    const uae = classifyKeyword('hr jobs in uae');
    assert.ok(uae);
    assert.equal(uae.countryCode, 'AE');
    assert.equal(uae.jobRoleSlug, 'recruiter');
    assert.equal(uae.recommendedDestination, '/jobs/recruiter/uae');

    const govt = classifyKeyword('government jobs india');
    assert.ok(govt);
    assert.equal(govt.searchIntent, 'government_jobs');
    assert.equal(govt.recommendedDestination, '/government-jobs');

    const college = classifyKeyword('colleges placement india');
    assert.ok(college);
    assert.equal(college.searchIntent, 'college_placement');
    assert.equal(college.recommendedDestination, '/colleges');
  });

  await test('4. Configurable 7-factor opportunity scorer & transparent unknown-volume downgrade', () => {
    assert.throws(() =>
      validateScoringWeights({
        demandEvidence: 0.5,
        gscOpportunity: 0.5,
        talentxcelRelevance: 0.5,
        inventoryAvailability: 0,
        conversionPotential: 0,
        contentQualityGap: 0,
        competition: 0,
      })
    );

    const cl = classifyKeyword('software engineer jobs in bangalore')!;
    const unknownScore = scoreOpportunity({
      classified: cl,
      searchVolumeStatus: 'unknown',
      gscImpressions: null,
      liveInventoryCount: 0,
    });
    const verifiedScore = scoreOpportunity({
      classified: cl,
      searchVolumeStatus: 'verified',
      gscImpressions: 1200,
      gscClicks: 18,
      gscCtr: 0.015,
      gscPosition: 6.2,
      ga4Conversions: 3,
      liveInventoryCount: 30,
    });

    assert.equal(unknownScore.demandStatus, 'UNKNOWN');
    assert.equal(verifiedScore.demandStatus, 'VERIFIED');
    assert.ok(unknownScore.dataConfidence < verifiedScore.dataConfidence);
    assert.ok(unknownScore.compositeScore < verifiedScore.compositeScore);
  });

  await test('5. GSC Opportunity Detector A-I & cannibalization classification', () => {
    const opps = detectGscOpportunities(
      [
        {
          query: 'ats resume checker free',
          pageUrl: 'https://talentxcel.in/resume/ats-check',
          propertyUrl: 'https://talentxcel.in/',
          country: 'USA',
          device: 'DESKTOP',
          impressions: 500,
          priorImpressions: 120,
          clicks: 2,
          ctr: 0.004,
          position: 5.5,
          ga4Conversions: 4,
          observationDate: '2026-11-22',
        },
        {
          query: 'software engineer jobs in noida',
          pageUrl: 'https://talentxcel.in/jobs',
          propertyUrl: 'https://talentxcel.in/',
          country: 'IND',
          device: 'MOBILE',
          impressions: 240,
          clicks: 1,
          ctr: 0.0041,
          position: 9.0,
          observationDate: '2026-11-22',
        },
        {
          query: 'software engineer jobs in noida',
          pageUrl: 'https://talentxcel.in/jobs/noida',
          propertyUrl: 'https://talentxcel.in/',
          country: 'IND',
          device: 'DESKTOP',
          impressions: 90,
          clicks: 1,
          ctr: 0.011,
          position: 11.0,
          observationDate: '2026-11-22',
        },
      ],
      new Set(['/resume/ats-check'])
    );

    const codes = new Set(opps.map((o) => o.code));
    for (const expectedCode of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const) {
      assert.ok(codes.has(expectedCode), `Expected GSC Opportunity Code ${expectedCode} to be detected`);
    }
  });

  await test('6. Page Qualification Governor blocks 0-inventory job doorways & cannibalization', () => {
    const emptyJobCity = evaluatePageQualification({
      pageUrl: '/jobs/accountant/small-town',
      pageType: 'role-city-job',
      primaryKeyword: 'accountant jobs in small town',
      clusterKey: 'c1',
      realInventoryCount: 0,
      uniqueContentScore: 80,
      relevanceScore: 80,
      opportunityScore: 55,
    });
    assert.equal(emptyJobCity.qualificationStatus, 'REJECTED_THIN');
    assert.equal(emptyJobCity.sitemapEligible, false);

    const healthyAts = evaluatePageQualification({
      pageUrl: '/resume/ats-check',
      pageType: 'ats-check',
      primaryKeyword: 'free ats resume checker',
      clusterKey: 'c2',
      realInventoryCount: 0,
      profileAggregateCount: 500,
      uniqueContentScore: 95,
      relevanceScore: 98,
      opportunityScore: 90,
      hasUtilityExperience: true,
    });
    assert.equal(healthyAts.qualificationStatus, 'QUALIFIED_FOR_INDEX');
    assert.equal(healthyAts.sitemapEligible, true);

    const cannibal = evaluatePageQualification({
      pageUrl: '/jobs/duplicate-route',
      pageType: 'role-city-job',
      primaryKeyword: 'developer jobs',
      clusterKey: 'c3',
      realInventoryCount: 15,
      uniqueContentScore: 80,
      relevanceScore: 80,
      opportunityScore: 70,
      jaccardOverlapRatio: 0.85,
      canonicalTargetUrl: '/jobs/software-engineer/bangalore',
    });
    assert.equal(cannibal.qualificationStatus, 'REJECTED_THIN');
  });

  await test('7. Internal link recommender & 25 SEO content brief grounding check', () => {
    const quals = new Map([
      [
        '/jobs/software-engineer/bangalore',
        evaluatePageQualification({
          pageUrl: '/jobs/software-engineer/bangalore',
          pageType: 'role-city-job',
          primaryKeyword: 'software engineer jobs in bangalore',
          clusterKey: 'c',
          realInventoryCount: 12,
          uniqueContentScore: 88,
          relevanceScore: 92,
          opportunityScore: 86,
        }),
      ],
    ]);
    const links = generateInternalLinkRecommendations(
      [
        {
          pageUrl: '/jobs/software-engineer/bangalore',
          pageType: 'role-city-job',
          primaryKeyword: 'software engineer jobs in bangalore',
          clusterKey: 'c',
          existingInboundLinks: 1,
          opportunityScore: 86,
        },
      ],
      quals
    );
    assert.ok(links.some((l) => l.linkType === 'ORPHAN_RESCUE' && l.targetPageUrl === '/jobs/software-engineer/bangalore'));
    assert.ok(links.some((l) => l.linkType === 'CROSS_SURFACE_FUNNEL'));

    assert.equal(SEO_OPPORTUNITY_TYPES.length, 25);
    const brief = generateContentBrief({
      targetUrl: '/salary/software-engineer',
      opportunityType: 'salary-benchmark',
      primaryKeyword: 'software engineer salary in india',
      supportingKeywords: ['sde salary india', 'fresher developer ctc'],
      targetIntent: 'salary_benchmark',
      estimatedImpactScore: 82,
      verifiedJobsCount: 0,
      verifiedProfilesCount: 705,
      verifiedCoursesCount: 100,
      observedGscImpressions: 0,
      observedGscClicks: 0,
    });
    assert.equal(brief.evidenceSummary.policyCompliance, 'NO_FABRICATED_STATS_OR_TESTIMONIALS');
    assert.ok(brief.outline[0].dataGroundedFrom.includes('NEEDS_DATA_COLLECTION'));
  });

  await test('8. Streaming clusterer & restartable idempotent SQLite ingestion test', async () => {
    const agg = new StreamingClusterAggregator();
    agg.add(classifyKeyword('python developer jobs in bangalore')!, 60);
    agg.add(classifyKeyword('python jobs bangalore')!, 55);
    assert.ok(agg.size() >= 1);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tx-si-test-'));
    const csvFile = path.join(tmpDir, 'mini.csv');
    const dbFile = path.join(tmpDir, 'mini.db');
    fs.writeFileSync(
      csvFile,
      [
        'Keyword,Cluster,Search intent,Generation source,Suggested page,Search volume status',
        'software engineer jobs in bangalore,Role × Location,transactional,role-location,/jobs/,Generated candidate; volume not verified',
        'Software Engineer Jobs in Bangalore,Role × Location,transactional,role-location,/jobs/,Generated candidate; volume not verified',
        'free ats resume check,Career,mixed,career,/career/,Generated candidate; volume not verified',
        'http://bad-spam-url.com,,mixed,test,/jobs/,Generated candidate; volume not verified',
      ].join('\n')
    );

    const run1 = await runIngest1mCorpus({ csvPath: csvFile, dbPath: dbFile, skipSupabase: true, resume: false });
    assert.equal(run1.totalRowsProcessed, 4);
    assert.equal(run1.uniqueKeywords, 2);
    assert.equal(run1.duplicateKeywords, 1);
    assert.equal(run1.invalidKeywords, 1);

    // Idempotent re-run must keep unique SQLite keyword rows = 2 without inflating counts
    const run2 = await runIngest1mCorpus({ csvPath: csvFile, dbPath: dbFile, skipSupabase: true, resume: false });
    assert.equal(run2.uniqueKeywords, 2);

    const db = openWarehouse(dbFile);
    const dbCount = (db.prepare('SELECT COUNT(*) AS c FROM keywords').get() as { c: number }).c;
    assert.equal(dbCount, 2);
    db.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  await test('9. Phase 2 FastTaxonomyMatcher, explicit-geo (GLB vs IN) & Keyword Quality 11-state gate', () => {
    const fm = new FastTaxonomyMatcher();
    fm.addCity('paris', { geonameId: 2988507, name: 'Paris', slug: 'paris-fr', countryCode: 'FR', admin1Code: '11', population: 2140526, isEmploymentHub: true });
    fm.addCity('reading', { geonameId: 2639577, name: 'Reading', slug: 'reading-gb', countryCode: 'GB', admin1Code: 'ENG', population: 230000, isEmploymentHub: true });
    fm.addJobTitle('aircraft mechanic', { titleId: 'onet-49-3011.00:abc', canonicalTitle: 'Aircraft Mechanic', slug: 'aircraft-mechanic', socCode: '49-3011.00', industrySlug: 'automobile-automotive' });

    const parisMech = classifyKeyword('aircraft mechanic jobs in paris', { fastMatcher: fm });
    assert.ok(parisMech);
    assert.equal(parisMech.countryCode, 'FR');
    assert.equal(parisMech.isExplicitGeo, true);
    assert.equal(parisMech.citySlug, 'paris-fr');
    assert.equal(parisMech.jobRoleSlug, 'aircraft-mechanic');

    // Canonical alias still consolidates cleanly onto unified TalentXcel nurse hub
    const parisNurse = classifyKeyword('registered nurse jobs in paris', { fastMatcher: fm });
    assert.ok(parisNurse);
    assert.equal(parisNurse.jobRoleSlug, 'nurse');

    // Ambiguous city word ("reading") without "in " preposition must NOT override when unlocated
    const unlocated = classifyKeyword('ats resume score checker', { fastMatcher: fm });
    assert.ok(unlocated);
    assert.equal(unlocated.isExplicitGeo, false);
    assert.equal(unlocated.countryCode, 'GLB');

    const rejectedSpam = evaluateKeywordQuality({
      rawKeyword: '100% job guarantee software engineer jobs',
      normalizedKeyword: '100% job guarantee software engineer jobs',
      dedupKey: 'job guarantee software engineer jobs',
      searchIntent: 'job_search',
      jobRoleSlug: 'software-engineer',
      skillSlug: null,
      industrySlug: 'software',
      countryCode: 'GLB',
      citySlug: null,
      workMode: 'unknown',
      isExplicitGeo: false,
      isGeoValidated: false,
      isRoleValidated: true,
      isSkillValidated: false,
      sourceType: 'DISCOVERY_CORPUS_CSV',
      gscImpressions: 0,
      publicSuggestObserved: false,
      realInventoryCount: 0,
      isDuplicateSyntacticVariant: false,
      isDuplicateIntentWithinPageGroup: false,
    });
    assert.equal(rejectedSpam.qualityLifecycleState, 'REJECTED');
    assert.ok(rejectedSpam.issues.includes('UNSUPPORTED_CLAIM'));
    assert.ok(rejectedSpam.issues.includes('UNLOCATED_DEFAULT_GEO'));

    assert.equal(isPlausibleCandidateCombination({ roleTitle: 'director of engineering', modifier: 'fresher' }), false);
    assert.equal(isPlausibleCandidateCombination({ roleTitle: 'software engineer', cityName: 'Bengaluru', countryName: 'India', modifier: 'jobs' }), true);
    assert.ok(describeEvidenceStatus('UNKNOWN').includes('UNKNOWN'));
  });

  await test('10. Phase 11 Automated GSC Monitoring (Declining, Position Movement, Mobile, Page Momentum & Incomplete Data Resilience)', () => {
    const monitoringRows = [
      // Declining query (J): 120 -> 25 (-79%)
      {
        query: 'brand manager career path',
        pageUrl: 'https://talentxcel.in/careers/brand-manager',
        propertyUrl: 'https://talentxcel.in/',
        country: 'IND',
        device: 'DESKTOP',
        impressions: 25,
        priorImpressions: 120,
        priorPosition: 18,
        clicks: 0,
        ctr: 0,
        position: 52,
        ga4Conversions: 0,
        observationDate: '2026-11-23',
      },
      // New emerging query (D, priorImpressions === 0) + mobile gap (L) + position climb (K)
      {
        query: 'ntpc careers',
        pageUrl: 'https://jobs.talentxcel.in/company/ntpc',
        propertyUrl: 'sc-domain:jobs.talentxcel.in',
        country: 'IND',
        device: 'MOBILE',
        impressions: 220,
        priorImpressions: 40,
        priorPosition: 12.5,
        clicks: 1,
        ctr: 0.0045,
        position: 3.8,
        ga4Conversions: 2,
        observationDate: '2026-11-23',
      },
      // International surge (E) + genuinely new query
      {
        query: 'software engineer jobs in dubai',
        pageUrl: 'https://jobs.talentxcel.in/jobs',
        propertyUrl: 'sc-domain:jobs.talentxcel.in',
        country: 'ARE',
        device: 'MOBILE',
        impressions: 45,
        priorImpressions: 0,
        clicks: 1,
        ctr: 0.022,
        position: 9.2,
        ga4Conversions: 0,
        observationDate: '2026-11-23',
      },
      // Incomplete / noisy rows (missing prior, missing country/device, NaN position) must NEVER crash or false-alert new/declining
      {
        query: 'partial gsc row check',
        pageUrl: '',
        propertyUrl: 'https://talentxcel.in/',
        country: '',
        device: '',
        impressions: 35,
        priorImpressions: null,
        clicks: Number.NaN,
        ctr: 0,
        position: Number.NaN,
        observationDate: '2026-11-23',
      },
    ];

    const detected = detectGscOpportunities(monitoringRows as never);
    const codes = new Set(detected.map((d) => d.code));
    assert.ok(codes.has('J'), 'Expected DECLINING_QUERY_ALERT (J)');
    assert.ok(codes.has('K'), 'Expected POSITION_MOVEMENT_ALERT (K)');
    assert.ok(codes.has('L'), 'Expected MOBILE_OPPORTUNITY (L)');
    assert.ok(codes.has('M'), 'Expected PAGE_GAINING_IMPRESSIONS (M)');
    assert.ok(codes.has('D'), 'Expected NEW/RISING query alert (D)');
    assert.ok(codes.has('E'), 'Expected GEOGRAPHIC_DEMAND_SURGE (E)');
    assert.ok(codes.has('I'), 'Expected HIGH_CONVERTING_QUERY (I)');

    // Ensure null prior row did NOT false-trigger D or J
    const partialAlerts = detected.filter((d) => d.normalizedQuery === 'partial gsc row check' && (d.code === 'D' || d.code === 'J' || d.code === 'K'));
    assert.equal(partialAlerts.length, 0);

    const summary = summarizeGscMonitoring(monitoringRows as never, detected);
    assert.equal(summary.rowsEvaluated, 4);
    assert.equal(summary.incompleteRowsHandled, 1);
    assert.ok(summary.decliningQueries >= 1 && summary.positionMovements >= 1 && summary.mobileOpportunities >= 1 && summary.pagesGainingImpressions >= 1);
  });

  await test('11. Phase 3 Empirical CTR Cohorts & Position-Aware CTR Recovery', () => {
    assert.equal(getPositionBand(2.1), 'POS_1_3');
    assert.equal(getPositionBand(5.2), 'POS_4_6');
    assert.equal(getPositionBand(8.9), 'POS_7_10');
    assert.equal(getPositionBand(14.0), 'POS_11_20');
    assert.equal(getPositionBand(29.0), 'POS_21_PLUS');

    const cohorts = buildEmpiricalCtrCohorts([
      { position: 2.0, impressions: 200, clicks: 36 },
      { position: 5.5, impressions: 300, clicks: 18 },
      { position: 9.0, impressions: 500, clicks: 15 },
    ]);
    assert.ok(cohorts.POS_1_3.cohortMedianCtr >= 0.15);
    assert.ok(cohorts.POS_4_6.cohortMedianCtr >= 0.05);

    const rec = evaluateCtrRecovery(
      {
        pageUrl: 'https://talentxcel.in/salary/data-scientist',
        primaryQuery: 'data scientist salary in india',
        queryEvidence: [{ query: 'data scientist salary in india', impressions: 120, clicks: 0, ctr: 0, position: 5.5 }],
        pageIntent: 'salary_benchmark',
        impressions: 120,
        clicks: 0,
        avgPosition: 5.5,
        actualCtr: 0,
        existingTitle: 'Data Scientist Salary | TalentXcel',
        existingDescription: 'Check salary.',
        realInventoryCount: 12,
      },
      cohorts
    );
    assert.ok(rec !== null);
    assert.equal(rec!.governanceState, 'RECOMMENDATION');
    assert.ok(rec!.suggestedTitle.length <= 68);
    assert.ok(rec!.suggestedTitle.includes('2026 Payscale'));
  });

  await test('12. Phase 3 Closed-Loop Page Performance Feedback Classifier', () => {
    const ins = classifyPageFeedback({
      pageUrl: 'https://talentxcel.in/jobs/rust',
      impressions7d: 2,
      clicks7d: 0,
      ctr7d: 0,
      pos7d: 18,
      impressions28d: 8,
      clicks28d: 0,
      ctr28d: 0,
      pos28d: 19,
      impressions90d: 12,
      clicks90d: 0,
      ctr90d: 0,
      pos90d: 20,
      qualificationStatus: 'QUALIFIED_FOR_INDEX',
      realInventoryCount: 5,
      isJobAggregationPage: true,
    });
    assert.equal(ins.classification, 'INSUFFICIENT_DATA');

    const stale = classifyPageFeedback({
      pageUrl: 'https://talentxcel.in/jobs/cobol',
      impressions7d: 10,
      clicks7d: 1,
      ctr7d: 0.1,
      pos7d: 7,
      impressions28d: 40,
      clicks28d: 2,
      ctr28d: 0.05,
      pos28d: 8,
      impressions90d: 90,
      clicks90d: 4,
      ctr90d: 0.044,
      pos90d: 8.5,
      qualificationStatus: 'QUALIFIED_FOR_INDEX',
      realInventoryCount: 0,
      isJobAggregationPage: true,
    });
    assert.equal(stale.classification, 'INVENTORY_STALE');

    const idxIssue = classifyPageFeedback({
      pageUrl: 'https://talentxcel.in/jobs/thin-page',
      impressions7d: 20,
      clicks7d: 0,
      ctr7d: 0,
      pos7d: 14,
      impressions28d: 50,
      clicks28d: 0,
      ctr28d: 0,
      pos28d: 14,
      impressions90d: 80,
      clicks90d: 0,
      ctr90d: 0,
      pos90d: 14,
      qualificationStatus: 'REJECTED_THIN',
      realInventoryCount: 0,
      isJobAggregationPage: true,
    });
    assert.equal(idxIssue.classification, 'INDEXATION_ISSUE');

    const gainingClicks = classifyPageFeedback({
      pageUrl: 'https://talentxcel.in/ats-check',
      impressions7d: 80,
      clicks7d: 12,
      ctr7d: 0.15,
      pos7d: 4.0,
      impressions28d: 180,
      clicks28d: 20,
      ctr28d: 0.11,
      pos28d: 5.0,
      impressions90d: 350,
      clicks90d: 35,
      ctr90d: 0.1,
      pos90d: 5.5,
      qualificationStatus: 'QUALIFIED_FOR_INDEX',
      realInventoryCount: 10,
      isJobAggregationPage: false,
    });
    assert.equal(gainingClicks.classification, 'GAINING_CLICKS');
  });

  await test('13. Phase 3 Action Governance Lifecycle & Rollback Guards', () => {
    const base = {
      actionId: 'gov-test-1',
      actionType: 'CTR_METADATA_UPDATE',
      targetUrl: 'https://talentxcel.in/ats-check',
      state: 'RECOMMENDATION' as const,
      payload: { suggestedTitle: 'ATS Check' },
      validationChecks: { titleLengthWithin68: true, noFabricatedClaims: true },
      rollbackPayload: { previousTitle: 'ATS' },
    };

    // Must reject skipping APPROVED -> EXECUTED directly
    assert.throws(() => transitionActionGovernance(base, 'EXECUTED', { actor: 'admin' }));

    const approved = transitionActionGovernance(base, 'APPROVED', { actor: 'seo-lead' });
    assert.equal(approved.state, 'APPROVED');
    assert.equal(approved.approvedBy, 'seo-lead');

    const executed = transitionActionGovernance(approved, 'EXECUTED', { note: 'Applied title change' });
    assert.equal(executed.state, 'EXECUTED');
    assert.ok(Boolean(executed.executedAt));

    const verified = transitionActionGovernance(executed, 'VERIFIED', { note: 'CTR lifted +2.1%' });
    assert.equal(verified.state, 'VERIFIED');

    const reverted = transitionActionGovernance(verified, 'REVERTED', { note: 'Rollback test' });
    assert.equal(reverted.state, 'REVERTED');
    assert.throws(() => transitionActionGovernance(reverted, 'APPROVED'));
  });

  await test('14. Phase 12 Indexation Parity & Regression Monitoring Detector', () => {
    assert.equal(isNoindexPath('/locations/varanasi'), false);
    assert.equal(isNoindexPath('/locations/doha'), true);
    assert.equal(isNoindexPath('/salary/data-scientist'), false);
    assert.equal(isNoindexPath('/salary/ui-ux-designer'), false);
    assert.equal(isNoindexPath('/salary/obscure-unverified-role'), true);
    assert.equal(isNoindexPath('/salary/data-scientist/hyderabad'), true);

    const regAlerts = detectPhase12Regressions({
      ssrProbes: [
        {
          url: 'https://talentxcel.in/locations/varanasi',
          status: 200,
          robots: 'noindex, follow',
          canonical: 'https://talentxcel.in/locations/varanasi',
          isQualified: true,
          clientNoindex: false,
        },
      ],
      sitemapProbes: [
        {
          url: 'https://talentxcel.in/sitemap-rankings.xml',
          status: 200,
          contentType: 'application/xml',
          bodyHead: '<!DOCTYPE html><html>',
          expectedRetired: true,
        },
      ],
      ga4OrganicSnapshot: {
        sessions28d: 1116,
        signUpCount28d: 0,
        applicationSubmittedCount28d: 170,
        seoLandingViewsPerUser: 123.6,
      },
    });
    const cats = new Set(regAlerts.map((a) => a.category));
    assert.ok(cats.has('UNEXPECTED_NOINDEX_ON_QUALIFIED'));
    assert.ok(cats.has('SSR_CLIENT_PARITY_MISMATCH'));
    assert.ok(cats.has('INVALID_SPA_FALLTHROUGH'));
    assert.ok(cats.has('CONVERSION_TELEMETRY_REGRESSION'));
  });

  await test('15. Phase 4 10-State Governance & Tier A/B/C Safe Execution Guards', () => {
    const tierB = {
      actionId: 'exec-b-1',
      url: 'https://talentxcel.in/salary/data-scientist',
      queryOrCluster: 'data scientist salary',
      actionCategory: 'CTR_RECOVERY' as const,
      executionTier: 'TIER_B_APPROVAL' as const,
      recommendation: 'Update title',
      supportingEvidence: {},
      gscMetrics: { impressions: 1685 },
      ga4Metrics: {},
      expectedImpact: 'Recover CTR',
      confidenceScore: 0.85,
      priorityScore: 90,
      riskLevel: 'LOW' as const,
      actionStatus: 'RECOMMENDATION' as const,
      approvalStatus: 'PENDING' as const,
      ownerSystem: 'Phase4',
      proposedChanges: {},
      beforeStateSnapshot: {},
      afterStateSnapshot: {},
      verificationWindow: '28d' as const,
      rollbackInstructions: 'Revert title',
    };

    assert.throws(() => transitionPhase4Action(tierB, 'EXECUTED'));
    const rev = transitionPhase4Action(tierB, 'EVIDENCE_REVIEW');
    const app = transitionPhase4Action(rev, 'APPROVED', { actor: 'seo-lead' });
    assert.equal(app.approvalStatus, 'APPROVED');
    const exe = transitionPhase4Action(app, 'EXECUTED', { validationPassed: true, afterSnapshot: { done: true } });
    assert.equal(exe.actionStatus, 'EXECUTED');
    const ver = transitionPhase4Action(exe, 'VERIFIED');
    const mon = transitionPhase4Action(ver, 'MONITORING');
    assert.equal(mon.actionStatus, 'MONITORING');
  });

  await test('16. Phase 4 Execution Queue Deduplication & Conflict Suppression', () => {
    const base = {
      queryOrCluster: 'python jobs',
      executionTier: 'TIER_B_APPROVAL' as const,
      recommendation: 'Test',
      supportingEvidence: {},
      gscMetrics: {},
      ga4Metrics: {},
      expectedImpact: 'Impact',
      confidenceScore: 0.8,
      riskLevel: 'LOW' as const,
      actionStatus: 'RECOMMENDATION' as const,
      approvalStatus: 'PENDING' as const,
      ownerSystem: 'Phase4',
      beforeStateSnapshot: {},
      afterStateSnapshot: {},
      verificationWindow: '28d' as const,
      rollbackInstructions: 'Rollback',
    };
    const { consolidated, suppressedCount } = consolidateExecutionQueue([
      {
        ...base,
        actionId: 'a1',
        url: 'https://talentxcel.in/jobs/dup',
        actionCategory: 'CANNIBALIZATION_RESOLUTION',
        priorityScore: 92,
        proposedChanges: { classification: 'CONSOLIDATION_CANDIDATE', dominantUrl: 'https://talentxcel.in/jobs/main' },
      },
      {
        ...base,
        actionId: 'a2',
        url: 'https://talentxcel.in/jobs/dup',
        actionCategory: 'CONTENT_BRIEF',
        priorityScore: 80,
        proposedChanges: {},
      },
      {
        ...base,
        actionId: 'a3',
        url: 'https://talentxcel.in/jobs/main',
        actionCategory: 'CTR_RECOVERY',
        priorityScore: 85,
        proposedChanges: {},
      },
      {
        ...base,
        actionId: 'a4',
        url: 'https://talentxcel.in/jobs/main',
        actionCategory: 'CTR_RECOVERY',
        priorityScore: 70,
        proposedChanges: {},
      },
    ]);
    assert.equal(suppressedCount, 2);
    assert.equal(consolidated.length, 2);
  });

  await test('17. Phase 4 3-Candidate CTR Metadata Generator & 7-State Cannibalization Classifier', () => {
    const { candidates, selected } = generateCtrMetadataCandidates({
      primaryQuery: 'salary for data scientist',
      pageIntent: 'salary_benchmark',
      realInventoryCount: 14,
    });
    assert.equal(candidates.length, 3);
    assert.ok(selected.title.toLowerCase().includes('data scientist'));

    const legit = classifyCannibalizationCluster('data scientist salary', [
      { pageUrl: 'https://salary.talentxcel.in/salary/data-scientist', pageType: 'salary-benchmark', searchIntent: 'salary_benchmark', impressions: 1685, clicks: 10, avgPosition: 9.5, inventoryCount: 8 },
      { pageUrl: 'https://jobs.talentxcel.in/jobs/data-scientist', pageType: 'jobs-landing', searchIntent: 'job_search', impressions: 200, clicks: 2, avgPosition: 14, inventoryCount: 15 },
    ]);
    assert.equal(legit.classification, 'LEGITIMATE_MULTIPLE_RANKING');

    const consol = classifyCannibalizationCluster('thin duplicate role', [
      { pageUrl: 'https://talentxcel.in/jobs/role-a', pageType: 'jobs-landing', searchIntent: 'job_search', impressions: 120, clicks: 4, avgPosition: 7, inventoryCount: 12 },
      { pageUrl: 'https://talentxcel.in/jobs/role-b', pageType: 'jobs-landing', searchIntent: 'job_search', impressions: 80, clicks: 0, avgPosition: 13, inventoryCount: 0 },
    ]);
    assert.equal(consol.classification, 'CONSOLIDATION_CANDIDATE');
    assert.equal(consol.dominantUrl, 'https://talentxcel.in/jobs/role-a');
  });

  await test('18. Phase 5 Refined Cannibalization Classifier (Subdomain Alias & Employer Job Postings)', () => {
    const alias = classifyCannibalizationCluster('south indian bank careers', [
      {
        pageUrl: 'https://jobs.talentxcel.in/jobs/devops-engineer-south-indian-bank',
        pageType: 'jobs-landing',
        searchIntent: 'job_search',
        impressions: 15,
        clicks: 0,
        avgPosition: 3.1,
        inventoryCount: 0,
      },
      {
        pageUrl: 'https://talentxcel.in/jobs/devops-engineer-south-indian-bank',
        pageType: 'jobs-landing',
        searchIntent: 'job_search',
        impressions: 125,
        clicks: 0,
        avgPosition: 3.8,
        inventoryCount: 0,
      },
    ]);
    assert.equal(alias.classification, 'NO_ACTION');
    assert.equal(alias.dominantUrl, 'https://talentxcel.in/jobs/devops-engineer-south-indian-bank');

    const employerJobs = classifyCannibalizationCluster('tata steel career', [
      {
        pageUrl: 'https://jobs.talentxcel.in/jobs/data-analyst-tata-steel-dhanbad',
        pageType: 'jobs-landing',
        searchIntent: 'job_search',
        impressions: 80,
        clicks: 2,
        avgPosition: 5.4,
        inventoryCount: 0,
      },
      {
        pageUrl: 'https://jobs.talentxcel.in/jobs/sde-ii-tata-steel-bhubaneswar',
        pageType: 'jobs-landing',
        searchIntent: 'job_search',
        impressions: 216,
        clicks: 1,
        avgPosition: 4.1,
        inventoryCount: 0,
      },
    ]);
    assert.equal(employerJobs.classification, 'LEGITIMATE_MULTIPLE_RANKING');
  });

  await test('19. Phase 5 P0-P4 Priority Model & Controlled Batch Execution Planner', () => {
    const baseItem = {
      url: 'https://talentxcel.in/salary/data-scientist',
      queryOrCluster: 'data scientist salary',
      executionTier: 'TIER_B_APPROVAL' as const,
      recommendation: 'Optimize',
      supportingEvidence: {},
      ga4Metrics: {},
      expectedImpact: 'Lift',
      riskLevel: 'LOW' as const,
      actionStatus: 'RECOMMENDATION' as const,
      approvalStatus: 'PENDING' as const,
      ownerSystem: 'Phase5',
      proposedChanges: {},
      beforeStateSnapshot: {},
      afterStateSnapshot: {},
      verificationWindow: '28d' as const,
      rollbackInstructions: 'Revert',
    };

    const p0 = assignExecutionPriorityTier({
      ...baseItem,
      actionId: 'p0',
      actionCategory: 'TECHNICAL_SEO',
      confidenceScore: 0.9,
      priorityScore: 88,
      gscMetrics: {},
    });
    assert.equal(p0.priorityTier, 'P0');

    // Low-confidence item must NEVER be promoted to P0/P1 even if priorityScore is 99
    const lowConf = assignExecutionPriorityTier({
      ...baseItem,
      actionId: 'p4',
      actionCategory: 'CTR_RECOVERY',
      confidenceScore: 0.4,
      priorityScore: 99,
      gscMetrics: { impressions: 500, clicks: 0, avgPosition: 5 },
    });
    assert.equal(lowConf.priorityTier, 'P4');

    const plan = planExecutionBatches([p0.item, lowConf.item]);
    assert.equal(plan.tierCounts.P0, 1);
    assert.equal(plan.tierCounts.P4, 1);
    assert.equal(plan.batches.BATCH_1_CRITICAL_AND_CTR.length, 2);
  });

  await test('20. Phase 6 P0 Golang Interview-Prep 301 Redirect Rule & Canonical Parity Check', () => {
    const seoRenderPath = path.resolve(process.cwd(), 'api', 'seo-render.ts');
    const src = fs.readFileSync(seoRenderPath, 'utf8');
    const regexMatch = src.match(/\/\^resume\\\/interview-prep\\\/\(\?:executive-\|senior-\|junior-\|lead-\)\?golang-developer-interview-questions-and-answers\(\?:-part-\\d\+\)\?\$\/i/);
    assert.ok(regexMatch, 'Expected legacy golang interview-prep 301 redirect regex in api/seo-render.ts');
    assert.ok(
      src.includes("https://talentxcel.in/resume/interview-prep/golang-developer"),
      'Expected canonical golang-developer target URL in api/seo-render.ts'
    );
    const legacySlug = 'resume/interview-prep/executive-golang-developer-interview-questions-and-answers-part-3';
    const rule = /^resume\/interview-prep\/(?:executive-|senior-|junior-|lead-)?golang-developer-interview-questions-and-answers(?:-part-\d+)?$/i;
    assert.equal(rule.test(legacySlug), true);
  });

  console.log(`\nAll ${passed} Search Demand Intelligence Engine verification tests PASSED.`);
}

runTests().catch((err) => {
  console.error('TEST FAILURE:', err);
  process.exit(1);
});
