const fs = require('fs');
const path = require('path');

const { extractGscSignals } = require('./modules/gscExtractor.cjs');
const { detectTractionSignals } = require('./modules/tractionDetector.cjs');
const { profileAudience } = require('./modules/audienceProfiler.cjs');
const { matchCommunities } = require('./modules/communityMatcher.cjs');
const { routeDestination, buildAttributedUrl } = require('./modules/destinationRouter.cjs');
const { generatePlatformContent } = require('./modules/contentGenerator.cjs');
const { computeDps, updateBacklog } = require('./modules/backlogManager.cjs');
const { measureGa4Traffic } = require('./modules/ga4Tracker.cjs');
const { reconcileSupabaseRegistrations } = require('./modules/supabaseReconciler.cjs');
const { runFeedbackLoop } = require('./modules/feedbackLoop.cjs');

async function runGdiOsCycle() {
  console.log('========================================================================');
  console.log('TALENTXCEL GLOBAL DISTRIBUTION INTELLIGENCE — CONTINUOUS OPERATING SYSTEM');
  console.log('Cycle Initiated At:', new Date().toISOString());
  console.log('Environment: PRODUCTION (https://talentxcel.in)');
  console.log('========================================================================\n');

  // STEP 1: Extract GSC Demand Signals
  const gscData = await extractGscSignals();

  // STEP 2: Detect Traction Signals & Emerging Clusters
  const tractionData = await detectTractionSignals(gscData);

  // STEPS 3 - 7: Audience Profiling, Community Matching, Routing, Content Generation & Backlog
  console.log('[Steps 3-7] Synthesizing Opportunities, Content & Scoring Backlog...');
  const opportunities = [];

  // Take top breakout and striking distance queries
  const topSignals = tractionData.breakoutSignals.slice(0, 50);

  topSignals.forEach((sig, index) => {
    // Step 3: Audience
    const audience = profileAudience(sig.query, sig.cluster, 'IND');

    // Step 4: Communities
    const communities = matchCommunities(sig.cluster);
    const primaryCommunity = communities[0];

    // Step 5: Destination
    const destination = routeDestination(sig.query, sig.cluster);
    const campaignSlug = sig.cluster.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 20);
    const contentSlug = sig.query.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 20);

    const attributedUrl = buildAttributedUrl(destination.path, {
      source: primaryCommunity.platform,
      medium: primaryCommunity.format,
      campaign: campaignSlug,
      content: contentSlug,
      term: sig.query.replace(/\s+/g, '+')
    });

    // Step 6: Platform Content
    const content = generatePlatformContent(sig, audience, primaryCommunity, attributedUrl);

    // Step 7: DPS Scoring
    const dps = computeDps(sig, audience, primaryCommunity, destination);

    opportunities.push({
      id: `GDI-${String(index + 1).padStart(3, '0')}`,
      query: sig.query,
      cluster: sig.cluster,
      velocity: sig.velocity,
      impressions7d: sig.impressions7d,
      clicks7d: sig.clicks7d,
      position: sig.position.toFixed(1),
      audience,
      community: primaryCommunity,
      destination: { ...destination, fullUrl: attributedUrl },
      content,
      dps,
      status: 'STAGED_FOR_FREEZE_EXIT'
    });
  });

  const prioritizedBacklog = updateBacklog(opportunities);

  // STEP 8: Measure External Traffic in GA4
  const ga4Campaigns = await measureGa4Traffic('499367883');

  // STEP 9: Reconcile with Supabase Database
  const supabaseData = await reconcileSupabaseRegistrations();

  // STEP 10: Closed-Loop Performance Evaluation (Scale / Refine / Stop)
  const feedback = runFeedbackLoop(ga4Campaigns, supabaseData, prioritizedBacklog);

  // Compile System State Dashboard
  const systemState = {
    generatedAt: new Date().toISOString(),
    gscTimeRange: gscData.timeRange,
    tractionSummary: {
      totalSignalsAnalyzed: tractionData.signals.length,
      breakoutCount: tractionData.breakoutSignals.length,
      topAcceleratingClusters: tractionData.topClustersByTraction.slice(0, 5)
    },
    backlogSummary: {
      totalOpportunities: prioritizedBacklog.length,
      topDpsOpportunities: prioritizedBacklog.slice(0, 10).map(o => ({
        id: o.id,
        query: o.query,
        cluster: o.cluster,
        dps: o.dps,
        platform: o.community.platform,
        url: o.destination.fullUrl
      }))
    },
    ga4AcquisitionMetrics: {
      totalTrackedCampaigns: ga4Campaigns.length,
      campaigns: ga4Campaigns.slice(0, 10)
    },
    supabaseVerification: supabaseData,
    operationalFeedback: {
      scale: feedback.scaleActions,
      refine: feedback.refineActions,
      stop: feedback.stopActions
    }
  };

  const dashboardPath = path.join(__dirname, '..', '..', 'scratch', 'GDI_OS_DASHBOARD.json');
  fs.writeFileSync(dashboardPath, JSON.stringify(systemState, null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log(`✅ GDI-OS CYCLE COMPLETED SUCCESSFULLY!`);
  console.log(`Dashboard state exported to: ${dashboardPath}`);
  console.log('========================================================================');
}

if (require.main === module) {
  runGdiOsCycle().catch(console.error);
}

module.exports = { runGdiOsCycle };
