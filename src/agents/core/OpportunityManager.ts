// src/agents/core/OpportunityManager.ts
// Opportunity Lifecycle Manager for Employer, College, and Claim #1 Pipelines
// 100% genuine, uninflated state tracking

import { kernelEventBus } from '../kernel/EventBus';

export type OpportunityStage =
  | 'DISCOVERED'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'MEETING_BOOKED'
  | 'CONVERTED'
  | 'SUPPRESSED'
  | 'CLOSED_LOST';

export interface BusinessOpportunity {
  id: string;
  entityName: string;
  domain?: string;
  category: 'employer' | 'claim1' | 'college';
  stage: OpportunityStage;
  score: number; // 0 - 100
  assignedMailbox?: string;
  assignedAgent?: string;
  contactEmail?: string;
  contactName?: string;
  activeVacanciesCount?: number;
  matchingCandidatesCount?: number;
  estimatedRevenueINR?: number;
  lastTouchAt?: string;
  touchCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class OpportunityManager {
  private opportunities = new Map<string, BusinessOpportunity>();

  upsertOpportunity(opp: Partial<BusinessOpportunity> & { entityName: string }): BusinessOpportunity {
    const key = opp.domain ? opp.domain.toLowerCase().trim() : opp.entityName.toLowerCase().trim();
    const existing = this.opportunities.get(key);

    const now = new Date().toISOString();
    const updated: BusinessOpportunity = {
      id: existing ? existing.id : `opp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entityName: opp.entityName,
      domain: opp.domain || existing?.domain,
      category: opp.category || existing?.category || 'employer',
      stage: opp.stage || existing?.stage || 'DISCOVERED',
      score: opp.score ?? existing?.score ?? 70,
      assignedMailbox: opp.assignedMailbox || existing?.assignedMailbox || 'shelly@talentxcel.in',
      assignedAgent: opp.assignedAgent || existing?.assignedAgent || 'employer_outreach',
      contactEmail: opp.contactEmail || existing?.contactEmail,
      contactName: opp.contactName || existing?.contactName,
      activeVacanciesCount: opp.activeVacanciesCount ?? existing?.activeVacanciesCount,
      matchingCandidatesCount: opp.matchingCandidatesCount ?? existing?.matchingCandidatesCount,
      estimatedRevenueINR: opp.estimatedRevenueINR ?? existing?.estimatedRevenueINR,
      lastTouchAt: opp.lastTouchAt || existing?.lastTouchAt,
      touchCount: opp.touchCount ?? (existing ? existing.touchCount : 0),
      notes: opp.notes || existing?.notes,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    this.opportunities.set(key, updated);
    return updated;
  }

  transitionStage(id: string, stage: OpportunityStage, notes?: string): BusinessOpportunity | undefined {
    let targetKey: string | undefined;
    for (const [k, v] of this.opportunities.entries()) {
      if (v.id === id || v.domain === id) {
        targetKey = k;
        break;
      }
    }

    if (!targetKey) return undefined;
    const opp = this.opportunities.get(targetKey)!;

    opp.stage = stage;
    opp.updatedAt = new Date().toISOString();
    if (notes) opp.notes = notes;

    kernelEventBus.publish({
      type: `OPPORTUNITY_STAGE_${stage}`,
      sourceAgent: 'OpportunityManager',
      department: opp.category === 'employer' ? 'employer' : opp.category === 'college' ? 'colleges' : 'growth_marketing',
      payload: opp,
    });

    return opp;
  }

  getAllOpportunities(): BusinessOpportunity[] {
    return Array.from(this.opportunities.values());
  }

  getPipelineCounts(): {
    discovered: number;
    qualified: number;
    contacted: number;
    interested: number;
    meetings: number;
    converted: number;
    suppressed: number;
  } {
    const all = Array.from(this.opportunities.values());
    return {
      discovered: all.filter((o) => o.stage === 'DISCOVERED').length,
      qualified: all.filter((o) => o.stage === 'QUALIFIED').length,
      contacted: all.filter((o) => o.stage === 'CONTACTED').length,
      interested: all.filter((o) => o.stage === 'INTERESTED').length,
      meetings: all.filter((o) => o.stage === 'MEETING_BOOKED').length,
      converted: all.filter((o) => o.stage === 'CONVERTED').length,
      suppressed: all.filter((o) => o.stage === 'SUPPRESSED').length,
    };
  }
}

export const coreOpportunityManager = new OpportunityManager();
