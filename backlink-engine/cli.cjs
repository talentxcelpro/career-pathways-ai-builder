#!/usr/bin/env node
// backlink-engine/cli.cjs
// Command-Line Interface for TalentXcel Backlink Acquisition Engine (Stage 4)
// Completely independent execution: Zero Vercel dependencies, Zero Vercel costs.

const { getDatabase } = require('./src/db/schema.cjs');
const { DomainDiscoveryEngine } = require('./src/discovery/domainDiscoveryEngine.cjs');
const { QualificationEngine } = require('./src/qualification/qualificationEngine.cjs');
const { CampusTpoCampaign } = require('./src/campaigns/campusTpoCampaign.cjs');
const { B2bDirectoryCampaign } = require('./src/campaigns/b2bDirectoryCampaign.cjs');
const { Stage4Execution } = require('./src/campaigns/stage4Execution.cjs');
const { Stage4_1Execution } = require('./src/campaigns/stage4_1Execution.cjs');
const { Stage5Execution } = require('./src/campaigns/stage5Execution.cjs');
const { VerificationEngine } = require('./src/verification/verificationEngine.cjs');
const { ScaleEngine } = require('./src/scaling/scaleEngine.cjs');
const { AnalyticsEngine } = require('./src/analytics/analyticsEngine.cjs');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';

  const db = getDatabase();
  const discoveryEngine = new DomainDiscoveryEngine(db);
  const qualificationEngine = new QualificationEngine(db);
  const tpoCampaign = new CampusTpoCampaign(db);
  const b2bCampaign = new B2bDirectoryCampaign(db);
  const stage4 = new Stage4Execution(db);
  const stage4_1 = new Stage4_1Execution(db);
  const stage5 = new Stage5Execution(db);
  const verificationEngine = new VerificationEngine(db);
  const scaleEngine = new ScaleEngine(db);
  const analyticsEngine = new AnalyticsEngine(db);

  switch (command.toLowerCase()) {
    case 'stage5': {
      stage5.executeFirstAcquisitionBatch();
      stage5.generateStage5Report();
      analyticsEngine.renderTerminalDashboard();
      break;
    }

    case 'stage4.1':
    case 'stage4_1': {
      console.log('\n================================================================================');
      console.log('🚀 COMMENCING TXC-BACKLINK-ENGINE — STAGE 4.1: FIRST ACQUISITION BATCH');
      console.log('================================================================================\n');

      stage4_1.exportBatchFiles();
      stage4_1.generateStage4_1Report();
      analyticsEngine.renderTerminalDashboard();
      break;
    }

    case 'stage4': {
      console.log('\n================================================================================');
      console.log('🚀 COMMENCING TXC-BACKLINK-ENGINE — STAGE 4: FIRST 10 REFERRING DOMAINS READINESS');
      console.log('================================================================================\n');

      // 1. Stage Top 25 Priority Accredited Institutions
      stage4.stageTop25Institutions();

      // 2. Stage 10 Validated Zero-Cost B2B Directory Profiles
      b2bCampaign.stageDirectoryProfiles();

      // 3. Capture snapshot & render 8-metric dashboard
      analyticsEngine.captureSnapshot();
      analyticsEngine.renderTerminalDashboard();

      // 4. Export all dossiers
      analyticsEngine.generateMarkdownReport();
      stage4.exportTop25Manifest();
      b2bCampaign.exportProfiles();
      stage4.generateStage4Report();

      console.log('🏁 Stage 4 readiness and prioritization complete.');
      break;
    }

    case 'stage-top25': {
      stage4.stageTop25Institutions();
      break;
    }

    case 'b2b-directories': {
      b2bCampaign.stageDirectoryProfiles();
      break;
    }

    case 'status': {
      analyticsEngine.renderTerminalDashboard();
      break;
    }

    case 'discover': {
      const targetCount = parseInt(args[1], 10) || 10000;
      await discoveryEngine.runDiscovery(targetCount);
      break;
    }

    case 'qualify': {
      await qualificationEngine.runQualification();
      break;
    }

    case 'campaign-tpo': {
      const limit = parseInt(args[1], 10) || 100;
      await tpoCampaign.stagePilotCampaign(limit);
      break;
    }

    case 'audit-sources': {
      const limit = parseInt(args[1], 10) || 100;
      await verificationEngine.runSourcePageAuditBatch(limit);
      break;
    }

    case 'verify': {
      const limitArg = args.find(a => a.startsWith('--limit='));
      const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50;
      await verificationEngine.runBacklinkVerificationBatch({ limit });
      break;
    }

    case 'verify-url': {
      const targetUrl = args[1];
      if (!targetUrl) {
        console.error('Please specify a URL: node backlink-engine/cli.cjs verify-url <url>');
        process.exit(1);
      }
      console.log(`🔎 Auditing URL: ${targetUrl}`);
      const result = await verificationEngine.verifyBacklinkUrl(targetUrl);
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'export': {
      analyticsEngine.captureSnapshot();
      analyticsEngine.generateMarkdownReport();
      tpoCampaign.exportCampaignData();
      stage4.exportTop25Manifest();
      b2bCampaign.exportProfiles();
      stage4.generateStage4Report();
      console.log(`✅ All reports and manifests exported successfully.`);
      break;
    }

    case 'run-all': {
      console.log('\n================================================================================');
      console.log('🚀 COMMENCING TALENTXCEL FULL PIPELINE (STAGE 4 INTEGRATION)');
      console.log('================================================================================\n');

      await discoveryEngine.runDiscovery(10000);
      await qualificationEngine.runQualification();
      await tpoCampaign.stagePilotCampaign(100);
      stage4.stageTop25Institutions();
      b2bCampaign.stageDirectoryProfiles();

      analyticsEngine.captureSnapshot();
      analyticsEngine.renderTerminalDashboard();
      analyticsEngine.generateMarkdownReport();

      console.log('🏁 End-to-end execution complete.');
      break;
    }

    default: {
      console.log(`
Usage: node backlink-engine/cli.cjs <command> [options]

Commands:
  stage4           Executes Stage 4 readiness (Top 25 TPO Prioritization + 10 B2B Directories)
  status           Displays the definitive 8-metric acquisition dashboard
  stage-top25      Prioritizes Top 25 premier accredited institutions with verified TPO contacts
  b2b-directories  Stages 10 official zero-cost B2B directory profiles
  discover         Discovers 10,000+ candidate domains across Education, HR, Tech & Business
  qualify          Runs anti-spam gate & promotes to 'QUALIFIED_PROSPECT' status
  campaign-tpo     Stages the Campus TPO Resource Partnership Campaign for top 100 institutions
  audit-sources    Audits candidate placement/career portals live over HTTP/HTTPS
  verify           Audits registered external backlinks
  verify-url       Audits a single live web URL for TalentXcel backlink presence
  export           Generates Markdown audit reports and CSV datasets
      `);
      break;
    }
  }
}

main().catch(err => {
  console.error('❌ Error executing Backlink Engine CLI:', err);
  process.exit(1);
});
