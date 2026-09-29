// src/services/email/emailService.ts
/**
 * TalentXcel Centralized Email Service
 * Unified, enterprise entry-point for all application email delivery.
 * All application emails (auth, applications, matches, alerts, marketing)
 * pass through this centralized architecture.
 *
 * Application -> Email Service -> Policies/Preferences -> Queue -> Rate Limiter -> Amazon SES
 */

import { EmailPriority, type EmailJobPayload, type EmailSendResult } from './emailTypes';
import { emailQueue } from './emailQueue';
import { emailSuppressionManager } from './emailSuppression';
import { emailPreferencesManager } from './emailPreferences';
import { emailGovernor } from './emailGovernor';
import { emailProvider } from './emailProvider';
import { renderEmailTemplate } from './emailTemplates';
import { buildListUnsubscribeHeaders } from './emailUnsubscribe';

export class EmailService {
  /**
   * Main Dispatch Method: Sends or Enqueues based on Priority and System Policy.
   * If priority is CRITICAL (e.g. password reset), attempts immediate send with queue fallback.
   */
  async send(payload: EmailJobPayload): Promise<EmailSendResult> {
    const cleanEmail = payload.to.toLowerCase().trim();
    const priority = payload.priority || (payload.category === 'transactional' ? EmailPriority.HIGH : EmailPriority.NORMAL);

    // 1. Suppression Check: Never contact suppressed addresses
    const isSuppressed = await emailSuppressionManager.isSuppressed(cleanEmail);
    if (isSuppressed) {
      console.warn(`🛡️ [EmailService.send] Suppressed recipient: ${cleanEmail}`);
      return {
        success: false,
        status: 'suppressed',
        error: 'Recipient address is suppressed due to previous bounce or complaint'
      };
    }

    // 2. Preferences Check: Enforce user choices
    const prefCheck = await emailPreferencesManager.canSend(cleanEmail, payload.category, payload.template);
    if (!prefCheck.allowed) {
      console.log(`🔕 [EmailService.send] Blocked by preferences: ${prefCheck.reason}`);
      return {
        success: false,
        status: 'preference_blocked',
        error: prefCheck.reason
      };
    }

    // 3. Frequency Governor Check: Prevent over-emailing
    const govCheck = await emailGovernor.evaluate(payload);
    if (!govCheck.allowed) {
      if (govCheck.shouldAggregate && govCheck.aggregatedPayload) {
        payload = govCheck.aggregatedPayload;
      } else {
        console.log(`⏳ [EmailService.send] Blocked by governor: ${govCheck.reason}`);
        return {
          success: false,
          status: 'frequency_capped',
          error: govCheck.reason
        };
      }
    }

    // 4. Critical Immediate Dispatch: If CRITICAL or immediate send requested, attempt immediate send
    if (priority === EmailPriority.CRITICAL || (payload as any).immediate === true) {
      try {
        const rendered = await renderEmailTemplate(
          payload.template,
          payload.variables,
          cleanEmail,
          payload.userId
        );

        const result = await emailProvider.send({
          to: cleanEmail,
          from: payload.from?.fromEmail,
          replyTo: payload.replyTo,
          category: payload.category,
          rendered,
          headers: payload.category !== 'transactional'
            ? await buildListUnsubscribeHeaders(cleanEmail, payload.userId)
            : undefined
        });

        if (result.success) {
          emailGovernor.recordDispatch(cleanEmail, payload.category, payload.template);
          return result;
        }

        // On transient failure of critical send, fallback to high-priority queue
        console.warn(`⚠️ Immediate critical send failed, falling back to priority queue: ${result.error}`);
        await emailQueue.enqueue(payload);
        return {
          success: true,
          status: 'pending',
          messageId: result.messageId,
          error: 'Queued for retry'
        };
      } catch (err: any) {
        console.error('❌ Exception in immediate send, queueing fallback:', err.message);
        await emailQueue.enqueue(payload);
        return { success: true, status: 'pending' };
      }
    }

    // 5. Default Flow: Route all other communications through the Priority Queue
    const queueResult = await emailQueue.enqueue(payload);
    return {
      success: queueResult.queued,
      status: queueResult.queued ? 'pending' : 'failed',
      error: queueResult.reason
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONVENIENCE METHODS FOR APPLICATION EVENT COUPLING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Send Welcome Email to a newly registered user
   */
  async sendWelcomeEmail(to: string, firstName: string, userId?: string) {
    return this.send({
      to,
      recipientName: firstName,
      template: 'welcome',
      category: 'transactional',
      priority: EmailPriority.HIGH,
      userId,
      idempotencyKey: `welcome_${userId || to}`,
      variables: {
        firstName,
        ctaUrl: 'https://talentxcel.in/dashboard'
      }
    });
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(to: string, resetUrl: string, firstName?: string, userId?: string) {
    return this.send({
      to,
      recipientName: firstName,
      template: 'password_reset',
      category: 'transactional',
      priority: EmailPriority.CRITICAL,
      userId,
      idempotencyKey: `pw_reset_${to}_${Math.floor(Date.now() / 60000)}`, // 1-minute window idempotency
      variables: {
        firstName: firstName || 'there',
        resetUrl,
        expiresIn: '60 minutes'
      }
    });
  }

  /**
   * Send Email Verification
   */
  async sendVerificationEmail(to: string, verifyUrl: string, code?: string, firstName?: string) {
    return this.send({
      to,
      recipientName: firstName,
      template: 'verify_email',
      category: 'transactional',
      priority: EmailPriority.CRITICAL,
      variables: {
        firstName: firstName || 'there',
        verifyUrl,
        code
      }
    });
  }

  /**
   * Send Job Match (automatically aggregated if multiple arrive today)
   */
  async sendJobMatchEmail(to: string, job: { title: string; company: string; location?: string; salary?: string }, firstName?: string, userId?: string) {
    return this.send({
      to,
      recipientName: firstName,
      template: 'job_match',
      category: 'product_notification',
      priority: EmailPriority.NORMAL,
      userId,
      variables: {
        firstName: firstName || 'there',
        jobTitle: job.title,
        companyName: job.company,
        location: job.location || 'India / Remote',
        salaryRange: job.salary || 'Competitive',
        ctaUrl: 'https://talentxcel.in/jobs'
      }
    });
  }

  /**
   * Send Aggregated Job Match Digest (Consolidates 2-10 jobs into ONE email)
   */
  async sendJobMatchDigest(
    to: string,
    jobs: Array<{ title: string; company: string; location?: string; salary?: string }>,
    firstName?: string,
    userId?: string
  ) {
    return this.send({
      to,
      recipientName: firstName,
      template: 'job_match_digest',
      category: 'product_notification',
      priority: EmailPriority.NORMAL,
      userId,
      idempotencyKey: `job_digest_${to}_${new Date().toISOString().slice(0, 10)}`, // 1 per day idempotency
      variables: {
        firstName: firstName || 'there',
        jobs,
        jobCount: jobs.length,
        ctaUrl: 'https://talentxcel.in/jobs'
      }
    });
  }

  /**
   * Send Job Application Confirmation
   */
  async sendApplicationConfirmation(to: string, jobTitle: string, companyName: string, applicationId: string, candidateName?: string, userId?: string) {
    return this.send({
      to,
      recipientName: candidateName,
      template: 'application_confirmation',
      category: 'transactional',
      priority: EmailPriority.HIGH,
      userId,
      idempotencyKey: `app_conf_${applicationId}`,
      variables: {
        candidateName: candidateName || 'there',
        jobTitle,
        companyName,
        applicationId,
        ctaUrl: 'https://talentxcel.in/jobs/applications'
      }
    });
  }

  /**
   * Send Application Status Update
   */
  async sendApplicationStatusUpdate(to: string, jobTitle: string, companyName: string, status: string, note?: string, candidateName?: string, userId?: string) {
    return this.send({
      to,
      recipientName: candidateName,
      template: 'application_status',
      category: 'transactional',
      priority: EmailPriority.HIGH,
      userId,
      idempotencyKey: `app_status_${to}_${jobTitle}_${status}`,
      variables: {
        candidateName: candidateName || 'there',
        jobTitle,
        companyName,
        status,
        note,
        ctaUrl: 'https://talentxcel.in/jobs/applications'
      }
    });
  }

  /**
   * Send Weekly Career Digest
   */
  async sendWeeklyDigest(to: string, profileViews: number, matchCount: number, firstName?: string, userId?: string) {
    return this.send({
      to,
      recipientName: firstName,
      template: 'weekly_digest',
      category: 'engagement',
      priority: EmailPriority.LOW,
      userId,
      idempotencyKey: `weekly_digest_${to}_${new Date().toISOString().slice(0, 10)}`,
      variables: {
        firstName: firstName || 'there',
        profileViews,
        matchCount,
        ctaUrl: 'https://talentxcel.in/dashboard'
      }
    });
  }

  /**
   * Send Platform Announcement / Marketing Campaign (strict opt-in & one-click unsubscribe)
   */
  async sendMarketingCampaign(to: string, headline: string, message: string, ctaLabel?: string, ctaUrl?: string, userId?: string) {
    return this.send({
      to,
      template: 'marketing',
      category: 'marketing',
      priority: EmailPriority.LOW,
      userId,
      variables: {
        headline,
        message,
        ctaLabel: ctaLabel || 'Explore More',
        ctaUrl: ctaUrl || 'https://talentxcel.in'
      }
    });
  }

  /**
   * Trigger queue processing batch
   */
  async processQueue(batchSize: number = 20) {
    return emailQueue.processBatch(batchSize);
  }
}

export const emailService = new EmailService();
