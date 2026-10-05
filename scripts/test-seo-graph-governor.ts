// scripts/test-seo-graph-governor.ts
/**
 * TalentXcel SEO 2.0 Test & Invariant Verification Suite
 * Verifies the 10-Layer Entity-and-Intent Search Graph and SEO Page Governor
 */

import { SEOPageGovernor, GovernorEvaluationResult } from '../src/lib/seo/governor/seoPageGovernor';
import { EntitySearchGraph, SearchGraphNode } from '../src/lib/seo/graph/entitySearchGraph';

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

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 TALENTXCEL SEO 2.0: ENTITY GRAPH & PAGE GOVERNOR TEST SUITE');
  console.log('================================================================\n');

  console.log('--- 1. Testing SEO Page Governor Formula & Decision Tiers ---');

  // Test 1: Real inventory + high demand (Software Engineer Bangalore: 38 jobs)
  const evalHighIntent = SEOPageGovernor.evaluate({
    urlPath: '/jobs/software-engineer/bangalore',
    entityType: 'ROLE_HUB',
    searchDemandScore: 90,
    inventoryCount: 38,
    uniqueContentScore: 85,
    commercialIntentScore: 95,
    internalLinkAuthority: 80,
    lastUpdatedDaysAgo: 1,
  });
  assert(evalHighIntent.decision === 'INDEX', 'High intent + 38 jobs yields INDEX decision');
  assert(evalHighIntent.includeInSitemap === true, 'INDEX decision includes URL in XML sitemap');
  assert(evalHighIntent.seoValueScore >= 80, `High intent score (${evalHighIntent.seoValueScore}) meets >= 80 threshold`);

  // Test 2: Artificial mathematical permutation with 0 jobs (Software Engineer Antarctica)
  const evalZeroInventory = SEOPageGovernor.evaluate({
    urlPath: '/jobs/software-engineer/antarctica',
    entityType: 'ROLE_HUB',
    searchDemandScore: 10,
    inventoryCount: 0,
    uniqueContentScore: 10,
    commercialIntentScore: 70,
    internalLinkAuthority: 5,
    lastUpdatedDaysAgo: 120,
  });
  assert(evalZeroInventory.decision === 'DO_NOT_GENERATE', 'Zero active inventory yields DO_NOT_GENERATE');
  assert(evalZeroInventory.includeInSitemap === false, 'Zero active inventory is strictly excluded from sitemap');
  assert(evalZeroInventory.httpStatus === 404, 'Zero active inventory returns HTTP 404');

  // Test 3: Expired single job posting
  const evalExpiredJob = SEOPageGovernor.evaluate({
    urlPath: '/jobs/old-expired-job-123',
    entityType: 'JOB',
    searchDemandScore: 20,
    inventoryCount: 0,
    uniqueContentScore: 50,
    commercialIntentScore: 90,
    internalLinkAuthority: 20,
    lastUpdatedDaysAgo: 90,
    isSingleJobPosting: true,
  });
  assert(evalExpiredJob.decision === 'HTTP_410', 'Expired job returns HTTP_410 exterminator');
  assert(evalExpiredJob.httpStatus === 410, 'Expired job returns HTTP 410 status code');
  assert(evalExpiredJob.robotsMeta === 'noindex, nofollow', 'Expired job emits noindex, nofollow');

  // Test 4: College Facet with verified unique dataset (IIT Delhi Placements 2026)
  const evalCollegePlacements = SEOPageGovernor.evaluate({
    urlPath: '/colleges/iit-delhi/placements',
    entityType: 'COLLEGE_FACET',
    searchDemandScore: 85,
    inventoryCount: 450, // 450 verified placement records
    uniqueContentScore: 90,
    commercialIntentScore: 75,
    internalLinkAuthority: 85,
    lastUpdatedDaysAgo: 5,
    hasVerifiedUniqueDataset: true,
  });
  assert(evalCollegePlacements.decision === 'INDEX' || evalCollegePlacements.decision === 'INDEX_REVIEW', 'College placement report with unique dataset is indexable');
  assert(evalCollegePlacements.includeInSitemap === true, 'Verified placement report included in sitemap');

  // Test 5: College Facet without verified unique dataset (Generic fee tab)
  const evalGenericCollegeFee = SEOPageGovernor.evaluate({
    urlPath: '/colleges/iit-delhi/fees',
    entityType: 'COLLEGE_FACET',
    searchDemandScore: 70,
    inventoryCount: 1,
    uniqueContentScore: 10, // duplicate of main dossier
    commercialIntentScore: 60,
    internalLinkAuthority: 40,
    lastUpdatedDaysAgo: 20,
    hasVerifiedUniqueDataset: false,
  });
  assert(evalGenericCollegeFee.decision === 'NOINDEX_HOLD', 'College facet without unique dataset held at NOINDEX_HOLD');
  assert(evalGenericCollegeFee.includeInSitemap === false, 'Generic facet excluded from XML sitemap');

  // Test 6: Layer 9 Candidate Profile - Private vs Public
  const evalPrivateProfile = SEOPageGovernor.evaluate({
    urlPath: '/p/candidate-private-123',
    entityType: 'PASSPORT',
    searchDemandScore: 5,
    inventoryCount: 1,
    uniqueContentScore: 70,
    commercialIntentScore: 40,
    internalLinkAuthority: 10,
    lastUpdatedDaysAgo: 2,
    isOptInPublicProfile: false,
  });
  assert(evalPrivateProfile.decision === 'DO_NOT_GENERATE', 'Private candidate profile strictly prevented from crawl');

  const evalPublicProfile = SEOPageGovernor.evaluate({
    urlPath: '/p/arshid-wani',
    entityType: 'PASSPORT',
    searchDemandScore: 40,
    inventoryCount: 1,
    uniqueContentScore: 90,
    commercialIntentScore: 70,
    internalLinkAuthority: 30,
    lastUpdatedDaysAgo: 2,
    isOptInPublicProfile: true,
  });
  assert(evalPublicProfile.decision === 'INDEX' || evalPublicProfile.decision === 'INDEX_REVIEW', 'Opt-in public candidate profile is indexable');

  console.log('\n--- 2. Testing 10-Layer Entity Search Graph & Cross-Links ---');
  const graph = new EntitySearchGraph();

  // Populate 10 Representative Nodes across all 10 Layers
  const sampleNodes: SearchGraphNode[] = [
    {
      id: 'job:se-senior-001',
      layer: 'LAYER_1_JOBS',
      entityType: 'JOB',
      urlPath: '/jobs/senior-software-engineer-google-bangalore',
      canonicalUrl: 'https://talentxcel.in/jobs/senior-software-engineer-google-bangalore',
      title: 'Senior Software Engineer at Google',
      description: 'Lead distributed systems in Bangalore.',
      structuredDataSchema: 'JobPosting',
      inventoryCount: 1,
      searchDemandScore: 70,
      uniqueContentScore: 95,
      commercialIntentScore: 100,
      internalLinkAuthority: 50,
      lastUpdatedDaysAgo: 1,
      isSingleJobPosting: true,
      outboundEdges: [],
    },
    {
      id: 'resume:software-engineer',
      layer: 'LAYER_2_RESUME',
      entityType: 'RESUME',
      urlPath: '/resume-templates/software-engineer',
      canonicalUrl: 'https://talentxcel.in/resume-templates/software-engineer',
      title: 'Software Engineer Resume Templates & Examples',
      description: 'ATS-optimized software engineering resume templates.',
      structuredDataSchema: 'CollectionPage',
      inventoryCount: 12,
      searchDemandScore: 88,
      uniqueContentScore: 90,
      commercialIntentScore: 95,
      internalLinkAuthority: 75,
      lastUpdatedDaysAgo: 4,
      outboundEdges: [],
    },
    {
      id: 'ats:software-engineer',
      layer: 'LAYER_3_ATS',
      entityType: 'ATS',
      urlPath: '/ats-resume-checker/software-engineer',
      canonicalUrl: 'https://talentxcel.in/ats-resume-checker/software-engineer',
      title: 'ATS Resume Score Checker for Software Engineers',
      description: 'Scan your resume against real tech job descriptions.',
      structuredDataSchema: 'CollectionPage',
      inventoryCount: 50,
      searchDemandScore: 85,
      uniqueContentScore: 92,
      commercialIntentScore: 95,
      internalLinkAuthority: 70,
      lastUpdatedDaysAgo: 3,
      outboundEdges: [],
    },
    {
      id: 'career:software-engineer',
      layer: 'LAYER_4_CAREER',
      entityType: 'CAREER',
      urlPath: '/careers/software-engineer',
      canonicalUrl: 'https://talentxcel.in/careers/software-engineer',
      title: 'Software Engineer Career Roadmap & Skills Guide',
      description: 'Comprehensive career pathways and salary milestones.',
      structuredDataSchema: 'Occupation',
      inventoryCount: 25,
      searchDemandScore: 92,
      uniqueContentScore: 95,
      commercialIntentScore: 85,
      internalLinkAuthority: 90,
      lastUpdatedDaysAgo: 2,
      outboundEdges: [],
    },
    {
      id: 'skill:python',
      layer: 'LAYER_5_SKILLS',
      entityType: 'SKILL',
      urlPath: '/skills/python',
      canonicalUrl: 'https://talentxcel.in/skills/python',
      title: 'Python Skills, Career Paths & Jobs',
      description: 'Python demand benchmarks and top hiring companies.',
      structuredDataSchema: 'CollectionPage',
      inventoryCount: 180,
      searchDemandScore: 95,
      uniqueContentScore: 90,
      commercialIntentScore: 85,
      internalLinkAuthority: 85,
      lastUpdatedDaysAgo: 1,
      outboundEdges: [],
    },
    {
      id: 'college:iit-delhi',
      layer: 'LAYER_6_EDUCATION',
      entityType: 'COLLEGE',
      urlPath: '/colleges/iit-delhi',
      canonicalUrl: 'https://talentxcel.in/colleges/iit-delhi',
      title: 'IIT Delhi - Placements, Programs & Campus Dossier',
      description: 'Authoritative dossier for Indian Institute of Technology Delhi.',
      structuredDataSchema: 'CollegeOrUniversity',
      inventoryCount: 120,
      searchDemandScore: 90,
      uniqueContentScore: 95,
      commercialIntentScore: 80,
      internalLinkAuthority: 95,
      lastUpdatedDaysAgo: 3,
      hasVerifiedUniqueDataset: true,
      outboundEdges: [],
    },
    {
      id: 'course:advanced-python-architecture',
      layer: 'LAYER_7_COURSES',
      entityType: 'COURSE',
      urlPath: '/courses/advanced-python-architecture',
      canonicalUrl: 'https://talentxcel.in/courses/advanced-python-architecture',
      title: 'Advanced Python Distributed Systems Architecture',
      description: 'Hands-on course on asynchronous concurrency and microservices.',
      structuredDataSchema: 'Course',
      inventoryCount: 14,
      searchDemandScore: 78,
      uniqueContentScore: 92,
      commercialIntentScore: 90,
      internalLinkAuthority: 65,
      lastUpdatedDaysAgo: 7,
      outboundEdges: [],
    },
    {
      id: 'salary:software-engineer',
      layer: 'LAYER_8_SALARY',
      entityType: 'SALARY',
      urlPath: '/salary/software-engineer/india',
      canonicalUrl: 'https://talentxcel.in/salary/software-engineer/india',
      title: 'Software Engineer Salary in India (2026 Benchmarks)',
      description: 'Verified percentiles and compensation ranges based on actual job offers.',
      structuredDataSchema: 'Dataset',
      inventoryCount: 350,
      searchDemandScore: 92,
      uniqueContentScore: 95,
      commercialIntentScore: 90,
      internalLinkAuthority: 80,
      lastUpdatedDaysAgo: 2,
      hasVerifiedUniqueDataset: true,
      outboundEdges: [],
    },
    {
      id: 'passport:software-engineer',
      layer: 'LAYER_9_PASSPORT',
      entityType: 'PASSPORT',
      urlPath: '/passport/software-engineer',
      canonicalUrl: 'https://talentxcel.in/passport/software-engineer',
      title: 'Software Engineer Career Passport & Skill Credentials',
      description: 'Verified capability credentials and verifiable career score.',
      structuredDataSchema: 'CollectionPage',
      inventoryCount: 45,
      searchDemandScore: 70,
      uniqueContentScore: 88,
      commercialIntentScore: 80,
      internalLinkAuthority: 70,
      lastUpdatedDaysAgo: 5,
      isOptInPublicProfile: true,
      outboundEdges: [],
    },
    {
      id: 'knowledge:how-to-beat-ats',
      layer: 'LAYER_10_KNOWLEDGE',
      entityType: 'KNOWLEDGE',
      urlPath: '/career-advice/how-to-beat-ats-resume-parsing',
      canonicalUrl: 'https://talentxcel.in/career-advice/how-to-beat-ats-resume-parsing',
      title: 'How to Beat ATS Resume Parsers in 2026: Evidence-Based Guide',
      description: 'Architectural analysis of modern semantic screening algorithms.',
      structuredDataSchema: 'Article',
      inventoryCount: 1,
      searchDemandScore: 85,
      uniqueContentScore: 98,
      commercialIntentScore: 85,
      internalLinkAuthority: 75,
      lastUpdatedDaysAgo: 4,
      outboundEdges: [],
    },
  ];

  // Register nodes
  sampleNodes.forEach(node => graph.registerNode(node));

  // Add semantic edges across layers
  graph.addEdge('job:se-senior-001', 'skill:python', 'REQUIRES_SKILL');
  graph.addEdge('career:software-engineer', 'skill:python', 'REQUIRES_SKILL');
  graph.addEdge('career:software-engineer', 'resume:software-engineer', 'HAS_RESUME_TEMPLATE');
  graph.addEdge('career:software-engineer', 'ats:software-engineer', 'HAS_ATS_KEYWORDS');
  graph.addEdge('career:software-engineer', 'salary:software-engineer', 'BENCHMARKS_SALARY');
  graph.addEdge('skill:python', 'course:advanced-python-architecture', 'TAUGHT_BY_COURSE');
  graph.addEdge('college:iit-delhi', 'salary:software-engineer', 'HAS_PLACEMENT_DATA');
  graph.addEdge('resume:software-engineer', 'knowledge:how-to-beat-ats', 'ANSWERS_QUESTION');

  const distribution = graph.getLayerDistribution();
  assert(distribution.LAYER_1_JOBS.total === 1, 'Layer 1 (Jobs) node registered');
  assert(distribution.LAYER_2_RESUME.total === 1, 'Layer 2 (Resume) node registered');
  assert(distribution.LAYER_3_ATS.total === 1, 'Layer 3 (ATS) node registered');
  assert(distribution.LAYER_4_CAREER.total === 1, 'Layer 4 (Career) node registered');
  assert(distribution.LAYER_5_SKILLS.total === 1, 'Layer 5 (Skills) node registered');
  assert(distribution.LAYER_6_EDUCATION.total === 1, 'Layer 6 (Education) node registered');
  assert(distribution.LAYER_7_COURSES.total === 1, 'Layer 7 (Courses) node registered');
  assert(distribution.LAYER_8_SALARY.total === 1, 'Layer 8 (Salary) node registered');
  assert(distribution.LAYER_9_PASSPORT.total === 1, 'Layer 9 (Passport) node registered');
  assert(distribution.LAYER_10_KNOWLEDGE.total === 1, 'Layer 10 (Knowledge) node registered');

  // Verify that all 10 high-quality sample nodes are indexable
  const indexableNodes = graph.getIndexableNodes();
  assert(indexableNodes.length === 10, 'All 10 quality-backed entity nodes evaluated to indexable in search graph');

  console.log('\n--- 3. Testing Real-Time Entity Event Flywheel ---');
  // Scenario: A new Role x Location hub has 2 jobs (below threshold 3). It starts at NOINDEX_HOLD.
  const comboNode: SearchGraphNode = {
    id: 'job_combo:software-engineer:pune',
    layer: 'LAYER_1_JOBS',
    entityType: 'ROLE_HUB',
    urlPath: '/jobs/software-engineer/pune',
    canonicalUrl: 'https://talentxcel.in/jobs/software-engineer/pune',
    title: 'Software Engineer Jobs in Pune',
    description: 'Find top software engineer vacancies in Pune.',
    structuredDataSchema: 'CollectionPage',
    inventoryCount: 2, // Below threshold of 3
    searchDemandScore: 80,
    uniqueContentScore: 70,
    commercialIntentScore: 90,
    internalLinkAuthority: 40,
    lastUpdatedDaysAgo: 10,
    outboundEdges: [],
  };

  const initialEval = graph.registerNode(comboNode);
  assert(initialEval.decision === 'NOINDEX_HOLD', 'Initial combo with 2 jobs is held at NOINDEX_HOLD');

  // Propagate a JOB_INSERTED event into Pune
  console.log('  -> Simulating JOB_INSERTED event for Software Engineer in Pune...');
  const propagationResult = graph.propagateEntityEvent({
    eventType: 'JOB_INSERTED',
    entityId: 'job-pune-new-001',
    primaryRoleSlug: 'software-engineer',
    locationSlug: 'pune',
    skillSlugs: ['python'],
  });

  const updatedCombo = graph.getNode('job_combo:software-engineer:pune');
  assert(updatedCombo?.inventoryCount === 3, 'Flywheel propagated inventory increment to 3 jobs');
  assert(updatedCombo?.governorEvaluation?.decision === 'INDEX' || updatedCombo?.governorEvaluation?.decision === 'INDEX_REVIEW', 'Flywheel dynamically transitioned Pune hub from NOINDEX_HOLD to INDEX/INDEX_REVIEW!');
  assert(propagationResult.governorTransitions.length > 0, 'Governor state transition recorded in propagation report');

  console.log('\n--- 4. Testing Google JobPosting Schema Invariance ---');
  // Invariant: JobPosting schema MUST ONLY be on single job posting pages, NEVER on collections or filters
  const nonJobPostingNodes = graph.getAllNodes().filter(n => n.entityType !== 'JOB');
  const schemaViolations = nonJobPostingNodes.filter(n => n.structuredDataSchema === 'JobPosting');
  assert(schemaViolations.length === 0, 'JobPosting schema is strictly isolated to single job postings and never placed on aggregate pages');

  console.log('\n================================================================');
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed with error:', err);
  process.exit(1);
});
