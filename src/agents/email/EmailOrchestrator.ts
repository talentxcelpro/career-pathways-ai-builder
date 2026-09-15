// src/agents/email/EmailOrchestrator.ts
// Central Email Infrastructure Orchestrator for all 48 Autonomous Specialist Workers
// Powers the 11 Authorised Zoho Mailboxes for Founder & CEO: Sanobar Jahan

import type { OutboundEmailRequest, EmailSendResult, InboundEmailMessage, MailboxDescriptor } from './types';
import { coreMailboxRegistry } from './MailboxRegistry';
import { coreSuppressionManager } from './SuppressionManager';
import { coreEmailRouter } from './EmailRouter';
import { coreEmailComposer } from './EmailComposer';
import { coreZohoProvider } from './ZohoProvider';
import { coreThreadManager } from './ThreadManager';
import { coreInboundEmailProcessor } from './InboundEmailProcessor';
import { coreEmailAuditLog } from './EmailAuditLog';
import { kernelEventBus } from '../kernel/EventBus';

export class EmailOrchestrator {
  /**
   * Primary method used by all 48 specialist workers to dispatch authorized outbound emails.
   */
  async sendEmail(request: OutboundEmailRequest): Promise<EmailSendResult> {
    const recipient = request.recipientEmail.toLowerCase().trim();

    // 1. Guardrail Check: Global Suppression & Max 3 Touches
    const canContact = coreSuppressionManager.canContactRecipient(recipient);
    if (!canContact.allowed) {
      await coreEmailAuditLog.record({
        agentId: request.agentId,
        department: request.department,
        campaignId: request.campaignId,
        mailboxId: request.preferredMailbox || 'talentxcel',
        recipientEmail: recipient,
        subject: request.subject,
        direction: 'OUTBOUND',
        status: 'SUPPRESSED',
      });

      return {
        success: false,
        mailboxUsed: request.preferredMailbox || 'talentxcel',
        recipientEmail: recipient,
        timestamp: new Date().toISOString(),
        error: canContact.reason,
      };
    }

    // 2. Resolve Best Authorized Mailbox (preserving thread affinity)
    const { mailboxId } = coreEmailRouter.resolveMailbox({
      department: request.department,
      agentId: request.agentId,
      recipientEmail: recipient,
      preferredMailbox: request.preferredMailbox,
    });

    const mailbox = coreMailboxRegistry.getMailbox(mailboxId);

    // 3. Compose Email Content
    const composed = request.htmlContent
      ? { subject: request.subject, html: request.htmlContent, plainText: request.plainTextContent || request.subject }
      : coreEmailComposer.compose(request.templateName || 'general', {
          recipientName: request.recipientName,
          companyName: request.companyName,
          senderDisplayName: mailbox?.displayName,
          senderEmail: mailbox?.email,
          customData: {
            subject: request.subject,
            message: request.plainTextContent,
            ...request.templateVariables,
          },
        });

    // 4. Dispatch through Zoho Edge Function Provider
    const result = await coreZohoProvider.send(mailboxId, request, composed);

    if (result.success) {
      // 5. Update State: Record touch count & update thread continuity
      coreSuppressionManager.recordOutreachTouch(recipient);
      coreThreadManager.createOrUpdateThread({
        recipientEmail: recipient,
        assignedMailbox: mailboxId,
        department: request.department,
        subject: composed.subject,
      });

      // 6. Record Immutable Audit Ledger
      await coreEmailAuditLog.record({
        agentId: request.agentId,
        department: request.department,
        campaignId: request.campaignId,
        mailboxId,
        recipientEmail: recipient,
        subject: composed.subject,
        direction: 'OUTBOUND',
        status: 'SENT',
        messageId: result.messageId,
        providerResponse: result.providerResponse,
      });

      // 7. Publish Event to Central EventBus
      kernelEventBus.publish({
        type: 'EMAIL_SENT',
        sourceAgent: request.agentId,
        department: request.department as any,
        payload: {
          recipientEmail: recipient,
          mailboxId,
          messageId: result.messageId,
          campaignId: request.campaignId,
        },
      });
    } else {
      await coreEmailAuditLog.record({
        agentId: request.agentId,
        department: request.department,
        campaignId: request.campaignId,
        mailboxId,
        recipientEmail: recipient,
        subject: composed.subject,
        direction: 'OUTBOUND',
        status: 'FAILED',
      });
    }

    return result;
  }

  /**
   * Ingests and processes an incoming reply, triggering events and updating CRM states.
   */
  async processInboundReply(message: InboundEmailMessage) {
    const result = await coreInboundEmailProcessor.processInboundMessage(message);

    await coreEmailAuditLog.record({
      agentId: 'InboundEmailProcessor',
      department: 'growth_marketing',
      mailboxId: message.mailboxId,
      recipientEmail: message.fromEmail,
      subject: message.subject,
      direction: 'INBOUND',
      status: 'REPLIED',
      classifiedIntent: result.intent,
      messageId: message.messageId,
    });

    return result;
  }

  getAllMailboxes(): MailboxDescriptor[] {
    return coreMailboxRegistry.getAllMailboxes();
  }

  getAuditHistory(limit = 40) {
    return coreEmailAuditLog.getRecentLogs(limit);
  }
}

export const coreEmailOrchestrator = new EmailOrchestrator();
