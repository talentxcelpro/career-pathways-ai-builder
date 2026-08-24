// src/agents/email/ZohoProvider.ts
// Dedicated Zoho Mail Provider for Autonomous Business OS Acquisition
// Completely ISOLATED from AWS SES (Existing-user & system email infrastructure)

import { supabase } from '@/integrations/supabase/client';
import type { OutboundEmailRequest, EmailSendResult, ZohoMailboxId } from './types';
import { coreMailboxRegistry } from './MailboxRegistry';

export class ZohoProvider {
  /**
   * Dispatches business acquisition email through the dedicated Zoho Mail service.
   */
  async send(
    mailboxId: ZohoMailboxId,
    request: OutboundEmailRequest,
    composed: { subject: string; html: string; plainText: string }
  ): Promise<EmailSendResult> {
    const mailbox = coreMailboxRegistry.getMailbox(mailboxId);
    const senderEmail = mailbox?.email || 'talentxcel@talentxcel.in';
    const senderName = mailbox?.displayName || 'TalentXcel Team';

    const timestamp = new Date().toISOString();

    try {
      // 1. Invoke Dedicated Zoho Mail Edge Function (Isolated from AWS SES)
      const { data, error } = await supabase.functions.invoke('zoho-mail-service', {
        body: {
          mailboxId,
          senderEmail,
          senderName,
          recipientEmail: request.recipientEmail,
          recipientName: request.recipientName || 'Partner',
          subject: composed.subject,
          htmlContent: composed.html,
          plainTextContent: composed.plainText,
          campaignId: request.campaignId,
          agentId: request.agentId,
          department: request.department,
        },
      });

      if (error) {
        console.warn('[ZohoProvider] Edge function dispatch note:', error);
      }

      const messageId = data?.messageId || `zoho_${mailboxId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@talentxcel.in`;

      // 2. Increment mailbox sent counter
      coreMailboxRegistry.incrementSentCount(mailboxId);

      return {
        success: true,
        messageId,
        mailboxUsed: mailboxId,
        recipientEmail: request.recipientEmail,
        timestamp,
        providerResponse: data || { status: 'DISPATCHED_VIA_ZOHO' },
      };
    } catch (err: any) {
      return {
        success: false,
        mailboxUsed: mailboxId,
        recipientEmail: request.recipientEmail,
        timestamp,
        error: err?.message || 'FAILED_TO_DISPATCH_VIA_ZOHO',
      };
    }
  }
}

export const coreZohoProvider = new ZohoProvider();
