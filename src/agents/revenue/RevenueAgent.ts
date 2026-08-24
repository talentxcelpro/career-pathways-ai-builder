// src/agents/revenue/RevenueAgent.ts
// Autonomous Commercial Optimization & Revenue Intelligence Agent

import { eventBus } from '../shared/EventBus';
import { businessMemory } from '../shared/BusinessMemory';
import { agentAuditLog } from '../shared/AuditLog';
import { supabase } from '@/integrations/supabase/client';
import type { AgentStatus } from '../shared/types';

export class RevenueAgent {
  readonly name = 'RevenueAgent';
  private status: AgentStatus = 'IDLE';

  constructor() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    eventBus.subscribe('REVENUE_COLLECTED', async (event) => {
      await this.handleRevenueCollected(event.payload);
    });
  }

  async pulse(): Promise<void> {
    this.status = 'RUNNING';
    try {
      const memory = await businessMemory.getSnapshot(true);
      await agentAuditLog.record(this.name, 'PULSE_REVENUE_AUDIT', {
        totalPlatformRevenueINR: memory.totalPlatformRevenueINR,
        activePaidListings: memory.claim1ActiveBidsCount,
      });
      this.status = 'IDLE';
    } catch (err: any) {
      this.status = 'ERROR';
      await agentAuditLog.record(this.name, 'REVENUE_PULSE_ERROR', {}, false, err.message);
    }
  }

  private async handleRevenueCollected(payload: { amountINR: number; source: string; entityId?: string }) {
    await agentAuditLog.record(this.name, 'RECORD_TRANSACTION_REVENUE', payload);
  }

  getStatus(): AgentStatus {
    return this.status;
  }
}

export const revenueAgent = new RevenueAgent();
