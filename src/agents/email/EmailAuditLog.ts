// src/agents/email/EmailAuditLog.ts
// Immutable Telemetry & Delivery Audit Ledger for all 11 Zoho Mailboxes

import type { EmailAuditRecord } from './types';
import { supabase } from '@/integrations/supabase/client';

export class EmailAuditLog {
  private inMemoryLogs: EmailAuditRecord[] = [];
  private readonly MAX_LOGS = 500;

  async record(entry: Omit<EmailAuditRecord, 'id' | 'timestamp'>): Promise<EmailAuditRecord> {
    const fullEntry: EmailAuditRecord = {
      ...entry,
      id: `email-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.inMemoryLogs.unshift(fullEntry);
    if (this.inMemoryLogs.length > this.MAX_LOGS) {
      this.inMemoryLogs.pop();
    }

    try {
      await supabase.from('claim1_growth_events' as any).insert({
        event_type: `EMAIL_${entry.direction}_${entry.status}`,
        channel: `zoho_${entry.mailboxId}`,
        metadata: {
          ...fullEntry,
          auditId: fullEntry.id,
        },
      });
    } catch {
      // safe fallback
    }

    return fullEntry;
  }

  getRecentLogs(limit = 40): EmailAuditRecord[] {
    return this.inMemoryLogs.slice(0, limit);
  }
}

export const coreEmailAuditLog = new EmailAuditLog();
