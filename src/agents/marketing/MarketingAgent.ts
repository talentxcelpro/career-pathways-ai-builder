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
  private statusReason: string | undefined = undefined;

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
    try {
      // 1. Fetch qualified prospects ready for outreach
      const prospects = await claim1MarketingService.getProspects('QUALIFIED');

      if (!prospects || prospects.length === 0) {
        this.status = 'IDLE';
        this.statusReason = 'No pending qualified prospects in queue.';
        return;
      }

      this.status = 'RUNNING';
      this.statusReason = `Processing ${prospects.length} qualified prospects in queue.`;

      for (const prospect of prospects.slice(0, 3)) {
        // Enforce anti-spam guardrail
        const check = guardrails.canContactProspect(prospect.contact_count);
        if (!check.allowed) {
          continue;
        }

        if (prospect.founder_email) {
          // Dispatch via toolRegistry
          const result = await toolRegistry.invokeTool(
            'marketing.sendEmail',
            {
              to: prospect.founder_email,
              subject: `Founding 100 Category Invitation: ${prospect.name}`,
              htmlContent: `<p>We have opened the verified category leaderboards on TalentXcel Claim #1. Your product is a top candidate. The first 100 claimed profiles lock a permanent 5% platform fee for life.</p><p><a href="https://talentxcel.in/company/${prospect.slug}">Claim your profile</a></p>`,
              prospectId: prospect.id,
              currentTouchCount: prospect.contact_count,
            },
            this.name
          );

          if (result.status === 'SENT') {
            await eventBus.publish(
              'OUTREACH_SENT',
              {
                prospectId: prospect.id,
                slug: prospect.slug,
                channel: 'email',
              },
              this.name
            );
          }
        } else {
          // Awaiting founder email connector
          await claim1MarketingService.updateProspectState(prospect.id, 'QUALIFIED');
        }
      }

      this.status = 'IDLE';
      this.statusReason = undefined;
    } catch (err: any) {
      this.status = 'ERROR';
      this.statusReason = err.message;
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

  getStatusReason(): string | undefined {
    return this.statusReason;
  }
}

export const marketingAgent = new MarketingAgent();
