// src/lib/social-marketing/socialPublishingGateway.ts
// Stage 10: Master Publishing Gateway for TalentXcel AI Content Factory
// Governed execution boundary: Enforces Master Org Killswitch (Immediate Pre-Flight), Level-3 Policy,
// Platform Readiness, Account Health, and Idempotency before external mutation.

import { getAuthoritativeLifecycleState } from '@/lib/ai-org/aiOrganizationState';
import { executeAgentAction } from '@/lib/ai-org/executionGateway';
import { getPlatformReadiness } from './socialAccounts';
import {
  enqueuePublishingJob,
  recordJobExecutionResult,
  generatePublishingIdempotencyKey,
} from './publishingQueue';
import type {
  SocialPlatform,
  SocialPublishingJob,
  QualityAuditReport,
  SafetyAuditReport,
  PlatformDeliverableGroup,
} from './types';

export interface PublishExecutionRequest {
  contentId: string;
  campaignId: string;
  platform: SocialPlatform;
  deliverables: PlatformDeliverableGroup;
  qualityReport: QualityAuditReport;
  safetyReport: SafetyAuditReport;
  executionPolicyOverride?: 'AUTO' | 'REVIEW' | 'BLOCKED';
}

export interface PublishExecutionResponse {
  success: boolean;
  status: 'PUBLISHED' | 'PENDING_REVIEW' | 'BLOCKED_OFF' | 'BLOCKED_SAFETY' | 'BLOCKED_QUALITY' | 'BLOCKED_PLATFORM';
  idempotencyKey: string;
  publishedUrl?: string;
  rejectionReason?: string;
  job?: SocialPublishingJob;
}

/**
 * Stage 10 Primary Function: The Single Governed Gatekeeper for All Social Publishing Mutations.
 * Performs the required IMMEDIATE PRE-FLIGHT KILLSWITCH CHECK immediately before dispatch.
 */
export async function executeSocialPublish(
  request: PublishExecutionRequest
): Promise<PublishExecutionResponse> {
  const { contentId, campaignId, platform, qualityReport, safetyReport, executionPolicyOverride } = request;
  const timeWindow = new Date().toISOString().slice(0, 13); // Hourly resolution window
  const idempotencyKey = generatePublishingIdempotencyKey(contentId, platform, timeWindow);

  // 1. Safety Check (Hard Block - Zero Tolerance)
  if (!safetyReport.passed) {
    return {
      success: false,
      status: 'BLOCKED_SAFETY',
      idempotencyKey,
      rejectionReason: `Content failed zero-tolerance safety gate: ${safetyReport.hard_blocked_reason}`,
    };
  }

  // 2. Quality Check (Must meet min score, default >= 75)
  if (!qualityReport.passed) {
    return {
      success: false,
      status: 'BLOCKED_QUALITY',
      idempotencyKey,
      rejectionReason: `Content failed 18-point quality gate (Score: ${qualityReport.overall_score}/100).`,
    };
  }

  // 3. Platform Readiness & Account Health Check
  const platformHealth = await getPlatformReadiness(platform);
  if (platformHealth.readiness !== 'READY') {
    return {
      success: false,
      status: 'BLOCKED_PLATFORM',
      idempotencyKey,
      rejectionReason: `Platform ${platform} is not ready: ${platformHealth.reason}`,
    };
  }

  // Determine policy: default to REVIEW for safety unless explicitly AUTO
  const policy = executionPolicyOverride || 'REVIEW';

  // 4. Create and enqueue publishing job
  const newJob: SocialPublishingJob = {
    id: `job-${idempotencyKey}`,
    contentId,
    campaign_id: campaignId,
    platform,
    format: platform === 'YOUTUBE' ? 'YOUTUBE_SHORT' : platform === 'INSTAGRAM' ? 'INSTAGRAM_CAROUSEL' : platform === 'FACEBOOK' ? 'FACEBOOK_POST' : 'X_THREAD',
    idempotency_key: idempotencyKey,
    scheduled_at: new Date().toISOString(),
    execution_policy: policy,
    quality_score: qualityReport.overall_score,
    safety_check_passed: true,
    platform_readiness: platformHealth.readiness,
    account_health: platformHealth.health,
    execution_status: policy === 'AUTO' ? 'APPROVED' : 'PENDING_REVIEW',
    attempt_count: 0,
    retry_policy: { max_attempts: 3, backoff_factor: 2 },
    created_at: new Date().toISOString(),
  };

  const { job: enqueuedJob, duplicateDetected } = enqueuePublishingJob(newJob);
  if (duplicateDetected && enqueuedJob.execution_status === 'PUBLISHED') {
    return {
      success: true,
      status: 'PUBLISHED',
      idempotencyKey,
      publishedUrl: enqueuedJob.published_url,
      job: enqueuedJob,
    };
  }

  // If policy is REVIEW, hold in queue for human approval
  if (policy === 'REVIEW') {
    return {
      success: true,
      status: 'PENDING_REVIEW',
      idempotencyKey,
      job: enqueuedJob,
    };
  }

  // 5. IMMEDIATE PRE-FLIGHT STATE CHECK
  // Non-negotiable invariant: Evaluate Organization Master State immediately before external API request.
  const preflightOrgState = await getAuthoritativeLifecycleState();
  if (preflightOrgState === 'OFFLINE' || preflightOrgState === 'PAUSED' || preflightOrgState === 'EMERGENCY_STOP') {
    recordJobExecutionResult(idempotencyKey, {
      status: 'FAILED',
      error: `Immediate pre-flight check aborted: Organization is currently ${preflightOrgState}. Master kill switch engaged.`,
    });

    return {
      success: false,
      status: 'BLOCKED_OFF',
      idempotencyKey,
      rejectionReason: `Pre-flight blocked: TalentXcel Organization is ${preflightOrgState}. Zero external mutations allowed.`,
      job: enqueuedJob,
    };
  }

  // 6. Execute Mutation through Central AI Execution Gateway
  const gatewayResult = await executeAgentAction({
    agentId: 'SOCIAL_DISTRIBUTION',
    actionType: 'PUBLISH_PAGE',
    targetSurface: `Social / ${platform}`,
    telemetryTrigger: `2-Hour Content Factory Autonomous Loop (Content: ${contentId})`,
    payload: { platform, contentId, idempotencyKey },
    executeFn: async () => {
      // Simulate live API handshake using vaulted OAuth tokens
      const mockPostIds: Record<SocialPlatform, string> = {
        YOUTUBE: 'yt_video_8947291',
        INSTAGRAM: 'ig_post_1784920482',
        FACEBOOK: 'fb_post_902847192',
        X: 'x_tweet_18294719024',
      };
      const mockUrls: Record<SocialPlatform, string> = {
        YOUTUBE: `https://youtube.com/shorts/${mockPostIds.YOUTUBE}`,
        INSTAGRAM: `https://instagram.com/p/${mockPostIds.INSTAGRAM}`,
        FACEBOOK: `https://facebook.com/talentxcel/posts/${mockPostIds.FACEBOOK}`,
        X: `https://x.com/talentxcel/status/${mockPostIds.X}`,
      };

      return {
        externalPostId: mockPostIds[platform],
        publishedUrl: mockUrls[platform],
      };
    },
  });

  if (gatewayResult.success && gatewayResult.data) {
    const updatedJob = recordJobExecutionResult(idempotencyKey, {
      status: 'PUBLISHED',
      publishedUrl: gatewayResult.data.publishedUrl,
      externalPostId: gatewayResult.data.externalPostId,
    });

    return {
      success: true,
      status: 'PUBLISHED',
      idempotencyKey,
      publishedUrl: gatewayResult.data.publishedUrl,
      job: updatedJob || enqueuedJob,
    };
  }

  // Gateway blocked or rejected
  recordJobExecutionResult(idempotencyKey, {
    status: 'FAILED',
    error: gatewayResult.rejectionReason || 'Execution gateway rejected mutation.',
  });

  return {
    success: false,
    status: gatewayResult.status === 'BLOCKED_OFF' ? 'BLOCKED_OFF' : 'BLOCKED_PLATFORM',
    idempotencyKey,
    rejectionReason: gatewayResult.rejectionReason,
    job: enqueuedJob,
  };
}

/**
 * Phase 25.11: Publishes an approved content package directly from the Local Content Vault
 * Invariant: Reads exact files from disk, verifies checksums & manifest, checks preflight killswitch,
 * and publishes without regenerating content.
 */
export async function publishFromVault(input: {
  scheduledDate: string;
  campaignSlug: string;
  contentId: string;
  platform: SocialPlatform;
  executionPolicyOverride?: 'AUTO' | 'REVIEW';
}): Promise<PublishExecutionResponse> {
  const { scheduledDate, campaignSlug, contentId, platform, executionPolicyOverride } = input;
  const { defaultContentVault } = await import('./vault/contentVaultProvider');

  // 1. Read manifest from vault
  const manifest = await defaultContentVault.getPackageManifest(scheduledDate, campaignSlug, contentId);
  if (!manifest) {
    return {
      success: false,
      status: 'BLOCKED_PLATFORM',
      idempotencyKey: `vault-pub-${contentId}-${platform}`,
      rejectionReason: `Vault manifest not found for ${scheduledDate}/${campaignSlug}/${contentId}`,
    };
  }

  // 2. Verify integrity of physical assets on disk
  const integrity = await defaultContentVault.verifyPackageIntegrity(manifest);
  if (!integrity.valid) {
    return {
      success: false,
      status: 'BLOCKED_PLATFORM',
      idempotencyKey: `vault-pub-${contentId}-${platform}`,
      rejectionReason: `Vault integrity check failed: missing ${integrity.missingFiles.join(', ')}`,
    };
  }

  // 3. Verify Quality & Safety scores from manifest
  if (!manifest.safetyPassed) {
    return {
      success: false,
      status: 'BLOCKED_SAFETY',
      idempotencyKey: `vault-pub-${contentId}-${platform}`,
      rejectionReason: 'Vault package failed safety audit checks.',
    };
  }

  if (manifest.qualityScore < 75) {
    return {
      success: false,
      status: 'BLOCKED_QUALITY',
      idempotencyKey: `vault-pub-${contentId}-${platform}`,
      rejectionReason: `Vault package quality score ${manifest.qualityScore} is below threshold 75`,
    };
  }

  // 4. Preflight Master Org Killswitch Check
  const preflightOrgState = await getAuthoritativeLifecycleState();
  if (preflightOrgState === 'OFFLINE' || preflightOrgState === 'PAUSED' || preflightOrgState === 'EMERGENCY_STOP') {
    return {
      success: false,
      status: 'BLOCKED_OFF',
      idempotencyKey: `vault-pub-${contentId}-${platform}`,
      rejectionReason: `Pre-flight Killswitch Blocked: Org state is ${preflightOrgState}`,
    };
  }

  // 5. Account Health and Platform Readiness Check
  const platformHealth = await getPlatformReadiness(platform);
  if (platformHealth.readiness !== 'READY' || platformHealth.health !== 'CONNECTED') {
    return {
      success: false,
      status: 'BLOCKED_PLATFORM',
      idempotencyKey: `vault-pub-${contentId}-${platform}`,
      rejectionReason: `Platform ${platform} is not ready: ${platformHealth.reason || 'Account not connected'}`,
    };
  }

  // 6. Execute live publishing via Central Execution Gateway
  const idempotencyKey = `vault-pub-${contentId}-${platform}-${manifest.contentVersion}`;
  const mockPostIds: Record<SocialPlatform, string> = {
    YOUTUBE: `yt_vault_${contentId.slice(0, 8)}`,
    INSTAGRAM: `ig_vault_${contentId.slice(0, 8)}`,
    FACEBOOK: `fb_vault_${contentId.slice(0, 8)}`,
    X: `x_vault_${contentId.slice(0, 8)}`,
  };
  const mockUrls: Record<SocialPlatform, string> = {
    YOUTUBE: `https://youtube.com/shorts/${mockPostIds.YOUTUBE}`,
    INSTAGRAM: `https://instagram.com/p/${mockPostIds.INSTAGRAM}`,
    FACEBOOK: `https://facebook.com/talentxcel/posts/${mockPostIds.FACEBOOK}`,
    X: `https://x.com/talentxcel/status/${mockPostIds.X}`,
  };

  const gatewayResult = await executeAgentAction({
    agentId: 'SOCIAL_DISTRIBUTION',
    actionType: 'PUBLISH_PAGE',
    targetSurface: `Social Vault / ${platform}`,
    telemetryTrigger: `Vault Calendar Scheduled Publication (Content: ${contentId})`,
    payload: { platform, contentId, idempotencyKey, vaultDate: scheduledDate },
    executeFn: async () => ({
      externalPostId: mockPostIds[platform],
      publishedUrl: mockUrls[platform],
    }),
  });

  if (gatewayResult.success && gatewayResult.data) {
    return {
      success: true,
      status: 'PUBLISHED',
      idempotencyKey,
      publishedUrl: gatewayResult.data.publishedUrl,
    };
  }

  return {
    success: false,
    status: gatewayResult.status === 'BLOCKED_OFF' ? 'BLOCKED_OFF' : 'BLOCKED_PLATFORM',
    idempotencyKey,
    rejectionReason: gatewayResult.rejectionReason,
  };
}

