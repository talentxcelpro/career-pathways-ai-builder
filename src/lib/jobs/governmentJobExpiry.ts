/**
 * TalentXcel Government Job Lifecycle & Expiry Engine
 * Automatically manages vacancy transitions:
 * PUBLISHED -> DEADLINE_EXTENDED -> DEADLINE_PASSED -> EXPIRED -> REMOVED
 */

import { GlobalJob, GlobalJobStatus, CorrigendumUpdate } from '@/types/jobs/globalJob';

export interface ExpiryEvaluation {
  currentStatus: GlobalJobStatus;
  suggestedStatus: GlobalJobStatus;
  daysRemaining?: number;
  isExpired: boolean;
  isExtended: boolean;
  reason: string;
}

export function handleDeadlineExtension(
  job: Partial<GlobalJob>,
  newValidThroughDate: string,
  officialNoticeUrl?: string
): { updatedJob: Partial<GlobalJob>; corrigendum: CorrigendumUpdate } {
  const oldDeadline = job.valid_through || 'unspecified';
  const corrigendum: CorrigendumUpdate = {
    id: `corr-${Date.now()}`,
    detected_at: new Date().toISOString(),
    update_type: 'DEADLINE_EXTENSION',
    description: `Application deadline extended from ${oldDeadline} to ${newValidThroughDate}.`,
    old_value: oldDeadline,
    new_value: newValidThroughDate,
    official_notice_url: officialNoticeUrl,
  };

  const updatedHistory = [...(job.corrigendum_history || []), corrigendum];

  return {
    updatedJob: {
      ...job,
      valid_through: newValidThroughDate,
      status: 'PUBLISHED',
      is_google_eligible: true,
      corrigendum_history: updatedHistory,
    },
    corrigendum,
  };
}

export function evaluateJobExpiry(job: Partial<GlobalJob>): ExpiryEvaluation {
  const current = job.status || 'PUBLISHED';
  const validThrough = job.valid_through;

  if (!validThrough) {
    const posted = job.posted_at ? new Date(job.posted_at).getTime() : Date.now();
    const ageDays = (Date.now() - posted) / (1000 * 60 * 60 * 24);

    if (ageDays > 60) {
      return {
        currentStatus: current,
        suggestedStatus: 'EXPIRED',
        isExpired: true,
        isExtended: false,
        reason: 'Posting is over 60 days old with no deadline specified; automatically expired.',
      };
    }

    return {
      currentStatus: current,
      suggestedStatus: current,
      isExpired: false,
      isExtended: false,
      reason: 'Active vacancy with no explicit deadline.',
    };
  }

  const deadline = new Date(validThrough).getTime();
  const now = Date.now();
  const diffMs = deadline - now;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) {
    const hoursPast = Math.abs(diffMs) / (1000 * 60 * 60);

    // If deadline passed less than 48h ago, mark DEADLINE_PASSED for verification
    if (hoursPast <= 48) {
      return {
        currentStatus: current,
        suggestedStatus: 'DEADLINE_PASSED',
        daysRemaining: 0,
        isExpired: true,
        isExtended: false,
        reason: 'Application deadline has elapsed. Awaiting official extension notice.',
      };
    }

    return {
      currentStatus: current,
      suggestedStatus: 'EXPIRED',
      daysRemaining: 0,
      isExpired: true,
      isExtended: false,
      reason: 'Application deadline elapsed more than 48 hours ago; vacancy marked expired.',
    };
  }

  // Deadline in future: active
  return {
    currentStatus: current,
    suggestedStatus: 'PUBLISHED',
    daysRemaining,
    isExpired: false,
    isExtended: false,
    reason: `Active vacancy (${daysRemaining} days remaining).`,
  };
}
