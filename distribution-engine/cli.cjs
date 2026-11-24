#!/usr/bin/env node
// distribution-engine/cli.cjs
// Unified Command-Line Interface for TalentXcel Global Free Content Distribution Engine (Phase 1)
// Completely independent execution: Zero Vercel dependencies, Zero paid link costs.

const { getDatabase } = require('./src/db/schema.cjs');
const { DiscoveryEngine } = require('./src/discovery/discoveryEngine.cjs');
const { ContentLibrary } = require('./src/content/contentLibrary.cjs');
const { VariationEngine } = require('./src/content/variationEngine.cjs');
const { CampaignManager } = require('./src/content/campaignManager.cjs');
const { SubmissionManager } = require('./src/workflow/submissionManager.cjs');
const { OutreachEngine } = require('./src/workflow/outreachEngine.cjs');
const { DistributionExecutor } = require('./src/workflow/distributionExecutor.cjs');
const { PublicationVerifier } = require('./src/verification/publicationVerifier.cjs');
const { TrackingEngine } = require('./src/analytics/trackingEngine.cjs');
const { DashboardGenerator } = require('./src/analytics/dashboard.cjs');

async function main() {
  const args = process.argv.slice(2);
  const command = (args[0] || 'status').toLowerCase();

  const db = getDatabase();
  const discovery = new DiscoveryEngine(db);
  const contentLib = new ContentLibrary(db);
  const variationEng = new VariationEngine(db);
  const campaignMgr = new CampaignManager(db);
  const submissionMgr = new SubmissionManager(db);
  const outreachEng = new OutreachEngine(db);
  const executor = new DistributionExecutor(db);
  const verifier = new PublicationVerifier(db);
  const tracker = new TrackingEngine(db);
  const dashboard = new DashboardGenerator(db);

  switch (command) {
    case 'status': {
      dashboard.renderTerminalDashboard();
      const htmlPath = dashboard.generateHtmlDashboard();
      console.log(`📄 Standalone HTML Dashboard updated: ${htmlPath}`);
      break;
    }

    case 'discover-real': {
      const count = parseInt(args[1], 10) || 500;
      console.log(`\n🔍 Executing Real Discovery Batch (${count} platforms)...`);
      await discovery.runRealDiscoveryBatch(count);
      dashboard.renderTerminalDashboard();
      dashboard.generateHtmlDashboard();
      break;
    }

    case 'discover': {
      const target = parseInt(args[1], 10) || 10000;
      await discovery.runRealDiscoveryBatch(500);
      await discovery.runDiscovery(target);
      dashboard.renderTerminalDashboard();
      break;
    }

    case 'seed-campaign': {
      console.log('\n📝 Initializing Campaign: TALENTXCEL GLOBAL ORGANIC DISTRIBUTION — PHASE 1');
      const campRes = campaignMgr.seedCampaignData();
      console.log(`✅ Campaign Seed Complete: ${campRes.conceptsCount} concepts, ${campRes.articlesCount} full articles, ${campRes.variationsCount} variations.`);
      break;
    }

    case 'launch-distribution': {
      const count = parseInt(args[1], 10) || 100;
      console.log(`\n🚀 Commencing Live Distribution Phase for Top ${count} Verified Platforms...`);
      campaignMgr.seedCampaignData();
      const distRes = await executor.executeDistributionCampaign(count);
      tracker.captureSnapshot();
      tracker.exportPriorityPlatforms(count);
      dashboard.renderTerminalDashboard();
      dashboard.generateHtmlDashboard();
      break;
    }

    case 'verify': {
      const platformId = args[1];
      const pubUrl = args[2];
      if (!platformId || !pubUrl) {
        console.error('Usage: node cli.cjs verify <platformId> <publicationUrl>');
        process.exit(1);
      }
      await verifier.verifyPublication(platformId, pubUrl);
      break;
    }

    case 'export': {
      const exportRes = tracker.exportPriorityPlatforms(200);
      console.log(`📁 Priority Platforms exported to:`);
      console.log(`   - JSON: ${exportRes.jsonPath}`);
      console.log(`   - CSV:  ${exportRes.csvPath}`);
      const htmlPath = dashboard.generateHtmlDashboard();
      console.log(`📄 HTML Dashboard: ${htmlPath}`);
      break;
    }

    case 'ai-distrib': {
      console.log('='.repeat(80));
      console.log('🤖 TALENTXCEL GLOBAL AI DISTRIBUTION & FACTUAL CONTENT ENGINE');
      console.log('='.repeat(80));
      const { processAiDistributionOpportunities } = require('./src/ai/aiDistributionManager.cjs');
      const res = processAiDistributionOpportunities();
      console.log(`\n✅ Evaluated ${res.totalEvaluated} High-Authority Distribution Platforms`);
      console.log(`   - Tier 1 Priority Opportunities: ${res.tier1Count}`);
      console.log(`   - Tier 2 Valuable Opportunities: ${res.tier2Count}`);
      console.log(`\n📁 Priority Distribution Queue Manifest: ${res.exportPath}\n`);
      console.log('Top Priority Distribution Actions:');
      res.queue.slice(0, 5).forEach((item, idx) => {
        console.log(`  ${idx + 1}. [${item.priorityTier}] ${item.platformName} (${item.domain}) - Score: ${item.priorityScore}/100`);
        console.log(`     Target Asset: ${item.distributionAction.assetTitle}`);
        console.log(`     Canonical:    ${item.distributionAction.canonicalUrl}`);
      });
      break;
    }

    case 'run-all': {
      console.log('='.repeat(80));
      console.log('🚀 COMMENCING TALENTXCEL GLOBAL FREE DISTRIBUTION ENGINE — FULL LAUNCH');
      console.log('='.repeat(80));

      // 1. Ingest Real 500 Platform Discovery Batch + Scale to 10k
      console.log('\n[Step 1/5] Ingesting Real 500 Platform Discovery Batch...');
      await discovery.runRealDiscoveryBatch(500);
      await discovery.runDiscovery(10000);

      // 2. Seed Campaign TALENTXCEL GLOBAL ORGANIC DISTRIBUTION — PHASE 1
      console.log('\n[Step 2/5] Seeding Campaign & Adapting 10 Full Articles (100 Variations)...');
      campaignMgr.seedCampaignData();
      contentLib.seedConcepts();
      variationEng.seedAllVariations(contentLib.getConcepts());

      // 3. Stage & Launch Distribution across Top 100 Verified Free Platforms
      console.log('\n[Step 3/5] Launching Distribution for Top 100 Verified Platforms...');
      await executor.executeDistributionCampaign(100);

      // 4. Stage remaining priority platforms
      console.log('\n[Step 4/5] Staging Remaining Top 200 Priority Batch...');
      submissionMgr.stageBatchSubmissions(200);
      outreachEng.stageAllEligibleOutreach(200);

      // 5. Snapshot & Exports
      console.log('\n[Step 5/5] Generating Exports & Telemetry Snapshot...');
      tracker.captureSnapshot();
      tracker.exportPriorityPlatforms(200);
      dashboard.generateHtmlDashboard();

      console.log('\n' + '='.repeat(80));
      console.log('🏁 FULL PHASE 1 ORCHESTRATION & CAMPAIGN LAUNCH COMPLETE');
      console.log('='.repeat(80));
      dashboard.renderTerminalDashboard();
      break;
    }

    default: {
      console.log(`Unknown command: ${command}`);
      console.log('Available commands: status, discover-real, discover, seed-campaign, launch-distribution, verify, export, run-all');
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('Fatal CLI execution error:', err);
  process.exit(1);
});
