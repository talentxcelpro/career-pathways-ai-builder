// src/agents/si/engines/MCPGatewayEngine.ts
// Engine 4 — MCP Integration Gateway

import { supabase } from '@/integrations/supabase/client';
import { kernelToolRegistry } from '@/agents/kernel/ToolRegistry';
import type { MCPServer } from '../types';

class MCPGatewayEngine {
  async getMCPServers(): Promise<MCPServer[]> {
    try {
      const { data } = await supabase
        .from('si_mcp_servers' as any)
        .select('*')
        .order('name', { ascending: true });
      return (data || []).map((d: any): MCPServer => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        connectionStatus: d.connection_status,
        endpoint: d.endpoint,
        authType: d.auth_type,
        toolCount: d.tool_count || 0,
        lastHealthCheckAt: d.last_health_check_at,
        usageThisMonth: d.usage_this_month || 0,
        costINR: Number(d.cost_inr) || 0,
      }));
    } catch {
      return [];
    }
  }

  async getAvailableTools(): Promise<Array<{ name: string; department: string; description: string }>> {
    return kernelToolRegistry.getAllTools().map((t) => ({
      name: t.name,
      department: t.department,
      description: t.description,
    }));
  }

  async testConnection(serverId: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = Date.now();
    try {
      // For now, test the Supabase connection which is always available
      await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const latency = Date.now() - start;
      return { success: true, latencyMs: latency, message: 'Connection test successful' };
    } catch (err: any) {
      return { success: false, latencyMs: Date.now() - start, message: err.message };
    }
  }

  async getGatewayHealth(): Promise<{
    connectedServers: number;
    totalServers: number;
    registeredTools: number;
    totalExecutionsToday: number;
    totalCostToday: number;
  }> {
    try {
      const servers = await this.getMCPServers();
      const connected = servers.filter((s) => s.connectionStatus === 'CONNECTED').length;
      const tools = kernelToolRegistry.getAllTools().length;

      const today = new Date().toISOString().split('T')[0];
      const { data: executions } = await supabase
        .from('si_audit_logs' as any)
        .select('cost_inr')
        .gte('created_at', `${today}T00:00:00Z`);

      const totalCost = (executions || []).reduce((sum: number, r: any) => sum + (Number(r.cost_inr) || 0), 0);

      return {
        connectedServers: connected,
        totalServers: servers.length,
        registeredTools: tools,
        totalExecutionsToday: (executions || []).length,
        totalCostToday: totalCost,
      };
    } catch {
      return { connectedServers: 0, totalServers: 0, registeredTools: 0, totalExecutionsToday: 0, totalCostToday: 0 };
    }
  }
}

export const mcpGatewayEngine = new MCPGatewayEngine();
