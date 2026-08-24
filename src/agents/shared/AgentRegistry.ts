// src/agents/shared/AgentRegistry.ts
// Agent Registry: Tracks live agent states, action counts from DB, and tool authorizations

import type { AgentStatus, AgentInfo } from './types';
import { toolRegistry } from './ToolRegistry';
import { supabase } from '@/integrations/supabase/client';

export interface AgentInstance {
  name: string;
  role: string;
  getStatus: () => AgentStatus;
  getStatusReason?: () => string | undefined;
  pulse: () => Promise<void>;
  getCurrentObjective: () => string;
}

class CentralAgentRegistry {
  private registeredAgents = new Map<string, AgentInstance>();
  private lastActiveTimes = new Map<string, string>();

  registerAgent(agent: AgentInstance) {
    this.registeredAgents.set(agent.name, agent);
  }

  getAgent(name: string): AgentInstance | undefined {
    return this.registeredAgents.get(name);
  }

  recordActivity(name: string) {
    this.lastActiveTimes.set(name, new Date().toISOString());
  }

  /**
   * Returns live diagnostic info for all 8 agents with real action counts from DB
   */
  async getLiveAgentMatrix(): Promise<AgentInfo[]> {
    // 1. Query today's real audit records from Supabase telemetry
    const todayIso = new Date().toISOString().split('T')[0];
    const { data: todayLogs } = await supabase
      .from('claim1_growth_events' as any)
      .select('event_type, created_at, metadata')
      .gte('created_at', `${todayIso}T00:00:00Z`);

    const logs = (todayLogs as any[]) || [];

    const result: AgentInfo[] = [];

    for (const [name, inst] of this.registeredAgents.entries()) {
      const category = name.replace('Agent', '').toLowerCase();
      const agentTools = toolRegistry.listToolsForAgent(category);

      // Count real actions performed today by this agent
      const agentPrefix = `AGENT_${name.toUpperCase()}_`;
      const agentLogs = logs.filter(
        (l) => l.event_type.startsWith(agentPrefix) || l.metadata?.agentName === name
      );

      const errorLogs = agentLogs.filter((l) => l.metadata?.success === false);

      const status = inst.getStatus();
      const statusReason = inst.getStatusReason ? inst.getStatusReason() : undefined;

      result.push({
        name,
        role: inst.role,
        status,
        statusReason,
        currentObjective: inst.getCurrentObjective(),
        actionsToday: agentLogs.length,
        errorsToday: errorLogs.length,
        lastActiveAt: this.lastActiveTimes.get(name) || null,
        tools: agentTools,
      });
    }

    return result;
  }
}

export const agentRegistry = new CentralAgentRegistry();
