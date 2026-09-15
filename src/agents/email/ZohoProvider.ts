// src/agents/email/ZohoProvider.ts
// Dedicated Zoho Mail Provider for Autonomous Business OS Acquisition
// Completely ISOLATED from AWS SES (Existing-user & system email infrastructure)
// Enforces 100% genuine provider transmission — Zero fabricated message IDs.

import { supabase } from '@/integrations/supabase/client';
import type { OutboundEmailRequest, EmailSendResult, ZohoMailboxId } from './types';
import { coreMailboxRegistry } from './MailboxRegistry';

export class ZohoProvider {
  /**
   * Dispatches business acquisition email through the dedicated Zoho Mail service.
   * Only returns success if Zoho SMTP/API actually transmits and returns a real provider message ID.
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
      // 1. Invoke Dedicated Zoho Mail Edge Function
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

      // Strict Validation: If edge function returned an error or no genuine messageId from Zoho server
      if (error || !data?.success || !data?.messageId || data?.isMock) {
        const errorMsg = error?.message || data?.error || 'ZOHO_SERVER_AUTH_REQUIRED: Real Zoho SMTP credentials or OAuth token needed to transmit email';
        console.error('[ZohoProvider] Real transmission failed:', errorMsg);

        return {
          success: false,
          mailboxUsed: mailboxId,
          recipientEmail: request.recipientEmail,
          timestamp,
          error: errorMsg,
        };
      }

      // 2. Real dispatch succeeded
      coreMailboxRegistry.incrementSentCount(mailboxId);

      return {
        success: true,
        messageId: data.messageId,
        mailboxUsed: mailboxId,
        recipientEmail: request.recipientEmail,
        timestamp,
        providerResponse: data,
      };
    } catch (err: any) {
      console.error('[ZohoProvider] Network/invocation exception:', err);
      return {
        success: false,
        mailboxUsed: mailboxId,
        recipientEmail: request.recipientEmail,
        timestamp,
        error: err?.message || 'ZOHO_CONNECTION_ERROR',
      };
    }
  }
}

export const coreZohoProvider = new ZohoProvider();
