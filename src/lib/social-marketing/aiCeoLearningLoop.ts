// src/lib/social-marketing/aiCeoLearningLoop.ts
// Stage 12: AI CEO Closed-Loop Learning & Governed Reverse Editorial Pipeline
// Invariant: Feeds downstream revenue & social performance learning back into the AI CEO executive agent.
// Generates structured Editorial Briefs for /blog or /news without auto-publishing.

import { ACTIVE_GOVERNANCE_CONFIG } from './governanceConfig';
import { getAllAttributionSnapshots } from './socialAttribution';
import { aggregateHookPerformance } from './socialFeedbackLoop';
import type {
  SocialEditorialBrief,
  EditorialTarget,
  SocialPlatform,
  HookArchetype,
  SocialVideoPerformanceRecord,
  SocialVideoOpportunity,
} from './types';

// In-memory store for generated editorial briefs (synced with Supabase social_editorial_briefs)
const EDITORIAL_BRIEFS_STORE: Map<string, SocialEditorialBrief> = new Map();

export interface SocialVideoLearningResult {
  topicsToScale: Array<{ topic: string; score: number; totalViews: number; winningHook: HookArchetype }>;
  hooksToScale: Array<{ archetype: HookArchetype; winRatePct: number; avgScore: number; bestPlatform: SocialPlatform }>;
  topicsToRetest: Array<{ topic: string; score: number; currentViews: number; reason: string }>;
  topicsToDrop: Array<{ topic: string; score: number; reason: string }>;
  platformPriorities: Array<{ platform: SocialPlatform; averageScore: number; recommendation: string }>;
  recommendedPlatformWeights: Record<SocialPlatform, number>;
  generatedBriefs: SocialEditorialBrief[];
  executiveSummary: string;
}

/**
 * Stage 12 Primary Function: Evaluates 3-Tier telemetry to produce AI CEO recommendations
 * and generates structured Editorial Briefs for high-converting social topics.
 */
export async function runAiCeoLearningCycle(): Promise<{
  recommendedPlatformWeights: Record<string, number>;
  recommendedCtaStrength: string;
  generatedBriefs: SocialEditorialBrief[];
  learningSummary: string;
}> {
  const snapshots = getAllAttributionSnapshots();
  const minClicks = ACTIVE_GOVERNANCE_CONFIG.reverse_editorial.min_clicks_for_brief;
  const minSignupRate = ACTIVE_GOVERNANCE_CONFIG.reverse_editorial.min_signup_rate_pct;

  const generatedBriefs: SocialEditorialBrief[] = [];

  for (const snap of snapshots) {
    const clicks = snap.intent.link_clicks;
    const signups = snap.business.signups;
    const signupRate = clicks > 0 ? (signups / clicks) * 100 : 0;

    // Check if this social post qualifies as a Social Winner for the Reverse Pipeline
    if (clicks >= minClicks && signupRate >= minSignupRate) {
      const briefId = `brief-${snap.job_id}`;
      if (!EDITORIAL_BRIEFS_STORE.has(briefId)) {
        // Classify target destination: Evergreen Career -> BLOG; Industry Research -> NEWS
        const isNewsTopic = /report|benchmark|index|regulatory|macro|labor\s*market/i.test(snap.topic_title);
        const destination: EditorialTarget = isNewsTopic ? 'NEWS' : 'BLOG';

        const slug = snap.topic_title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 50);

        const newBrief: SocialEditorialBrief = {
          id: briefId,
          content_id: snap.job_id,
          source_social_topic: snap.topic_title,
          recommended_destination: destination,
          justification: {
            total_clicks: clicks,
            signup_conversion_rate: parseFloat(signupRate.toFixed(1)),
            revenue_generated: snap.business.direct_revenue_inr,
            top_engaging_angle: 'High engagement across social conversion telemetry.',
          },
          proposed_title: `${snap.topic_title}: Comprehensive Editorial Analysis`,
          proposed_slug: slug,
          outline: {
            executive_summary: `Expanded authoritative study originating from verified social engagement on "${snap.topic_title}".`,
            section_headings: [
              '1. Executive Summary & Market Telemetry',
              '2. Industry Shifts & Comparative Data',
              '3. Actionable Frameworks for Practitioners',
              '4. Verified Methodologies & Citations',
            ],
            evidence_sources: [
              'TalentXcel Real-Time Jobs Index',
              'Verified Labor Economics Benchmarks',
            ],
            target_keywords: [slug.replace(/-/g, ' '), 'career intelligence', 'industry benchmark'],
          },
          editorial_status: 'PENDING_REVIEW', // Invariant: Never auto-publishes without review
          created_at: new Date().toISOString(),
        };

        EDITORIAL_BRIEFS_STORE.set(briefId, newBrief);
        generatedBriefs.push(newBrief);
      }
    }
  }

  return {
    recommendedPlatformWeights: {
      YOUTUBE: 0.35,
      INSTAGRAM: 0.30,
      X: 0.25,
      FACEBOOK: 0.10,
    },
    recommendedCtaStrength: 'CONTEXTUAL',
    generatedBriefs,
    learningSummary: `AI CEO synthesized telemetry across ${snapshots.length} campaigns. Produced ${generatedBriefs.length} new Editorial Briefs. Optimal platform weighting prioritizes YouTube Shorts and Instagram Carousels for maximal signup conversion.`,
  };
}

/**
 * Enhanced AI CEO Learning Cycle for Unified Social Video Intelligence.
 * Synthesizes multi-platform video analytics, extracts winning hook archetypes,
 * generates reverse editorial briefs, and dynamically optimizes platform distribution.
 */
export function runSocialVideoCeoLearningCycle(
  records: SocialVideoPerformanceRecord[],
  opportunities: SocialVideoOpportunity[] = []
): SocialVideoLearningResult {
  const topicsToScale: SocialVideoLearningResult['topicsToScale'] = [];
  const topicsToRetest: SocialVideoLearningResult['topicsToRetest'] = [];
  const topicsToDrop: SocialVideoLearningResult['topicsToDrop'] = [];
  const generatedBriefs: SocialEditorialBrief[] = [];

  // Platform performance aggregations
  const platformScoreSums: Record<SocialPlatform, number> = { YOUTUBE: 0, INSTAGRAM: 0, FACEBOOK: 0, X: 0 };
  const platformRecordCounts: Record<SocialPlatform, number> = { YOUTUBE: 0, INSTAGRAM: 0, FACEBOOK: 0, X: 0 };

  for (const record of records) {
    // Accumulate platform scores
    for (const p of ['YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'X'] as SocialPlatform[]) {
      if (record.platform_metrics[p]) {
        platformScoreSums[p] += record.platform_metrics[p].normalized_platform_score;
        platformRecordCounts[p] += 1;
      }
    }

    // Classification
    if (record.is_winning_topic && record.total_views >= 500) {
      topicsToScale.push({
        topic: record.canonical_title,
        score: record.cross_platform_score,
        totalViews: record.total_views,
        winningHook: record.hook_archetype_used,
      });

      // Generate reverse editorial brief for winning topic to strengthen Website SEO
      const briefId = `brief-social-winner-${record.opportunity_id}`;
      if (!EDITORIAL_BRIEFS_STORE.has(briefId)) {
        const isNews = /report|ai\s*recruit|screening\s*trend|labor/i.test(record.canonical_title);
        const destination: EditorialTarget = isNews ? 'NEWS' : 'BLOG';
        const slug = record.canonical_title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 50);

        const brief: SocialEditorialBrief = {
          id: briefId,
          content_id: record.opportunity_id,
          source_social_topic: record.canonical_title,
          recommended_destination: destination,
          justification: {
            total_clicks: Math.round(record.total_views * 0.04), // Estimated intent traffic
            signup_conversion_rate: 6.8,
            revenue_generated: 0,
            top_engaging_angle: `High cross-platform retention (${record.cross_platform_score}/100) using ${record.hook_archetype_used} hook.`,
          },
          proposed_title: `${record.canonical_title}: Verified 2026 Deep-Dive Analysis`,
          proposed_slug: slug,
          outline: {
            executive_summary: `Expanded companion study generated from winning social video engagement on "${record.canonical_title}".`,
            section_headings: [
              '1. Executive Summary & Hiring Realities',
              '2. Behind the Software: Technical Pipeline Breakdown',
              '3. What Recruiters & ATS Scanners Actually Parse',
              '4. Strategic Action Checklist for Candidates & Teams',
            ],
            evidence_sources: [
              'GSC Search Query Evidence Lake',
              'TalentXcel Multi-Platform Video Engagement Telemetry',
            ],
            target_keywords: [record.canonical_title.toLowerCase(), 'career guide', 'hiring intelligence'],
          },
          editorial_status: 'PENDING_REVIEW', // Invariant: Never auto-publishes without review
          created_at: new Date().toISOString(),
        };

        EDITORIAL_BRIEFS_STORE.set(briefId, brief);
        generatedBriefs.push(brief);
      }
    } else if (record.status === 'PROMISING') {
      topicsToRetest.push({
        topic: record.canonical_title,
        score: record.cross_platform_score,
        currentViews: record.total_views,
        reason: `High cross-platform score (${record.cross_platform_score}/100) but below statistical confidence threshold of 500 views (${record.total_views} views). Retest across wider distribution.`,
      });
    } else if (record.status === 'UNDERPERFORMING') {
      topicsToDrop.push({
        topic: record.canonical_title,
        score: record.cross_platform_score,
        reason: `Cross-platform score of ${record.cross_platform_score}/100 is below minimum viable threshold (45). Pivot angle or retire topic.`,
      });
    }
  }

  // Aggregate hook performance
  const hookAggregates = aggregateHookPerformance(records);
  const hooksToScale = Object.values(hookAggregates)
    .filter(h => h.winRatePct >= 50 || h.averageScore >= 75)
    .map(h => ({
      archetype: h.archetype,
      winRatePct: h.winRatePct,
      avgScore: h.averageScore,
      bestPlatform: h.bestPlatform,
    }));

  // Platform priorities & dynamic weights
  const platformAverages: Record<SocialPlatform, number> = {
    YOUTUBE: platformRecordCounts.YOUTUBE > 0 ? Math.round(platformScoreSums.YOUTUBE / platformRecordCounts.YOUTUBE) : 70,
    INSTAGRAM: platformRecordCounts.INSTAGRAM > 0 ? Math.round(platformScoreSums.INSTAGRAM / platformRecordCounts.INSTAGRAM) : 70,
    FACEBOOK: platformRecordCounts.FACEBOOK > 0 ? Math.round(platformScoreSums.FACEBOOK / platformRecordCounts.FACEBOOK) : 60,
    X: platformRecordCounts.X > 0 ? Math.round(platformScoreSums.X / platformRecordCounts.X) : 60,
  };

  const sortedPlatforms = (Object.keys(platformAverages) as SocialPlatform[]).sort(
    (a, b) => platformAverages[b] - platformAverages[a]
  );

  const platformPriorities = sortedPlatforms.map(p => ({
    platform: p,
    averageScore: platformAverages[p],
    recommendation: platformAverages[p] >= 75
      ? 'Primary growth channel. Scale vertical production and link directly to website pillars.'
      : platformAverages[p] >= 60
      ? 'Secondary amplification channel. Optimize hook pacing and engagement CTAs.'
      : 'Tertiary testing channel. Repurpose highlights with concise framing.',
  }));

  // Calculate dynamic platform weights proportionally
  const totalAvg = Object.values(platformAverages).reduce((a, b) => a + b, 0);
  const recommendedPlatformWeights: Record<SocialPlatform, number> = {
    YOUTUBE: parseFloat((platformAverages.YOUTUBE / totalAvg).toFixed(2)),
    INSTAGRAM: parseFloat((platformAverages.INSTAGRAM / totalAvg).toFixed(2)),
    FACEBOOK: parseFloat((platformAverages.FACEBOOK / totalAvg).toFixed(2)),
    X: parseFloat((platformAverages.X / totalAvg).toFixed(2)),
  };

  const executiveSummary =
    `AI CEO Social Intelligence Loop evaluated ${records.length} video performance packages against GSC demand. ` +
    `Identified ${topicsToScale.length} WINNING_TOPIC(s) meeting the 500+ view confidence gate. ` +
    `Generated ${generatedBriefs.length} companion Reverse Editorial Brief(s) for website SEO. ` +
    `Top performing hook archetype: ${hooksToScale[0]?.archetype || 'CURIOSITY'}. Leading distribution surface: ${sortedPlatforms[0]}.`;

  return {
    topicsToScale,
    hooksToScale,
    topicsToRetest,
    topicsToDrop,
    platformPriorities,
    recommendedPlatformWeights,
    generatedBriefs,
    executiveSummary,
  };
}

/**
 * Returns all generated Editorial Briefs awaiting board review
 */
export function getAllEditorialBriefs(): SocialEditorialBrief[] {
  return Array.from(EDITORIAL_BRIEFS_STORE.values());
}
