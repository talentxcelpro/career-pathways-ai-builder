// src/agents/candidates/CandidateAgent.ts
// Autonomous Candidate Acquisition & Career Funnel Agent

import { eventBus } from '../shared/EventBus';
import { businessMemory } from '../shared/BusinessMemory';
import { agentAuditLog } from '../shared/AuditLog';
import type { AgentStatus } from '../shared/types';

export class CandidateAgent {
  readonly name = 'CandidateAgent';
  private status: AgentStatus = 'IDLE';

  constructor() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    eventBus.subscribe('JOB_INGESTED', async (event) => {
      await this.handleJobIngested(event.payload);
    });

    eventBus.subscribe('CANDIDATE_REGISTERED', async (event) => {
      await this.handleCandidateRegistered(event.payload);
    });
  }

  async pulse(): Promise<void> {
    this.status = 'RUNNING';
    try {
      const memory = await businessMemory.getSnapshot();
      await agentAuditLog.record(this.name, 'PULSE_CANDIDATE_METRICS', {
        totalCandidates: memory.usersCount,
      });
      this.status = 'IDLE';
    } catch (err: any) {
      this.status = 'ERROR';
      await agentAuditLog.record(this.name, 'CANDIDATE_PULSE_ERROR', {}, false, err.message);
    }
  }

  private async handleJobIngested(payload: { jobId: string; title: string }) {
    await agentAuditLog.record(this.name, 'MATCH_CANDIDATES_TO_JOB', {
      jobId: payload.jobId,
      jobTitle: payload.title,
    });
  }

  private async handleCandidateRegistered(payload: { userId: string; email?: string }) {
    await agentAuditLog.record(this.name, 'PROVISION_ATS_PASSPORT_ONBOARDING', payload);
  }

  getStatus(): AgentStatus {
    return this.status;
  }
}

export const candidateAgent = new CandidateAgent();
