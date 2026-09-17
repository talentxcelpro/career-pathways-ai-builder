/**
 * UDX v4.0 — Outcome & Displacement Metrics Engine
 * 
 * Replaces Keyword Rankings and Page Counts with true performance metrics:
 * 1. Intent Resolution Rate (IRR)
 * 2. Search Displacement Rate (SDR)
 * 3. Qualified Intent Coverage (QIC)
 * 4. AI Discovery Share (ADS)
 */

export interface IRRBreakdown {
  intentUnderstandingRate: number;  // Correctly Understood / Total Expressed
  pathRelevanceRate: number;        // Relevant Paths Served / Understood
  actionCompletionRate: number;     // Actions Executed / Paths Served
  outcomeCaptureRate: number;       // Outcomes Recorded / Actions Executed
  verifiedOutcomeRate: number;      // Independently Verified / Outcomes Recorded
  compositeIRR: number;             // End-to-end verified resolution rate
}

export interface SDRMetrics {
  searchDisplacementRate: number;   // % resolved without manual search pogo-sticking
  searchDependencyRemaining: number;// % still requiring external search
  avgManualStepsSaved: number;      // e.g. 5.8 steps saved vs traditional search
  externalClickDependency: number;  // % requiring external off-site clicks
  agentActionRate: number;          // % resolved autonomously via agent
}

export interface QualifiedIntentCoverage {
  totalDiscoveredIntents: number;
  qualifiedHighValueIntents: number;
  intentsWithResolutionSurface: number;
  coverageRatio: number;            // Surface / HighValue
  staleOrphanedCount: number;
  cannibalizedCount: number;
}

export interface AIDiscoveryShare {
  machineReadableEntities: number;
  agentLookupsCount: number;
  traditionalCrawlerHits: number;
  aiDiscoveryRatio: number;         // Agent Lookups / Total Ingests
}

export class MetricsEngine {
  /**
   * Computes Intent Resolution Rate breakdown from raw funnel numbers.
   */
  public static calculateIRR(counts: {
    expressed: number;
    understood: number;
    relevantPaths: number;
    actionsExecuted: number;
    outcomesRecorded: number;
    verifiedOutcomes: number;
  }): IRRBreakdown {
    const { expressed, understood, relevantPaths, actionsExecuted, outcomesRecorded, verifiedOutcomes } = counts;

    const intentUnderstandingRate = expressed > 0 ? understood / expressed : 0;
    const pathRelevanceRate = understood > 0 ? relevantPaths / understood : 0;
    const actionCompletionRate = relevantPaths > 0 ? actionsExecuted / relevantPaths : 0;
    const outcomeCaptureRate = actionsExecuted > 0 ? outcomesRecorded / actionsExecuted : 0;
    const verifiedOutcomeRate = outcomesRecorded > 0 ? verifiedOutcomes / outcomesRecorded : 0;

    const compositeIRR = expressed > 0 ? verifiedOutcomes / expressed : 0;

    return {
      intentUnderstandingRate: Number(intentUnderstandingRate.toFixed(3)),
      pathRelevanceRate: Number(pathRelevanceRate.toFixed(3)),
      actionCompletionRate: Number(actionCompletionRate.toFixed(3)),
      outcomeCaptureRate: Number(outcomeCaptureRate.toFixed(3)),
      verifiedOutcomeRate: Number(verifiedOutcomeRate.toFixed(3)),
      compositeIRR: Number(compositeIRR.toFixed(3)),
    };
  }

  /**
   * Computes Search Displacement Rate metrics.
   */
  public static calculateSDR(stats: {
    totalResolvedObjectives: number;
    directResolutionWithoutSearchCount: number;
    totalTraditionalStepsRequired: number;
    actualUDXStepsRequired: number;
    externalClicksCount: number;
    agentAutomatedActions: number;
  }): SDRMetrics {
    const {
      totalResolvedObjectives,
      directResolutionWithoutSearchCount,
      totalTraditionalStepsRequired,
      actualUDXStepsRequired,
      externalClicksCount,
      agentAutomatedActions,
    } = stats;

    const sdr = totalResolvedObjectives > 0
      ? directResolutionWithoutSearchCount / totalResolvedObjectives
      : 0;
    const dependencyRemaining = 1.0 - sdr;
    const stepsSaved = totalResolvedObjectives > 0
      ? (totalTraditionalStepsRequired - actualUDXStepsRequired) / totalResolvedObjectives
      : 0;
    const clickDep = totalResolvedObjectives > 0
      ? externalClicksCount / totalResolvedObjectives
      : 0;
    const agentRate = totalResolvedObjectives > 0
      ? agentAutomatedActions / totalResolvedObjectives
      : 0;

    return {
      searchDisplacementRate: Number(sdr.toFixed(3)),
      searchDependencyRemaining: Number(dependencyRemaining.toFixed(3)),
      avgManualStepsSaved: Number(stepsSaved.toFixed(1)),
      externalClickDependency: Number(clickDep.toFixed(3)),
      agentActionRate: Number(agentRate.toFixed(3)),
    };
  }

  /**
   * Computes Qualified Intent Coverage.
   */
  public static calculateQIC(data: {
    totalDiscovered: number;
    highValue: number;
    withSurface: number;
    staleOrphaned: number;
    cannibalized: number;
  }): QualifiedIntentCoverage {
    const coverageRatio = data.highValue > 0 ? data.withSurface / data.highValue : 0;
    return {
      totalDiscoveredIntents: data.totalDiscovered,
      qualifiedHighValueIntents: data.highValue,
      intentsWithResolutionSurface: data.withSurface,
      coverageRatio: Number(coverageRatio.toFixed(3)),
      staleOrphanedCount: data.staleOrphaned,
      cannibalizedCount: data.cannibalized,
    };
  }

  /**
   * Computes AI Discovery Share.
   */
  public static calculateADS(data: {
    machineEntities: number;
    agentLookups: number;
    traditionalCrawlers: number;
  }): AIDiscoveryShare {
    const total = data.agentLookups + data.traditionalCrawlers;
    const aiDiscoveryRatio = total > 0 ? data.agentLookups / total : 0;

    return {
      machineReadableEntities: data.machineEntities,
      agentLookupsCount: data.agentLookups,
      traditionalCrawlerHits: data.traditionalCrawlers,
      aiDiscoveryRatio: Number(aiDiscoveryRatio.toFixed(3)),
    };
  }
}
