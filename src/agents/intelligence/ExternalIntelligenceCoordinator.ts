// src/agents/intelligence/ExternalIntelligenceCoordinator.ts
// Master Coordinator for External Intelligence Layer & Opportunity Graph

import { coreExternalSourceRegistry } from './ExternalSourceRegistry';
import { coreExternalSignalEngine } from './ExternalSignalEngine';
import { coreOpportunityGraph } from './OpportunityGraph';
import type { OpportunityGraphStats, OpportunityNode } from './types';

export class ExternalIntelligenceCoordinator {
  /**
   * Executes an external intelligence discovery pulse across all compliant feeds.
   */
  async runIntelligencePulse(): Promise<{
    signalsDiscovered: number;
    graphStats: OpportunityGraphStats;
    topOpportunities: OpportunityNode[];
  }> {
    const signals = await coreExternalSignalEngine.discoverSignals();
    const stats = coreOpportunityGraph.getStats();
    const topOpportunities = coreOpportunityGraph.getTopQualifiedOpportunities(10);

    return {
      signalsDiscovered: signals.length,
      graphStats: stats,
      topOpportunities,
    };
  }

  getGraphStats(): OpportunityGraphStats {
    return coreOpportunityGraph.getStats();
  }

  getTopOpportunities(limit = 10): OpportunityNode[] {
    return coreOpportunityGraph.getTopQualifiedOpportunities(limit);
  }
}

export const coreExternalIntelligenceCoordinator = new ExternalIntelligenceCoordinator();
