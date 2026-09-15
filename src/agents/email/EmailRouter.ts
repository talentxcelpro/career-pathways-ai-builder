// src/agents/email/EmailRouter.ts
// Intelligent Mailbox Router ensuring thread affinity, departmental alignment, and deliverability health

import type { ZohoMailboxId } from './types';
import { coreMailboxRegistry } from './MailboxRegistry';
import { coreThreadManager } from './ThreadManager';
import { coreEmailRateLimiter } from './EmailRateLimiter';

export class EmailRouter {
  /**
   * Determines the optimal authorized Zoho mailbox for an outbound communication.
   */
  resolveMailbox(params: {
    department: string;
    agentId: string;
    recipientEmail: string;
    preferredMailbox?: ZohoMailboxId;
  }): { mailboxId: ZohoMailboxId; reason: string } {
    // 1. Check existing thread affinity (preserve conversation continuity)
    const existingMailbox = coreThreadManager.getAssignedMailboxForRecipient(params.recipientEmail);
    if (existingMailbox) {
      const check = coreEmailRateLimiter.canSendFromMailbox(existingMailbox);
      if (check.allowed) {
        return { mailboxId: existingMailbox, reason: 'PRESERVED_THREAD_AFFINITY' };
      }
    }

    // 2. Check explicit preferred mailbox
    if (params.preferredMailbox) {
      const check = coreEmailRateLimiter.canSendFromMailbox(params.preferredMailbox);
      if (check.allowed) {
        return { mailboxId: params.preferredMailbox, reason: 'EXPLICIT_PREFERRED_MAILBOX' };
      }
    }

    // 3. Departmental Mapping
    const departmentMailboxes = coreMailboxRegistry.getMailboxesForDepartment(params.department);

    for (const mb of departmentMailboxes) {
      const check = coreEmailRateLimiter.canSendFromMailbox(mb.id);
      if (check.allowed) {
        return { mailboxId: mb.id, reason: `DEPARTMENT_ALIGNMENT_${params.department.toUpperCase()}` };
      }
    }

    // 4. Fallback to talentxcel general corporate mailbox
    return { mailboxId: 'talentxcel', reason: 'GENERAL_CORPORATE_FALLBACK' };
  }
}

export const coreEmailRouter = new EmailRouter();
