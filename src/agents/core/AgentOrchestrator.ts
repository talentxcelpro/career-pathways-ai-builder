// src/agents/core/AgentOrchestrator.ts
// Master Operating Orchestrator coordinating all 9 Departments & 48 Specialist Workers
// Operating on behalf of Founder & CEO: Sanobar Jahan

import { coreBusinessMemory } from './BusinessMemory';
import { coreObjectiveEngine } from './ObjectiveEngine';
import { coreChannelRegistry } from './ChannelRegistry';
import { coreDecisionEngine } from './DecisionEngine';
import { coreKPIEngine } from './KPIEngine';
import { coreGuardrails } from './Guardrails';
import { kernelAgentRegistry } from '../kernel/AgentRegistry';
import { kernelTaskQueue } from '../kernel/TaskQueue';
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
      const goals = await coreObjectiveEngine.getSynchronizedGoals();
      const primaryGoal = coreObjectiveEngine.getPrimaryObjective();

      // 2. Department 1: Executive Office Evaluation
      kernelAgentRegistry.setWorkerStatus('founder_ceo', 'RUNNING');
      const execResult = await executiveAgent.runBusinessCycle();
      actionsExecuted += execResult.actionsTaken;
      kernelAgentRegistry.setWorkerStatus('founder_ceo', 'IDLE');

      // 3. Department 2: Growth & Marketing (Prospects, Campaigns & Outreach)
      kernelAgentRegistry.setWorkerStatus('marketing', 'RUNNING');
      kernelAgentRegistry.setWorkerStatus('prospect_discovery', 'RUNNING');
      const marketingResult = await marketingAgent.runMarketingCycle();
      actionsExecuted += marketingResult.actionsTaken;
      kernelAgentRegistry.setWorkerStatus('marketing', 'IDLE');
      kernelAgentRegistry.setWorkerStatus('prospect_discovery', 'IDLE');

      // 4. Department 3: Employer Acquisition (Hiring signals & Employer Verification)
      kernelAgentRegistry.setWorkerStatus('employer_discovery', 'RUNNING');
      kernelAgentRegistry.setWorkerStatus('employer_qualification', 'RUNNING');
      const employerResult = await employerAgent.runEmployerCycle();
      actionsExecuted += employerResult.actionsTaken;
      kernelAgentRegistry.setWorkerStatus('employer_discovery', 'IDLE');
      kernelAgentRegistry.setWorkerStatus('employer_qualification', 'IDLE');

      // 5. Department 4: Jobs Division (Hygiene & Deduplication across 4,812 jobs)
      kernelAgentRegistry.setWorkerStatus('job_quality', 'RUNNING');
      kernelAgentRegistry.setWorkerStatus('job_deduplication', 'RUNNING');
      const jobResult = await jobAgent.runJobCycle();
      actionsExecuted += jobResult.actionsTaken;
      kernelAgentRegistry.setWorkerStatus('job_quality', 'IDLE');
      kernelAgentRegistry.setWorkerStatus('job_deduplication', 'IDLE');

      // 6. Department 5: Candidate Growth (ATS & Job Matching)
      kernelAgentRegistry.setWorkerStatus('matching', 'RUNNING');
      kernelAgentRegistry.setWorkerStatus('resume', 'RUNNING');
      const candidateResult = await candidateAgent.runCandidateCycle();
      actionsExecuted += candidateResult.actionsTaken;
      kernelAgentRegistry.setWorkerStatus('matching', 'IDLE');
      kernelAgentRegistry.setWorkerStatus('resume', 'IDLE');

      // 7. Department 6: College Division (1,509 Verified Higher Education Catalog)
      kernelAgentRegistry.setWorkerStatus('college_discovery', 'RUNNING');
      kernelAgentRegistry.setWorkerStatus('college_qualification', 'RUNNING');
      const collegeResult = await collegeAgent.runCollegeCycle();
      actionsExecuted += collegeResult.actionsTaken;
      kernelAgentRegistry.setWorkerStatus('college_discovery', 'IDLE');
      kernelAgentRegistry.setWorkerStatus('college_qualification', 'IDLE');

      // 8. Department 7: Claim #1 Revenue Engine (Bids, Outbids, Reclaim Calculations)
      kernelAgentRegistry.setWorkerStatus('claim_discovery', 'RUNNING');
      kernelAgentRegistry.setWorkerStatus('outbid_reclaim', 'RUNNING');
      const claimResult = await claim1Agent.runClaim1Cycle();
      actionsExecuted += claimResult.actionsTaken;
      kernelAgentRegistry.setWorkerStatus('claim_discovery', 'IDLE');
      kernelAgentRegistry.setWorkerStatus('outbid_reclaim', 'IDLE');

      // 9. Department 8: Revenue & Commercial (Billing Reconciliation & Cash Flow)
      kernelAgentRegistry.setWorkerStatus('revenue', 'RUNNING');
      kernelAgentRegistry.setWorkerStatus('billing', 'RUNNING');
      const revResult = await revenueAgent.runRevenueCycle();
      actionsExecuted += revResult.actionsTaken;
      kernelAgentRegistry.setWorkerStatus('revenue', 'IDLE');
      kernelAgentRegistry.setWorkerStatus('billing', 'IDLE');

      // 10. Department 9: Product & Engineering (Audit and Telemetry)
      kernelAgentRegistry.setWorkerStatus('reliability', 'RUNNING');
      kernelAgentRegistry.setWorkerStatus('security_compliance', 'RUNNING');
      await kernelAuditEngine.record('orchestrator', 'executive', 'CYCLE_COMPLETED', {
        actionsExecuted,
        primaryGoal: primaryGoal.title,
        success: true,
      });
      kernelAgentRegistry.setWorkerStatus('reliability', 'IDLE');
      kernelAgentRegistry.setWorkerStatus('security_compliance', 'IDLE');

      // Publish cycle completion event
      kernelEventBus.publish({
        type: 'BUSINESS_CYCLE_EXECUTED',
        sourceAgent: 'AgentOrchestrator',
        department: 'executive',
        payload: { actionsExecuted, timestamp: new Date().toISOString() },
      });

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
