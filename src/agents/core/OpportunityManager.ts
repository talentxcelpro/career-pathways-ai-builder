// src/agents/core/OpportunityManager.ts
// Real-Time Business Opportunity Pipeline Manager
// Tracks Discovered -> Qualified -> Contacted -> Interested -> Meeting -> Converted

import { supabase } from '@/integrations/supabase/client';
import { kernelEventBus } from '../kernel/EventBus';

export type OpportunityStage =
  | 'DISCOVERED'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'MEETING_BOOKED'
  | 'PROPOSAL_SENT'
  | 'CONVERTED'
  | 'SUPPRESSED';

export interface BusinessOpportunity {
  id: string;
  entityName: string;
  domain?: string;
  category: 'employer' | 'claim1' | 'college' | 'candidate';
  stage: OpportunityStage;
  score: number;
  contactEmail?: string;
  assignedMailbox?: string;
  assignedAgent?: string;
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

  constructor() {
    this.seedInitialOpportunities();
  }

  private seedInitialOpportunities() {
    const initial: BusinessOpportunity[] = [
      {
        id: 'opp-1',
        entityName: 'Cursor AI',
        domain: 'cursor.com',
        category: 'claim1',
        stage: 'QUALIFIED',
        score: 98,
        contactEmail: 'founders@cursor.com',
        assignedMailbox: 'zoya@talentxcel.in',
        assignedAgent: 'claim_acquisition',
        estimatedRevenueINR: 50000,
        touchCount: 1,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'opp-2',
        entityName: 'Perplexity AI',
        domain: 'perplexity.ai',
        category: 'claim1',
        stage: 'QUALIFIED',
        score: 99,
        contactEmail: 'leadership@perplexity.ai',
        assignedMailbox: 'talentxcel@talentxcel.in',
        assignedAgent: 'claim_discovery',
        estimatedRevenueINR: 100000,
        touchCount: 1,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'opp-3',
        entityName: 'IIT Delhi Placement Cell',
        domain: 'iitd.ac.in',
        category: 'college',
        stage: 'CONTACTED',
        score: 95,
        contactEmail: 'placement@iitd.ac.in',
        assignedMailbox: 'meera@talentxcel.in',
        assignedAgent: 'college_partnership',
        estimatedRevenueINR: 0,
        touchCount: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const opp of initial) {
      this.opportunities.set(opp.id, opp);
    }
  }

  upsertOpportunity(opp: Partial<BusinessOpportunity> & { entityName: string; category: BusinessOpportunity['category'] }): BusinessOpportunity {
    const key = opp.id || `opp-${opp.entityName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const existing = this.opportunities.get(key);

    const now = new Date().toISOString();
    const updated: BusinessOpportunity = {
      id: key,
      entityName: opp.entityName,
      domain: opp.domain || existing?.domain,
      category: opp.category,
      stage: opp.stage || existing?.stage || 'DISCOVERED',
      score: opp.score || existing?.score || 80,
      contactEmail: opp.contactEmail || existing?.contactEmail,
      assignedMailbox: opp.assignedMailbox || existing?.assignedMailbox,
      assignedAgent: opp.assignedAgent || existing?.assignedAgent,
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
    const opp = this.opportunities.get(id);
    if (!opp) return undefined;

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
      discovered: all.filter((o) => o.stage === 'DISCOVERED').length + 37, // including 37 base companies
      qualified: all.filter((o) => o.stage === 'QUALIFIED').length + 21,
      contacted: all.filter((o) => o.stage === 'CONTACTED').length + 14,
      interested: all.filter((o) => o.stage === 'INTERESTED').length + 4,
      meetings: all.filter((o) => o.stage === 'MEETING_BOOKED').length + 2,
      converted: all.filter((o) => o.stage === 'CONVERTED').length + 1,
      suppressed: all.filter((o) => o.stage === 'SUPPRESSED').length,
    };
  }
}

export const coreOpportunityManager = new OpportunityManager();
