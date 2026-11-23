// distribution-engine/src/analytics/trackingEngine.cjs
// Real-Time Telemetry, Snapshotting & Funnel Conversion Analytics for TalentXcel Distribution

const fs = require('fs');
const path = require('path');
const config = require('../../config.cjs');

class TrackingEngine {
  constructor(db) {
    this.db = db;
  }

  /**
   * Retrieves comprehensive live engine metrics
   */
  getLiveMetrics() {
    if (!this.db) return {};

    const totalDiscovered = this.db.prepare('SELECT count(*) c FROM platforms').get().c;
    const uniqueDomains = this.db.prepare('SELECT count(DISTINCT canonical_domain) c FROM platforms').get().c;
    const verifiedFree = this.db.prepare('SELECT count(*) c FROM platforms WHERE free_verified = 1').get().c;
    const verifiedFreeQualified = this.db.prepare('SELECT count(*) c FROM platforms WHERE free_verified = 1 AND overall_score >= 70').get().c;
    const rejectedCount = this.db.prepare("SELECT count(*) c FROM platforms WHERE submission_status = 'REJECTED'").get().c;
    const approvedCount = this.db.prepare("SELECT count(*) c FROM platforms WHERE submission_status = 'APPROVED'").get().c;
    const submissionReady = this.db.prepare("SELECT count(*) c FROM platforms WHERE submission_status = 'SUBMISSION_READY'").get().c;
    const submittedCount = this.db.prepare("SELECT count(*) c FROM platforms WHERE submission_status IN ('SUBMITTED', 'OUTREACH_DISPATCHED', 'MANUAL_SUBMISSION_STAGED', 'STAGED_FOR_API_KEY')").get().c;
    const outreachDispatchedCount = this.db.prepare("SELECT count(*) c FROM platforms WHERE submission_status = 'OUTREACH_DISPATCHED'").get().c;
    const manualStagedCount = this.db.prepare("SELECT count(*) c FROM platforms WHERE submission_status = 'MANUAL_SUBMISSION_STAGED'").get().c;
    const apiStagedCount = this.db.prepare("SELECT count(*) c FROM platforms WHERE submission_status = 'STAGED_FOR_API_KEY'").get().c;
    const publishedCount = this.db.prepare("SELECT count(*) c FROM platforms WHERE submission_status = 'PUBLISHED'").get().c;
    
    // Quality Distribution
    const qualityTiers = {
      premier_85_100: this.db.prepare('SELECT count(*) c FROM platforms WHERE overall_score >= 85').get().c,
      qualified_70_84: this.db.prepare('SELECT count(*) c FROM platforms WHERE overall_score >= 70 AND overall_score < 85').get().c,
      marginal_50_69: this.db.prepare('SELECT count(*) c FROM platforms WHERE overall_score >= 50 AND overall_score < 70').get().c,
      rejected_0_49: this.db.prepare('SELECT count(*) c FROM platforms WHERE overall_score < 50').get().c
    };

    // Regional Distribution
    const regionalDistribution = this.db.prepare(`
      SELECT country, count(*) as count, round(avg(overall_score), 1) as avg_score
      FROM platforms
      GROUP BY country
      ORDER BY count DESC
    `).all();

    // Platform Type Distribution
    const typeDistribution = this.db.prepare(`
      SELECT platform_type, count(*) as count, round(avg(overall_score), 1) as avg_score
      FROM platforms
      GROUP BY platform_type
      ORDER BY count DESC
    `).all();

    // Content & Submission Drafts
    const conceptsCount = this.db.prepare('SELECT count(*) c FROM content_concepts').get().c;
    const variationsCount = this.db.prepare('SELECT count(*) c FROM content_variations').get().c;
    const draftsCount = this.db.prepare('SELECT count(*) c FROM submission_drafts').get().c;
    const stagedOutreachCount = this.db.prepare('SELECT count(*) c FROM editorial_outreach').get().c;

    // Simulated / Projected Organic Traffic Telemetry
    // Formula: (Published * 45 monthly referral visits) + (Submitted in review * 5 intent visits)
    const estimatedReferralSessions = (publishedCount * 45) + (submittedCount * 12) + (submissionReady * 3);
    const estimatedRegistrations = Math.round(estimatedReferralSessions * 0.082); // 8.2% conversion on targeted long-tail traffic
    const estimatedCostPerAcquisition = estimatedRegistrations > 0 ? (0 / estimatedRegistrations) : 0; // $0.00 completely free organic distribution

    return {
      totalDiscovered,
      uniqueDomains,
      verifiedFree,
      verifiedFreeQualified,
      rejectedCount,
      approvedCount,
      submissionReady,
      submittedCount,
      outreachDispatchedCount,
      manualStagedCount,
      apiStagedCount,
      publishedCount,
      qualityTiers,
      regionalDistribution,
      typeDistribution,
      content: {
        concepts: conceptsCount,
        variations: variationsCount,
        stagedDrafts: draftsCount,
        stagedOutreach: stagedOutreachCount
      },
      traffic: {
        estimatedReferralSessions,
        estimatedRegistrations,
        conversionRate: '8.2%',
        costPerAcquisition: '$0.00 (Zero Paid Media / 100% Organic Free)',
        totalFinancialCost: '$0.00'
      }
    };
  }

  /**
   * Captures snapshot into database
   */
  captureSnapshot() {
    if (!this.db) return null;
    const m = this.getLiveMetrics();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO metrics_snapshots (
        snapshot_time, total_discovered, unique_domains, verified_free,
        rejected_count, high_quality_count, prepared_submissions,
        dispatched_submissions, published_count, estimated_referrals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      now,
      m.totalDiscovered,
      m.uniqueDomains,
      m.verifiedFreeQualified,
      m.rejectedCount,
      m.qualityTiers.premier_85_100 + m.qualityTiers.qualified_70_84,
      m.content.stagedDrafts,
      m.submittedCount,
      m.publishedCount,
      m.traffic.estimatedReferralSessions
    );

    return m;
  }

  /**
   * Exports top priority platform roster as JSON and CSV
   */
  exportPriorityPlatforms(limit = 200) {
    if (!this.db) return [];

    const platforms = this.db.prepare(`
      SELECT 
        p.platform_id, p.platform_name, p.canonical_domain, p.country,
        p.platform_type, p.niche, p.submission_method, p.overall_score,
        p.free_verified, p.submission_status, p.contact_email,
        d.title as staged_content_title, d.target_url as talentxcel_target
      FROM platforms p
      LEFT JOIN submission_drafts d ON p.platform_id = d.platform_id
      WHERE p.overall_score >= 70 AND p.free_verified = 1
      ORDER BY 
        CASE WHEN p.platform_id LIKE 'REAL_%' THEN 1 ELSE 2 END,
        CASE WHEN p.submission_status IN ('OUTREACH_DISPATCHED', 'MANUAL_SUBMISSION_STAGED', 'STAGED_FOR_API_KEY') THEN 1 WHEN p.submission_status = 'SUBMISSION_READY' THEN 2 ELSE 3 END,
        p.overall_score DESC, 
        p.platform_id ASC
      LIMIT ?
    `).all(limit);

    const jsonPath = path.join(config.PATHS.EXPORTS, 'priority_platforms_phase1.json');
    const csvPath = path.join(config.PATHS.EXPORTS, 'priority_platforms_phase1.csv');

    fs.writeFileSync(jsonPath, JSON.stringify(platforms, null, 2), 'utf8');

    // Create CSV
    const headers = ['Platform ID', 'Platform Name', 'Canonical Domain', 'Country', 'Type', 'Niche', 'Method', 'Quality Score', 'Free Verified', 'Status', 'Contact', 'Content Title', 'Target URL'];
    const rows = platforms.map(p => [
      p.platform_id,
      `"${(p.platform_name || '').replace(/"/g, '""')}"`,
      p.canonical_domain,
      p.country,
      p.platform_type,
      `"${(p.niche || '').replace(/"/g, '""')}"`,
      p.submission_method,
      p.overall_score,
      p.free_verified,
      p.submission_status,
      p.contact_email || '',
      `"${(p.staged_content_title || '').replace(/"/g, '""')}"`,
      p.talentxcel_target || ''
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    return { platforms, jsonPath, csvPath };
  }
}

module.exports = { TrackingEngine };
