// src/agents/intelligence/ZohoProductionGate.ts
// Hard Production Gate enforcing strict qualification before any email is submitted to Zoho.
// AWS SES is 100% untouched. Zoho is exclusively responsible for new-business acquisition.

import type { ExternalProspectRecord } from './types';
import { coreEmailOrchestrator } from '../email/EmailOrchestrator';
import { coreSuppressionManager } from '../email/SuppressionManager';
import { coreEmailRateLimiter } from '../email/EmailRateLimiter';
import { coreExternalProspectStore } from './ExternalProspectStore';
import { kernelAuditEngine } from '../kernel/AuditEngine';
import { kernelEventBus } from '../kernel/EventBus';

export interface GateVerificationResult {
  passed: boolean;
  checks: {
    companyVerified: boolean;
    relevantSignalPresent: boolean;
    contactChannelVerified: boolean;
    notSuppressed: boolean;
    notContactedPreviously: boolean;
    opportunityScorePass: boolean;
    factualPersonalizationReady: boolean;
    mailboxDeliverabilityHealthy: boolean;
  };
  rejectionReason?: string;
}

export class ZohoProductionGate {
  private readonly MIN_OPPORTUNITY_SCORE = 75;

  /**
   * Verifies all 8 strict criteria for an external prospect.
   */
  verifyGate(prospect: ExternalProspectRecord): GateVerificationResult {
    const checks = {
      companyVerified: Boolean(prospect.company_name && prospect.company_domain.includes('.')),
      relevantSignalPresent: prospect.job_count > 0 || prospect.signal_strength >= 80,
      contactChannelVerified: Boolean(
        prospect.permitted_contact_channel &&
        prospect.permitted_contact_channel.includes('@') &&
        prospect.permitted_contact_channel.includes(prospect.company_domain.split('.')[0])
      ),
      notSuppressed: !coreSuppressionManager.isSuppressed(prospect.permitted_contact_channel),
      notContactedPreviously: !prospect.provider_message_id && prospect.outreach_status !== 'SENT',
      opportunityScorePass: prospect.opportunity_score >= this.MIN_OPPORTUNITY_SCORE,
      factualPersonalizationReady: prospect.relevant_roles.length > 0 && prospect.job_count > 0,
      mailboxDeliverabilityHealthy: true,
    };

    // Deliverability rate limit check on assigned mailbox
    const mailboxId = (prospect.assigned_mailbox.split('@')[0] || 'shelly') as any;
    const rateCheck = coreEmailRateLimiter.canSendFromMailbox(mailboxId);
    if (!rateCheck.allowed) {
      checks.mailboxDeliverabilityHealthy = false;
    }

    const allPassed = Object.values(checks).every(Boolean);

    let rejectionReason: string | undefined;
    if (!allPassed) {
      if (!checks.notSuppressed) rejectionReason = 'RECIPIENT_SUPPRESSED';
      else if (!checks.opportunityScorePass) rejectionReason = `SCORE_BELOW_THRESHOLD_${prospect.opportunity_score}`;
      else if (!checks.contactChannelVerified) rejectionReason = 'INVALID_CONTACT_CHANNEL';
      else if (!checks.notContactedPreviously) rejectionReason = 'ALREADY_CONTACTED';
      else if (!checks.mailboxDeliverabilityHealthy) rejectionReason = rateCheck.reason || 'MAILBOX_RATE_LIMITED';
      else rejectionReason = 'GATE_VERIFICATION_FAILED';
    }

    return { passed: allPassed, checks, rejectionReason };
  }

  /**
   * Executes verified factual outreach through Zoho Mail, capturing real provider Message ID.
   */
  async executeGatedOutreach(prospect: ExternalProspectRecord): Promise<{
    success: boolean;
    providerMessageId?: string;
    error?: string;
  }> {
    const verification = this.verifyGate(prospect);

    if (!verification.passed) {
      return {
        success: false,
        error: `GATE_BLOCKED: ${verification.rejectionReason}`,
      };
    }

    // Role-based Zoho mailbox selection
    const mailboxChoice = (prospect.assigned_mailbox.split('@')[0] || 'shelly') as any;

    const emailResult = await coreEmailOrchestrator.sendEmail({
      department: 'employer',
      agentId: prospect.assigned_agent || 'employer_outreach',
      recipientEmail: prospect.permitted_contact_channel,
      recipientName: `${prospect.contact_name} at ${prospect.company_name}`,
      companyName: prospect.company_name,
      subject: `TalentXcel candidate matches for ${prospect.job_count} tech openings at ${prospect.company_name}`,
      templateName: 'employer_discovery',
      templateVariables: {
        activeVacanciesCount: prospect.job_count,
        sampleTitles: prospect.relevant_roles.slice(0, 3).join(', '),
        sourceUrl: prospect.source_url,
      },
      preferredMailbox: mailboxChoice,
    });

    if (emailResult.success && emailResult.messageId) {
      // Update persistent prospect store with real provider Message ID
      coreExternalProspectStore.updateOutreachStatus(
        prospect.company_domain,
        'SENT',
        emailResult.messageId
      );

      // Record immutable audit telemetry
      await kernelAuditEngine.record('zoho_production_gate', 'employer', 'GATED_OUTREACH_EXECUTED', {
        companyName: prospect.company_name,
        domain: prospect.company_domain,
        permittedContact: prospect.permitted_contact_channel,
        mailboxUsed: emailResult.mailboxUsed,
        providerMessageId: emailResult.messageId,
        opportunityScore: prospect.opportunity_score,
        success: true,
      });

      // Publish event to central bus
      kernelEventBus.publish({
        type: 'EXTERNAL_OUTREACH_DISPATCHED',
        sourceAgent: 'ZohoProductionGate',
        department: 'employer',
        payload: {
          companyName: prospect.company_name,
          domain: prospect.company_domain,
          messageId: emailResult.messageId,
          mailbox: emailResult.mailboxUsed,
        },
      });

      return {
        success: true,
        providerMessageId: emailResult.messageId,
      };
    }

    return {
      success: false,
      error: emailResult.error || 'ZOHO_DISPATCH_FAILED',
    };
  }
}

export const coreZohoProductionGate = new ZohoProductionGate();
