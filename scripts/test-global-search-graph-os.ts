// scripts/test-global-search-graph-os.ts
/**
 * TalentXcel Global Search Graph OS v2 - Automated Verification Suite
 *
 * Exhaustively tests the 8 core engines of the search ecosystem:
 * 1. 22 Entity Dimensions Machine-Readable Registry
 * 2. 22 Intent Dimensions Machine-Readable Registry
 * 3. Global Location Hierarchy & Relationship Engine
 * 4. Continuous Search Demand Ingestion Engine
 * 5. Systematic Intent Expansion Engine
 * 6. Universe-Specific Evidence Engine
 * 7. Content Contract Engine (Hard Requirements per Universe)
 * 8. Internal Link Authority Graph Engine
 * 9. Global Language, Locale & Currency Engine
 */

import { EntityTaxonomyRegistry, EntityTypeId } from '../src/lib/seo/searchUniverse/entityTaxonomyRegistry';
import { IntentTaxonomyRegistry, IntentTypeId } from '../src/lib/seo/searchUniverse/intentTaxonomyRegistry';
import { GlobalLocationHierarchy, COMPREHENSIVE_GLOBAL_LOCATIONS, COMPREHENSIVE_LOCATION_EDGES } from '../src/lib/seo/searchUniverse/globalLocationHierarchy';
import { SearchDemandIngestionEngine, RawDemandSignal } from '../src/lib/seo/searchUniverse/searchDemandIngestionEngine';
import { IntentExpansionEngine } from '../src/lib/seo/searchUniverse/intentExpansionEngine';
import { UniverseEvidenceEngine } from '../src/lib/seo/searchUniverse/universeEvidenceEngine';
import { ContentContractEngine, ARCHETYPE_CONTRACTS } from '../src/lib/seo/searchUniverse/contentContractEngine';
import { InternalLinkAuthorityEngine } from '../src/lib/seo/searchUniverse/internalLinkAuthorityEngine';
import { LocaleCurrencyEngine } from '../src/lib/seo/searchUniverse/localeCurrencyEngine';
import { SearchOpportunityEngine } from '../src/lib/seo/searchUniverse/searchOpportunityEngine';
import { SearchUniverseTargetRegistry } from '../src/lib/seo/searchUniverse/searchUniverseTargetRegistry';
import { GlobalIndustryHierarchy } from '../src/lib/seo/searchUniverse/globalIndustryHierarchy';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    console.error(`  ❌ FAILED: ${testName}`);
    if (failureDetails) console.error(`     -> ${failureDetails}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 TALENTXCEL GLOBAL SEARCH GRAPH OS v2 - VERIFICATION SUITE');
  console.log('================================================================\n');

  // --- 1. Entity Taxonomy Registry Tests ---
  console.log('--- 1. Testing 22 Entity Dimensions Machine-Readable Registry ---');
  const allEntities = EntityTaxonomyRegistry.getAllDimensions();
  assert(allEntities.length === 22, 'Exact 22 Entity Dimensions registered in catalog');

  const roleDef = EntityTaxonomyRegistry.getEntityDefinition('ROLE');
  assert(roleDef !== undefined && roleDef.schemaType === 'Occupation', 'ROLE dimension has schemaType Occupation');

  const collegeDef = EntityTaxonomyRegistry.getEntityDefinition('COLLEGE');
  assert(collegeDef !== undefined && collegeDef.schemaType === 'CollegeOrUniversity', 'COLLEGE dimension has schemaType CollegeOrUniversity');

  const validRoleSkill = EntityTaxonomyRegistry.isValidRelationship('ROLE', 'SKILL');
  assert(validRoleSkill === true, 'Valid parent-child relationship: ROLE -> SKILL');

  const validCollegeDegree = EntityTaxonomyRegistry.isValidRelationship('COLLEGE', 'DEGREE');
  assert(validCollegeDegree === true, 'Valid parent-child relationship: COLLEGE -> DEGREE');

  const invalidRel = EntityTaxonomyRegistry.isValidRelationship('DISTRICT', 'COUNTRY');
  assert(invalidRel === false, 'Invalid relationship rejected: DISTRICT cannot directly parent COUNTRY');

  // --- 2. Intent Taxonomy Registry Tests ---
  console.log('\n--- 2. Testing 22 Intent Dimensions Machine-Readable Registry ---');
  const allIntents = IntentTaxonomyRegistry.getAllIntents();
  assert(allIntents.length === 22, 'Exact 22 Intent Dimensions registered in catalog');

  const jobsIntent = IntentTaxonomyRegistry.getIntentDefinition('JOBS');
  assert(jobsIntent?.evidenceRequirement === 'JOB_INVENTORY', 'JOBS intent requires JOB_INVENTORY evidence');
  assert(jobsIntent?.minimumEvidenceThreshold === 3, 'JOBS intent requires >= 3 minimum active jobs');

  const salaryIntent = IntentTaxonomyRegistry.getIntentDefinition('SALARY');
  assert(salaryIntent?.evidenceRequirement === 'SALARY_DATASET', 'SALARY intent requires SALARY_DATASET evidence');
  assert(salaryIntent?.minimumEvidenceThreshold === 15, 'SALARY intent requires >= 15 verified data points');

  const atsIntent = IntentTaxonomyRegistry.getIntentDefinition('ATS_CHECKER');
  assert(atsIntent?.evidenceRequirement === 'ATS_KEYWORD_TAXONOMY', 'ATS_CHECKER intent requires ATS_KEYWORD_TAXONOMY');
  assert(atsIntent?.minimumEvidenceThreshold === 20, 'ATS_CHECKER intent requires >= 20 keyword terms');

  const placementsIntent = IntentTaxonomyRegistry.getIntentDefinition('PLACEMENTS');
  assert(placementsIntent?.evidenceRequirement === 'COLLEGE_PLACEMENT_REPORT', 'PLACEMENTS intent requires COLLEGE_PLACEMENT_REPORT');

  // --- 3. Global Location Hierarchy Tests ---
  console.log('\n--- 3. Testing Global Location Hierarchy & Relationship Engine ---');
  assert(COMPREHENSIVE_GLOBAL_LOCATIONS.length >= 20, 'Comprehensive global locations catalog loaded');
  assert(COMPREHENSIVE_LOCATION_EDGES.length >= 15, 'Geographic location edges loaded');

  // Alias resolution
  const blr = GlobalLocationHierarchy.resolveLocation('blr');
  assert(blr?.slug === 'bangalore', 'Alias BLR successfully resolves to Bangalore');

  const nyc = GlobalLocationHierarchy.resolveLocation('nyc');
  assert(nyc?.slug === 'new-york', 'Alias NYC successfully resolves to New York City');

  const dxb = GlobalLocationHierarchy.resolveLocation('dxb');
  assert(dxb?.slug === 'dubai', 'Alias DXB successfully resolves to Dubai');

  const wfh = GlobalLocationHierarchy.resolveLocation('wfh');
  assert(wfh?.slug === 'remote', 'Alias WFH successfully resolves to Worldwide Remote');

  const manhattan = GlobalLocationHierarchy.resolveLocation('manhattan');
  assert(manhattan?.slug === 'manhattan-nyc', 'District Manhattan resolves with adminLevel 6');

  // Multi-tier Ancestor Hierarchy
  const manhattanAncestors = GlobalLocationHierarchy.getAncestorHierarchy('manhattan-nyc');
  assert(manhattanAncestors.length >= 3, 'Manhattan hierarchy resolves up: Manhattan -> New York -> New York State -> USA');

  // Geographic neighbor edges
  const gurgaonNeighbors = GlobalLocationHierarchy.getNearbyLocations('gurgaon');
  assert(gurgaonNeighbors.some(n => n.slug === 'delhi'), 'Gurgaon neighbors include Delhi');

  // --- 4. Search Demand Ingestion Engine Tests ---
  console.log('\n--- 4. Testing Search Demand Ingestion Engine ---');
  const sampleGSC: RawDemandSignal[] = [
    {
      sourceType: 'GSC',
      rawQuery: 'senior software engineer jobs in bangalore',
      impressions: 4200,
      clicks: 140,
    },
    {
      sourceType: 'GSC',
      rawQuery: 'free ats resume score checker for python developer',
      impressions: 2800,
      clicks: 95,
    },
    {
      sourceType: 'INTERNAL_SEARCH',
      rawQuery: 'iit bombay placement report 2026',
    },
  ];

  const ingested = SearchDemandIngestionEngine.processDemandBatch(sampleGSC);
  assert(ingested.length === 3, 'Processed 3 raw search demand signals');

  assert(ingested[0].detectedIntent === 'JOBS', 'Signal 1 classified as JOBS');
  assert(ingested[0].primaryRole === 'software-engineer', 'Signal 1 extracted software-engineer role');
  assert(ingested[0].primaryLocation?.slug === 'bangalore', 'Signal 1 extracted Bangalore location');
  assert(ingested[0].recommendedUrl === '/jobs/software-engineer/bangalore', 'Signal 1 mapped to /jobs/software-engineer/bangalore');

  assert(ingested[1].detectedIntent === 'ATS_CHECKER', 'Signal 2 classified as ATS_CHECKER');
  assert(ingested[1].recommendedUrl === '/resume/ats-check/python-developer', 'Signal 2 mapped to /resume/ats-check/python-developer');

  assert(ingested[2].detectedIntent === 'PLACEMENTS', 'Signal 3 classified as PLACEMENTS');

  // --- 5. Systematic Intent Expansion Engine Tests ---
  console.log('\n--- 5. Testing Systematic Intent Expansion Engine ---');
  const testLocations = COMPREHENSIVE_GLOBAL_LOCATIONS.filter(l => ['bangalore', 'dubai', 'new-york', 'london', 'remote'].includes(l.slug));
  const expandedRole = IntentExpansionEngine.expandRoleEntity('software-engineer', 'Software Engineer', testLocations);
  assert(expandedRole.length >= 10, 'Expanded software-engineer into 10+ orthogonal search opportunities');

  const hasSalaryOpp = expandedRole.some(o => o.intentType === 'SALARY' && o.locationNode?.slug === 'bangalore');
  assert(hasSalaryOpp, 'Expansion includes Software Engineer Salary in Bangalore');

  const hasAtsOpp = expandedRole.some(o => o.intentType === 'ATS_CHECKER');
  assert(hasAtsOpp, 'Expansion includes ATS Resume Score Checker');

  const hasFresherOpp = expandedRole.some(o => o.intentType === 'FRESHER');
  assert(hasFresherOpp, 'Expansion includes Fresher Jobs');

  // Company expansion
  const expandedCompany = IntentExpansionEngine.expandCompanyEntity('google', 'Google', [
    { slug: 'software-engineer', title: 'Software Engineer' },
  ]);
  assert(expandedCompany.some(o => o.intentType === 'SALARY'), 'Company expansion includes Google Salaries');
  assert(expandedCompany.some(o => o.intentType === 'INTERVIEWS'), 'Company expansion includes Google Interview Process');

  // --- 6. Universe-Specific Evidence Engine Tests ---
  console.log('\n--- 6. Testing Universe-Specific Evidence Engine ---');
  // JOBS with 0 jobs -> INSUFFICIENT
  const jobsZero = UniverseEvidenceEngine.evaluateEvidence({
    intentType: 'JOBS',
    canonicalEntity: 'software-engineer',
    activeJobCount: 0,
  });
  assert(jobsZero.isEvidenceSufficient === false, 'JOBS with 0 vacancies rejected (prevents thin crawl bloat)');

  // JOBS with >= 3 jobs -> APPROVED
  const jobsThree = UniverseEvidenceEngine.evaluateEvidence({
    intentType: 'JOBS',
    canonicalEntity: 'software-engineer',
    activeJobCount: 5,
  });
  assert(jobsThree.isEvidenceSufficient === true, 'JOBS with 5 vacancies approved');

  // SALARY with 0 jobs but 35 salary records -> APPROVED (CRITICAL USER REQUIREMENT!)
  const salaryWithoutJobs = UniverseEvidenceEngine.evaluateEvidence({
    intentType: 'SALARY',
    canonicalEntity: 'software-engineer',
    activeJobCount: 0,
    salaryDataPoints: 35,
    salaryPercentilesAvailable: true,
  });
  assert(salaryWithoutJobs.isEvidenceSufficient === true, 'SALARY with 0 jobs but 35 data points is approved');

  // RESUME with template available -> APPROVED
  const resumeEval = UniverseEvidenceEngine.evaluateEvidence({
    intentType: 'RESUME',
    canonicalEntity: 'software-engineer',
    resumeTemplatesAvailable: true,
  });
  assert(resumeEval.isEvidenceSufficient === true, 'RESUME with template approved');

  // COLLEGES with audited placement report -> APPROVED
  const collegeEval = UniverseEvidenceEngine.evaluateEvidence({
    intentType: 'PLACEMENTS',
    canonicalEntity: 'iit-delhi',
    collegePlacementReportAudited: true,
  });
  assert(collegeEval.isEvidenceSufficient === true, 'PLACEMENTS with audited report approved');

  // --- 7. Content Contract Engine Tests ---
  console.log('\n--- 7. Testing Content Contract Engine ---');
  assert(ARCHETYPE_CONTRACTS['GOVERNMENT_JOB_PAGE'] !== undefined, 'GOVERNMENT_JOB_PAGE contract defined');
  assert(ARCHETYPE_CONTRACTS['COMPANY_CAREERS_DOSSIER'] !== undefined, 'COMPANY_CAREERS_DOSSIER contract defined');
  assert(ARCHETYPE_CONTRACTS['INTERVIEW_QUESTIONS_PAGE'] !== undefined, 'INTERVIEW_QUESTIONS_PAGE contract defined');

  // Validate complete content
  const validJobPageData = {
    'Hero & Canonical Intent H1': [1],
    'Live Verified Job Inventory': [1, 2, 3, 4],
    'Local Compensation Benchmarks': [1, 2, 3],
    'Top Hiring Companies': [1, 2, 3],
    'Core Technical Skill Demands': [1, 2, 3, 4, 5],
    'Interactive ATS Match CTA': [1],
    'Related Cities & Sub-Roles': [1, 2, 3, 4],
  };
  const contractResult = ContentContractEngine.validateContentContract('JOB_ROLE_CITY_PAGE', validJobPageData);
  assert(contractResult.isValid === true, 'Content contract passed when all mandatory modules are satisfied');

  // Validate thin content detection
  const thinJobPageData = {
    'Hero & Canonical Intent H1': [1],
    'Live Verified Job Inventory': [1], // Only 1 job, requires >= 3
  };
  const thinResult = ContentContractEngine.validateContentContract('JOB_ROLE_CITY_PAGE', thinJobPageData);
  assert(thinResult.isValid === false, 'Thin content flagged when mandatory inventory module fails minimum data points');

  // --- 8. Internal Link Authority Graph Engine Tests ---
  console.log('\n--- 8. Testing Internal Link Authority Graph Engine ---');
  const roleLinks = InternalLinkAuthorityEngine.generateRoleClusterLinks('software-engineer', 'Software Engineer', blr);
  assert(roleLinks.some(l => l.edgeType === 'ROLE_TO_SALARY'), 'Role links contain ROLE_TO_SALARY');
  assert(roleLinks.some(l => l.edgeType === 'ROLE_TO_ATS'), 'Role links contain ROLE_TO_ATS');
  assert(roleLinks.some(l => l.edgeType === 'ROLE_TO_INTERVIEW'), 'Role links contain ROLE_TO_INTERVIEW');

  const locLinks = InternalLinkAuthorityEngine.generateLocationClusterLinks(blr);
  assert(locLinks.some(l => l.edgeType === 'LOCATION_TO_ROLES'), 'Location links contain LOCATION_TO_ROLES');

  // --- 9. Global Language, Locale & Currency Engine Tests ---
  console.log('\n--- 9. Testing Global Language, Locale & Currency Engine ---');
  const inProfile = LocaleCurrencyEngine.getLocaleProfile('IN');
  assert(inProfile.currencySymbol === '₹', 'India profile currency symbol is ₹');
  assert(inProfile.formatSalary(1200000, 2400000) === '₹12 - 24 LPA', 'India salary formats as LPA');
  assert(inProfile.localEmploymentTerminology.compensationLabel === 'Cost to Company (CTC)', 'India uses CTC terminology');

  const aeProfile = LocaleCurrencyEngine.getLocaleProfile('AE');
  assert(aeProfile.currencyCode === 'AED', 'UAE profile currency is AED');
  assert(aeProfile.localEmploymentTerminology.taxTerm === '0% Personal Income Tax', 'UAE has 0% income tax terminology');

  const usProfile = LocaleCurrencyEngine.getLocaleProfile('US');
  assert(usProfile.currencySymbol === '$', 'US profile currency symbol is $');
  assert(usProfile.formatSalary(120000, 160000) === '$120k - $160k/year', 'US salary formats as $k/year');

  const gbProfile = LocaleCurrencyEngine.getLocaleProfile('GB');
  assert(gbProfile.currencySymbol === '£', 'UK profile currency symbol is £');

  const deProfile = LocaleCurrencyEngine.getLocaleProfile('DE');
  assert(deProfile.currencySymbol === '€', 'Germany profile currency symbol is €');

  // --- 10. Search Opportunity Engine Integrated Test ---
  console.log('\n--- 10. Testing Integrated Search Opportunity Engine ---');
  const validOpp = SearchOpportunityEngine.evaluateOpportunity({
    keyword: 'software engineer jobs in bangalore',
    normalizedQuery: 'software-engineer-jobs-bangalore',
    universeId: 'JOBS',
    canonicalEntity: 'software-engineer',
    searchDemandScore: 90,
    entityValidityScore: 100,
    inventoryCount: 35,
    dataEvidenceScore: 95,
    uniqueValueScore: 90,
    conversionPotentialScore: 95,
    freshnessScore: 95,
    internalAuthorityScore: 85,
    competitionGapScore: 30,
  });
  assert(validOpp.decision === 'BUILD_DESTINATION', 'Verified job intent evaluates to BUILD_DESTINATION');
  assert(validOpp.opportunityScore >= 75, `High opportunity score awarded: ${validOpp.opportunityScore}/100`);

  const zeroOpp = SearchOpportunityEngine.evaluateOpportunity({
    keyword: 'software engineer jobs in nowhereville',
    normalizedQuery: 'software-engineer-jobs-nowhereville',
    universeId: 'JOBS',
    canonicalEntity: 'software-engineer',
    searchDemandScore: 50,
    entityValidityScore: 100,
    inventoryCount: 0, // 0 jobs
    dataEvidenceScore: 20,
    uniqueValueScore: 50,
    conversionPotentialScore: 50,
    freshnessScore: 50,
    internalAuthorityScore: 20,
    competitionGapScore: 20,
  });
  assert(zeroOpp.decision === 'DO_NOT_BUILD', 'Zero inventory job intent evaluates to DO_NOT_BUILD');

  // --- 11. Search Universe Target Registry & Scale Tests ---
  console.log('\n--- 11. Testing Search Universe Target Registry & Scale Catalog ---');
  const allScaleTargets = SearchUniverseTargetRegistry.getAllTargets();
  assert(allScaleTargets.length === 31, 'Exactly 31 Search Universes registered in scale target registry');

  const locIntellTarget = SearchUniverseTargetRegistry.getTarget('LOCATION_INTELLIGENCE');
  assert(locIntellTarget !== undefined, 'LOCATION_INTELLIGENCE registered as 31st system universe');
  assert(locIntellTarget?.keywordTarget === 100000000, 'LOCATION_INTELLIGENCE targets 100M keywords');
  assert(locIntellTarget?.destinationTarget === 4000000, 'LOCATION_INTELLIGENCE targets 4M destinations');
  assert(locIntellTarget?.priority === 'CRITICAL_MASSIVE', 'LOCATION_INTELLIGENCE marked as CRITICAL_MASSIVE priority');

  const jobsTarget = SearchUniverseTargetRegistry.getTarget('JOBS');
  assert(jobsTarget?.keywordTarget === 120000000, 'JOBS targets 120M keywords');
  assert(jobsTarget?.destinationTarget === 10000000, 'JOBS targets 10M destinations');

  const passportTarget = SearchUniverseTargetRegistry.getTarget('CAREER_PASSPORT');
  assert(passportTarget?.destinationTarget === 6000000, 'CAREER_PASSPORT targets 6M destinations');

  const aggMetrics = SearchUniverseTargetRegistry.getGlobalAggregateMetrics();
  assert(aggMetrics.totalKeywordTarget === '1.057B (1057M)', `Global aggregate keyword target is 1.057B / 1.057 BILLION+ (found ${aggMetrics.totalKeywordTarget})`);
  assert(aggMetrics.totalDestinationTarget === '73M', `Global aggregate destination target is 73M (found ${aggMetrics.totalDestinationTarget})`);
  assert(aggMetrics.totalIndexableTarget === '22.6M', `Global aggregate indexable capacity is 22.6M (found ${aggMetrics.totalIndexableTarget})`);

  // --- 12. Multi-Tier Global Industry & Cross-Occupation Hierarchy Tests ---
  console.log('\n--- 12. Testing Global Industry & Cross-Occupation Hierarchy ---');
  const industries = GlobalIndustryHierarchy.getAllIndustries();
  assert(industries.length >= 10, `Loaded ${industries.length} global industries (Healthcare, BFSI, Construction, Hospitality, Aviation, etc.)`);

  const occupations = GlobalIndustryHierarchy.getAllOccupations();
  assert(occupations.length >= 25, `Loaded ${occupations.length} canonical occupations`);

  // Resolution tests for non-IT professions
  const pharmacistNode = GlobalIndustryHierarchy.resolveEntity('pharmacist');
  assert(pharmacistNode?.slug === 'pharmacist' && pharmacistNode.tier === 'OCCUPATION', 'Pharmacist resolves to OCCUPATION tier');

  const hotelMgrNode = GlobalIndustryHierarchy.resolveEntity('hotel manager');
  assert(hotelMgrNode?.slug === 'hotel-manager', 'Hotel manager resolves to canonical hotel-manager');

  const civilEngNode = GlobalIndustryHierarchy.resolveEntity('civil engineer');
  assert(civilEngNode?.slug === 'civil-engineer', 'Civil engineer resolves to civil-engineer');

  const pilotNode = GlobalIndustryHierarchy.resolveEntity('commercial pilot');
  assert(pilotNode?.slug === 'commercial-pilot', 'Commercial pilot resolves to commercial-pilot');

  // Ancestor hierarchy traversal
  const pharmaAncestors = GlobalIndustryHierarchy.getOccupationHierarchy('pharmacist');
  assert(pharmaAncestors.length >= 3, 'Pharmacist traverses upward to parent Pharmacy sector and Healthcare industry');
  assert(pharmaAncestors.some(n => n.slug === 'healthcare'), 'Pharmacist hierarchy reaches root Healthcare industry');

  const hotelAncestors = GlobalIndustryHierarchy.getOccupationHierarchy('hotel-manager');
  assert(hotelAncestors.some(n => n.slug === 'hospitality-tourism'), 'Hotel manager hierarchy reaches Hospitality & Tourism industry');

  // Industry occupation grouping
  const healthcareOccupations = GlobalIndustryHierarchy.getOccupationsForIndustry('healthcare');
  assert(healthcareOccupations.length >= 4, `Healthcare contains ${healthcareOccupations.length} occupations & specializations (pharmacist, nurse, physician, etc.)`);

  console.log('\n================================================================');
  console.log(`🏁 VERIFICATION SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
