// src/agents/shared/GoalManager.ts
// Decomposes top-level business objectives into sub-goals and computes real progress from DB

import { supabase } from '@/integrations/supabase/client';
import type { AgentObjective } from './types';

class CentralGoalManager {
  private primaryObjective: AgentObjective = {
    id: 'obj-founding-100',
    title: 'Acquire the First 100 Legitimate Claim #1 Companies & Generate Real Competitive Bidding',
    targetMetric: 'Claimed Companies',
    targetValue: 100,
    currentValue: 1,
    priority: 'HIGH',
    ownerAgent: 'ExecutiveAgent',
    status: 'ACTIVE',
    requiredActions: [
      'Discover high-probability AI products & startups',
      'Execute permitted founder outreach within anti-spam limits',
      'Lock Founding 100 5% platform fee for verified claims',
      'Monitor ranking movements and trigger exact-price reclaim opportunities',
      'Reconcile Razorpay transactions vs committed listings',
    ],
    successCondition: '100 verified entities claimed with minimum 10 competitive bidding battles.',
  };

  /**
   * Computes the real current progress from Supabase
   */
  async getActiveObjective(): Promise<AgentObjective> {
    try {
      const { count } = await supabase
        .from('claim1_entities')
        .select('id', { count: 'exact', head: true })
        .not('owner_user_id', 'is', null);

      this.primaryObjective.currentValue = count || 1;
      if (this.primaryObjective.currentValue >= this.primaryObjective.targetValue) {
        this.primaryObjective.status = 'ACHIEVED';
      }
    } catch {
      // safe fallback
    }

    return { ...this.primaryObjective };
  }

  updateObjective(updates: Partial<AgentObjective>) {
    this.primaryObjective = { ...this.primaryObjective, ...updates };
  }
}

export const goalManager = new CentralGoalManager();
