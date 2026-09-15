// src/lib/social-marketing/marketingScheduler.ts
// Stage 2: Marketing Scheduler & 2-Hour Autonomous Heartbeat for TalentXcel AI Content Factory
// Coordinates the full 12-stage cycle. Decides whether to publish or explicitly choose NO_ACTION.
// Invariant: Non-spammy. Never publishes merely because the 2-hour timer fired.

import { getAuthoritativeLifecycleState } from '@/lib/ai-org/aiOrganizationState';
import { discoverContentOpportunities } from './contentIntelligenceEngine';
import { researchTopicEvidence } from './contentResearchEngine';
import { createCoreContent } from './aiContentCreator';
import { generateVoiceSynthesis } from './voiceSynthesisEngine';
import { generateVisualAssets } from './visualContentCreator';
import { renderVideoPackage } from './videoProductionEngine';
import { adaptContentForPlatforms } from './socialContentAdapter';
import { executeSafetyGate, executeQualityGate } from './contentQualityGate';
import { executeSocialPublish } from './socialPublishingGateway';
import { recordFunnelAttribution } from './socialAttribution';
import type {
  SchedulerCycleResult,
  AiDecisionMode,
  NoActionReason,
  SocialPlatform,
  DiscoveredOpportunity,
} from './types';

// In-memory cycle lock to prevent concurrent executions
let isCycleRunning = false;
let lastCycleTimestamp: string | null = null;
const RECENT_PUBLISHED_TOPICS = new Set<string>();

/**
 * Maps hour of day to peak engagement platform (IST timezone aligned)
 */
export function selectOptimalPlatformForHour(hour: number): SocialPlatform {
  if (hour >= 6 && hour < 10) return 'INSTAGRAM'; // Morning motivation & career carousels
  if (hour >= 10 && hour < 14) return 'X'; // Lunchtime industry insights & threads
  if (hour >= 14 && hour < 18) return 'FACEBOOK'; // Afternoon professional deep-dives
  return 'YOUTUBE'; // Evening long-form & Shorts viewing
}

/**
 * Stage 2 & Orchestrator Primary Function: Executes the complete 12-Stage Autonomous Decision Cycle.
 */
export async function runAutonomousContentCycle(options?: {
  forcePlatform?: SocialPlatform;
  executionPolicyOverride?: 'AUTO' | 'REVIEW' | 'BLOCKED';
}): Promise<SchedulerCycleResult> {
  const startTime = Date.now();
  const cycleId = `cycle-${Date.now()}`;
  const nowHour = new Date().getHours();

  // Concurrency Lock
  if (isCycleRunning) {
    return {
      cycle_id: cycleId,
      timestamp: new Date().toISOString(),
      decision: 'NO_ACTION',
      no_action_reason: 'GOVERNANCE_BLOCK',
      jobs_created: 0,
      policy_enforced: 'BLOCKED',
      duration_ms: Date.now() - startTime,
    };
  }

  isCycleRunning = true;

  try {
    // 1. Initial Master Org State Check
    const orgState = await getAuthoritativeLifecycleState();
    if (orgState === 'OFFLINE' || orgState === 'PAUSED' || orgState === 'EMERGENCY_STOP') {
      return {
        cycle_id: cycleId,
        timestamp: new Date().toISOString(),
        decision: 'NO_ACTION',
        no_action_reason: 'GOVERNANCE_BLOCK',
        jobs_created: 0,
        policy_enforced: 'BLOCKED',
        duration_ms: Date.now() - startTime,
      };
    }

    // 2. Stage 1: DISCOVER
    const opportunities = await discoverContentOpportunities();
    if (opportunities.length === 0) {
      return {
        cycle_id: cycleId,
        timestamp: new Date().toISOString(),
        decision: 'NO_ACTION',
        no_action_reason: 'INSUFFICIENT_DEMAND',
        jobs_created: 0,
        policy_enforced: 'AUTO',
        duration_ms: Date.now() - startTime,
      };
    }

    // Filter out topics published recently (cooldown)
    const viableOpp = opportunities.find(opp => !RECENT_PUBLISHED_TOPICS.has(opp.topic.toLowerCase()));
    if (!viableOpp || viableOpp.demand_score < 60) {
      return {
        cycle_id: cycleId,
        timestamp: new Date().toISOString(),
        decision: 'NO_ACTION',
        no_action_reason: viableOpp ? 'LOW_EVIDENCE' : 'DUPLICATE_TOPIC',
        jobs_created: 0,
        policy_enforced: 'AUTO',
        duration_ms: Date.now() - startTime,
      };
    }

    // 3. Stage 2: DECIDE
    let decisionMode: AiDecisionMode = 'CREATE_NEW';
    if (viableOpp.source_type === 'BLOG_ARTICLE' || viableOpp.source_type === 'NEWS_REPORT') {
      decisionMode = 'REPURPOSE';
    } else if (viableOpp.topic.toLowerCase().includes('roadmap') || viableOpp.topic.toLowerCase().includes('guide')) {
      decisionMode = 'EVERGREEN';
    }

    const targetPlatform = options?.forcePlatform || selectOptimalPlatformForHour(nowHour);

    // 4. Stage 3: RESEARCH
    const evidenceRecords = await researchTopicEvidence(viableOpp.topic, viableOpp);

    // 5. Stage 4: WRITE
    const coreDraft = await createCoreContent(viableOpp, evidenceRecords);

    // 6. Stage 5: VOICE
    const voiceSpec = await generateVoiceSynthesis(coreDraft);

    // 7. Stage 6: VISUAL
    const visualAssets = await generateVisualAssets(coreDraft, cycleId);

    // 8. Stage 7: VIDEO PRODUCTION (Decoupled)
    const videoPkg = await renderVideoPackage(coreDraft, voiceSpec, visualAssets, {
      aspectRatio: targetPlatform === 'YOUTUBE' ? '9:16' : '9:16',
    });

    // 9. Stage 8: PLATFORM ADAPTATION
    const deliverables = await adaptContentForPlatforms(coreDraft, visualAssets, videoPkg);

    // 10. Stage 9: QUALITY + SAFETY GATES
    const safetyReport = executeSafetyGate(coreDraft, evidenceRecords);
    const qualityReport = executeQualityGate(coreDraft, deliverables, evidenceRecords);

    if (!safetyReport.passed) {
      return {
        cycle_id: cycleId,
        timestamp: new Date().toISOString(),
        decision: 'NO_ACTION',
        no_action_reason: 'QUALITY_RISK',
        selected_opportunity: viableOpp,
        selected_platform: targetPlatform,
        jobs_created: 0,
        policy_enforced: 'BLOCKED',
        duration_ms: Date.now() - startTime,
      };
    }

    // 11. Stage 10: PUBLISH VIA GOVERNED GATEWAY
    const publishResponse = await executeSocialPublish({
      contentId: coreDraft.identity.content_id,
      campaignId: coreDraft.identity.campaign_id,
      platform: targetPlatform,
      deliverables,
      qualityReport,
      safetyReport,
      executionPolicyOverride: options?.executionPolicyOverride || 'REVIEW',
    });

    // Mark topic in cooldown set
    RECENT_PUBLISHED_TOPICS.add(viableOpp.topic.toLowerCase());
    lastCycleTimestamp = new Date().toISOString();

    // 12. Simulate Stage 11: Attribution Seed Record
    recordFunnelAttribution({
      job_id: publishResponse.job?.id || `job-${cycleId}`,
      platform: targetPlatform,
      topic_title: viableOpp.topic,
      campaign_slug: coreDraft.identity.campaign_id,
      attention: {
        impressions: 4800,
        reach: 3900,
        views: 2800,
        watch_time_sec: 11400,
        completion_rate: 68,
      },
      intent: {
        profile_visits: 184,
        link_clicks: 92,
        landing_sessions: 86,
        saves: 142,
        shares: 38,
      },
      business: {
        signups: 14,
        verified_users: 12,
        activated_users: 9,
        resume_scans: 8,
        job_applications: 5,
        employer_leads: 1,
        jobs_posted: 0,
        paid_txc_purchases: 2,
        direct_revenue_inr: 1500,
      },
      roi_score: 91,
      recorded_at: new Date().toISOString(),
    });

    return {
      cycle_id: cycleId,
      timestamp: new Date().toISOString(),
      decision: decisionMode,
      selected_opportunity: viableOpp,
      selected_platform: targetPlatform,
      jobs_created: 1,
      policy_enforced: options?.executionPolicyOverride || 'REVIEW',
      duration_ms: Date.now() - startTime,
    };
  } finally {
    isCycleRunning = false;
  }
}

/**
 * Returns telemetry regarding the 2-hour heartbeat clock
 */
export function getSchedulerHeartbeatInfo(): {
  isCycleRunning: boolean;
  lastCycleTimestamp: string | null;
  nextScheduledCycle: string;
  heartbeatIntervalHours: number;
} {
  const lastTime = lastCycleTimestamp ? new Date(lastCycleTimestamp).getTime() : Date.now();
  const nextTime = new Date(lastTime + 2 * 3600 * 1000).toISOString();

  return {
    isCycleRunning,
    lastCycleTimestamp,
    nextScheduledCycle: nextTime,
    heartbeatIntervalHours: 2,
  };
}
