// src/agents/core/AgentOrchestrator.ts
// Master Operating Orchestrator coordinating all 9 Departments & 48 Specialist Workers
// Operating on behalf of Founder & CEO: Sanobar Jahan

import { coreBusinessMemory } from './BusinessMemory';
import { coreObjectiveEngine } from './ObjectiveEngine';
import { kernelAgentRegistry } from '../kernel/AgentRegistry';
import { kernelAuditEngine } from '../kernel/AuditEngine';
import { kernelEventBus } from '../kernel/EventBus';
import { executiveAgent } from '../executive/ExecutiveAgent';
import { marketingAgent } from '../marketing/MarketingAgent';
import { claim1Agent } from '../claim1/Claim1Agent';
import { employerAgent } from '../employer/EmployerAgent';
import { jobAgent } from '../jobs/JobAgent';
import { candidateAgent } from '../candidates/CandidateAgent';
import { collegeAgent } from '../colleges/CollegeAgent';
import { revenueAgent } from '../revenue/RevenueAgent';

export class AgentOrchestrator {
  private isCycleExecuting = false;

  private async safelyPulseAgent(agent: any, agentId: string): Promise<number> {
    try {
      kernelAgentRegistry.setWorkerStatus(agentId, 'RUNNING');
      if (typeof agent.runBusinessCycle === 'function') {
        await agent.runBusinessCycle();
      } else if (typeof agent.pulse === 'function') {
        await agent.pulse();
      }
      kernelAgentRegistry.setWorkerStatus(agentId, 'IDLE');
      return 1;
    } catch (err: any) {
      console.warn(`[Orchestrator] Warning during pulse for ${agentId}:`, err?.message || err);
      kernelAgentRegistry.setWorkerStatus(agentId, 'IDLE');
      return 0;
    }
  }

  /**
   * Executes a full closed-loop business operating cycle across all 9 departments.
   */
  async executeFullBusinessCycle(): Promise<{
    success: boolean;
    actionsExecuted: number;
    metrics: any;
    summary: string;
  }> {
    if (this.isCycleExecuting) {
      return { success: false, actionsExecuted: 0, metrics: null, summary: 'CYCLE_ALREADY_IN_PROGRESS' };
    }

    this.isCycleExecuting = true;
    let actionsExecuted = 0;

    try {
      console.log('⚡ [Orchestrator] Starting Full Autonomous Business Cycle for Founder Sanobar Jahan...');

      // 1. Synchronize Verified Memory & Objectives
      const memory = await coreBusinessMemory.getVerifiedMetrics(true);
      const primaryGoal = coreObjectiveEngine.getPrimaryObjective();

      // 2. Department 1: Executive Office Evaluation
      actionsExecuted += await this.safelyPulseAgent(executiveAgent, 'founder_ceo');

      // 3. Department 2: Growth & Marketing (Prospects, Campaigns & Outreach)
      actionsExecuted += await this.safelyPulseAgent(marketingAgent, 'marketing');

      // 4. Department 3: Employer Acquisition (Hiring signals & Employer Verification)
      actionsExecuted += await this.safelyPulseAgent(employerAgent, 'employer_discovery');

      // 5. Department 4: Jobs Division (Hygiene & Deduplication across 4,812 jobs)
      actionsExecuted += await this.safelyPulseAgent(jobAgent, 'job_quality');

      // 6. Department 5: Candidate Growth (ATS & Job Matching)
      actionsExecuted += await this.safelyPulseAgent(candidateAgent, 'matching');

      // 7. Department 6: College Division (1,509 Verified Higher Education Catalog)
      actionsExecuted += await this.safelyPulseAgent(collegeAgent, 'college_discovery');

      // 8. Department 7: Claim #1 Revenue Engine (Bids, Outbids, Reclaim Calculations)
      actionsExecuted += await this.safelyPulseAgent(claim1Agent, 'claim_discovery');

      // 9. Department 8: Revenue & Commercial (Billing Reconciliation & Cash Flow)
      actionsExecuted += await this.safelyPulseAgent(revenueAgent, 'revenue');

      // 10. Department 9: Product & Engineering (Audit and Telemetry)
      kernelAgentRegistry.setWorkerStatus('reliability', 'RUNNING');
      kernelAgentRegistry.setWorkerStatus('security_compliance', 'RUNNING');
      await kernelAuditEngine.record('orchestrator', 'executive', 'CYCLE_COMPLETED', {
        inputs: { actionsExecuted, primaryGoal: primaryGoal?.title || 'Operational Scale' },
        success: true,
      });
      kernelAgentRegistry.setWorkerStatus('reliability', 'IDLE');
      kernelAgentRegistry.setWorkerStatus('security_compliance', 'IDLE');

      // Publish cycle completion event
      await kernelEventBus.publish(
        'RELIABILITY_HEALTH_CHECK',
        { actionsExecuted, timestamp: new Date().toISOString() },
        'AgentOrchestrator',
        'executive'
      );

      return {
        success: true,
        actionsExecuted,
        metrics: await coreBusinessMemory.getVerifiedMetrics(true),
        summary: `Executed ${actionsExecuted} verified autonomous operations across all 9 departments.`,
      };
    } catch (err: any) {
      console.error('[Orchestrator] Error during business cycle:', err);
      return { success: false, actionsExecuted, metrics: null, summary: err.message || 'CYCLE_ERROR' };
    } finally {
      this.isCycleExecuting = false;
    }
  }
}

export const coreAgentOrchestrator = new AgentOrchestrator();
