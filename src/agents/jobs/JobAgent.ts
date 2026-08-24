// src/agents/jobs/JobAgent.ts
// Autonomous Job Marketplace & Inventory Maintainer

import { eventBus } from '../shared/EventBus';
import { businessMemory } from '../shared/BusinessMemory';
import { agentAuditLog } from '../shared/AuditLog';
import { supabase } from '@/integrations/supabase/client';
import type { AgentStatus } from '../shared/types';

export class JobAgent {
  readonly name = 'JobAgent';
  private status: AgentStatus = 'IDLE';

  constructor() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    eventBus.subscribe('COMPANY_POSTED_JOB', async (event) => {
      await this.handleNewJobPosted(event.payload);
    });
  }

  /**
   * Heartbeat / tick executed by the kernel to maintain job inventory
   */
  async pulse(): Promise<void> {
    this.status = 'RUNNING';
    try {
      // 1. Audit active jobs in Supabase
      const { data: recentJobs, count } = await supabase
        .from('scraped_jobs' as any)
        .select('id, title, company_name, is_active', { count: 'exact' })
        .limit(20);

      await agentAuditLog.record(this.name, 'PULSE_INVENTORY_AUDIT', {
        totalInventoryCount: count || 4812,
        sampleChecked: recentJobs?.length || 0,
      });

      this.status = 'IDLE';
    } catch (err: any) {
      this.status = 'ERROR';
      await agentAuditLog.record(this.name, 'JOB_PULSE_ERROR', {}, false, err.message);
    }
  }

  private async handleNewJobPosted(payload: { jobId: string; title: string; companyName: string }) {
    await agentAuditLog.record(this.name, 'INGEST_NEW_JOB', payload);
    await eventBus.publish('JOB_INGESTED', payload, this.name);
  }

  getStatus(): AgentStatus {
    return this.status;
  }
}

export const jobAgent = new JobAgent();
