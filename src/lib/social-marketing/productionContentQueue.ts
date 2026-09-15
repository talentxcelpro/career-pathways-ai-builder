// src/lib/social-marketing/productionContentQueue.ts
// TalentXcel Production Content Queue
// Automatically turns P0 GSC video opportunities into ready-to-publish Shorts/Reels/video packages,
// enforcing strict PENDING_REVIEW governance before autonomous publishing.

import {
  enqueuePublishingJob,
  generatePublishingIdempotencyKey,
  getAllPublishingJobs,
} from './publishingQueue';
import { ACTIVE_GOVERNANCE_CONFIG } from './governanceConfig';
import type {
  SocialVideoOpportunity,
  SocialPublishingJob,
  SocialPlatform,
  ContentFormatType,
} from './types';

export interface EnqueueProductionResult {
  enqueuedJobs: SocialPublishingJob[];
  duplicateCount: number;
  summary: string;
}

/**
 * Maps a SocialPlatform and SocialContentFormat to the corresponding ContentFormatType.
 */
function resolveContentFormat(platform: SocialPlatform): ContentFormatType {
  switch (platform) {
    case 'YOUTUBE':
      return 'YOUTUBE_SHORT';
    case 'INSTAGRAM':
      return 'INSTAGRAM_REEL';
    case 'FACEBOOK':
      return 'FACEBOOK_VIDEO';
    case 'X':
      return 'X_VIDEO';
  }
}

/**
 * Automatically enqueues all P0 (High-Impact) opportunities into the Production Content Queue
 * as PENDING_REVIEW packages with platform-tailored metadata and idempotency keys.
 */
export function enqueueP0OpportunitiesToProductionQueue(
  opportunities: SocialVideoOpportunity[],
  targetDateStr?: string
): EnqueueProductionResult {
  const scheduledDate = targetDateStr || new Date().toISOString().split('T')[0];
  const p0Opportunities = opportunities.filter(o => o.opportunity_tier === 'P0');
  const enqueuedJobs: SocialPublishingJob[] = [];
  let duplicateCount = 0;

  for (const opp of p0Opportunities) {
    const platforms: SocialPlatform[] = ['YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'X'];

    for (const platform of platforms) {
      const variant = opp.platform_variants[platform];
      if (!variant) continue;

      const idempotencyKey = generatePublishingIdempotencyKey(
        opp.opportunity_id,
        platform,
        scheduledDate
      );

      const formatType = resolveContentFormat(platform);

      const job: SocialPublishingJob = {
        id: `prod-job-${opp.opportunity_id}-${platform.toLowerCase()}`,
        content_id: opp.opportunity_id,
        platform,
        format: formatType,
        content_version: 1,
        rendered_assets: [
          {
            asset_id: `asset-${opp.opportunity_id}-${platform.toLowerCase()}`,
            type: 'RENDERED_VIDEO',
            public_url: opp.staged_vault_path
              ? `${opp.staged_vault_path}/${platform.toLowerCase()}/video.mp4`
              : `https://talentxcel.in/vault/${opp.opportunity_id}/${platform.toLowerCase()}/video.mp4`,
            mime_type: 'video/mp4',
            file_size_bytes: 14_500_000,
            status: 'READY',
          },
        ],
        caption: variant.caption,
        hashtags: variant.hashtags,
        cta_text: variant.cta,
        destination_url: 'https://talentxcel.in',
        idempotency_key: idempotencyKey,
        execution_status: 'PENDING_REVIEW', // Invariant: Human-in-the-loop gate before live dispatch
        attempt_count: 0,
        retry_policy: {
          max_attempts: ACTIVE_GOVERNANCE_CONFIG.retry_policy.max_attempts,
          backoff_multiplier: ACTIVE_GOVERNANCE_CONFIG.retry_policy.backoff_multiplier,
          initial_backoff_ms: ACTIVE_GOVERNANCE_CONFIG.retry_policy.initial_backoff_ms,
        },
        scheduled_for: new Date(Date.now() + 3600 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };

      const result = enqueuePublishingJob(job);
      if (result.success) {
        enqueuedJobs.push(result.job);
      } else if (result.duplicateDetected) {
        duplicateCount += 1;
      }
    }
  }

  const summary =
    `Enqueued ${enqueuedJobs.length} P0 publishing packages into the production queue with status PENDING_REVIEW. ` +
    `Detected ${duplicateCount} previously enqueued duplicate packages. All packages staged with full metadata.`;

  return {
    enqueuedJobs,
    duplicateCount,
    summary,
  };
}

/**
 * Retrieves all jobs in the production queue awaiting board or editorial review.
 */
export function getPendingReviewProductionJobs(): SocialPublishingJob[] {
  return getAllPublishingJobs().filter(j => j.execution_status === 'PENDING_REVIEW');
}

/**
 * Approves a production job, promoting it from PENDING_REVIEW to APPROVED for publishing.
 */
export function approveProductionJob(idempotencyKey: string): SocialPublishingJob | null {
  const jobs = getAllPublishingJobs();
  const target = jobs.find(j => j.idempotency_key === idempotencyKey);
  if (!target) return null;

  target.execution_status = 'APPROVED';
  return target;
}

/**
 * Returns aggregated stats for the production content queue.
 */
export function getProductionQueueSummary(): {
  totalInQueue: number;
  pendingReviewCount: number;
  approvedCount: number;
  publishedCount: number;
  platformBreakdown: Record<SocialPlatform, number>;
} {
  const allJobs = getAllPublishingJobs();
  const platformBreakdown: Record<SocialPlatform, number> = {
    YOUTUBE: 0,
    INSTAGRAM: 0,
    FACEBOOK: 0,
    X: 0,
  };

  let pendingReviewCount = 0;
  let approvedCount = 0;
  let publishedCount = 0;

  for (const j of allJobs) {
    platformBreakdown[j.platform] = (platformBreakdown[j.platform] || 0) + 1;
    if (j.execution_status === 'PENDING_REVIEW') pendingReviewCount++;
    else if (j.execution_status === 'APPROVED') approvedCount++;
    else if (j.execution_status === 'PUBLISHED') publishedCount++;
  }

  return {
    totalInQueue: allJobs.length,
    pendingReviewCount,
    approvedCount,
    publishedCount,
    platformBreakdown,
  };
}
