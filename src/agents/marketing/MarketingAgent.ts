// src/agents/marketing/MarketingAgent.ts
// Autonomous Marketing & Outreach Agent

import { eventBus } from '../shared/EventBus';
import { businessMemory } from '../shared/BusinessMemory';
import { guardrails } from '../shared/Guardrails';
import { agentAuditLog } from '../shared/AuditLog';
import { claim1MarketingService } from '@/services/claim1MarketingService';
import type { AgentStatus } from '../shared/types';
import type { Claim1Prospect } from '@/types/claim1Marketing';

export class MarketingAgent {
  readonly name = 'MarketingAgent';
  private status: AgentStatus = 'IDLE';

  constructor() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    eventBus.subscribe('COMPANY_REGISTERED', async (event) => {
      await this.handleNewCompanyRegistered(event.payload);
    });

    eventBus.subscribe('CONVERSION_RECORDED', async (event) => {
      await this.handleConversion(event.payload);
    });
  }

  /**
   * Heartbeat / tick executed by the kernel
   */
  async pulse(): Promise<void> {
    this.status = 'RUNNING';
    try {
      // 1. Fetch qualified prospects ready for outreach
      const prospects = await claim1MarketingService.getProspects('QUALIFIED');

      let outreachExecuted = 0;
      for (const prospect of prospects.slice(0, 5)) {
        // Enforce anti-spam guardrail
        const check = guardrails.canContactProspect(prospect.contact_count);
        if (!check.allowed) {
          continue;
        }

        // Record validated outreach
        guardrails.recordAction('daily_outreach');
        await claim1MarketingService.updateProspectState(prospect.id, 'CONTACTED');
        outreachExecuted++;

        await agentAuditLog.record(this.name, 'DISPATCH_PROSPECT_OUTREACH', {
          prospectId: prospect.id,
          name: prospect.name,
          slug: prospect.slug,
          touchNumber: prospect.contact_count + 1,
        });

        await eventBus.publish(
          'OUTREACH_SENT',
          {
            prospectId: prospect.id,
            slug: prospect.slug,
            channel: 'direct_founder_outreach',
          },
          this.name
        );
      }

      this.status = 'IDLE';
    } catch (err: any) {
      this.status = 'ERROR';
      await agentAuditLog.record(this.name, 'MARKETING_PULSE_ERROR', {}, false, err.message);
    }
  }

  private async handleNewCompanyRegistered(payload: { companyId: string; name: string }) {
    await agentAuditLog.record(this.name, 'ONBOARD_NEW_COMPANY', payload);
  }

  private async handleConversion(payload: any) {
    await agentAuditLog.record(this.name, 'LOG_MARKETING_CONVERSION', payload);
  }

  getStatus(): AgentStatus {
    return this.status;
  }
}

export const marketingAgent = new MarketingAgent();
