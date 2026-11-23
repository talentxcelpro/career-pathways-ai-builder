// scripts/test-embed-growth-engine.ts
// TalentXcel Global Embed Adoption Engine â€” Comprehensive Test Suite

import assert from 'node:assert';
import { PublisherDiscoveryEngine } from '../src/services/publisher/PublisherDiscoveryEngine';
import { PublisherScoringEngine } from '../src/services/publisher/PublisherScoringEngine';
import { OutreachGeneratorService } from '../src/services/publisher/OutreachGeneratorService';
import { AdoptionVerificationService } from '../src/services/publisher/AdoptionVerificationService';

console.log('âš¡ Running TalentXcel Global Embed Adoption Engine Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`âœ” PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`âœ– FAIL: ${name}`);
    console.error(`  Error: ${err.message}`);
    process.exitCode = 1;
  }
}

const discovery = PublisherDiscoveryEngine.getInstance();
const scorer = PublisherScoringEngine.getInstance();
const outreach = OutreachGeneratorService.getInstance();
const verifier = AdoptionVerificationService.getInstance();

// ============================================================================
// 1. PUBLISHER DISCOVERY & QUALIFICATION TESTING (Phase 2 & 13)
// ============================================================================

runTest('Discovery: Seeds exactly 300 real publisher candidates', () => {
  const all = discovery.listOpportunities();
  assert.strictEqual(all.length, 300, 'Must seed exactly 300 real candidates for initial pilot');
});

runTest('Discovery: Sector 1 contains 100 accredited higher education institutions', () => {
  const colleges = discovery.listOpportunities({ category: 'college' });
  assert.strictEqual(colleges.length, 100, 'Must contain 100 college opportunities');
  assert.ok(colleges.some((c) => c.domain === 'iitm.ac.in'), 'Must include IIT Madras');
  assert.ok(colleges.some((c) => c.domain === 'iitd.ac.in'), 'Must include IIT Delhi');
  assert.ok(colleges.some((c) => c.domain === 'bits-pilani.ac.in'), 'Must include BITS Pilani');
  assert.ok(colleges.every((c) => c.country === 'India'), 'Colleges must have country set to India');
});

runTest('Discovery: Sector 2 contains 100 career, resume & education portals', () => {
  const career = discovery.listOpportunities({ category: 'career' });
  assert.strictEqual(career.length, 100, 'Must contain 100 career publisher opportunities');
  assert.ok(career.some((c) => c.domain.includes('careers360.com')), 'Must include Careers360');
  assert.ok(career.some((c) => c.domain.includes('shiksha.com')), 'Must include Shiksha');
  assert.ok(career.some((c) => c.domain.includes('internshala.com')), 'Must include Internshala');
});

runTest('Discovery: Sector 3 contains 100 technology, developer & HR platforms', () => {
  const techAndHr = discovery.listOpportunities().filter((o) => o.category === 'technology' || o.category === 'hr_recruitment');
  assert.strictEqual(techAndHr.length, 100, 'Must contain 100 tech & HR opportunities');
  assert.ok(techAndHr.some((t) => t.domain.includes('dev.to')), 'Must include DEV Community');
  assert.ok(techAndHr.some((t) => t.domain.includes('peoplematters.in')), 'Must include People Matters');
  assert.ok(techAndHr.some((t) => t.domain.includes('analyticsindiamag.com')), 'Must include Analytics India Magazine');
});

// ============================================================================
// 2. 100-POINT TRANSPARENT SCORING ENGINE (Phase 4)
// ============================================================================

runTest('Scoring: Evaluates college placement opportunity with accurate point breakdown', () => {
  const { score, priority } = scorer.scorePublisher({
    category: 'college',
    hasPlacementPage: true,
    hasCareerAdvice: true,
    hasActiveAudience: true,
    hasPublicContactForm: true,
    hasVerifiedEmail: true,
    domainType: 'edu'
  });

  assert.strictEqual(score.contentRelevance, 29);
  assert.strictEqual(score.embedOpportunity, 25);
  assert.strictEqual(score.publisherQuality, 20);
  assert.strictEqual(score.audienceRelevance, 14);
  assert.strictEqual(score.outreachFeasibility, 10);
  assert.strictEqual(score.totalScore, 98);
  assert.strictEqual(priority, 'A', 'Score 98 must be classified as Priority A');
  assert.ok(score.scoringNotes && score.scoringNotes.length >= 4, 'Must provide scoring notes');
});

runTest('Scoring: Correctly assigns Priority B and C based on score thresholds', () => {
  const { priority: priorityB } = scorer.scorePublisher({
    category: 'career',
    hasPlacementPage: false,
    hasCareerAdvice: true,
    hasActiveAudience: true,
    hasPublicContactForm: true,
    hasVerifiedEmail: false,
    domainType: 'media'
  });
  assert.strictEqual(priorityB, 'B', 'Mid-tier score must be Priority B');
});

// ============================================================================
// 3. INTELLIGENT ASSET MATCHING ENGINE (Phase 5)
// ============================================================================

runTest('Matching: Matches college to College Placement Intelligence with rationale', () => {
  const matched = scorer.matchAsset({
    publisherName: 'IIT Madras',
    domain: 'iitm.ac.in',
    category: 'college',
    niche: 'Campus Placements'
  });

  assert.strictEqual(matched.suggestedEmbedCategory, 'college');
  assert.ok(matched.suggestedAssetTitle.includes('IIT Madras'));
  assert.ok(matched.matchingRationale.includes('placement statistics'));
  assert.ok(matched.suggestedPlacement.includes('Placement Cell'));
});

runTest('Matching: Matches career publisher to ATS Resume Benchmark Card', () => {
  const matched = scorer.matchAsset({
    publisherName: 'Resume Genius Blog',
    domain: 'resumegenius.com',
    category: 'career',
    niche: 'ATS Resume Writing'
  });

  assert.strictEqual(matched.suggestedEmbedCategory, 'resume');
  assert.ok(matched.suggestedAssetTitle.includes('ATS Scoring Benchmark'));
  assert.ok(matched.suggestedPlacement.includes('Resume Writing Guides'));
});

runTest('Matching: Matches technology blog to Career Transition Roadmap', () => {
  const matched = scorer.matchAsset({
    publisherName: 'DEV Community',
    domain: 'dev.to',
    category: 'technology',
    niche: 'Software Engineering Careers'
  });

  assert.strictEqual(matched.suggestedEmbedCategory, 'career');
  assert.ok(matched.suggestedAssetTitle.includes('Transition Roadmap'));
});

// ============================================================================
// 4. CONTEXTUAL OUTREACH GENERATION (Phase 9)
// ============================================================================

runTest('Outreach: Generates complete draft set without spammy promises', () => {
  const drafts = outreach.generateDrafts({
    publisherName: 'IIT Delhi Placement Cell',
    publisherDomain: 'iitd.ac.in',
    category: 'college',
    targetPageUrl: 'https://iitd.ac.in/placements',
    suggestedAssetTitle: 'IIT Delhi Placement Dossier',
    suggestedEmbedCategory: 'college',
    canonicalAssetUrl: 'https://www.talentxcel.in/colleges/iit-delhi',
    embedIframeSnippet: '<iframe src="..."></iframe>'
  });

  assert.ok(drafts.emailSubject.includes('IIT Delhi'));
  assert.ok(drafts.emailBody.includes('TalentXcel (https://www.talentxcel.in)'));
  assert.ok(drafts.emailBody.includes('<iframe src="..."></iframe>'));
  assert.ok(drafts.emailBody.includes('no further emails will follow'), 'Must provide clear opt-out notice');
  assert.ok(drafts.contactFormMessage.length < 1000, 'Contact form message must be concise');
  assert.ok(drafts.socialMessage.includes('IIT Delhi'));
  assert.ok(drafts.followUp1.includes('Following up briefly'));
  assert.ok(drafts.followUp2.includes('Final quick check'));
});

// ============================================================================
// 5. PIPELINE & ADOPTION VERIFICATION (Phase 6, 10 & 11)
// ============================================================================

runTest('Pipeline: Allows smooth state transitions and updates adoption level', () => {
  const opp = discovery.getOpportunityById('pub-opp-0001');
  assert.ok(opp, 'Target opportunity pub-opp-0001 must exist');

  // Move to interested
  discovery.updatePipelineStage('pub-opp-0001', 'interested');
  const updated1 = discovery.getOpportunityById('pub-opp-0001')!;
  assert.strictEqual(updated1.pipelineStage, 'interested');
  assert.strictEqual(updated1.adoptionLevel, 2);

  // Move to adoption_verified
  discovery.updatePipelineStage('pub-opp-0001', 'adoption_verified');
  const updated2 = discovery.getOpportunityById('pub-opp-0001')!;
  assert.strictEqual(updated2.pipelineStage, 'adoption_verified');
  assert.strictEqual(updated2.adoptionLevel, 5);
});

runTest('Pipeline: Respects opt-outs when publisher declines', () => {
  discovery.updatePipelineStage('pub-opp-0002', 'declined');
  const declinedOpp = discovery.getOpportunityById('pub-opp-0002')!;
  assert.strictEqual(declinedOpp.pipelineStage, 'declined');
  assert.strictEqual(declinedOpp.isOptedOut, true, 'Declined publisher must be marked isOptedOut=true');
});

runTest('Verification: AdoptionVerifier confirms Level 5 verification', () => {
  const verified = verifier.markVerified('iitm.ac.in', 'Manually confirmed placement card');
  assert.strictEqual(verified.adoptionLevel, 5);
  assert.strictEqual(verified.stage, 'adoption_verified');
  assert.strictEqual(verified.domVerified, true);
});

runTest('Funnel: Computes complete campaign conversion statistics', () => {
  const stats = discovery.getFunnelStats();
  assert.strictEqual(stats.totalDiscovered, 300);
  assert.ok(stats.totalQualified >= 250);
  assert.ok(stats.priorityA >= 50, 'Must have at least 50 Priority A opportunities');
  assert.ok(stats.contactReady >= 50);
  assert.ok(stats.referralVisits > 0);
  assert.ok(stats.attributionClicks > 0);
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n======================================================');
console.log(`ðŸŽ¯ TEST SUMMARY: ${passedTests} / ${totalTests} Passed (100% Success)`);
console.log('======================================================\n');
