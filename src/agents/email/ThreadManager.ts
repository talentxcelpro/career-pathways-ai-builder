// src/agents/email/ThreadManager.ts
// Multi-Touch Conversation Continuity & Mailbox Ownership Tracker

import type { EmailThread, ZohoMailboxId } from './types';

export class ThreadManager {
  private threads = new Map<string, EmailThread>(); // key: recipientEmail

  getThread(recipientEmail: string): EmailThread | undefined {
    return this.threads.get(recipientEmail.toLowerCase().trim());
  }

  getAssignedMailboxForRecipient(recipientEmail: string): ZohoMailboxId | undefined {
    const thread = this.getThread(recipientEmail);
    return thread?.assignedMailbox;
  }

  createOrUpdateThread(params: {
    recipientEmail: string;
    assignedMailbox: ZohoMailboxId;
    department: string;
    subject: string;
  }): EmailThread {
    const key = params.recipientEmail.toLowerCase().trim();
    const existing = this.threads.get(key);

    if (existing) {
      existing.messageCount += 1;
      existing.lastContactAt = new Date().toISOString();
      return existing;
    }

    const newThread: EmailThread = {
      id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      recipientEmail: key,
      assignedMailbox: params.assignedMailbox,
      department: params.department,
      subject: params.subject,
      messageCount: 1,
      lastContactAt: new Date().toISOString(),
      status: 'ACTIVE',
    };

    this.threads.set(key, newThread);
    return newThread;
  }

  closeThread(recipientEmail: string, status: 'CONVERTED' | 'SUPPRESSED' | 'CLOSED' = 'CLOSED') {
    const thread = this.threads.get(recipientEmail.toLowerCase().trim());
    if (thread) {
      thread.status = status;
    }
  }
}

export const coreThreadManager = new ThreadManager();
