/**
 * TalentXcel Government Job Lifecycle & Expiry Engine
 * Automatically manages vacancy transitions:
 * PUBLISHED -> DEADLINE_PASSED -> EXPIRED -> REMOVED
 */

import { GlobalJob, GlobalJobStatus } from '@/types/jobs/globalJob';

export interface ExpiryEvaluation {
  currentStatus: GlobalJobStatus;
  suggestedStatus: GlobalJobStatus;
  daysRemaining?: number;
  isExpired: boolean;
  reason: string;
}

export function evaluateJobExpiry(job: Partial<GlobalJob>): ExpiryEvaluation {
  const current = job.status || 'PUBLISHED';
  const validThrough = job.valid_through;

  if (!validThrough) {
    // If no closing date specified, default to 30 days after posting
    const posted = job.posted_at ? new Date(job.posted_at).getTime() : Date.now();
    const ageDays = (Date.now() - posted) / (1000 * 60 * 60 * 24);

    if (ageDays > 60) {
      return {
        currentStatus: current,
        suggestedStatus: 'EXPIRED',
        isExpired: true,
        reason: 'Posting is over 60 days old with no deadline specified; automatically expired.',
      };
    }

    return {
      currentStatus: current,
      suggestedStatus: current,
      isExpired: false,
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
        reason: 'Application deadline has elapsed. Awaiting official extension notice.',
      };
    }

    return {
      currentStatus: current,
      suggestedStatus: 'EXPIRED',
      daysRemaining: 0,
      isExpired: true,
      reason: 'Application deadline has passed. Vacancy is closed.',
    };
  }

  return {
    currentStatus: current,
    suggestedStatus: 'PUBLISHED',
    daysRemaining,
    isExpired: false,
    reason: `Application closes in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`,
  };
}
