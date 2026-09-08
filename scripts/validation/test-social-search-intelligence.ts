// scripts/validation/test-social-search-intelligence.ts
// Comprehensive Test Suite for TalentXcel Social Search Intelligence Pipeline
// Validates: 4 hooks, 4 platform packages, rate normalization, 500-view confidence gate, AI CEO learning, and backwards compatibility.

import { SOCIAL_SEARCH_INTELLIGENCE_CONFIG } from '../../src/lib/social-marketing/social-search-intelligence.config';
import {
  detectTopicCluster,
  computeSocialOpportunityScore,
  generateHookProposals,
  generatePlatformVariants,
  createSocialVideoOpportunity,
  processGscOpportunitiesForSocial,
  BENCHMARK_CAREER_QUERIES,
} from '../../src/lib/seo/socialVideoIntelligenceEngine';
import {
  runShortsIntelligence,
  generateShortsOpportunitiesFromGsc,
} from '../../src/lib/seo/shortsIntelligenceEngine';
import {
  computeYouTubeScore,
  computeInstagramScore,
  computeFacebookScore,
  computeXScore,
  evaluatePerformanceRecord,
  aggregateHookPerformance,
} from '../../src/lib/social-marketing/socialFeedbackLoop';
import {
  runSocialVideoCeoLearningCycle,
  getAllEditorialBriefs,
} from '../../src/lib/social-marketing/aiCeoLearningLoop';
import type { HookArchetype, SocialPlatform } from '../../src/lib/social-marketing/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTestSuite() {
  console.log('\n' + '='.repeat(80));
  console.log('   RUNNING TEST SUITE: TALENTXCEL SOCIAL SEARCH INTELLIGENCE');
  console.log('='.repeat(80) + '\n');

  // TEST 1: Config Integrity
  console.log('[Test 1] Validating Configuration Weights & Thresholds...');
  const oppWeights = Object.values(SOCIAL_SEARCH_INTELLIGENCE_CONFIG.opportunityScoring).reduce((a, b) => a + b, 0);
  assert(Math.abs(oppWeights - 1.0) < 0.001, `Opportunity scoring weights must sum to 1.0 (got ${oppWeights})`);

  const platWeights = Object.values(SOCIAL_SEARCH_INTELLIGENCE_CONFIG.platformWeights).reduce((a, b) => a + b, 0);
  assert(Math.abs(platWeights - 1.0) < 0.001, `Platform weights must sum to 1.0 (got ${platWeights})`);

  assert(SOCIAL_SEARCH_INTELLIGENCE_CONFIG.winnerGates.minViewsForWinnerStatus === 500, 'minViewsForWinnerStatus must be 500');
  assert(SOCIAL_SEARCH_INTELLIGENCE_CONFIG.winnerGates.winningTopicScoreMin === 75, 'winningTopicScoreMin must be 75');
  assert(SOCIAL_SEARCH_INTELLIGENCE_CONFIG.winnerGates.winningHookScoreMin === 80, 'winningHookScoreMin must be 80');

  // TEST 2: Cluster Detection
  console.log('\n[Test 2] Validating Topic Cluster Matching...');
  assert(detectTopicCluster('how does ats work') === 'ATS', 'Matches ATS cluster');
  assert(detectTopicCluster('ats resume formatting') === 'ATS', 'Matches ATS cluster');
  assert(detectTopicCluster('ai recruitment trends 2026') === 'AI_RECRUITMENT', 'Matches AI_RECRUITMENT cluster');
  assert(detectTopicCluster('candidate screening process') === 'CANDIDATE_SCREENING', 'Matches CANDIDATE_SCREENING cluster');
  assert(detectTopicCluster('top 5 resume mistakes to avoid') === 'RESUME_MISTAKES', 'Matches RESUME_MISTAKES cluster');

  // TEST 3: 4-Hook Archetype Generation
  console.log('\n[Test 3] Validating 4-Hook Archetype Generation...');
  const hooks = generateHookProposals('how does ats work', 'ATS');
  assert(hooks.length === 4, 'Must generate exactly 4 hook proposals');
  const archetypes = hooks.map(h => h.archetype);
  const requiredArchetypes: HookArchetype[] = ['CURIOSITY', 'CONTRARIAN', 'DATA_REVELATION', 'PROBLEM_SOLUTION'];
  for (const req of requiredArchetypes) {
    assert(archetypes.includes(req), `Must include hook archetype: ${req}`);
  }

  // TEST 4: Multi-Platform Packaging
  console.log('\n[Test 4] Validating 4-Platform Variant Packaging...');
  const testOpp = createSocialVideoOpportunity({
    query: 'how does ats work',
    impressions: 180,
    clicks: 12,
    ctr: 6.67,
    position: 4.2,
  });

  assert(testOpp.surface === 'SHORTS', "Surface must be 'SHORTS'");
  assert(testOpp.platform_targets.length === 4, 'Target platforms must include 4 platforms');
  assert(testOpp.platform_variants.YOUTUBE.format === 'SHORT', "YouTube format must be 'SHORT'");
  assert(testOpp.platform_variants.INSTAGRAM.format === 'REEL', "Instagram format must be 'REEL'");
  assert(testOpp.platform_variants.FACEBOOK.format === 'REEL', "Facebook format must be 'REEL'");
  assert(testOpp.platform_variants.X.format === 'VIDEO', "X format must be 'VIDEO'");
  assert(testOpp.platform_variants.YOUTUBE.recommended_duration_seconds === 50, 'YouTube duration around 50s');
  assert(testOpp.platform_variants.INSTAGRAM.recommended_duration_seconds === 38, 'Instagram duration around 38s');
  assert(testOpp.platform_variants.X.recommended_duration_seconds === 32, 'X duration around 32s');
  assert(testOpp.status === 'READY_FOR_REVIEW', "Initial status must be 'READY_FOR_REVIEW'");

  // TEST 5: Rate Normalization & Low-View vs High-View Fairness
  console.log('\n[Test 5] Validating Rate-Normalized Metric Computation...');
  // A video with 10,000 views and 100 shares has a 1.0% share rate (below target 2.0%)
  // A video with 500 views and 20 shares has a 4.0% share rate (above target 2.0%)
  const score10k = computeYouTubeScore({
    views: 10000,
    viewed_vs_swiped_pct: 75,
    retention_rate_pct: 85,
    rewatch_rate_pct: 15,
    shares: 100, // 1%
    subscribers_or_followers: 50, // 0.5%
  });

  const score500 = computeYouTubeScore({
    views: 500,
    viewed_vs_swiped_pct: 75,
    retention_rate_pct: 85,
    rewatch_rate_pct: 15,
    shares: 20, // 4%
    subscribers_or_followers: 10, // 2%
  });

  assert(score500 >= score10k, 'Higher rate with smaller volume scores equal or higher due to rate normalization');

  // TEST 6: Statistical Confidence Gate (500+ views invariant)
  console.log('\n[Test 6] Validating 500+ Views Statistical Confidence Gate...');
  const under500ViewsRecord = evaluatePerformanceRecord(
    'opp-test-small',
    'topic-ats',
    'How Does ATS Work',
    'CURIOSITY',
    {
      YOUTUBE: { views: 150, viewed_vs_swiped_pct: 85, retention_rate_pct: 90, rewatch_rate_pct: 20, shares: 10, subscribers_or_followers: 5, likes: 20, comments: 5 },
      INSTAGRAM: { views: 100, completion_rate_pct: 80, saves: 10, shares: 8, comments: 4, profile_visits: 3, likes: 15 },
      FACEBOOK: { views: 50, retention_rate_pct: 70, shares: 3, comments: 2, likes: 5 },
      X: { views: 30, completion_rate_pct: 70, reposts: 2, comments: 1, likes: 4, subscribers_or_followers: 1 },
    }
  );

  assert(under500ViewsRecord.total_views === 330, `Total views is 330 (< 500)`);
  assert(under500ViewsRecord.cross_platform_score >= 75, `Cross-platform score is >= 75 (got ${under500ViewsRecord.cross_platform_score})`);
  assert(under500ViewsRecord.status === 'PROMISING', `Status must be 'PROMISING' under 500 views (got '${under500ViewsRecord.status}')`);
  assert(under500ViewsRecord.is_winning_topic === false, 'is_winning_topic must be false when views < 500');

  const over500ViewsRecord = evaluatePerformanceRecord(
    'opp-test-large',
    'topic-ats',
    'How Does ATS Work (Scaled)',
    'CURIOSITY',
    {
      YOUTUBE: { views: 650, viewed_vs_swiped_pct: 85, retention_rate_pct: 90, rewatch_rate_pct: 20, shares: 40, subscribers_or_followers: 25, likes: 80, comments: 20 },
      INSTAGRAM: { views: 400, completion_rate_pct: 80, saves: 35, shares: 28, comments: 15, profile_visits: 12, likes: 55 },
      FACEBOOK: { views: 200, retention_rate_pct: 70, shares: 12, comments: 8, likes: 20 },
      X: { views: 150, completion_rate_pct: 70, reposts: 8, comments: 5, likes: 16, subscribers_or_followers: 4 },
    }
  );

  assert(over500ViewsRecord.total_views === 1400, `Total views is 1400 (>= 500)`);
  assert(over500ViewsRecord.cross_platform_score >= 75, `Cross-platform score is >= 75 (got ${over500ViewsRecord.cross_platform_score})`);
  assert(over500ViewsRecord.status === 'WINNING_TOPIC', `Status must be 'WINNING_TOPIC' (got '${over500ViewsRecord.status}')`);
  assert(over500ViewsRecord.is_winning_topic === true, 'is_winning_topic must be true when views >= 500 and score >= 75');

  // TEST 7: AI CEO Learning Loop & Reverse Editorial Brief Generation
  console.log('\n[Test 7] Validating AI CEO Learning Loop & Editorial Briefs...');
  const ceoResult = runSocialVideoCeoLearningCycle([under500ViewsRecord, over500ViewsRecord]);
  assert(ceoResult.topicsToScale.length === 1, 'Exactly 1 topic scaled (the 1400 views winner)');
  assert(ceoResult.topicsToRetest.length === 1, 'Exactly 1 topic queued for retest (the 330 views promising topic)');
  assert(ceoResult.generatedBriefs.length === 1, 'Generated 1 companion Reverse Editorial Brief for website SEO');
  assert(ceoResult.generatedBriefs[0].editorial_status === 'PENDING_REVIEW', 'Editorial brief must be PENDING_REVIEW');

  // TEST 8: Backwards Compatibility
  console.log('\n[Test 8] Validating Backwards-Compatible Shorts Engine Wrapper...');
  const shortsResults = runShortsIntelligence([
    { query: 'how does ats work', impressions: 180, clicks: 12, ctr: 6.67, position: 4.2 },
  ], { includeBenchmarks: false });
  assert(shortsResults.length === 1, 'Wrapper returns processed opportunities');
  assert(shortsResults[0].surface === 'SHORTS', 'Surface is SHORTS');
  assert(typeof generateShortsOpportunitiesFromGsc === 'function', 'generateShortsOpportunitiesFromGsc alias exists');

  console.log('\n' + '='.repeat(80));
  console.log('   ALL 8 TESTS PASSED SUCCESSFULLY! 100% SPECIFICATION COMPLIANCE.');
  console.log('='.repeat(80) + '\n');
}

runTestSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
