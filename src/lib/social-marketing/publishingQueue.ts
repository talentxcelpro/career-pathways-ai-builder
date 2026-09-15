// src/lib/social-marketing/publishingQueue.ts
// Stage 10: Publishing Queue & Retry Manager for TalentXcel AI Content Factory
// Enforces: Deterministic idempotency, exponential backoff, dead-letter state, and per-platform isolation.

import { ACTIVE_GOVERNANCE_CONFIG } from './governanceConfig';
import type { SocialPublishingJob, PublishingJobStatus, SocialPlatform } from './types';

// In-memory queue store (synced with Supabase social_publishing_jobs in production)
const PUBLISHING_JOB_VAULT: Map<string, SocialPublishingJob> = new Map();

/**
 * Creates a unique deterministic idempotency key for a publishing job
 */
export function generatePublishingIdempotencyKey(
  contentId: string,
  platform: SocialPlatform,
  scheduledTimeWindow: string
): string {
  let hash = 0;
  const raw = `${contentId}|${platform}|${scheduledTimeWindow}`;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `idem_${platform.toLowerCase()}_${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

/**
 * Enqueues a new publishing job with duplicate detection
 */
export function enqueuePublishingJob(job: SocialPublishingJob): {
  success: boolean;
  job: SocialPublishingJob;
  duplicateDetected: boolean;
} {
  // Check if idempotency key already exists
  if (PUBLISHING_JOB_VAULT.has(job.idempotency_key)) {
    const existing = PUBLISHING_JOB_VAULT.get(job.idempotency_key)!;
    return {
      success: false,
      job: existing,
      duplicateDetected: true,
    };
  }

  PUBLISHING_JOB_VAULT.set(job.idempotency_key, job);
  return {
    success: true,
    job,
    duplicateDetected: false,
  };
}

/**
 * Retrieves all jobs currently in the publishing queue
 */
export function getAllPublishingJobs(): SocialPublishingJob[] {
  return Array.from(PUBLISHING_JOB_VAULT.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Updates a job's status and handles exponential retry or transition to DEAD_LETTER
 */
export function recordJobExecutionResult(
  idempotencyKey: string,
  result: {
    status: PublishingJobStatus;
    publishedUrl?: string;
    externalPostId?: string;
    error?: string;
  }
): SocialPublishingJob | null {
  const job = PUBLISHING_JOB_VAULT.get(idempotencyKey);
  if (!job) return null;

  if (result.status === 'PUBLISHED') {
    job.execution_status = 'PUBLISHED';
    job.published_url = result.publishedUrl;
    job.external_post_id = result.externalPostId;
    job.published_at = new Date().toISOString();
    job.last_error = undefined;
  } else if (result.status === 'FAILED') {
    job.attempt_count += 1;
    job.last_error = result.error;

    const maxAttempts = job.retry_policy?.max_attempts || ACTIVE_GOVERNANCE_CONFIG.retry_policy.max_attempts;
    if (job.attempt_count >= maxAttempts) {
      job.execution_status = 'DEAD_LETTER';
      job.next_retry_at = undefined;
    } else {
      job.execution_status = 'PENDING_REVIEW';
      const backoffMs = ACTIVE_GOVERNANCE_CONFIG.retry_policy.initial_backoff_ms *
        Math.pow(ACTIVE_GOVERNANCE_CONFIG.retry_policy.backoff_multiplier, job.attempt_count - 1);
      job.next_retry_at = new Date(Date.now() + backoffMs).toISOString();
    }
  } else {
    job.execution_status = result.status;
  }

  PUBLISHING_JOB_VAULT.set(idempotencyKey, job);
  return job;
}
