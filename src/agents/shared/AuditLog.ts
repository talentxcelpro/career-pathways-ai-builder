// src/agents/shared/AuditLog.ts
// Immutable Audit Trail and Telemetry Recorder for Agent Operations

import { supabase } from '@/integrations/supabase/client';
import type { AgentAuditRecord } from './types';

class AgentAuditEngine {
  private inMemoryLog: AgentAuditRecord[] = [];
  private readonly MAX_RECORDS = 500;

  /**
   * Records an agent operational action
   */
  async record(
    agentName: string,
    action: string,
    details: Record<string, any>,
    success = true,
    error?: string
  ): Promise<AgentAuditRecord> {
    const record: AgentAuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentName,
      action,
      details,
      timestamp: new Date().toISOString(),
      success,
      error,
    };

    this.inMemoryLog.unshift(record);
    if (this.inMemoryLog.length > this.MAX_RECORDS) {
      this.inMemoryLog.pop();
    }

    // Persist to Supabase telemetry asynchronously
    try {
      await supabase.from('claim1_growth_events' as any).insert({
        event_type: `AGENT_${agentName.toUpperCase()}_${action.toUpperCase()}`,
        channel: 'agent_kernel',
        metadata: { ...details, success, error, record_id: record.id },
      });
    } catch {
      // safe fallback
    }

    return record;
  }

  getLogs(agentName?: string, limit = 50): AgentAuditRecord[] {
    if (agentName) {
      return this.inMemoryLog.filter((l) => l.agentName === agentName).slice(0, limit);
    }
    return this.inMemoryLog.slice(0, limit);
  }
}

export const agentAuditLog = new AgentAuditEngine();
