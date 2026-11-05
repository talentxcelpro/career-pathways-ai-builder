// backlink-engine/src/scripts/upgradeSchemaMission009.cjs
const Database = require('node:sqlite').DatabaseSync;
const path = require('path');
const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new Database(DB_PATH);

console.log('--- UPGRADING DATABASE SCHEMA FOR TXC-BACKLINK-009 ---');

// 1. Check existing columns in backlinks
const cols = db.prepare('PRAGMA table_info(backlinks)').all().map(c => c.name);

if (!cols.includes('link_category')) {
  db.exec("ALTER TABLE backlinks ADD COLUMN link_category TEXT NOT NULL DEFAULT 'SELF_PUBLISHED_CITATION';");
  console.log('Added column backlinks.link_category');
}

if (!cols.includes('channel')) {
  db.exec("ALTER TABLE backlinks ADD COLUMN channel TEXT NOT NULL DEFAULT 'RESEARCH_CITATIONS';");
  console.log('Added column backlinks.channel');
}

if (!cols.includes('persistence_days')) {
  db.exec("ALTER TABLE backlinks ADD COLUMN persistence_days INTEGER DEFAULT 0;");
  console.log('Added column backlinks.persistence_days');
}

// 2. Explicitly reclassify all existing Rentry backlinks as SELF_PUBLISHED_CITATION
db.exec(`
  UPDATE backlinks SET
    link_category = 'SELF_PUBLISHED_CITATION',
    link_placement = 'OPEN_MARKDOWN_PASTE',
    channel = 'RESEARCH_CITATIONS',
    notes = 'TXC-BACKLINK-009 Reclassified: Self-published markdown citation (rentry.co). NOT an earned editorial endorsement.'
  WHERE referring_domain = 'rentry.co';
`);
console.log('Reclassified all Rentry backlinks as SELF_PUBLISHED_CITATION (0 earned editorial credit).');

// 3. Create table for the 50 Prioritized Cohort Opportunities
db.exec(`
  CREATE TABLE IF NOT EXISTS cohort_50_opportunities (
    id TEXT PRIMARY KEY,
    platform_name TEXT NOT NULL,
    root_domain TEXT NOT NULL,
    channel TEXT NOT NULL, -- EMPLOYER_PARTNERS, COLLEGES_UNIVERSITIES, TRAINING_EDUCATORS, BUSINESS_SAAS_DIRECTORIES, EDITORIAL_CONTRIBUTIONS, RESEARCH_CITATIONS
    category TEXT NOT NULL,
    target_product_or_resource TEXT NOT NULL,
    official_submission_or_contact_url TEXT NOT NULL,
    free_tier_terms TEXT NOT NULL,
    cost_usd REAL DEFAULT 0.0,
    cost_inr REAL DEFAULT 0.0,
    eligibility_requirements TEXT NOT NULL,
    quarantine_or_safeguard_notes TEXT,
    opportunity_status TEXT NOT NULL DEFAULT 'QUALIFIED_STAGED', -- QUALIFIED_STAGED, PROPOSAL_PREPARED, SUBMITTED_PENDING_REVIEW, APPROVED_LIVE, DISQUALIFIED
    disqualification_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_c50_channel ON cohort_50_opportunities(channel);
  CREATE INDEX IF NOT EXISTS idx_c50_status ON cohort_50_opportunities(opportunity_status);
`);
console.log('Created table cohort_50_opportunities.');

// 4. Verify updated backlinks count by category
const breakdown = db.prepare(`
  SELECT 
    link_category,
    COUNT(*) as backlink_count,
    COUNT(DISTINCT referring_domain) as domain_count
  FROM backlinks
  WHERE status = 'LIVE'
  GROUP BY link_category
`).all();

console.log('\nUpdated Live Backlinks Breakdown:');
console.table(breakdown);
