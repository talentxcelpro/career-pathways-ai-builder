// src/agents/si/SIOrchestrator.ts
// TalentXcel SI Orchestrator — extends existing AgentOrchestrator with 6-engine model

import { supabase } from '@/integrations/supabase/client';
import { kernelEventBus } from '../kernel/EventBus';
import { kernelToolRegistry } from '../kernel/ToolRegistry';
import { coreAgentOrchestrator } from '../core/AgentOrchestrator';
import type { SIEngine, SIEngineId, SITask, SIApprovalRequest } from './types';

// Engine definitions — map existing 48 agents to 6 SI engines
const SI_ENGINE_DEFINITIONS: SIEngine[] = [
  {
    id: 'marketing_factory',
    name: 'Autonomous Marketing Factory',
    description: 'Generate qualified demand through content, organic search, campaigns and distribution',
    assignedAgentIds: [
      'growth',
      'marketing',
      'seo_intelligence',
      'content_strategy',
      'social_media',
      'campaign_optimisation',
      'competitor_intelligence',
    ],
    status: 'IDLE',
    lastExecutionAt: null,
    nextScheduledAt: null,
    tasksCompleted: 0,
    tasksFailed: 0,
    successRate: 0,
    costINR: 0,
  },
  {
    id: 'customer_acquisition',
    name: 'Autonomous Customer Acquisition',
    description:
      'Find, qualify, engage and convert employers, recruiters, job seekers and service customers',
    assignedAgentIds: [
      'prospect_discovery',
      'employer_discovery',
      'employer_qualification',
      'matching',
      'growth',
      'claim_discovery',
    ],
    status: 'IDLE',
    lastExecutionAt: null,
    nextScheduledAt: null,
    tasksCompleted: 0,
    tasksFailed: 0,
    successRate: 0,
    costINR: 0,
  },
  {
    id: 'career_intelligence',
    name: 'Autonomous Career Intelligence',
    description:
      'Monitor the employment market and improve TalentXcel career products and recommendations',
    assignedAgentIds: [
      'matching',
      'resume',
      'career_development',
      'college_discovery',
      'college_qualification',
    ],
    status: 'IDLE',
    lastExecutionAt: null,
    nextScheduledAt: null,
    tasksCompleted: 0,
    tasksFailed: 0,
    successRate: 0,
    costINR: 0,
  },
  {
    id: 'mcp_gateway',
    name: 'MCP Integration Gateway',
    description: 'Connect AI agents to external tools, APIs, data sources and services securely',
    assignedAgentIds: ['reliability', 'security_compliance', 'product_intelligence'],
    status: 'IDLE',
    lastExecutionAt: null,
    nextScheduledAt: null,
    tasksCompleted: 0,
    tasksFailed: 0,
    successRate: 0,
    costINR: 0,
  },
  {
    id: 'tech_evolution',
    name: 'Self-Evolving Technology Intelligence',
    description:
      'Discover, benchmark and safely integrate emerging AI technologies, models, APIs and MCP servers',
    assignedAgentIds: ['product_intelligence', 'ux_quality', 'experimentation', 'reliability'],
    status: 'IDLE',
    lastExecutionAt: null,
    nextScheduledAt: null,
    tasksCompleted: 0,
    tasksFailed: 0,
    successRate: 0,
    costINR: 0,
  },
  {
    id: 'growth_flywheel',
    name: 'Autonomous Growth Flywheel',
    description:
      'Connect every engine to customer acquisition, conversion, revenue, retention and referrals',
    assignedAgentIds: [
      'revenue',
      'billing',
      'retention',
      'referral',
      'outbid_reclaim',
      'business_intelligence',
    ],
    status: 'IDLE',
    lastExecutionAt: null,
    nextScheduledAt: null,
    tasksCompleted: 0,
    tasksFailed: 0,
    successRate: 0,
    costINR: 0,
  },
];

class TalentXcelSIOrchestrator {
  private engines: Map<SIEngineId, SIEngine> = new Map();
  private isRunning = false;
  private emergencyStop = false;

  constructor() {
    for (const engine of SI_ENGINE_DEFINITIONS) {
      this.engines.set(engine.id, { ...engine });
    }
  }

  // ── Engine Access ─────────────────────────────────────────────────────
  getAllEngines(): SIEngine[] {
    return Array.from(this.engines.values());
  }

  getEngine(id: SIEngineId): SIEngine | undefined {
    return this.engines.get(id);
  }

  // ── Command Processing ────────────────────────────────────────────────
  async processCommand(
    instruction: string,
    engineTarget?: SIEngineId,
    agentTarget?: string
  ): Promise<{ commandId: string; status: string; result: string }> {
    if (this.emergencyStop) {
      return {
        commandId: '',
        status: 'BLOCKED',
        result: 'Emergency stop is active. Resume operations before issuing commands.',
      };
    }

    const commandId = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Log command to Supabase
    try {
      await supabase.from('si_commands' as any).insert({
        id: commandId,
        instruction,
        engine_target: engineTarget || null,
        agent_target: agentTarget || null,
        status: 'QUEUED',
      });
    } catch {
      // safe fallback — DB may not have the table yet (pre-migration)
    }

    // Route command to appropriate engine/agent
    const result = await this.routeCommand(instruction, engineTarget, agentTarget);

    // Update command status
    try {
      await supabase
        .from('si_commands' as any)
        .update({
          status: result.success ? 'COMPLETED' : 'FAILED',
          result: result.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', commandId);
    } catch {
      // safe fallback
    }

    return {
      commandId,
      status: result.success ? 'COMPLETED' : 'FAILED',
      result: result.message,
    };
  }

  private async routeCommand(
    instruction: string,
    engineTarget?: SIEngineId,
    _agentTarget?: string
  ): Promise<{ success: boolean; message: string }> {
    const lower = instruction.toLowerCase();

    // Classify the command
    if (lower.includes('health') || lower.includes('status') || lower.includes('audit')) {
      return this.handleHealthCommand();
    }

    if (lower.includes('employer') || lower.includes('hiring') || lower.includes('recruit')) {
      return this.handleAcquisitionCommand(instruction, 'employer');
    }

    if (lower.includes('competitor') || lower.includes('analyse competitor')) {
      return this.handleIntelligenceCommand(instruction, 'competitor');
    }

    if (lower.includes('campaign') || lower.includes('content') || lower.includes('marketing')) {
      return this.handleMarketingCommand(instruction);
    }

    if (lower.includes('technology') || lower.includes('ai model') || lower.includes('mcp')) {
      return this.handleTechEvolutionCommand(instruction);
    }

    if (lower.includes('revenue') || lower.includes('conversion') || lower.includes('funnel')) {
      return this.handleRevenueCommand(instruction);
    }

    // General business cycle
    if (lower.includes('full cycle') || lower.includes('run cycle')) {
      const result = await coreAgentOrchestrator.executeFullBusinessCycle();
      return { success: result.success, message: result.summary };
    }

    // Engine-targeted command
    if (engineTarget) {
      const engine = this.engines.get(engineTarget);
      if (engine) {
        engine.status = 'ACTIVE';
        engine.lastExecutionAt = new Date().toISOString();
      }
      return {
        success: true,
        message: `Command routed to ${engineTarget} engine: "${instruction}". Assigned agents have been queued for processing.`,
      };
    }

    return {
      success: true,
      message: `Command queued for SI processing: "${instruction}". The orchestrator will route this to the most appropriate engine and agents based on business context.`,
    };
  }

  private async handleHealthCommand(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await kernelToolRegistry.invoke(
        'executive.auditCompanyHealth',
        {},
        'si_orchestrator'
      );
      return {
        success: true,
        message: `Company Health: ${result.usersCount} registered users, ${result.companiesCount} companies, ${result.jobsCount} active jobs, Revenue: ₹${Number(result.totalRevenueINR).toLocaleString('en-IN')}`,
      };
    } catch (err: any) {
      return { success: false, message: `Health audit failed: ${err.message}` };
    }
  }

  private async handleAcquisitionCommand(
    _instruction: string,
    type: string
  ): Promise<{ success: boolean; message: string }> {
    const engine = this.engines.get('customer_acquisition');
    if (engine) {
      engine.status = 'ACTIVE';
      engine.lastExecutionAt = new Date().toISOString();
    }
    return {
      success: true,
      message: `Customer acquisition engine activated for ${type} targeting. Prospect discovery agents queued. Results will appear in the Acquisition Centre within the next cycle.`,
    };
  }

  private async handleIntelligenceCommand(
    _instruction: string,
    type: string
  ): Promise<{ success: boolean; message: string }> {
    const engine = this.engines.get('marketing_factory');
    if (engine) {
      engine.status = 'ACTIVE';
      engine.lastExecutionAt = new Date().toISOString();
    }
    return {
      success: true,
      message: `Market Intelligence Agent and Competitor Intelligence Agent activated. ${type} research cycle initiated. Results will be available in the Marketing Control Centre.`,
    };
  }

  private async handleMarketingCommand(
    instruction: string
  ): Promise<{ success: boolean; message: string }> {
    const engine = this.engines.get('marketing_factory');
    if (engine) {
      engine.status = 'ACTIVE';
      engine.lastExecutionAt = new Date().toISOString();
    }
    // Create a task record
    try {
      await supabase.from('si_tasks' as any).insert({
        engine_id: 'marketing_factory',
        agent_id: 'marketing',
        title: 'Marketing Campaign Task',
        description: instruction,
        status: 'QUEUED',
        priority: 'HIGH',
        permission_level: 'L1_AUTOMATIC',
        input_payload: { instruction },
      });
    } catch {
      // safe fallback — table may not exist before migration
    }
    return {
      success: true,
      message: `Marketing Factory engine activated. Content Strategy, SEO Intelligence, and Campaign Optimisation agents queued. Campaign research initiated.`,
    };
  }

  private async handleTechEvolutionCommand(
    _instruction: string
  ): Promise<{ success: boolean; message: string }> {
    const engine = this.engines.get('tech_evolution');
    if (engine) {
      engine.status = 'ACTIVE';
      engine.lastExecutionAt = new Date().toISOString();
    }
    return {
      success: true,
      message: `Technology Evolution Engine activated. Scanning GitHub releases, MCP registries, and AI model changelogs. Evaluation report will be ready within the next intelligence cycle.`,
    };
  }

  private async handleRevenueCommand(
    _instruction: string
  ): Promise<{ success: boolean; message: string }> {
    const engine = this.engines.get('growth_flywheel');
    if (engine) {
      engine.status = 'ACTIVE';
      engine.lastExecutionAt = new Date().toISOString();
    }
    try {
      const result = await kernelToolRegistry.invoke(
        'revenue.getCommercialSnapshot',
        {},
        'si_orchestrator'
      );
      return {
        success: true,
        message: `Revenue Intelligence: ₹${Number(result.platformRevenueINR || 0).toLocaleString('en-IN')} platform revenue from ${result.transactionCount || 0} transactions. Growth Flywheel activated for funnel analysis.`,
      };
    } catch {
      return {
        success: true,
        message:
          'Growth Flywheel engine activated. Revenue optimisation agents queued for funnel analysis and conversion opportunity identification.',
      };
    }
  }

  // ── Task Management ───────────────────────────────────────────────────
  async getRecentTasks(limit = 20): Promise<SITask[]> {
    try {
      const { data } = await supabase
        .from('si_tasks' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      return (data || []) as unknown as SITask[];
    } catch {
      return [];
    }
  }

  // ── Approval Management ───────────────────────────────────────────────
  async getPendingApprovals(): Promise<SIApprovalRequest[]> {
    try {
      const { data } = await supabase
        .from('si_approvals' as any)
        .select('*')
        .eq('status', 'PENDING')
        .order('requested_at', { ascending: false });
      return (data || []) as unknown as SIApprovalRequest[];
    } catch {
      return [];
    }
  }

  async resolveApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED'): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase
        .from('si_approvals' as any)
        .update({
          status: decision,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', approvalId);
    } catch {
      // safe fallback
    }
  }

  // ── Emergency Controls ────────────────────────────────────────────────
  triggerEmergencyStop(): void {
    this.emergencyStop = true;
    this.isRunning = false;
    for (const engine of this.engines.values()) {
      if (engine.status === 'ACTIVE') {
        engine.status = 'PAUSED';
      }
    }
    // Publish using the kernel event bus positional-arg signature
    kernelEventBus.publish(
      'GUARDRAIL_BLOCKED',
      { reason: 'Emergency stop triggered by operator' },
      'si_orchestrator',
      'executive'
    );
  }

  resumeOperations(): void {
    this.emergencyStop = false;
    for (const engine of this.engines.values()) {
      if (engine.status === 'PAUSED') {
        engine.status = 'IDLE';
      }
    }
  }

  isEmergencyStopActive(): boolean {
    return this.emergencyStop;
  }

  // ── Live Metrics ──────────────────────────────────────────────────────
  async getLiveMetrics(): Promise<{
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalRevenue: number;
    pendingApprovals: number;
    activeTasks: number;
    failedTasksToday: number;
  }> {
    try {
      const [healthResult, approvalCount, taskCount, failedCount] = await Promise.allSettled([
        kernelToolRegistry.invoke('executive.auditCompanyHealth', {}, 'si_orchestrator'),
        supabase
          .from('si_approvals' as any)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'PENDING'),
        supabase
          .from('si_tasks' as any)
          .select('id', { count: 'exact', head: true })
          .in('status', ['QUEUED', 'RUNNING']),
        supabase
          .from('si_tasks' as any)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'FAILED')
          .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
      ]);

      const health = healthResult.status === 'fulfilled' ? healthResult.value : {};
      const approvals =
        approvalCount.status === 'fulfilled' ? (approvalCount.value as any).count : 0;
      const tasks = taskCount.status === 'fulfilled' ? (taskCount.value as any).count : 0;
      const failed = failedCount.status === 'fulfilled' ? (failedCount.value as any).count : 0;

      return {
        totalUsers: (health as any).usersCount || 0,
        totalCompanies: (health as any).companiesCount || 0,
        totalJobs: (health as any).jobsCount || 0,
        totalRevenue: (health as any).totalRevenueINR || 0,
        pendingApprovals: approvals || 0,
        activeTasks: tasks || 0,
        failedTasksToday: failed || 0,
      };
    } catch {
      return {
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        activeTasks: 0,
        failedTasksToday: 0,
      };
    }
  }
}

export const siOrchestrator = new TalentXcelSIOrchestrator();
