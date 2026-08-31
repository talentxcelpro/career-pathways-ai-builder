// src/agents/shared/AgentRuntime.ts
// Master Autonomous Agent Runtime: Initializes kernel, boots all agents, and coordinates execution

import { agentRegistry } from './AgentRegistry';
import { eventBus } from './EventBus';
import { businessMemory } from './BusinessMemory';
import { goalManager } from './GoalManager';
import { taskQueue } from './TaskQueue';
import { scheduler } from './Scheduler';
import { guardrails } from './Guardrails';
import { toolRegistry } from './ToolRegistry';
import { agentAuditLog } from './AuditLog';

import { executiveAgent } from '../executive/ExecutiveAgent';
import { marketingAgent } from '../marketing/MarketingAgent';
import { claim1Agent } from '../claim1/Claim1Agent';
import { employerAgent } from '../employer/EmployerAgent';
import { jobAgent } from '../jobs/JobAgent';
import { candidateAgent } from '../candidates/CandidateAgent';
import { collegeAgent } from '../colleges/CollegeAgent';
import { revenueAgent } from '../revenue/RevenueAgent';

class MasterAgentRuntime {
  private isBooted = false;

  /**
   * Initializes the entire agent kernel and registers all 8 agents
   */
  boot() {
    if (this.isBooted) return;
    this.isBooted = true;

    console.log('🚀 [AgentRuntime] Booting TalentXcel Autonomous Business OS Kernel V1...');

    // Register all 8 functional agents
    agentRegistry.registerAgent({
      name: 'ExecutiveAgent',
      role: 'Business Brain & Strategic Orchestrator',
      getStatus: () => executiveAgent.getStatus(),
      pulse: () => executiveAgent.pulse(),
      getCurrentObjective: () => executiveAgent.getObjective().title,
    });

    agentRegistry.registerAgent({
      name: 'MarketingAgent',
      role: 'Outreach, SEO & Prospect Acquisition',
      getStatus: () => marketingAgent.getStatus(),
      getStatusReason: () => marketingAgent.getStatusReason(),
      pulse: () => marketingAgent.pulse(),
      getCurrentObjective: () => 'Contact High-Priority AI Founders for Founding 100',
    });

    agentRegistry.registerAgent({
      name: 'Claim1Agent',
      role: 'Leaderboard & Bidding Rivalry Engine',
      getStatus: () => claim1Agent.getStatus(),
      pulse: () => claim1Agent.pulse(),
      getCurrentObjective: () => 'Monitor Bidding & Reclaim Price Targets',
    });

    agentRegistry.registerAgent({
      name: 'EmployerAgent',
      role: 'Company Discovery & Qualification',
      getStatus: () => employerAgent.getStatus(),
      pulse: () => employerAgent.pulse(),
      getCurrentObjective: () => 'Qualify Active Hiring Employers',
    });

    agentRegistry.registerAgent({
      name: 'JobAgent',
      role: 'Marketplace Inventory & Deduplication',
      getStatus: () => jobAgent.getStatus(),
      pulse: () => jobAgent.pulse(),
      getCurrentObjective: () => 'Audit & Maintain Verified Job Inventory',
    });

    agentRegistry.registerAgent({
      name: 'CandidateAgent',
      role: 'ATS Funnels & Career Matching',
      getStatus: () => candidateAgent.getStatus(),
      pulse: () => candidateAgent.pulse(),
      getCurrentObjective: () => 'Match Candidates to Active Job Openings',
    });

    agentRegistry.registerAgent({
      name: 'CollegeAgent',
      role: 'Institutions & Student Cohorts',
      getStatus: () => collegeAgent.getStatus(),
      pulse: () => collegeAgent.pulse(),
      getCurrentObjective: () => 'Audit 1,509 Accredited Indian Colleges',
    });

    agentRegistry.registerAgent({
      name: 'RevenueAgent',
      role: 'Unit Economics & Razorpay Reconciliation',
      getStatus: () => revenueAgent.getStatus(),
      pulse: () => revenueAgent.pulse(),
      getCurrentObjective: () => 'Reconcile Razorpay Payments & Fee Streams',
    });

    // Start background scheduler
    scheduler.start();

    // Boot autonomous TPO outreach & snapshot runner
    import('@/lib/autonomous-os/autonomousTpoOutreachEngine').then(({ AutonomousTpoOutreachEngine }) => {
      const engine = AutonomousTpoOutreachEngine.getInstance();
      engine.executeAutonomousOutreachCycle();
      setInterval(() => {
        engine.executeAutonomousOutreachCycle();
      }, 300000); // Pulse every 5 minutes
    });

    // Boot 20M Keyword Universe Opportunity Graph (Refreshes every 3.5 hours)
    import('@/lib/seo/keywordUniverseEngine').then(({ KeywordUniverseEngine }) => {
      const kwEngine = KeywordUniverseEngine.getInstance();
      kwEngine.runPeriodicEvaluationCycle();
      setInterval(() => {
        kwEngine.runPeriodicEvaluationCycle();
      }, 3.5 * 60 * 60 * 1000);
    });

    console.log('✅ [AgentRuntime] All 8 Agents, TPO Outreach, 20M Keyword Universe and Scheduler Active.');
  }

  isReady(): boolean {
    return this.isBooted;
  }
}

export const agentRuntime = new MasterAgentRuntime();
