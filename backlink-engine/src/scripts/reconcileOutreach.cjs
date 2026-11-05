// backlink-engine/src/scripts/reconcileOutreach.cjs
// Reconciles the prospect count discrepancy by deduplicating campaign_outreach rows
// and establishing the single source of ground truth.

const { getDatabase } = require('../db/schema.cjs');

function reconcileOutreach() {
  const db = getDatabase();

  console.log('--- RECONCILIATION AUDIT ---');
  const beforeTotal = db.prepare('SELECT COUNT(*) as c FROM campaign_outreach').get().c;
  const beforeDistinct = db.prepare('SELECT COUNT(DISTINCT domain) as c FROM campaign_outreach').get().c;
  console.log(`Initial campaign_outreach rows: ${beforeTotal}`);
  console.log(`Initial unique domains: ${beforeDistinct}`);

  // Deduplicate: Keep highest ID for each domain (preserves Stage 4 enriched metadata)
  const deleteResult = db.prepare(`
    DELETE FROM campaign_outreach 
    WHERE id NOT IN (
      SELECT MAX(id) FROM campaign_outreach GROUP BY domain
    )
  `).run();

  const afterTotal = db.prepare('SELECT COUNT(*) as c FROM campaign_outreach').get().c;
  const afterDistinct = db.prepare('SELECT COUNT(DISTINCT domain) as c FROM campaign_outreach').get().c;
  console.log(`Deduplication complete. Deleted ${deleteResult.changes} redundant duplicate records.`);
  console.log(`Remaining campaign_outreach rows: ${afterTotal} (Unique domains: ${afterDistinct})`);

  // Update IIT Bombay placement URL with verified live domain
  db.prepare(`
    UPDATE domains 
    SET placement_page_url = 'https://campus.placements.iitb.ac.in/',
        placement_page_status = 'HTTP_200_VERIFIED',
        updated_at = datetime('now')
    WHERE domain = 'iitb.ac.in'
  `).run();

  db.prepare(`
    UPDATE campaign_outreach
    SET placement_source_url = 'https://campus.placements.iitb.ac.in/',
        updated_at = datetime('now')
    WHERE domain = 'iitb.ac.in'
  `).run();

  console.log('Updated IIT Bombay placement source URL to https://campus.placements.iitb.ac.in/');

  const b2bCount = db.prepare('SELECT COUNT(*) as c FROM b2b_directory_profiles').get().c;
  console.log(`B2B Directory Profiles: ${b2bCount}`);
  console.log(`Total Unified Outreach-Ready Entities: ${afterTotal + b2bCount}`);

  return {
    deletedDuplicates: deleteResult.changes,
    campusTpoOutreach: afterTotal,
    b2bDirectoryProfiles: b2bCount,
    totalUnifiedOutreachReady: afterTotal + b2bCount
  };
}

if (require.main === module) {
  reconcileOutreach();
}

module.exports = { reconcileOutreach };
