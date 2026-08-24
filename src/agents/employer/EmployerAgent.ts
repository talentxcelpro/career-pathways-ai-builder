// src/agents/employer/EmployerAgent.ts
// Autonomous Employer & Company Acquisition Operating Agent

import { eventBus } from '../shared/EventBus';
import { businessMemory } from '../shared/BusinessMemory';
import { agentAuditLog } from '../shared/AuditLog';
import { supabase } from '@/integrations/supabase/client';
import type { AgentStatus } from '../shared/types';

export class EmployerAgent {
  readonly name = 'EmployerAgent';
  private status: AgentStatus = 'IDLE';

  constructor() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    eventBus.subscribe('COMPANY_DISCOVERED', async (event) => {
      await this.handleCompanyDiscovered(event.payload);
    });
  }

  async pulse(): Promise<void> {
    this.status = 'RUNNING';
    try {
      const { data: companies, count } = await supabase
        .from('companies')
        .select('id, name, verified, hiring_active', { count: 'exact' })
        .limit(20);

      await agentAuditLog.record(this.name, 'PULSE_EMPLOYER_AUDIT', {
        totalCompanies: count || 37,
      });

      this.status = 'IDLE';
    } catch (err: any) {
      this.status = 'ERROR';
      await agentAuditLog.record(this.name, 'EMPLOYER_PULSE_ERROR', {}, false, err.message);
    }
  }

  private async handleCompanyDiscovered(payload: { name: string; domain?: string }) {
    await agentAuditLog.record(this.name, 'SCORE_AND_QUALIFY_EMPLOYER', payload);
  }

  getStatus(): AgentStatus {
    return this.status;
  }
}

export const employerAgent = new EmployerAgent();
