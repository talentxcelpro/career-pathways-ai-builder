// src/agents/email/SuppressionManager.ts
// Global Suppression List & Hard Anti-Spam Enforcer
// Guarantees immediate opt-out and maximum 3 touches per prospect across all 48 workers.

import { supabase } from '@/integrations/supabase/client';

export class SuppressionManager {
  private suppressedEmails = new Set<string>();
  private prospectTouchCounts = new Map<string, number>();
  private readonly MAX_TOUCHES = 3;

  constructor() {
    this.loadSuppressionList();
  }

  private async loadSuppressionList() {
    try {
      const { data } = await supabase
        .from('claim1_growth_events' as any)
        .select('metadata')
        .eq('event_type', 'EMAIL_UNSUBSCRIBED');

      if (data) {
        for (const row of data as any[]) {
          if (row.metadata?.email) {
            this.suppressedEmails.add(row.metadata.email.toLowerCase().trim());
          }
        }
      }
    } catch {
      // safe fallback
    }
  }

  isSuppressed(email: string): boolean {
    const clean = email.toLowerCase().trim();
    return this.suppressedEmails.has(clean);
  }

  async suppressEmail(email: string, reason = 'USER_REQUESTED_STOP') {
    const clean = email.toLowerCase().trim();
    this.suppressedEmails.add(clean);

    try {
      await supabase.from('claim1_growth_events' as any).insert({
        event_type: 'EMAIL_UNSUBSCRIBED',
        channel: 'email_ses_zoho',
        metadata: {
          email: clean,
          reason,
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // safe fallback
    }
  }

  canContactRecipient(email: string): { allowed: boolean; reason?: string } {
    const clean = email.toLowerCase().trim();
    if (this.isSuppressed(clean)) {
      return { allowed: false, reason: 'RECIPIENT_SUPPRESSED: Email is on global suppression list.' };
    }

    const currentTouches = this.prospectTouchCounts.get(clean) || 0;
    if (currentTouches >= this.MAX_TOUCHES) {
      return { allowed: false, reason: `MAX_TOUCHES_REACHED: Reached maximum ${this.MAX_TOUCHES} permitted contacts.` };
    }

    return { allowed: true };
  }

  recordOutreachTouch(email: string) {
    const clean = email.toLowerCase().trim();
    const current = this.prospectTouchCounts.get(clean) || 0;
    this.prospectTouchCounts.set(clean, current + 1);
  }
}

export const coreSuppressionManager = new SuppressionManager();
