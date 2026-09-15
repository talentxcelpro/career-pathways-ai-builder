// src/agents/email/InboundEmailProcessor.ts
// Inbound Email Message Processor & Closed-Loop Workflow Trigger

import type { InboundEmailMessage, ReplyIntent } from './types';
import { coreReplyClassifier } from './ReplyClassifier';
import { coreSuppressionManager } from './SuppressionManager';
import { coreThreadManager } from './ThreadManager';
import { kernelEventBus } from '../kernel/EventBus';
import { supabase } from '@/integrations/supabase/client';

export class InboundEmailProcessor {
  /**
   * Ingests, classifies, and executes autonomous actions for an inbound reply.
   */
  async processInboundMessage(message: InboundEmailMessage): Promise<{
    intent: ReplyIntent;
    actionTaken: string;
  }> {
    const intent = coreReplyClassifier.classify(message.subject, message.bodyText);
    const cleanEmail = message.fromEmail.toLowerCase().trim();

    console.log(`📩 [InboundEmailProcessor] Message from ${cleanEmail} classified as [${intent}] on mailbox [${message.mailboxId}]`);

    let actionTaken = 'LOGGED';

    switch (intent) {
      case 'UNSUBSCRIBE_STOP': {
        // 1. Immediate Global Suppression
        await coreSuppressionManager.suppressEmail(cleanEmail, 'STOP_REPLY_RECEIVED');
        coreThreadManager.closeThread(cleanEmail, 'SUPPRESSED');

        kernelEventBus.publish({
          type: 'EMAIL_UNSUBSCRIBED',
          sourceAgent: 'InboundEmailProcessor',
          department: 'growth_marketing',
          payload: { email: cleanEmail, mailboxId: message.mailboxId },
        });

        actionTaken = 'GLOBALLY_SUPPRESSED_AND_FOLLOWUPS_CANCELLED';
        break;
      }

      case 'INTERESTED': {
        // 2. Mark Prospect as Interested in DB
        try {
          await supabase
            .from('claim1_prospects' as any)
            .update({ state: 'RESPONDED', updated_at: new Date().toISOString() })
            .ilike('website_url', `%${cleanEmail.split('@')[1]}%`);
        } catch {
          // safe fallback
        }

        kernelEventBus.publish({
          type: 'EMAIL_INTERESTED',
          sourceAgent: 'InboundEmailProcessor',
          department: 'growth_marketing',
          payload: {
            email: cleanEmail,
            mailboxId: message.mailboxId,
            subject: message.subject,
            snippet: message.bodyText.slice(0, 140),
          },
        });

        actionTaken = 'PROSPECT_MARKED_INTERESTED_AND_AGENT_NOTIFIED';
        break;
      }

      case 'MEETING_REQUESTED': {
        kernelEventBus.publish({
          type: 'EMAIL_MEETING_REQUESTED',
          sourceAgent: 'InboundEmailProcessor',
          department: 'employer',
          payload: {
            email: cleanEmail,
            mailboxId: message.mailboxId,
            subject: message.subject,
            snippet: message.bodyText.slice(0, 140),
          },
        });

        actionTaken = 'MEETING_REQUEST_ROUTED_TO_EXECUTIVE_DESK';
        break;
      }

      case 'PAYMENT_INTENT': {
        kernelEventBus.publish({
          type: 'EMAIL_PAYMENT_INTENT',
          sourceAgent: 'InboundEmailProcessor',
          department: 'revenue',
          payload: { email: cleanEmail, mailboxId: message.mailboxId },
        });

        actionTaken = 'CHECKOUT_INTENT_ROUTED_TO_REVENUE_AGENT';
        break;
      }

      case 'SUPPORT_REQUEST': {
        kernelEventBus.publish({
          type: 'EMAIL_SUPPORT_REQUEST',
          sourceAgent: 'InboundEmailProcessor',
          department: 'candidates',
          payload: { email: cleanEmail, subject: message.subject },
        });

        actionTaken = 'ROUTED_TO_CANDIDATE_SUPPORT_AGENT';
        break;
      }

      default:
        actionTaken = 'RECORDED_IN_THREAD';
        break;
    }

    return { intent, actionTaken };
  }
}

export const coreInboundEmailProcessor = new InboundEmailProcessor();
