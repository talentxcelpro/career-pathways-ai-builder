// backlink-engine/src/scripts/reconcileMission007.cjs
// Reconciles database records against verified external evidence for Mission TXC-BACKLINK-007.
// Corrects action accounting: resets dispatched count to 0 confirmed,
// reclassifies institutional proposals to PREPARED_NOT_DISPATCHED,
// and reclassifies directory profiles to evidence-backed statuses.

const { getDatabase } = require('../db/schema.cjs');

function reconcileMission007() {
  const db = getDatabase();

  console.log('--- EXECUTING TXC-BACKLINK-007 EVIDENCE RECONCILIATION ---');

  // 1. Reclassify the 5 institutional proposals in campaign_outreach
  const tpoUpdateStmt = db.prepare(`
    UPDATE campaign_outreach SET
      outreach_status = 'PREPARED_NOT_DISPATCHED',
      contacted_at = NULL,
      response_notes = 'Proposal prepared and verified. Outbound SMTP transmission unconfirmed (0 dispatched). Held for human review.',
      updated_at = datetime('now')
    WHERE domain IN ('iitm.ac.in', 'home.iitd.ac.in', 'iitb.ac.in', 'iitk.ac.in', 'bits-pilani.ac.in')
  `);
  const tpoResult = tpoUpdateStmt.run();
  console.log(`✓ Reclassified ${tpoResult.changes} institutional proposals to PREPARED_NOT_DISPATCHED.`);

  // 2. Reclassify the 5 B2B directory profiles in b2b_directory_profiles
  db.prepare(`
    UPDATE b2b_directory_profiles SET
      profile_status = 'DOCUMENTS_PENDING_AUTHORISED_REVIEW',
      notes = 'DPIIT statutory recognition on HOLD. Zero sensitive documents uploaded. Staged for authorized manual filing.',
      updated_at = datetime('now')
    WHERE platform_id = 'startup-india'
  `).run();
  console.log(`✓ Reclassified Startup India to DOCUMENTS_PENDING_AUTHORISED_REVIEW (ON HOLD).`);

  db.prepare(`
    UPDATE b2b_directory_profiles SET
      profile_status = 'PROFILE_VERIFICATION_PENDING',
      notes = 'Free basic profile in verification queue. Candidate URL returned HTTP 403 (Cloudflare WAF / uncreated entity route).',
      updated_at = datetime('now')
    WHERE platform_id = 'crunchbase'
  `).run();
  console.log(`✓ Reclassified Crunchbase to PROFILE_VERIFICATION_PENDING.`);

  db.prepare(`
    UPDATE b2b_directory_profiles SET
      profile_status = 'PROFILE_VERIFICATION_PENDING',
      notes = 'Free basic vendor profile in verification queue. Candidate URL returned HTTP 403 (Cloudflare WAF / uncreated vendor route).',
      updated_at = datetime('now')
    WHERE platform_id = 'clutch'
  `).run();
  console.log(`✓ Reclassified Clutch to PROFILE_VERIFICATION_PENDING.`);

  db.prepare(`
    UPDATE b2b_directory_profiles SET
      profile_status = 'PROFILE_PUBLICATION_UNCONFIRMED',
      notes = 'Free catalog listing submitted to editorial queue. Candidate URL returned HTTP 404 (Publication unconfirmed).',
      updated_at = datetime('now')
    WHERE platform_id = 'softwaresuggest'
  `).run();
  console.log(`✓ Reclassified SoftwareSuggest to PROFILE_PUBLICATION_UNCONFIRMED.`);

  db.prepare(`
    UPDATE b2b_directory_profiles SET
      profile_status = 'PROFILE_VERIFICATION_PENDING',
      notes = 'Free community launch in preparation. Candidate URL returned HTTP 403 (WAF / uncreated product slug).',
      updated_at = datetime('now')
    WHERE platform_id = 'producthunt'
  `).run();
  console.log(`✓ Reclassified Product Hunt to PROFILE_VERIFICATION_PENDING.`);

  // 3. Update backlinks candidate rows
  db.prepare(`
    UPDATE backlinks SET
      status = 'PENDING_VERIFICATION',
      notes = 'Candidate URL audited via live HTTP probe. Link to TalentXcel: NOT FOUND.',
      updated_at = datetime('now')
    WHERE is_external = 1
  `).run();
  console.log(`✓ Candidate backlink rows updated.`);

  console.log('🏁 Database reconciliation complete.');
}

if (require.main === module) {
  reconcileMission007();
}

module.exports = { reconcileMission007 };
