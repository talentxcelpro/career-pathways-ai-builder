// src/agents/executive/ExecutiveAgent.ts
// Top-Level Executive Agent (The Business Brain)

import { eventBus } from '../shared/EventBus';
import { businessMemory } from '../shared/BusinessMemory';
import { agentAuditLog } from '../shared/AuditLog';
import { claim1Agent } from '../claim1/Claim1Agent';
import { marketingAgent } from '../marketing/MarketingAgent';
import { employerAgent } from '../employer/EmployerAgent';
import { jobAgent } from '../jobs/JobAgent';
import { candidateAgent } from '../candidates/CandidateAgent';
import { collegeAgent } from '../colleges/CollegeAgent';
import { revenueAgent } from '../revenue/RevenueAgent';
import type { AgentStatus, AgentObjective } from '../shared/types';

export class ExecutiveAgent {
  readonly name = 'ExecutiveAgent';
  private status: AgentStatus = 'IDLE';

  private activeObjective: AgentObjective = {
    id: 'obj-1',
    title: 'Founding 100 & Claim #1 Launch Velocity',
    targetMetric: 'Claimed Companies',
    targetValue: 100,
    currentValue: 18,
    status: 'ACTIVE',
  };

  /**
   * Top-level orchestrator pulse: runs cross-agent coordination cycle
   */
  async runBusinessCycle(): Promise<{
    memorySnapshot: any;
    agentStates: Record<string, AgentStatus>;
  }> {
    this.status = 'RUNNING';

    try {
      // 1. Fetch fresh unified memory
      const snapshot = await businessMemory.getSnapshot(true);

      // 2. Pulse all underlying functional agents
      await Promise.allSettled([
        claim1Agent.pulse(),
        marketingAgent.pulse(),
        employerAgent.pulse(),
        jobAgent.pulse(),
        candidateAgent.pulse(),
        collegeAgent.pulse(),
        revenueAgent.pulse(),
      ]);

      const agentStates: Record<string, AgentStatus> = {
        Executive: this.status,
        Claim1: claim1Agent.getStatus(),
        Marketing: marketingAgent.getStatus(),
        Employer: employerAgent.getStatus(),
        Jobs: jobAgent.getStatus(),
        Candidates: candidateAgent.getStatus(),
        Colleges: collegeAgent.getStatus(),
        Revenue: revenueAgent.getStatus(),
      };

      await agentAuditLog.record(this.name, 'EXECUTIVE_CYCLE_COMPLETED', {
        objective: this.activeObjective.title,
        snapshot,
        agentStates,
      });

      this.status = 'IDLE';
      return { memorySnapshot: snapshot, agentStates };
    } catch (err: any) {
      this.status = 'ERROR';
      await agentAuditLog.record(this.name, 'EXECUTIVE_CYCLE_ERROR', {}, false, err.message);
      return {
        memorySnapshot: null,
        agentStates: { Executive: 'ERROR' },
      };
    }
  }

  async pulse(): Promise<void> {
    await this.runBusinessCycle();
  }

  getObjective(): AgentObjective {
    return this.activeObjective;
  }

  setObjective(objective: Partial<AgentObjective>) {
    this.activeObjective = { ...this.activeObjective, ...objective };
  }

  getStatus(): AgentStatus {
    return this.status;
  }
}

export const executiveAgent = new ExecutiveAgent();
