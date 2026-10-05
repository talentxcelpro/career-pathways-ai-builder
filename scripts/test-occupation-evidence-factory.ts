// scripts/test-occupation-evidence-factory.ts
/**
 * Automated Verification Suite for Global Occupation Evidence Factory
 *
 * Validates:
 * 1. 12-factor evidence saturation per occupation across 32 industry verticals
 * 2. Active vacancies >= 3 threshold
 * 3. Salary dataset >= 15 records with P10..P90 spread
 * 4. ATS vocabulary >= 20 validated terms and action verbs
 * 5. Interview questions >= 10 with STAR framework responses
 * 6. Google XYZ resume bullet points
 * 7. Skills, Courses, Certifications, Career progression, and Employer data
 */

import { GlobalOccupationEvidenceFactory } from '../src/lib/seo/searchUniverse/globalOccupationEvidenceFactory';
import { GlobalIndustryHierarchy } from '../src/lib/seo/searchUniverse/globalIndustryHierarchy';
import { OccupationRoadmapRegistry } from '../src/lib/seo/searchUniverse/occupationRoadmapRegistry';
import { SearchCareerFunnelTelemetry } from '../src/lib/seo/searchUniverse/searchCareerFunnelTelemetry';
import { OccupationLedgerRegistry } from '../src/lib/seo/searchUniverse/occupationLedger';
import { RegistrationAcquisitionEngine } from '../src/lib/seo/searchUniverse/registrationAcquisitionEngine';

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
  console.log('🧪 TALENTXCEL GLOBAL OCCUPATION EVIDENCE FACTORY - TEST SUITE');
  console.log('================================================================\n');

  // --- 1. Testing Healthcare & Medicine Evidence Cluster ---
  console.log('--- 1. Testing Healthcare Cluster Evidence (Pharmacist, Nurse) ---');
  const pharmaEvidence = GlobalOccupationEvidenceFactory.getOccupationEvidence('pharmacist');
  assert(pharmaEvidence !== null, 'Pharmacist evidence package successfully loaded');
  assert(pharmaEvidence?.jobsEvidence.isSufficient === true, 'Pharmacist has >= 3 active jobs (found: ' + pharmaEvidence?.jobsEvidence.activeJobCount + ')');
  assert(pharmaEvidence?.salaryEvidence.isSufficient === true, 'Pharmacist has >= 15 verified salary points (found: ' + pharmaEvidence?.salaryEvidence.dataPointsCount + ')');
  assert(pharmaEvidence?.salaryEvidence.percentiles.p50 === 6.8, 'Pharmacist median salary is 6.8 LPA');
  assert(pharmaEvidence?.atsEvidence.isSufficient === true, 'Pharmacist has >= 20 ATS keywords (found: ' + pharmaEvidence?.atsEvidence.keywordTermsCount + ')');
  assert(pharmaEvidence?.interviewEvidence.isSufficient === true, 'Pharmacist has >= 10 interview questions (found: ' + pharmaEvidence?.interviewEvidence.questionCount + ')');
  assert(pharmaEvidence?.interviewEvidence.questions[0].starResponse.action.length > 20, 'Pharmacist interview question has complete STAR framework');
  assert(pharmaEvidence?.resumeEvidence.xyzBulletPoints.length >= 4, 'Pharmacist has Google XYZ formatted resume bullet points');
  assert(pharmaEvidence?.govtEvidence?.hasPublicSectorDemand === true, 'Pharmacist includes official government exam opportunities');

  const nurseEvidence = GlobalOccupationEvidenceFactory.getOccupationEvidence('nurse');
  assert(nurseEvidence !== null, 'Nurse evidence package successfully loaded');
  assert(nurseEvidence?.jobsEvidence.activeJobCount >= 50, 'Nurse has high-density job vacancies (found: ' + nurseEvidence?.jobsEvidence.activeJobCount + ')');
  assert(nurseEvidence?.certificationsEvidence.credentials.includes('NCLEX-RN License'), 'Nurse credentials include NCLEX-RN License');

  // --- 2. Testing Construction & Civil Cluster Evidence ---
  console.log('\n--- 2. Testing Construction Cluster Evidence (Civil Engineer) ---');
  const civilEvidence = GlobalOccupationEvidenceFactory.getOccupationEvidence('civil-engineer');
  assert(civilEvidence !== null, 'Civil Engineer evidence package loaded');
  assert(civilEvidence?.salaryEvidence.dataPointsCount >= 30, 'Civil Engineer has >= 30 verified salary records');
  assert(civilEvidence?.atsEvidence.softwareTools.includes('STAAD.Pro'), 'Civil Engineer ATS includes STAAD.Pro tool');
  assert(civilEvidence?.careerPathEvidence.stages.length === 4, 'Civil Engineer has complete 4-stage career roadmap');

  // --- 3. Testing Aviation Cluster Evidence ---
  console.log('\n--- 3. Testing Aviation Cluster Evidence (Commercial Pilot) ---');
  const pilotEvidence = GlobalOccupationEvidenceFactory.getOccupationEvidence('commercial-pilot');
  assert(pilotEvidence !== null, 'Commercial Pilot evidence package loaded');
  assert(pilotEvidence?.salaryEvidence.unit === 'monthly_aed', 'Commercial Pilot salary denominated in monthly AED');
  assert(pilotEvidence?.salaryEvidence.percentiles.p50 === 38000, 'Commercial Pilot median salary is 38,000 AED/month');
  assert(pilotEvidence?.atsEvidence.mustHaveKeywords.includes('Cockpit Resource Management (CRM)'), 'Pilot ATS includes CRM keyword');
  assert(pilotEvidence?.certificationsEvidence.credentials.includes('Airline Transport Pilot License (ATPL)'), 'Pilot credentials include ATPL');

  // --- 4. Testing Hospitality Cluster Evidence ---
  console.log('\n--- 4. Testing Hospitality Cluster Evidence (Hotel Manager) ---');
  const hotelEvidence = GlobalOccupationEvidenceFactory.getOccupationEvidence('hotel-manager');
  assert(hotelEvidence !== null, 'Hotel Manager evidence package loaded');
  assert(hotelEvidence?.atsEvidence.mustHaveKeywords.includes('RevPAR Optimization'), 'Hotel Manager ATS includes RevPAR Optimization');
  assert(hotelEvidence?.locationsEvidence.tier1Hubs.includes('Dubai'), 'Hotel Manager tier-1 hubs include Dubai');

  // --- 5. Testing BFSI Cluster Evidence ---
  console.log('\n--- 5. Testing BFSI Cluster Evidence (Relationship Manager) ---');
  const rmEvidence = GlobalOccupationEvidenceFactory.getOccupationEvidence('relationship-manager');
  assert(rmEvidence !== null, 'Relationship Manager evidence package loaded');
  assert(rmEvidence?.salaryEvidence.percentiles.p50 === 11.0, 'RM median salary is 11.0 LPA');
  assert(rmEvidence?.atsEvidence.mustHaveKeywords.includes('Wealth Management'), 'RM ATS includes Wealth Management');
  assert(rmEvidence?.resumeEvidence.xyzBulletPoints.some(b => b.includes('AUM')), 'RM resume bullets include AUM growth metrics');

  // --- 6. Testing Dynamic Synthesis for Extended Occupations ---
  console.log('\n--- 6. Testing Baseline Synthesis across 32 Industries ---');
  const radiologistEvidence = GlobalOccupationEvidenceFactory.getOccupationEvidence('radiologist');
  assert(radiologistEvidence !== null, 'Radiologist evidence successfully synthesized');
  assert(radiologistEvidence?.jobsEvidence.isSufficient === true, 'Radiologist has sufficient baseline jobs');
  assert(radiologistEvidence?.salaryEvidence.isSufficient === true, 'Radiologist has sufficient baseline salary points');
  assert(radiologistEvidence?.atsEvidence.isSufficient === true, 'Radiologist has sufficient baseline ATS terms');

  // --- 7. Testing Evidence Saturation Gate ---
  console.log('\n--- 7. Testing Evidence Saturation Verification Gate ---');
  const pharmaSaturation = GlobalOccupationEvidenceFactory.verifyEvidenceSaturation('pharmacist');
  assert(pharmaSaturation.isEligibleForIndex === true, 'Pharmacist meets all evidence thresholds for indexing (Score: ' + pharmaSaturation.saturationScore + ')');
  assert(pharmaSaturation.missingThresholds.length === 0, 'Pharmacist has zero missing evidence thresholds');

  const rmSaturation = GlobalOccupationEvidenceFactory.verifyEvidenceSaturation('relationship-manager');
  assert(rmSaturation.isEligibleForIndex === true, 'Relationship Manager meets all evidence thresholds (Score: ' + rmSaturation.saturationScore + ')');

  const invalidSaturation = GlobalOccupationEvidenceFactory.verifyEvidenceSaturation('non-existent-fantasy-role');
  assert(invalidSaturation.isEligibleForIndex === false, 'Invalid role rejected by evidence saturation gate');

  // --- 8. Testing Phase B 500-Occupation Roadmap & Yield KPIs ---
  console.log('\n--- 8. Testing Phase B 500-Occupation Roadmap & Yield KPIs ---');
  const sectors = OccupationRoadmapRegistry.getAllSectorsCatalog();
  assert(sectors.length === 68, 'Phase B sectors catalog contains exactly 68 specialized sub-sectors (found: ' + sectors.length + ')');
  const plannedOccupations = OccupationRoadmapRegistry.getTotalPlannedOccupationsForPhaseB();
  assert(plannedOccupations >= 500, 'Phase B targets >= 500 canonical occupations (found: ' + plannedOccupations + ')');

  const snapshot = SearchCareerFunnelTelemetry.generateSnapshot();
  assert(snapshot.executiveRatios.careerGraphCoverage.includes('8.80%'), 'Career Graph Coverage reflects 8.80% (44 / 500 target)');
  assert(snapshot.executiveRatios.qualifiedOpportunityCoverage.includes('0.0035%'), 'Qualified Opportunity Coverage reflects 0.0035%');
  assert(snapshot.executiveRatios.careerEventYield.includes('14.08%'), 'Career Event Yield reflects 14.08% (100 events / 710 clicks)');
  assert(snapshot.executiveRatios.occupationTransactionYield.includes('0.43 applications'), 'Occupation Transaction Yield reflects 0.43 applications / saturated occupation');
  assert(snapshot.executiveRatios.occupationPlacementYield.includes('0.068 matches'), 'Occupation Placement Yield reflects 0.068 matches / saturated occupation');

  const subMilestones = OccupationRoadmapRegistry.getPhaseBSubMilestones();
  assert(subMilestones.length === 3, 'Phase B defines 3 structured sub-milestones (B1: 100, B2: 250, B3: 500)');

  const priorityScore = OccupationRoadmapRegistry.computeOccupationPriorityScore({
    demandScore: 90,
    activeJobDensity: 85,
    salaryDataAvailability: 80,
    transactionPotential: 88,
    sectorDiversityWeight: 1.1,
  });
  assert(priorityScore >= 85, 'Factory prioritization scoring calculates composite score >= 85 (scored: ' + priorityScore + ')');

  // --- 9. Testing Per-Occupation Evidence & Economic Ledger ---
  console.log('\n--- 9. Testing Per-Occupation Evidence & Economic Ledger ---');
  const stats = OccupationLedgerRegistry.getLedgerAggregateStats();
  assert(stats.provenOccupationsCount === 44, 'Ledger tracks exact 44 baseline proven units (found: ' + stats.provenOccupationsCount + ')');
  assert(stats.b1CandidateCount === 56, 'Ledger queues exact 56 Phase B1 candidate units (found: ' + stats.b1CandidateCount + ')');
  assert(stats.b1TotalTarget === 100, 'Ledger establishes exact 100-role B1 milestone gate (found: ' + stats.b1TotalTarget + ')');
  assert(stats.totalCostINR === 0, 'Ledger aggregate production cost is ₹0 incremental cash (found: ₹' + stats.totalCostINR + ')');
  assert(stats.incrementalCashCostINR === 0, 'Incremental cash cost is ₹0 (found: ₹' + stats.incrementalCashCostINR + ')');
  assert(stats.totalApps === 19, 'Ledger accounts for exact 19 applications across 44 units (found: ' + stats.totalApps + ')');
  assert(stats.totalMatches === 3, 'Ledger accounts for exact 3 placements across 44 units (found: ' + stats.totalMatches + ')');
  assert(stats.evidenceCostPerApplicationINR === 0, 'Evidence Cost / Application reflects ₹0 in zero-cost model (found: ₹' + stats.evidenceCostPerApplicationINR + ')');
  assert(stats.evidenceCostPerPlacementINR === 0, 'Evidence Cost / Placement reflects ₹0 in zero-cost model (found: ₹' + stats.evidenceCostPerPlacementINR + ')');
  assert(stats.costModel === 'ZERO_INCREMENTAL_CASH', 'Ledger initializes costModel to ZERO_INCREMENTAL_CASH (found: ' + stats.costModel + ')');
  assert(stats.infrastructureCostModel === 'OWNED_EXISTING_INFRASTRUCTURE', 'Infrastructure model is OWNED_EXISTING_INFRASTRUCTURE');

  const emergingWinners = OccupationLedgerRegistry.getEmergingWinners();
  assert(emergingWinners.length >= 5, 'Ledger identifies >= 5 emerging winners (found: ' + emergingWinners.length + ')');
  assert(emergingWinners[0].performanceTier === 'EMERGING_WINNER', 'Top performers classified as EMERGING_WINNER rather than confirmed heroes');

  const sectorSummary = OccupationLedgerRegistry.getSectorPerformanceSummary();
  assert(sectorSummary['healthcare'] !== undefined, 'Sector summary contains healthcare vertical');
  assert(sectorSummary['healthcare'].evidenceCostPerApplicationINR === 0, 'Healthcare Evidence Cost / Application is ₹0 (found: ' + sectorSummary['healthcare'].evidenceCostPerApplicationINR + ')');
  assert(sectorSummary['healthcare'].evidenceCostPerPlacementINR === 0, 'Healthcare Evidence Cost / Placement is ₹0 (found: ' + sectorSummary['healthcare'].evidenceCostPerPlacementINR + ')');

  // Zero-Cost Opportunity Score (Post-B1 Formula 2 Redesign)
  const oppScore = OccupationRoadmapRegistry.computeZeroCostOpportunityScore({
    observedTransactionYield: 6,
    revenuePotentialWeight: 2.5,
    confidenceScore: 0.6,
  });
  assert(oppScore === 9.0, 'Zero-Cost Opportunity Score calculates 6 * 2.5 * 0.6 = 9.0 (found: ' + oppScore + ')');

  // 15-Column Table Export
  const headers = OccupationLedgerRegistry.get15ColumnLedgerHeaders();
  assert(headers.includes('Cost/App') && headers.includes('Cost/Placement'), '15-column headers include Cost/App and Cost/Placement');
  const table = OccupationLedgerRegistry.get15ColumnLedgerTable(undefined, 3);
  assert(table.includes('Registered Nurse') && table.includes('Pharmacist'), '15-column table renders top units with complete metrics');

  // Opportunity / Capital Efficiency Ranking
  const ranked = OccupationLedgerRegistry.rankByCapitalEfficiency(5);
  assert(ranked[0].occupationSlug === 'nurse', 'Top opportunity ranking unit is Registered Nurse (found: ' + ranked[0].occupationSlug + ')');
  assert(ranked[0].capitalAllocationScore > 10, 'Registered Nurse opportunity score > 10 (scored: ' + ranked[0].capitalAllocationScore + ')');
  assert(stats.managementSummary === '22 transaction events generated at ₹0 incremental cash spend', 'Management display accurately shows 22 transaction events generated at ₹0 incremental cash spend');

  // --- 10. Testing Registration Acquisition Engine (50k Registrations/Day Roadmap) ---
  console.log('\n--- 10. Testing Registration Acquisition Engine (50k Registrations/Day Roadmap) ---');
  const fourEngines = RegistrationAcquisitionEngine.getFourAcquisitionEngines();
  assert(fourEngines.length === 4, 'Engine framework defines exact 4 acquisition engines (found: ' + fourEngines.length + ')');
  assert(fourEngines.some(e => e.id === 'SEO_ACQUISITION_ENGINE'), 'Includes SEO Acquisition Engine for 31 search universes');
  assert(fourEngines.some(e => e.id === 'PROGRAMMATIC_CAREER_INTENT_ENGINE'), 'Includes Programmatic Career Intent Engine');
  assert(fourEngines.some(e => e.id === 'JOB_TO_CAREER_CONVERSION_ENGINE'), 'Includes Job-to-Career Conversion Engine');
  assert(fourEngines.some(e => e.id === 'VIRAL_REFERRAL_ACQUISITION_ENGINE'), 'Includes Viral Referral Acquisition Engine');

  const nurseSurfaces = RegistrationAcquisitionEngine.getAcquisitionSurfacesForOccupation('nurse', 'Registered Nurse');
  assert(nurseSurfaces.length === 10, 'Registered Nurse maps to exact 10 high-value acquisition surfaces (found: ' + nurseSurfaces.length + ')');
  assert(nurseSurfaces.some(s => s.surfaceType === 'JOBS' && s.actionHook === 'CHECK_MY_MATCH'), 'Jobs surface features CHECK_MY_MATCH action hook');
  assert(nurseSurfaces.some(s => s.surfaceType === 'RESUME_ATS' && s.actionHook === 'BUILD_MY_ATS_RESUME'), 'Resume surface features BUILD_MY_ATS_RESUME action hook');
  assert(nurseSurfaces.some(s => s.surfaceType === 'SALARY' && s.actionHook === 'SEE_SALARY_BENCHMARK'), 'Salary surface features SEE_SALARY_BENCHMARK action hook');
  assert(nurseSurfaces.some(s => s.surfaceType === 'INTERVIEW_QUESTIONS' && s.actionHook === 'PRACTICE_INTERVIEW'), 'Interview surface features PRACTICE_INTERVIEW hook');
  assert(nurseSurfaces.every(s => s.conversionPath.googleAuthTrigger.includes('Google')), 'Every surface enforces zero-friction Google sign-in trigger');
  assert(nurseSurfaces.every(s => s.isEvidenceSatisfied === true), 'All 10 surfaces for Registered Nurse pass evidence verification gate');

  const funnelCalc = RegistrationAcquisitionEngine.calculateFunnelRequirements(50000);
  assert(funnelCalc.requiredDailyQualifiedVisits >= 450000, '50k daily registrations requires ~455,000 qualified visits/day (calculated: ' + funnelCalc.requiredDailyQualifiedVisits + ')');
  assert(funnelCalc.expectedDailyApplications >= 12000, '50k daily registrations produces ~12,200 daily applications (calculated: ' + funnelCalc.expectedDailyApplications + ')');
  assert(funnelCalc.signupRatePercent === 10.99, 'Funnel operates on verified 10.99% signup rate');

  const gates = RegistrationAcquisitionEngine.getMilestoneGates();
  assert(gates.length === 6, 'Defines 6 progression gates from Stage 0 to Stage 5 (50k/day) (found: ' + gates.length + ')');
  assert(gates[5].dailyRegistrationsTarget === 50000, 'Stage 5 targets exactly 50,000 daily registrations');

  console.log('\n================================================================');
  console.log(`🏁 EVIDENCE FACTORY RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
