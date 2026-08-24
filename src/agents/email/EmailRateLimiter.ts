// src/agents/email/EmailRateLimiter.ts
// Per-Mailbox Rate Limiter & Deliverability Protection

import type { ZohoMailboxId } from './types';
import { coreMailboxRegistry } from './MailboxRegistry';

export class EmailRateLimiter {
  canSendFromMailbox(mailboxId: ZohoMailboxId): { allowed: boolean; reason?: string } {
    const mailbox = coreMailboxRegistry.getMailbox(mailboxId);
    if (!mailbox) {
      return { allowed: false, reason: `UNKNOWN_MAILBOX: Mailbox ${mailboxId} is not registered.` };
    }

    if (mailbox.healthStatus === 'AUTH_REQUIRED' || mailbox.healthStatus === 'PAUSED') {
      return { allowed: false, reason: `MAILBOX_PAUSED: Mailbox ${mailbox.email} status is ${mailbox.healthStatus}.` };
    }

    if (mailbox.sentTodayCount >= mailbox.dailyLimit) {
      return { allowed: false, reason: `DAILY_LIMIT_EXCEEDED: Mailbox ${mailbox.email} reached ${mailbox.dailyLimit} emails today.` };
    }

    if (mailbox.sentThisHourCount >= mailbox.hourlyLimit) {
      return { allowed: false, reason: `HOURLY_LIMIT_EXCEEDED: Mailbox ${mailbox.email} reached ${mailbox.hourlyLimit} emails this hour.` };
    }

    return { allowed: true };
  }
}

export const coreEmailRateLimiter = new EmailRateLimiter();
