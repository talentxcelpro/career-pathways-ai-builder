// scripts/run-search-career-funnel-telemetry.ts
/**
 * Executive Search-to-Career Funnel Telemetry Runner
 *
 * Implements 4-Box Executive Operating Model:
 * 1. GLOBAL CAREER GRAPH: 1.057B+ modeled opportunities | 241M qualified | 73M evidence-backed | 22.6M max capacity | 12,053 indexable | 8,450 indexed
 * 2. OCCUPATION GRAPH: 44 / 500 Phase-B saturated | 68 specialized sectors | 8.8% Career Graph Coverage | B1 (100) -> B2 (250) -> B3 (500)
 * 3. MARKET PERFORMANCE: 28,400 impressions | 710 clicks | 78 registrations | 19 applications | 3 matches
 * 4. YIELD & UNIT ECONOMICS: Career Event Yield | Occupation Transaction Yield | Occupation Placement Yield
 *
 * 14-Stage End-to-End Funnel Progression
 * Saves executive snapshot to search_career_funnel_telemetry.json
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { SearchCareerFunnelTelemetry } from '../src/lib/seo/searchUniverse/searchCareerFunnelTelemetry';

async function runTelemetry() {
  console.log('================================================================================');
  console.log('📊 TALENTXCEL EXECUTIVE SEARCH-TO-CAREER FUNNEL TELEMETRY');
  console.log('   Scale Ambition: 1.057B+ Modeled Search Opportunities');
  console.log('================================================================================\n');

  const snapshot = SearchCareerFunnelTelemetry.generateSnapshot({
    currentlyIndexableUrls: 12053,
    actuallyIndexedUrls: 8450,
    totalOrganicImpressions: 28400,
    totalOrganicClicks: 710,
    candidateRegistrations: 78,
    jobApplicationsSubmitted: 19,
    hiresMatchesCompleted: 3,
  });

  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ 🌐 BOX 1: GLOBAL CAREER GRAPH                                                │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  console.log(`│  • Modeled Search Opportunities : ${snapshot.scaleSummary.modeledSearchOpportunities.padEnd(42)} │`);
  console.log(`│  • Qualified Opportunities      : ${snapshot.scaleSummary.qualifiedOpportunities.padEnd(42)} │`);
  console.log(`│  • Evidence-Backed Destinations : ${snapshot.scaleSummary.evidenceBackedDestinations.padEnd(42)} │`);
  console.log(`│  • Maximum Quality Capacity     : ${snapshot.scaleSummary.maximumQualityCapacity.padEnd(42)} │`);
  console.log(`│  • Submitted to XML Sitemaps    : ${snapshot.scaleSummary.currentlyIndexableUrls.toLocaleString().padEnd(42)} │`);
  console.log(`│  • Actually Indexed (Googlebot) : ${snapshot.scaleSummary.actuallyIndexedUrls.toLocaleString().padEnd(42)} │`);
  console.log('└──────────────────────────────────────────────────────────────────────────────┘\n');

  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ 🧭 BOX 2: OCCUPATION GRAPH (PHASE B 500-TARGET)                              │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  console.log(`│  • Saturated Occupations        : 44 (Phase A) / 500 (Phase B Milestone)    │`);
  console.log(`│  • Specialized Sub-Sectors      : 68 Sectors (Cataloged & Mapped)            │`);
  console.log(`│  • Career Graph Coverage        : ${snapshot.executiveRatios.careerGraphCoverage.padEnd(42)} │`);
  console.log(`│  • Internal Roadmap Cadence     : B1 (100) ➔ B2 (250) ➔ B3 (500 Roles)       │`);
  console.log(`│  • Evidence Contract Standard   : 12-Factor Full Saturation                  │`);
  console.log('└──────────────────────────────────────────────────────────────────────────────┘\n');

  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ 📈 BOX 3: MARKET PERFORMANCE & TRANSACTIONS                                  │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  console.log(`│  • Organic Search Impressions   : ${snapshot.scaleSummary.totalOrganicImpressions.toLocaleString().padEnd(42)} │`);
  console.log(`│  • Organic Qualified Clicks     : ${snapshot.scaleSummary.totalOrganicClicks.toLocaleString().padEnd(42)} │`);
  console.log(`│  • Candidate Registrations      : ${snapshot.scaleSummary.candidateRegistrations.toString().padEnd(42)} │`);
  console.log(`│  • Job Applications Submitted   : ${snapshot.scaleSummary.jobApplicationsSubmitted.toString().padEnd(42)} │`);
  console.log(`│  • Successful Hires / Matches   : ${snapshot.scaleSummary.hiresMatchesCompleted.toString().padEnd(42)} │`);
  console.log('└──────────────────────────────────────────────────────────────────────────────┘\n');

  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ 🎯 BOX 4: YIELD & UNIT ECONOMICS                                             │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  console.log(`│  ⭐ Qualified Opp Coverage       : ${snapshot.executiveRatios.qualifiedOpportunityCoverage.padEnd(42)} │`);
  console.log(`│  ⭐ Career Event Yield           : ${snapshot.executiveRatios.careerEventYield.padEnd(42)} │`);
  console.log(`│  ⭐ Occupation Transaction Yield : ${snapshot.executiveRatios.occupationTransactionYield.padEnd(42)} │`);
  console.log(`│  ⭐ Occupation Placement Yield   : ${snapshot.executiveRatios.occupationPlacementYield.padEnd(42)} │`);
  console.log(`│  ⭐ Occupation Search Yield     : ${snapshot.executiveRatios.occupationSearchYield.padEnd(42)} │`);
  console.log(`│  • Unit Economic CTR            : ${snapshot.executiveRatios.unitEconomicCTR.padEnd(42)} │`);
  console.log(`│  • Unit Economic Signup Rate    : ${snapshot.executiveRatios.unitEconomicSignupRate.padEnd(42)} │`);
  console.log(`│  • Unit Economic App Rate       : ${snapshot.executiveRatios.unitEconomicApplicationRate.padEnd(42)} │`);
  console.log('└──────────────────────────────────────────────────────────────────────────────┘\n');

  if (snapshot.occupationLedgerSummary) {
    console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ 📋 BOX 5: PER-OCCUPATION EVIDENCE & ECONOMIC LEDGER (B1 FACTORY)             │');
    console.log('├──────────────────────────────────────────────────────────────────────────────┤');
    console.log(`│  • Proven Baseline Units        : ${snapshot.occupationLedgerSummary.provenUnitsCount} Occupations (Phase A Verified)         │`);
    console.log(`│  • B1 Priority Candidates Queued: ${snapshot.occupationLedgerSummary.b1CandidateCount} Occupations (Demand x Evidence Weighted) │`);
    console.log(`│  • B1 Milestone Target Scale    : ${snapshot.occupationLedgerSummary.b1TotalTarget} Occupations (Review Gate Milestone)     │`);
    console.log(`│  • Aggregate Production Cost    : ₹${snapshot.occupationLedgerSummary.totalProductionCostINR.toLocaleString()} (44 units @ ₹1,200/unit)       │`);
    console.log(`│  • Commercial Revenue Target    : ₹${snapshot.occupationLedgerSummary.totalMonetizedRevenueINR.toFixed(2)} (B1 Commercial Validation)       │`);
    console.log('│  • Top Performing Archetypes    :                                            │');
    for (const arch of snapshot.occupationLedgerSummary.topPerformingArchetypes) {
      const line = `    - ${arch.occupationName}: ${arch.applications} apps, ${arch.matches} match, ${arch.searchYield} imp`;
      console.log(`│  ${line.padEnd(76)}│`);
    }
    console.log('└──────────────────────────────────────────────────────────────────────────────┘\n');
  }

  console.log('--- 14-STAGE ACQUISITION FUNNEL PROGRESSION ---');
  for (let i = 0; i < snapshot.funnelStages.length; i++) {
    const stage = snapshot.funnelStages[i];
    const prevRate = stage.conversionRateFromPreviousStage !== undefined
      ? `(Step Conv: ${stage.conversionRateFromPreviousStage.toFixed(2)}%)`
      : '';
    console.log(`  [Stage ${(i + 1).toString().padStart(2)}] ${stage.stageName.padEnd(38)} : ${stage.formattedCount.padStart(16)} ${prevRate}`);
  }

  const outputPath = resolve('search_career_funnel_telemetry.json');
  writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`\n✓ Executive telemetry snapshot saved to search_career_funnel_telemetry.json`);
  console.log('================================================================================');
}

runTelemetry().catch(console.error);
