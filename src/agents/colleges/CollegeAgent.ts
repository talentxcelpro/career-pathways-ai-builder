// src/agents/colleges/CollegeAgent.ts
// Autonomous Higher Education & College Partnership Agent

import { eventBus } from '../shared/EventBus';
import { businessMemory } from '../shared/BusinessMemory';
import { agentAuditLog } from '../shared/AuditLog';
import { indianEducationService } from '@/services/indianEducationService';
import type { AgentStatus } from '../shared/types';

export class CollegeAgent {
  readonly name = 'CollegeAgent';
  private status: AgentStatus = 'IDLE';

  constructor() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    eventBus.subscribe('COLLEGE_MOU_SIGNED', async (event) => {
      await this.handleMouSigned(event.payload);
    });
  }

  async pulse(): Promise<void> {
    this.status = 'RUNNING';
    try {
      const stats = await indianEducationService.getCatalogStats();
      await agentAuditLog.record(this.name, 'PULSE_COLLEGE_CATALOG_AUDIT', {
        totalInstitutions: stats.total,
        verifiedPrograms: 100,
      });
      this.status = 'IDLE';
    } catch (err: any) {
      this.status = 'ERROR';
      await agentAuditLog.record(this.name, 'COLLEGE_PULSE_ERROR', {}, false, err.message);
    }
  }

  private async handleMouSigned(payload: { collegeId: string; institutionName: string; studentCount: number }) {
    await agentAuditLog.record(this.name, 'ONBOARD_COLLEGE_STUDENTS', payload);
    await eventBus.publish('STUDENT_COHORT_ONBOARDED', payload, this.name);
  }

  getStatus(): AgentStatus {
    return this.status;
  }
}

export const collegeAgent = new CollegeAgent();
