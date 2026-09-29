// src/services/email/emailGovernor.ts
/**
 * Intelligent Email Frequency Governor & Aggregation Engine
 * Enforces TalentXcel's core philosophy: Send fewer, more relevant emails.
 * Aggregates multiple events (e.g. 10 job matches) into a single consolidated email.
 * Applies daily user caps while allowing critical transactional emails to bypass.
 */

import { emailDb as supabase } from './emailDb';
import type { EmailCategory, EmailJobPayload, FrequencyCheckResult } from './emailTypes';

export class EmailGovernor {
  // Configurable thresholds
  private dailyJobAlertCap = 1;      // Max 1 job match email / day per user
  private dailyEngagementCap = 1;    // Max 1 digest or career recommendation / day
  private weeklyMarketingCap = 1;    // Max 1 marketing email / week
  private localRecentHistory: Array<{ email: string; category: string; template_name: string; timestamp: number }> = [];

  /**
   * Evaluates if an email payload should be sent, delayed, aggregated, or dropped.
   */
  async evaluate(payload: EmailJobPayload): Promise<FrequencyCheckResult> {
    // 1. Transactional emails NEVER get throttled or frequency-capped
    if (payload.category === 'transactional') {
      return { allowed: true };
    }

    const email = payload.to.toLowerCase().trim();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    try {
      let sentToday: Array<{ category: string; template_name: string; created_at: string }> = [];

      // Query recent emails for this recipient today from audit ledger
      const { data: recentEmails, error } = await supabase
        .from('email_audit_ledger')
        .select('id, category, template_name, created_at, status')
        .eq('recipient_email', email)
        .gte('created_at', todayStart.toISOString())
        .in('status', ['sent', 'queued']);

      if (!error && recentEmails) {
        sentToday = recentEmails;
      }

      // Merge local in-memory history for resiliency
      const localMatches = this.localRecentHistory
        .filter(h => h.email === email && h.timestamp >= todayStart.getTime())
        .map(h => ({
          category: h.category,
          template_name: h.template_name,
          created_at: new Date(h.timestamp).toISOString()
        }));

      sentToday = [...sentToday, ...localMatches];

      // 2. Job Matches & Alerts: Intelligent Aggregation
      if (payload.template === 'job_match') {
        const jobMatchesToday = sentToday.filter(e => e.template_name === 'job_match' || e.template_name === 'job_match_digest');

        if (jobMatchesToday.length >= this.dailyJobAlertCap) {
          // Check if there are existing uncollected matches to aggregate
          const existingJob = payload.variables?.jobTitle 
            ? [{ title: payload.variables.jobTitle, company: payload.variables.companyName || 'Top Company', location: payload.variables.location, salary: payload.variables.salaryRange }]
            : [];

          return {
            allowed: false,
            reason: `Recipient already received ${jobMatchesToday.length} job match email(s) today. Aggregating into next daily digest.`,
            shouldAggregate: true,
            aggregatedPayload: {
              ...payload,
              template: 'job_match_digest',
              variables: {
                ...payload.variables,
                jobs: existingJob,
                jobCount: jobMatchesToday.length + 1
              }
            }
          };
        }
      }

      // 3. Engagement / Digest Frequency Cap (Max 1 per day)
      if (payload.category === 'engagement') {
        const engagementToday = sentToday.filter(e => e.category === 'engagement');
        if (engagementToday.length >= this.dailyEngagementCap) {
          return {
            allowed: false,
            reason: `Daily engagement email limit reached (${engagementToday.length} sent today). Dropping non-critical notification.`
          };
        }
      }

      // 4. Marketing Frequency Cap (Max 1 per week)
      if (payload.category === 'marketing') {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const { data: marketingThisWeek } = await supabase
          .from('email_audit_ledger')
          .select('id')
          .eq('recipient_email', email)
          .eq('category', 'marketing')
          .gte('created_at', weekStart.toISOString())
          .in('status', ['sent', 'queued']);

        if (marketingThisWeek && marketingThisWeek.length >= this.weeklyMarketingCap) {
          return {
            allowed: false,
            reason: `Weekly marketing email limit reached (${marketingThisWeek.length} sent in past 7 days).`
          };
        }
      }

      // 5. Total Daily Non-Transactional Cap
      const nonTransactionalToday = sentToday.filter(e => e.category !== 'transactional');
      if (nonTransactionalToday.length >= 3) {
        return {
          allowed: false,
          reason: `Daily global volume cap reached for recipient (${nonTransactionalToday.length} non-transactional emails today).`
        };
      }

      return { allowed: true };
    } catch (err: any) {
      console.warn('⚠️ Exception in email governor:', err.message);
      return { allowed: true };
    }
  }

  /**
   * Helper to aggregate multiple job match items into a single digest payload
   */
  aggregateJobMatches(
    recipientEmail: string,
    recipientName: string,
    jobs: Array<{ title: string; company: string; location?: string; salary?: string; url?: string }>,
    userId?: string
  ): EmailJobPayload {
    return {
      to: recipientEmail,
      recipientName,
      template: 'job_match_digest',
      category: 'product_notification',
      userId,
      variables: {
        firstName: recipientName,
        jobs: jobs.slice(0, 5),
        jobCount: jobs.length,
        ctaUrl: 'https://talentxcel.in/jobs'
      }
    };
  }

  /**
   * Record a dispatched email in the local history buffer
   */
  recordDispatch(email: string, category: string, template_name: string) {
    this.localRecentHistory.push({
      email: email.toLowerCase().trim(),
      category,
      template_name,
      timestamp: Date.now()
    });
  }

  /**
   * Clear local history buffer (useful for test resets)
   */
  clearHistory() {
    this.localRecentHistory = [];
  }
}

export const emailGovernor = new EmailGovernor();
