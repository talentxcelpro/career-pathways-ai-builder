// src/agents/kernel/AuditEngine.ts
// Immutable Operational Audit Recorder for all 48 autonomous specialist workers

import { supabase } from '@/integrations/supabase/client';

export interface KernelAuditEntry {
  id: string;
  agentId: string;
  department: string;
  action: string;
  toolName?: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  durationMs?: number;
  timestamp: string;
  success: boolean;
  error?: string;
}

class KernelAuditEngine {
  private inMemoryLedger: KernelAuditEntry[] = [];
  private readonly MAX_RECORDS = 500;

  async record(
    agentId: string,
    department: string,
    action: string,
    details: {
      toolName?: string;
      inputs?: Record<string, any>;
      outputs?: Record<string, any>;
      durationMs?: number;
      success?: boolean;
      error?: string;
    }
  ): Promise<KernelAuditEntry> {
    const entry: KernelAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      department,
      action,
      toolName: details.toolName,
      inputs: details.inputs,
      outputs: details.outputs,
      durationMs: details.durationMs,
      timestamp: new Date().toISOString(),
      success: details.success ?? true,
      error: details.error,
    };

    this.inMemoryLedger.unshift(entry);
    if (this.inMemoryLedger.length > this.MAX_RECORDS) {
      this.inMemoryLedger.pop();
    }

    try {
      await supabase.from('claim1_growth_events' as any).insert({
        event_type: `AGENT_${agentId.toUpperCase()}_${action.toUpperCase()}`,
        channel: `audit_${department}`,
        metadata: { ...details, auditId: entry.id },
      });
    } catch {
      // safe fallback
    }

    return entry;
  }

  getRecentLogs(limit = 40): KernelAuditEntry[] {
    return this.inMemoryLedger.slice(0, limit);
  }
}

export const kernelAuditEngine = new KernelAuditEngine();
