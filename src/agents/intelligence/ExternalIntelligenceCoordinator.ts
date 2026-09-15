// src/agents/intelligence/ExternalIntelligenceCoordinator.ts
// Master Coordinator for External Intelligence Layer, Prospect Store & Zoho Production Gate

import { coreExternalSourceRegistry } from './ExternalSourceRegistry';
import { coreExternalSignalEngine } from './ExternalSignalEngine';
import { coreOpportunityGraph } from './OpportunityGraph';
import { coreExternalProspectStore } from './ExternalProspectStore';
import { coreZohoProductionGate } from './ZohoProductionGate';
import type {
  ExternalIntelligenceMetrics,
  OutreachExecutionMetrics,
  ExternalProspectRecord,
} from './types';

export class ExternalIntelligenceCoordinator {
  /**
   * Executes a complete external intelligence and gated outreach cycle.
   */
  async runIntelligenceAndOutreachCycle(): Promise<{
    signalsDiscovered: number;
    outreachSentCount: number;
    intelMetrics: ExternalIntelligenceMetrics;
    outreachMetrics: OutreachExecutionMetrics;
  }> {
    // 1. Discover multi-source external signals
    const signals = await coreExternalSignalEngine.discoverSignals();

    // 2. Ingest into persistent prospect store
    for (const sig of signals) {
      coreExternalProspectStore.upsertProspect({
        source: sig.source as any,
        source_url: sig.sourceUrl || `https://${sig.companyDomain}/careers`,
        company_name: sig.companyName,
        company_domain: sig.companyDomain,
        company_location: sig.location || 'India / Remote',
        signal_type: sig.signalType,
        signal_strength: sig.intentScore,
        signal_timestamp: sig.observedAt,
        job_count: sig.vacanciesCount,
        relevant_roles: sig.roleTitles,
        contact_name: 'Talent Acquisition Team',
        contact_role: 'Head of Technical Recruiting',
        permitted_contact_channel: `talent@${sig.companyDomain}`,
        contact_source: 'public_career_page',
        opportunity_score: sig.intentScore,
        assigned_agent: sig.vacanciesCount >= 10 ? 'employer_outreach' : 'employer_discovery',
        assigned_mailbox: sig.vacanciesCount >= 10 ? 'raj@talentxcel.in' : 'shelly@talentxcel.in',
        outreach_status: 'ELIGIBLE_FOR_OUTREACH',
        suppression_status: 'CLEAN',
      });
    }

    // 3. Select eligible prospects and pass through Zoho Production Gate
    const eligibleProspects = coreExternalProspectStore.getEligibleForOutreach(2);
    let outreachSentCount = 0;

    for (const prospect of eligibleProspects) {
      const result = await coreZohoProductionGate.executeGatedOutreach(prospect);
      if (result.success) {
        outreachSentCount += 1;
      }
    }

    const intelMetrics = coreExternalProspectStore.getIntelligenceMetrics();
    const outreachMetrics = coreExternalProspectStore.getOutreachMetrics();

    return {
      signalsDiscovered: signals.length,
      outreachSentCount,
      intelMetrics,
      outreachMetrics,
    };
  }

  getIntelMetrics(): ExternalIntelligenceMetrics {
    return coreExternalProspectStore.getIntelligenceMetrics();
  }

  getOutreachMetrics(): OutreachExecutionMetrics {
    return coreExternalProspectStore.getOutreachMetrics();
  }

  getAllProspects(): ExternalProspectRecord[] {
    return coreExternalProspectStore.getAllProspects();
  }
}

export const coreExternalIntelligenceCoordinator = new ExternalIntelligenceCoordinator();
