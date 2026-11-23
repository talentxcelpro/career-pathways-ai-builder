// distribution-engine/test/distributionEngine.test.cjs
// Comprehensive Unit & Integration Tests for TalentXcel Distribution Engine

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../src/db/schema.cjs');
const { QueryGenerator } = require('../src/discovery/queryGenerator.cjs');
const { DeduplicationEngine } = require('../src/discovery/deduplicationEngine.cjs');
const { QualityScorer } = require('../src/validation/qualityScorer.cjs');
const { ValidationEngine } = require('../src/validation/validationEngine.cjs');
const { ContentLibrary } = require('../src/content/contentLibrary.cjs');
const { VariationEngine } = require('../src/content/variationEngine.cjs');
const { CampaignManager } = require('../src/content/campaignManager.cjs');
const { PublicationVerifier } = require('../src/verification/publicationVerifier.cjs');
const { WorkflowStateMachine } = require('../src/workflow/stateMachine.cjs');
const { SubmissionManager } = require('../src/workflow/submissionManager.cjs');
const { OutreachEngine } = require('../src/workflow/outreachEngine.cjs');
const { generateGlobalSeedPlatforms } = require('../src/discovery/seedRealPlatforms.cjs');
const config = require('../config.cjs');

test('QueryGenerator - Generates combinatorial queries across all 10 regions', () => {
  const qg = new QueryGenerator();
  const queries = qg.generateQueries();
  assert.ok(queries.length > 4000, `Expected >4000 queries, got ${queries.length}`);

  const sample = queries[0];
  assert.ok(sample.query);
  assert.ok(sample.country);
  assert.ok(sample.intent);
});

test('DeduplicationEngine - Normalizes URLs and handles compound ccTLDs', () => {
  const de = new DeduplicationEngine();

  const res1 = de.extractDomainInfo('https://www.TechBlog.co.uk/guest-posts?utm=promo');
  assert.strictEqual(res1.canonicalDomain, 'techblog.co.uk');
  assert.strictEqual(res1.rootDomain, 'techblog.co.uk');

  const res2 = de.extractDomainInfo('http://Subdomain.StartupHub.com.au/');
  assert.strictEqual(res2.rootDomain, 'startuphub.com.au');

  const map = new Map();
  map.set('example.com', { platform_id: 'PLT_001' });
  const checkDup = de.evaluateCandidate({ platform_url: 'https://blog.example.com' }, map);
  assert.strictEqual(checkDup.isDuplicate, true);
});

test('QualityScorer - 100-Point Model with Anti-Spam Penalties', () => {
  const scorer = new QualityScorer();

  // High quality candidate
  const good = scorer.scorePlatform({
    niche: 'career development',
    category: 'Careers',
    platform_type: 'CAREER_BLOG',
    target_audience: 'Job Seekers',
    activity_level: 'HIGH',
    editorial_tier: 'HIGH_STANDARDS',
    free_verified: 1,
    free_submission: 1,
    has_public_submission_form: true,
    http_status: 200,
    response_time_ms: 200,
    ssl_valid: true
  });
  assert.ok(good.overallScore >= 90, `Expected score >= 90, got ${good.overallScore}`);
  assert.strictEqual(good.passesQualityGate, true);

  // Spam candidate
  const spam = scorer.scorePlatform({
    niche: 'career',
    category: 'Careers',
    is_spam_content: true,
    is_pbn: true
  });
  assert.ok(spam.overallScore < 50, `Expected penalty deduction, got ${spam.overallScore}`);
  assert.strictEqual(spam.passesQualityGate, false);
});

test('SeedRealPlatforms - Verified Genuine Platforms across 10 regions', () => {
  const platforms = generateGlobalSeedPlatforms();
  assert.ok(platforms.length >= 90, `Must contain authentic real platforms, got ${platforms.length}`);

  const regions = new Set(platforms.map(p => p.country));
  assert.strictEqual(regions.size, 10, 'Must span all 10 countries/regions');
});

test('CampaignManager - Seeds 30 concepts and 100 variations for 10 full articles', () => {
  const testDbPath = path.join(config.PATHS.DATA, 'test_campaign.db');
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

  const db = getDatabase(testDbPath);
  const cm = new CampaignManager(db);
  const res = cm.seedCampaignData();

  assert.strictEqual(res.conceptsCount, 30, 'Must seed 30 campaign concepts');
  assert.strictEqual(res.articlesCount, 10, 'Must have 10 complete articles');
  assert.strictEqual(res.variationsCount, 100, 'Must generate 100 adapted variations (10 x 10)');

  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});

test('PublicationVerifier - Inspects HTML DOM for backlinks, anchor text, and rel attributes', () => {
  const verifier = new PublicationVerifier(null);

  const sampleHtmlWithFollow = `
    <html>
      <body>
        <p>Check out our recommended tool <a href="https://talentxcel.in/resume" rel="dofollow">TalentXcel Resume Builder</a> for free ATS testing.</p>
      </body>
    </html>
  `;
  const result1 = verifier.inspectHtmlForLink(sampleHtmlWithFollow, 'talentxcel.in');
  assert.strictEqual(result1.found, true);
  assert.strictEqual(result1.anchorText, 'TalentXcel Resume Builder');
  assert.strictEqual(result1.rel, 'dofollow');

  const sampleHtmlNoLink = `
    <html>
      <body><p>Generic tech article without any backlink.</p></body>
    </html>
  `;
  const result2 = verifier.inspectHtmlForLink(sampleHtmlNoLink, 'talentxcel.in');
  assert.strictEqual(result2.found, false);
});

test('WorkflowStateMachine - Enforces state transitions and safety guards', () => {
  const testDbPath = path.join(config.PATHS.DATA, 'test_engine.db');
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

  const db = getDatabase(testDbPath);
  const sm = new WorkflowStateMachine(db);

  // Insert dummy platform
  db.prepare(`
    INSERT INTO platforms (
      platform_id, platform_name, domain, canonical_domain, platform_url, country, region,
      platform_type, category, niche, submission_method, free_submission, free_verified,
      overall_score, discovery_source, discovered_at, submission_status
    ) VALUES (
      'TEST_001', 'Test Blog', 'testblog.com', 'testblog.com', 'https://testblog.com',
      'India', 'South Asia', 'CAREER_BLOG', 'Careers', 'Career Advice', 'FORM',
      1, 1, 85, 'TEST', '2026-11-23', 'DISCOVERED'
    )
  `).run();

  // DISCOVERED -> NEEDS_VERIFICATION -> VERIFIED_FREE -> APPROVED
  assert.ok(sm.transition('TEST_001', 'NEEDS_VERIFICATION'));
  assert.ok(sm.transition('TEST_001', 'VERIFIED_FREE'));
  assert.ok(sm.transition('TEST_001', 'APPROVED'));

  // PUBLISHED guard check: cannot transition to PUBLISHED without valid URL
  assert.throws(() => {
    sm.transition('TEST_001', 'PUBLISHED', { publication_url: null });
  });

  // Clean up
  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});
