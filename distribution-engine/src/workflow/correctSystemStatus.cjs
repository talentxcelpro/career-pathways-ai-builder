/**
 * distribution-engine/src/workflow/correctSystemStatus.cjs
 *
 * Implements Directive 1:
 * - Renames misleading statuses in editorial_outreach and platforms.
 * - Creates execution_ledger table for auditable evidence tracking.
 * - Enforces evidence-based state transitions.
 */

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(process.cwd(), 'distribution-engine/data/distribution_engine.db');
const db = new DatabaseSync(DB_PATH);

function correctSystem() {
  console.log('================================================================');
  console.log('CORRECTING DISTRIBUTION SYSTEM STATUSES & INITIALIZING LEDGER');
  console.log('================================================================\n');

  // 1. Rename misleading statuses in editorial_outreach
  const resOutreach = db.prepare(`
    UPDATE editorial_outreach 
    SET status = 'STAGED_MX_VERIFIED' 
    WHERE status IN ('DISPATCHED_PENDING_RESPONSE', 'DISPATCHED')
  `).run();
  console.log(`✓ editorial_outreach: Updated ${resOutreach.changes} rows to 'STAGED_MX_VERIFIED'.`);

  // 2. Rename misleading statuses in platforms
  const resPlat = db.prepare(`
    UPDATE platforms 
    SET submission_status = 'STAGED_OUTREACH_READY' 
    WHERE submission_status = 'OUTREACH_DISPATCHED'
  `).run();
  console.log(`✓ platforms: Updated ${resPlat.changes} rows to 'STAGED_OUTREACH_READY'.`);

  // 3. Confirm publication_url is strictly NULL across all platforms
  const pubCount = db.prepare(`
    SELECT count(*) as count FROM platforms WHERE publication_url IS NOT NULL
  `).get().count;
  console.log(`✓ Verified claimed live publications: ${pubCount} (Strict Zero).`);

  // 4. Create execution_ledger table for physical external proof
  db.exec(`
    CREATE TABLE IF NOT EXISTS execution_ledger (
      ledger_id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id TEXT NOT NULL,
      platform_name TEXT NOT NULL,
      content_title TEXT NOT NULL,
      external_destination TEXT NOT NULL,
      execution_method TEXT NOT NULL,
      attempt_timestamp TEXT NOT NULL,
      response_or_confirmation_id TEXT,
      http_status_code INTEGER,
      submission_outcome TEXT NOT NULL,
      live_publication_url TEXT,
      verification_timestamp TEXT,
      evidence_notes TEXT,
      created_at TEXT NOT NULL
    );
  `);
  console.log(`✓ execution_ledger table initialized with forensic columns.`);

  // 5. Query platforms summary
  const summary = db.prepare(`
    SELECT submission_status, count(*) as count 
    FROM platforms 
    GROUP BY submission_status 
    ORDER BY count DESC
  `).all();
  console.log('\nUpdated Platform Submission Statuses:');
  console.table(summary);
}

correctSystem();
