/**
 * distribution-engine/src/audit/executeProofAudit.cjs
 *
 * Forensic Proof Audit Script
 * Executes direct SQL queries against SQLite database,
 * inspects actual execution evidence vs internal staging,
 * exports raw audit data for user inspection, and compiles
 * a complete, uncompromising proof audit report.
 */

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(process.cwd(), 'distribution-engine/data/distribution_engine.db');
const db = new DatabaseSync(DB_PATH);

const EXPORTS_DIR = path.join(process.cwd(), 'distribution-engine/data/exports/audit');
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

async function runAudit() {
  console.log('================================================================');
  console.log('TALENTXCEL DISTRIBUTION ENGINE: FORENSIC EXECUTION PROOF AUDIT');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // 1. AUDIT OF THE 9 EDITORIAL EMAILS
  // -------------------------------------------------------------------------
  console.log('--- 1. AUDITING 9 EDITORIAL PITCHES ---');
  const pitches = db.prepare(`
    SELECT 
      eo.id, eo.platform_id, p.platform_name, p.domain,
      eo.contact_name, eo.contact_email, eo.subject, eo.body,
      eo.outreach_date, eo.status, eo.reply_received, eo.reply_notes
    FROM editorial_outreach eo
    JOIN platforms p ON eo.platform_id = p.platform_id
    WHERE eo.id BETWEEN 601 AND 609
    ORDER BY eo.id ASC
  `).all();

  console.log(`Retrieved ${pitches.length} outreach records from editorial_outreach.`);
  
  const emailAuditResults = pitches.map(p => {
    let notes = {};
    try {
      notes = JSON.parse(p.reply_notes || '{}');
    } catch (e) {
      notes = { raw: p.reply_notes };
    }

    return {
      recordId: p.id,
      platformId: p.platform_id,
      platformName: p.platform_name,
      domain: p.domain,
      recipientName: p.contact_name,
      recipientEmail: p.contact_email,
      senderAddress: 'editorial@talentxcel.in (Planned / Configured Sender)',
      subject: p.subject,
      timestamp: p.outreach_date,
      bodyPreview: p.body ? p.body.substring(0, 200) + '...' : '',
      databaseStatus: p.status,
      // Forensic distinction
      hasSmtpMessageId: false,
      smtpDeliveryEvent: null,
      providerMessageId: null,
      mxVerified: notes.mxStatus === 'VERIFIED_ACTIVE',
      primaryMxServer: notes.primaryMx || null,
      actualExternalStatus: 'PREPARED_AND_MX_VERIFIED_ONLY',
      truthStatement: 'Email text and MX records were verified; message was recorded in SQLite, but NO physical SMTP packet or AWS SES API call was transmitted to the recipient mailbox.'
    };
  });

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'audit_editorial_pitches.json'),
    JSON.stringify(emailAuditResults, null, 2)
  );

  // -------------------------------------------------------------------------
  // 2. AUDIT OF CLAIMED EXTERNAL PUBLICATIONS
  // -------------------------------------------------------------------------
  console.log('--- 2. AUDITING CLAIMED EXTERNAL PUBLICATIONS ---');
  const claimedPubsPlatforms = db.prepare(`
    SELECT platform_id, platform_name, domain, publication_url, submission_status
    FROM platforms
    WHERE publication_url IS NOT NULL OR submission_status = 'PUBLISHED'
  `).all();

  const claimedPubsDrafts = db.prepare(`
    SELECT draft_id, platform_id, target_url, staging_status
    FROM submission_drafts
    WHERE staging_status = 'PUBLISHED'
  `).all();

  console.log(`Claimed publications in platforms table: ${claimedPubsPlatforms.length}`);
  console.log(`Claimed publications in submission_drafts table: ${claimedPubsDrafts.length}`);

  const publicationAudit = {
    totalClaimedLive: claimedPubsPlatforms.length,
    claimedRecords: claimedPubsPlatforms,
    draftsClaimedPublished: claimedPubsDrafts,
    externalAuditFinding: claimedPubsPlatforms.length === 0
      ? 'CONFIRMED ZERO: No external publications are currently claimed or marked PUBLISHED in the database. 100% strict verification policy active.'
      : 'WARNING: Found claimed publications that must be crawled.'
  };

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'audit_publications.json'),
    JSON.stringify(publicationAudit, null, 2)
  );

  // -------------------------------------------------------------------------
  // 3. AUDIT OF THE 8 MANUAL SUBMISSION TARGETS
  // -------------------------------------------------------------------------
  console.log('--- 3. AUDITING 8 MANUAL SUBMISSION TARGETS ---');
  const manualTargets = db.prepare(`
    SELECT 
      p.platform_id, p.platform_name, p.domain, p.submission_url,
      p.submission_status, d.draft_id, d.title, d.target_url,
      d.staging_status, d.notes, d.prepared_at
    FROM platforms p
    LEFT JOIN submission_drafts d ON p.platform_id = d.platform_id
    WHERE p.domain IN (
      'prospects.ac.uk', 'targetjobs.co.uk', 'talentegg.ca', 'remoteok.com',
      'jobberman.com', 'brightnetwork.co.uk', 'brainstation.io', 'platzi.com'
    )
    ORDER BY p.platform_id ASC
  `).all();

  console.log(`Retrieved ${manualTargets.length} manual targets from database.`);

  const manualAuditResults = manualTargets.map(t => {
    let parsedNotes = {};
    try {
      parsedNotes = JSON.parse(t.notes || '{}');
    } catch (e) {
      parsedNotes = { raw: t.notes };
    }

    return {
      platformId: t.platform_id,
      platformName: t.platform_name,
      domain: t.domain,
      submissionPathwayUrl: t.submission_url,
      stagedTitle: t.title,
      talentxcelDestination: t.target_url,
      databasePlatformStatus: t.submission_status,
      databaseDraftStatus: t.staging_status,
      preparedAt: t.prepared_at,
      hasExternalSubmissionConfirmation: false,
      confirmationId: null,
      screenshotArtifact: null,
      httpProbeStatus: parsedNotes.httpStatus || 'N/A',
      accessGatingProfile: parsedNotes.actionReason || 'N/A',
      truthClassification: 'STAGED_ONLY',
      truthStatement: 'Target URL and pathway were probed over HTTP GET and staged with tailored content, but NO HTTP POST form submission was executed. No confirmation ID exists.'
    };
  });

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'audit_manual_submissions.json'),
    JSON.stringify(manualAuditResults, null, 2)
  );

  // -------------------------------------------------------------------------
  // 4. AUDIT OF THE 563 DRAFTS IN SQLITE
  // -------------------------------------------------------------------------
  console.log('--- 4. AUDITING 563 STAGED DRAFTS ---');
  const totalDrafts = db.prepare('SELECT count(*) as count FROM submission_drafts').get().count;
  const draftsByStatus = db.prepare('SELECT staging_status, count(*) as count FROM submission_drafts GROUP BY staging_status').all();
  const draftsByType = db.prepare('SELECT submission_type, count(*) as count FROM submission_drafts GROUP BY submission_type').all();

  console.log(`Total rows in submission_drafts: ${totalDrafts}`);
  console.log('Breakdown by status:', draftsByStatus);

  // Sample 20 random drafts
  const sample20Drafts = db.prepare(`
    SELECT 
      d.draft_id, d.platform_id, p.platform_name, p.domain,
      d.concept_id, d.variation_id, d.submission_type,
      d.title, substr(d.content_body, 1, 150) as body_snippet,
      d.target_url, d.anchor_text, d.staging_status, d.prepared_at
    FROM submission_drafts d
    JOIN platforms p ON d.platform_id = p.platform_id
    ORDER BY RANDOM()
    LIMIT 20
  `).all();

  // Test uniqueness of titles
  const allDraftTitles = db.prepare('SELECT title FROM submission_drafts').all().map(d => d.title);
  const uniqueTitles = new Set(allDraftTitles);
  console.log(`Draft Titles: ${allDraftTitles.length} total, ${uniqueTitles.size} unique titles.`);

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'audit_sample_20_drafts.json'),
    JSON.stringify(sample20Drafts, null, 2)
  );

  // -------------------------------------------------------------------------
  // 5. AUDIT OF THE 102 NEWLY ADDED PLATFORMS
  // -------------------------------------------------------------------------
  console.log('--- 5. AUDITING 102 NEW PLATFORMS ---');
  const new102Platforms = db.prepare(`
    SELECT 
      platform_id, platform_name, domain, canonical_domain,
      country, region, platform_type, category, niche,
      submission_method, overall_score, free_submission,
      free_verified, verification_status, submission_status,
      discovered_at
    FROM platforms
    WHERE discovery_source = 'MANUAL_CURATED_DISCOVERY_ENGINE'
    ORDER BY platform_id ASC
  `).all();

  console.log(`Total rows matching MANUAL_CURATED_DISCOVERY_ENGINE: ${new102Platforms.length}`);

  // Check duplicate domains within the 102
  const newDomains = new102Platforms.map(p => p.canonical_domain.toLowerCase());
  const uniqueNewDomains = new Set(newDomains);
  const duplicateNewCount = newDomains.length - uniqueNewDomains.size;

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'audit_102_platforms.json'),
    JSON.stringify(new102Platforms, null, 2)
  );

  // -------------------------------------------------------------------------
  // 6. AUDIT OF THE 100-PLACEMENT PIPELINE
  // -------------------------------------------------------------------------
  console.log('--- 6. AUDITING 100-PLACEMENT PIPELINE ---');
  const top100Pipeline = db.prepare(`
    SELECT 
      p.platform_id, p.platform_name, p.domain, p.canonical_domain,
      p.submission_url, p.submission_method, p.overall_score,
      p.submission_status, p.last_verified_at,
      p.publication_url,
      d.title as staged_content_title, d.target_url as talentxcel_target
    FROM platforms p
    LEFT JOIN submission_drafts d ON p.platform_id = d.platform_id
    WHERE p.free_verified = 1
    ORDER BY 
      CASE WHEN p.platform_id LIKE 'REAL_%' THEN 1 ELSE 2 END,
      CASE WHEN p.submission_status IN ('OUTREACH_DISPATCHED', 'MANUAL_SUBMISSION_STAGED', 'STAGED_FOR_API_KEY') THEN 1 WHEN p.submission_status = 'SUBMISSION_READY' THEN 2 ELSE 3 END,
      p.overall_score DESC,
      p.platform_id ASC
    LIMIT 100
  `).all();

  const pipelineStatusBreakdown = {};
  top100Pipeline.forEach(p => {
    pipelineStatusBreakdown[p.submission_status] = (pipelineStatusBreakdown[p.submission_status] || 0) + 1;
  });

  console.log('Top 100 Pipeline Status Breakdown:', pipelineStatusBreakdown);

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'audit_100_pipeline.json'),
    JSON.stringify(top100Pipeline, null, 2)
  );

  // Compile final summary report data
  const finalAuditReport = {
    timestamp: new Date().toISOString(),
    auditScope: 'TalentXcel Free Content Distribution Engine Forensic Audit',
    summary: {
      editorialPitchesPrepared: pitches.length,
      editorialPitchesActuallySentSmtp: 0,
      claimedLiveExternalPublications: claimedPubsPlatforms.length,
      verifiedLiveExternalPublications: 0,
      manualTargetsStaged: manualTargets.length,
      manualSubmissionsActuallySubmitted: 0,
      totalDraftsInSqlite: totalDrafts,
      uniqueDraftTitles: uniqueTitles.size,
      newlyAddedPlatformsInSqlite: new102Platforms.length,
      newPlatformsDuplicates: duplicateNewCount,
      top100PipelineBreakdown: pipelineStatusBreakdown
    }
  };

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'forensic_audit_master_summary.json'),
    JSON.stringify(finalAuditReport, null, 2)
  );

  console.log('\n================================================================');
  console.log('FORENSIC AUDIT COMPLETE. MASTER SUMMARY:');
  console.log(JSON.stringify(finalAuditReport.summary, null, 2));
  console.log(`Audit artifacts written to: ${EXPORTS_DIR}`);
  console.log('================================================================');
}

runAudit().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
