// backlink-engine/src/scripts/setupBatch2Prospects.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

// 1. Create batch2_prospects table with exact specified schema
db.exec(`
  CREATE TABLE IF NOT EXISTS batch2_prospects (
    prospect_id TEXT PRIMARY KEY,
    platform_name TEXT NOT NULL,
    root_domain TEXT UNIQUE NOT NULL,
    official_submission_url TEXT NOT NULL,
    category TEXT NOT NULL,
    product_fit TEXT NOT NULL,
    free_tier_status TEXT NOT NULL, -- e.g. GENUINE_FREE, CONDITIONAL_FREE, PAID_ONLY, UNKNOWN
    fee_amount TEXT NOT NULL DEFAULT '₹0',
    reciprocal_requirement TEXT NOT NULL DEFAULT 'NONE', -- NONE, BADGE_REQUIRED, BACKLINK_REQUIRED
    account_requirement TEXT NOT NULL DEFAULT 'NONE', -- NONE, EMAIL_VERIFICATION, OAUTH_REQUIRED, ACCOUNT_REQUIRED
    submission_method TEXT NOT NULL, -- WEB_FORM, EMAIL, API, GITHUB_PR, MANUAL_ACCOUNT
    eligibility TEXT NOT NULL,
    target_url TEXT NOT NULL,
    submission_status TEXT NOT NULL DEFAULT 'RESEARCHED',
    submitted_at TEXT,
    confirmation_evidence TEXT,
    public_listing_url TEXT,
    backlink_status TEXT NOT NULL DEFAULT 'NO_BACKLINK',
    HTTP_status INTEGER,
    rel_attribute TEXT,
    anchor_text TEXT,
    last_verified_at TEXT,
    verification_evidence TEXT,
    next_action TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

console.log('batch2_prospects table created/verified.');

// Check for existing records in acquisition_targets
const existingTargets = db.prepare('SELECT root_domain, platform_name FROM acquisition_targets').all();
const targetMap = new Map();
existingTargets.forEach(t => targetMap.set(t.root_domain.toLowerCase(), t.platform_name));

console.log(`Existing acquisition_targets: ${existingTargets.length} domains`);

// List of Batch 2 candidates
const rawCandidates = [
  { name: 'Ignlab Launch', domainInput: 'launch.ignlab.net', subUrl: 'https://launch.ignlab.net/', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'Maybe Labs', domainInput: 'maybelabs.ai', subUrl: 'https://maybelabs.ai/launch', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'CodeHype', domainInput: 'codehype.in', subUrl: 'https://www.codehype.in/submit-saas', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner / Career OS' },
  { name: 'Upfynd', domainInput: 'upfynd.com', subUrl: 'https://upfynd.com/submit', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'SupaHunt', domainInput: 'supahunt.com', subUrl: 'https://www.supahunt.com/submit', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'The Tool Directory', domainInput: 'thetooldirectory.com', subUrl: 'https://thetooldirectory.com/submit-a-tool/', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'Linkrena', domainInput: 'linkrena.com', subUrl: 'https://linkrena.com/', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'Makeroo', domainInput: 'makeroo.app', subUrl: 'https://makeroo.app/submit', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: '10015 Product Finder', domainInput: '10015.io', subUrl: 'https://10015.io/product-finder/submit', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'Hype Star', domainInput: 'hypestar.org', subUrl: 'https://hypestar.org/submit', cat: 'Product & SaaS Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'AppsGit', domainInput: 'appsgit.com', subUrl: 'https://appsgit.com/submit', cat: 'Open-Source & Developer Ecosystem', fit: 'ATS Resume Parser Core Open-Source' },
  { name: 'FindOpenSource.dev', domainInput: 'findopensource.dev', subUrl: 'https://findopensource.dev/submit', cat: 'Open-Source & Developer Ecosystem', fit: 'ATS Resume Parser Core Open-Source' },
  { name: 'LibHunt', domainInput: 'libhunt.com', subUrl: 'https://www.libhunt.com/', cat: 'Open-Source & Developer Ecosystem', fit: 'ATS Resume Parser Core Open-Source' },
  { name: 'TeaserTrack', domainInput: 'teasertrack.cc', subUrl: 'https://teasertrack.cc/submit', cat: 'Open-Source & Developer Ecosystem', fit: 'ATS Resume Diagnostic Developer Tool' },
  { name: 'JevList', domainInput: 'jevlist.ai', subUrl: 'https://jevlist.ai/submit', cat: 'Open-Source & Developer Ecosystem', fit: 'ATS Resume Diagnostic Developer Tool' },
  { name: 'Ventmark', domainInput: 'useventmark.com', subUrl: 'https://useventmark.com/', cat: 'India-First Startup Discovery', fit: 'TalentXcel Company Profile' },
  { name: 'Central India Tech', domainInput: 'centralindiatech.com', subUrl: 'https://centralindiatech.com/submit', cat: 'India-First Startup Discovery', fit: 'TalentXcel Company Profile' },
  { name: 'LaunchPad India', domainInput: 'launchpadindia.in', subUrl: 'https://launchpadindia.in/', cat: 'India-First Startup Discovery', fit: 'TalentXcel Company Profile' },
  { name: 'Index by Dodo Payments', domainInput: 'index.dodopayments.com', subUrl: 'https://index.dodopayments.com/', cat: 'Product & SaaS Directory', fit: 'TalentXcel Career OS' },
  { name: 'Bootstrap Directory', domainInput: 'bootstrapdirectory.com', subUrl: 'https://bootstrapdirectory.com/submit', cat: 'Startup Discovery', fit: 'TalentXcel Company Profile' },
  { name: 'Altern', domainInput: 'altern.to', subUrl: 'https://altern.to/', cat: 'Software & Alternative Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'SaaSpa.ge', domainInput: 'saaspa.ge', subUrl: 'https://saaspa.ge/', cat: 'SaaS Launch Directory', fit: 'TalentXcel Career OS' },
  { name: 'PeerPush', domainInput: 'peerpush.net', subUrl: 'https://peerpush.net/', cat: 'Community Launch Discovery', fit: 'TalentXcel Career OS' },
  { name: 'HUNT0', domainInput: 'hunt0.com', subUrl: 'https://hunt0.com/', cat: 'Product Launch Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'BetaPage', domainInput: 'betapage.co', subUrl: 'https://betapage.co/', cat: 'Startup & Product Discovery', fit: 'TalentXcel Career OS' },
  { name: 'Open Startup List', domainInput: 'openstartuplist.com', subUrl: 'https://openstartuplist.com/', cat: 'Startup Discovery', fit: 'TalentXcel Company Profile' },
  { name: 'AppaList', domainInput: 'appalist.com', subUrl: 'https://appalist.com/', cat: 'App & Software Directory', fit: 'ATS Resume Diagnostic Scanner' },
  { name: 'BuildHop', domainInput: 'buildhop.com', subUrl: 'https://buildhop.com/', cat: 'Product Launch Discovery', fit: 'TalentXcel Career OS' },
  { name: 'LaunchDirectories', domainInput: 'launchdirectories.com', subUrl: 'https://launchdirectories.com/', cat: 'Directory & Startup List', fit: 'TalentXcel Career OS' },
  { name: 'Ramen.Tools', domainInput: 'ramen.tools', subUrl: 'https://ramen.tools/', cat: 'Product & Tool Discovery', fit: 'ATS Resume Diagnostic Scanner' }
];

console.log(`Checking ${rawCandidates.length} candidate domains against existing targets...`);
rawCandidates.forEach(c => {
  // normalize root domain
  let root = c.domainInput.toLowerCase();
  if (root.includes('.')) {
    const parts = root.split('.');
    if (parts.length > 2 && !['co.in', 'net.in', 'org.in', 'ac.in', 'gov.in'].includes(parts.slice(-2).join('.'))) {
      root = parts.slice(-2).join('.');
    }
  }
  if (targetMap.has(root)) {
    console.log(`[DUPLICATE MATCH] ${c.name} (${root}) already exists in acquisition_targets as: ${targetMap.get(root)}`);
  }
});
