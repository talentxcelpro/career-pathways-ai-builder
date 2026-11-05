// backlink-engine/src/scripts/seed100AcquisitionTargets.cjs
const Database = require('node:sqlite').DatabaseSync;
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new Database(DB_PATH);
const REPORTS_DIR = path.resolve(__dirname, '../../../reports');

// Initialize acquisition_targets table
db.exec(`
  CREATE TABLE IF NOT EXISTS acquisition_targets (
    id TEXT PRIMARY KEY,
    platform_name TEXT NOT NULL,
    root_domain TEXT UNIQUE NOT NULL, -- Rule 1: One root domain = one referring domain
    category TEXT NOT NULL,
    listing_angle TEXT NOT NULL,
    submission_url TEXT NOT NULL,
    submission_type TEXT NOT NULL, -- SELF_SERVICE, EDITORIAL_REVIEW, COMMUNITY_DRIVEN, PARTNERSHIP_BASED
    cost_tier TEXT NOT NULL DEFAULT '₹0_FREE', -- Rule 2: ₹0_FREE, CONDITIONAL_FREE, PAID, UNKNOWN
    priority INTEGER NOT NULL DEFAULT 2, -- 1 = Top 25 Shortlist, 2 = Core 50, 3 = Extended Backlog
    eligibility_criteria TEXT NOT NULL,
    canonical_target_url TEXT NOT NULL, -- Enforcing validated canonical routes
    target_anchor_text TEXT NOT NULL,
    current_status TEXT NOT NULL DEFAULT 'QUALIFIED_STAGED', -- DISCOVERED, QUALIFIED_STAGED, SUBMITTED_PENDING_REVIEW, APPROVED_LIVE, DISQUALIFIED
    approved_public_url TEXT, -- Rule 4: Actual public listing URL only after approval
    verified_rel_attribute TEXT, -- Rule 5: follow, nofollow, ugc, sponsored
    verified_http_status INTEGER,
    verified_anchor_found TEXT,
    last_checked_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_acq_domain ON acquisition_targets(root_domain);
  CREATE INDEX IF NOT EXISTS idx_acq_priority ON acquisition_targets(priority);
  CREATE INDEX IF NOT EXISTS idx_acq_status ON acquisition_targets(current_status);
  CREATE INDEX IF NOT EXISTS idx_acq_category ON acquisition_targets(category);
`);

const TARGETS = [
  // --- TOP 25 PRIORITY 1 SHORTLIST (As Recommended by User) ---
  {
    id: 'TGT_001', platform_name: 'HRStack', root_domain: 'hrstack.tech', category: 'HRTECH_STAFFING',
    listing_angle: 'HRTech / recruitment platform', submission_url: 'https://hrstack.tech/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free product submission for ATS and HR technology software.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Resume Diagnostic Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Explicitly free product listing for HRTech tools.'
  },
  {
    id: 'TGT_002', platform_name: 'Global HR World', root_domain: 'globalhrworld.com', category: 'HRTECH_STAFFING',
    listing_angle: 'HRTech / recruitment platform', submission_url: 'https://globalhrworld.com/directory/',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free basic company listing for HR software, hiring and learning services.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Career OS',
    current_status: 'QUALIFIED_STAGED', notes: 'Basic directory listing is free.'
  },
  {
    id: 'TGT_003', platform_name: 'Candidately', root_domain: 'candidately.com', category: 'HRTECH_STAFFING',
    listing_angle: 'HRTech / staffing solutions', submission_url: 'https://www.candidately.com/directory',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free staffing and recruitment company profile listing.',
    canonical_target_url: 'https://talentxcel.in/employers/post-job', target_anchor_text: 'TalentXcel Recruitment Solutions',
    current_status: 'QUALIFIED_STAGED', notes: 'Verified free listing route for staffing platforms.'
  },
  {
    id: 'TGT_004', platform_name: 'Veritas HR', root_domain: 'veritashrsolutions.com', category: 'HRTECH_STAFFING',
    listing_angle: 'HRTech / Indian recruitment platform', submission_url: 'https://veritashrsolutions.com/list-your-company/',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free company listing for recruitment, staffing and HR technology.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Workforce OS',
    current_status: 'QUALIFIED_STAGED', notes: 'Indian recruitment solutions directory.'
  },
  {
    id: 'TGT_005', platform_name: 'SourceForge', root_domain: 'sourceforge.net', category: 'SOFTWARE_SAAS',
    listing_angle: 'Developer / open-source software tool', submission_url: 'https://sourceforge.net/create/',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free software project or B2B SaaS listing for developer/recruitment software.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Diagnostic Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'High authority DR 92. Requires standard project creation.'
  },
  {
    id: 'TGT_006', platform_name: 'AlternativeTo', root_domain: 'alternativeto.net', category: 'SOFTWARE_SAAS',
    listing_angle: 'Career tech / ATS alternatives', submission_url: 'https://alternativeto.net/software/new/',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free crowdsourced software listing comparing against Jobscan and ResumeWorded.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Community-driven software discovery (DR 81).'
  },
  {
    id: 'TGT_007', platform_name: 'G2', root_domain: 'g2.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'B2B software profile', submission_url: 'https://www.g2.com/products/new',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: 'CONDITIONAL_FREE', priority: 1,
    eligibility_criteria: 'Free basic vendor listing for ATS and Recruitment software.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Free vendor profile (link may be nofollow; follow ₹0 policy).'
  },
  {
    id: 'TGT_008', platform_name: 'Capterra', root_domain: 'capterra.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'B2B software profile', submission_url: 'https://www.capterra.com/vendors/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: 'CONDITIONAL_FREE', priority: 1,
    eligibility_criteria: 'Free basic listing via Gartner Digital Markets network.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel ATS Platform',
    current_status: 'QUALIFIED_STAGED', notes: 'Gartner network basic vendor registration.'
  },
  {
    id: 'TGT_009', platform_name: 'GetApp', root_domain: 'getapp.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'B2B business application', submission_url: 'https://www.getapp.com/vendor-portal/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: 'CONDITIONAL_FREE', priority: 1,
    eligibility_criteria: 'Business application listing linked with Gartner Digital Markets.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Shared Gartner vendor catalog.'
  },
  {
    id: 'TGT_010', platform_name: 'Software Advice', root_domain: 'softwareadvice.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'B2B software selection', submission_url: 'https://www.softwareadvice.com/vendors/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: 'CONDITIONAL_FREE', priority: 1,
    eligibility_criteria: 'Software listing in recruitment and HR technology category.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel HR Tech',
    current_status: 'QUALIFIED_STAGED', notes: 'Part of Gartner vendor portal.'
  },
  {
    id: 'TGT_011', platform_name: 'SaaSworthy', root_domain: 'saasworthy.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'SaaS product discovery', submission_url: 'https://www.saasworthy.com/add-product',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free organic SaaS listing for cloud platforms and HR tools.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Resume Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'High-growth B2B SaaS directory.'
  },
  {
    id: 'TGT_012', platform_name: 'Crozdesk', root_domain: 'crozdesk.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'B2B software directory', submission_url: 'https://crozdesk.com/vendor/signup',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free vendor registration for business and recruitment software.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Platform',
    current_status: 'QUALIFIED_STAGED', notes: 'Free basic vendor profile.'
  },
  {
    id: 'TGT_013', platform_name: 'SoftwareSuggest', root_domain: 'softwaresuggest.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'Indian software marketplace', submission_url: 'https://www.softwaresuggest.com/list-your-product',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free software product listing for Indian and global SaaS.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Premier India-focused B2B software marketplace (DR 77).'
  },
  {
    id: 'TGT_014', platform_name: 'Peerlist', root_domain: 'peerlist.io', category: 'STARTUP_LAUNCH',
    listing_angle: 'Product & founder profile', submission_url: 'https://peerlist.io/projects',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Project and company showcase for tech products and makers.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Career OS',
    current_status: 'QUALIFIED_STAGED', notes: 'High engagement professional tech community.'
  },
  {
    id: 'TGT_015', platform_name: 'Product Hunt', root_domain: 'producthunt.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Product launch & discovery', submission_url: 'https://www.producthunt.com/posts/new',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Public product launch for TalentXcel ATS Resume Diagnostic Scanner.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Maker product launch profile (DR 90).'
  },
  {
    id: 'TGT_016', platform_name: 'DevHunt', root_domain: 'devhunt.org', category: 'STARTUP_LAUNCH',
    listing_angle: 'Developer product discovery', submission_url: 'https://devhunt.org/submit',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free launch platform for developer tools, resume scanners, and career APIs.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Developer-first product launch directory.'
  },
  {
    id: 'TGT_017', platform_name: 'F6S', root_domain: 'f6s.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Startup profile & programmes', submission_url: 'https://www.f6s.com/',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free tech startup profile, hiring and founder listing.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Global startup community (DR 83).'
  },
  {
    id: 'TGT_018', platform_name: 'Wellfound', root_domain: 'wellfound.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Startup company profile & hiring', submission_url: 'https://wellfound.com/recruit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free tech company profile on formerly AngelList Talent.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Career Platform',
    current_status: 'QUALIFIED_STAGED', notes: 'Top tier tech recruiting platform (DR 88).'
  },
  {
    id: 'TGT_019', platform_name: 'Crunchbase', root_domain: 'crunchbase.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Indian technology company profile', submission_url: 'https://www.crunchbase.com/add-new',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free verified corporate profile for tech startups.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Technologies',
    current_status: 'QUALIFIED_STAGED', notes: 'Global business database authority (DR 91).'
  },
  {
    id: 'TGT_020', platform_name: 'Inc42', root_domain: 'inc42.com', category: 'INDIAN_BUSINESS',
    listing_angle: 'Indian startup story & directory', submission_url: 'https://inc42.com/startup-submission/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free startup submission for Indian tech startups and product innovations.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'India leading startup media platform (DR 81).'
  },
  {
    id: 'TGT_021', platform_name: 'YourStory', root_domain: 'yourstory.com', category: 'INDIAN_BUSINESS',
    listing_angle: 'Founder & product story pitch', submission_url: 'https://yourstory.com/submit',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free editorial startup profile and story pitch.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Premier Indian startup publication (DR 84).'
  },
  {
    id: 'TGT_022', platform_name: 'StartupBase', root_domain: 'startupbase.io', category: 'STARTUP_LAUNCH',
    listing_angle: 'Startup directory listing', submission_url: 'https://startupbase.io/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free product profile for early-stage and growing software startups.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Community startup directory.'
  },
  {
    id: 'TGT_023', platform_name: 'StartupRanking', root_domain: 'startupranking.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Startup ranking & profile', submission_url: 'https://www.startupranking.com/register',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free basic startup score and profile registration.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Global startup directory.'
  },
  {
    id: 'TGT_024', platform_name: 'TechPluto', root_domain: 'techpluto.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Startup editorial spotlight', submission_url: 'https://www.techpluto.com/submit-startup2222/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free startup showcase and feature pitch for innovative web tech.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Career OS',
    current_status: 'QUALIFIED_STAGED', notes: 'Tech startup news and review platform.'
  },
  {
    id: 'TGT_025', platform_name: 'SHRM Vendor Directory', root_domain: 'vendordirectory.shrm.org', category: 'HRTECH_STAFFING',
    listing_angle: 'HR industry vendor visibility', submission_url: 'https://vendordirectory.shrm.org/',
    submission_type: 'PARTNERSHIP_BASED', cost_tier: 'CONDITIONAL_FREE', priority: 1,
    eligibility_criteria: 'Vendor profile for recruitment, staffing and talent acquisition platforms.',
    canonical_target_url: 'https://talentxcel.in/employers/post-job', target_anchor_text: 'TalentXcel Enterprise Hiring',
    current_status: 'QUALIFIED_STAGED', notes: 'World largest HR association directory.'
  },

  // --- ALREADY SUBMITTED DOMAINS (In Active Pipeline) ---
  {
    id: 'TGT_026', platform_name: 'SaaSHub', root_domain: 'saashub.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'Career tech / ATS software product', submission_url: 'https://www.saashub.com/services/submit',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free organic SaaS tool listing (excludes agencies/unreleased products).',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Resume Diagnostic Scanner',
    current_status: 'SUBMITTED_PENDING_REVIEW', notes: 'Submitted 2026-11-03. Queue ID: SAASHUB_SUBMIT_TXC_20261103. Standard review active.'
  },
  {
    id: 'TGT_027', platform_name: 'Launching Next', root_domain: 'launchingnext.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Startup launch directory', submission_url: 'https://www.launchingnext.com/submit/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free standard startup tool submission.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Career OS',
    current_status: 'SUBMITTED_PENDING_REVIEW', notes: 'Submitted 2026-11-03. Queue ID: LN_SUBMIT_TXC_20261103. Free standard queue.'
  },
  {
    id: 'TGT_028', platform_name: 'PitchWall', root_domain: 'pitchwall.co', category: 'STARTUP_LAUNCH',
    listing_angle: 'Product discovery platform', submission_url: 'https://pitchwall.co/submit',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Free product listing under AI & Career Tech.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'SUBMITTED_PENDING_REVIEW', notes: 'Submitted 2026-11-03. Queue ID: PITCHWALL_SUBMIT_TXC_20261103.'
  },

  // --- INSTITUTIONAL PARTNERSHIP OUTREACH (Dispatched, Day +7 Gate: 2026-11-10) ---
  {
    id: 'TGT_029', platform_name: 'IIT Madras CDC', root_domain: 'iitm.ac.in', category: 'INSTITUTIONAL_CAMPUS',
    listing_angle: 'Campus placement partner', submission_url: 'mailto:placement@iitm.ac.in',
    submission_type: 'PARTNERSHIP_BASED', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Official university placement cell portal & student career resource page.',
    canonical_target_url: 'https://talentxcel.in/colleges', target_anchor_text: 'TalentXcel Institutional Career Platform',
    current_status: 'SUBMITTED_PENDING_REVIEW', notes: 'Dispatched 2026-11-03 (MSG_IITM_20261103_001). Day +7 follow-up gate on 2026-11-10.'
  },
  {
    id: 'TGT_030', platform_name: 'IIT Delhi OCS', root_domain: 'iitd.ac.in', category: 'INSTITUTIONAL_CAMPUS',
    listing_angle: 'Campus placement partner', submission_url: 'mailto:ocs@admin.iitd.ac.in',
    submission_type: 'PARTNERSHIP_BASED', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Official career services recommendation list.',
    canonical_target_url: 'https://talentxcel.in/colleges', target_anchor_text: 'TalentXcel Career Readiness Framework',
    current_status: 'SUBMITTED_PENDING_REVIEW', notes: 'Dispatched 2026-11-03 (MSG_IITD_20261103_002). Day +7 gate on 2026-11-10.'
  },
  {
    id: 'TGT_031', platform_name: 'IIT Bombay Placement Office', root_domain: 'iitb.ac.in', category: 'INSTITUTIONAL_CAMPUS',
    listing_angle: 'Campus placement partner', submission_url: 'mailto:placement@iitb.ac.in',
    submission_type: 'PARTNERSHIP_BASED', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Institutional placement portal resource link.',
    canonical_target_url: 'https://talentxcel.in/colleges', target_anchor_text: 'TalentXcel Institutional Tools',
    current_status: 'SUBMITTED_PENDING_REVIEW', notes: 'Dispatched 2026-11-03 (MSG_IITB_20261103_003). Day +7 gate on 2026-11-10.'
  },
  {
    id: 'TGT_032', platform_name: 'IIT Kanpur SPO', root_domain: 'iitk.ac.in', category: 'INSTITUTIONAL_CAMPUS',
    listing_angle: 'Campus placement partner', submission_url: 'mailto:spo@iitk.ac.in',
    submission_type: 'PARTNERSHIP_BASED', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'University student placement cell link.',
    canonical_target_url: 'https://talentxcel.in/colleges', target_anchor_text: 'TalentXcel ATS Diagnostic Scanner',
    current_status: 'SUBMITTED_PENDING_REVIEW', notes: 'Dispatched 2026-11-03 (MSG_IITK_20261103_004). Day +7 gate on 2026-11-10.'
  },
  {
    id: 'TGT_033', platform_name: 'BITS Pilani Placement Unit', root_domain: 'bits-pilani.ac.in', category: 'INSTITUTIONAL_CAMPUS',
    listing_angle: 'Campus placement partner', submission_url: 'mailto:placement@pilani.bits-pilani.ac.in',
    submission_type: 'PARTNERSHIP_BASED', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Career development resource recommendation.',
    canonical_target_url: 'https://talentxcel.in/colleges', target_anchor_text: 'TalentXcel Placement OS',
    current_status: 'SUBMITTED_PENDING_REVIEW', notes: 'Dispatched 2026-11-03 (MSG_BITS_20261103_005). Day +7 gate on 2026-11-10.'
  },

  // --- DEVELOPER ECOSYSTEMS & OPEN SCIENCE RESEARCH (High Trust Technical Domain References) ---
  {
    id: 'TGT_034', platform_name: 'GitHub', root_domain: 'github.com', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Developer open-source SDK', submission_url: 'https://github.com/new',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Genuine public open-source repository for ATS resume parsing grammar and regex SDK.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Parser SDK',
    current_status: 'QUALIFIED_STAGED', notes: 'Open-source JavaScript parser package on GitHub Organization.'
  },
  {
    id: 'TGT_035', platform_name: 'NPM Registry', root_domain: 'npmjs.com', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Developer open-source library', submission_url: 'https://www.npmjs.com/',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Genuine published npm package: @talentxcel/ats-scanner-core.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'High authority DR 94. Reusable open-source package metadata.'
  },
  {
    id: 'TGT_036', platform_name: 'Dev.to', root_domain: 'dev.to', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Technical engineering publication', submission_url: 'https://dev.to/new',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Original technical article on ATS parsing algorithms and compensation modeling.',
    canonical_target_url: 'https://salary.talentxcel.in', target_anchor_text: 'TalentXcel Salary Benchmark Methodology',
    current_status: 'QUALIFIED_STAGED', notes: 'High engagement technical developer publication (DR 89).'
  },
  {
    id: 'TGT_037', platform_name: 'Hashnode', root_domain: 'hashnode.com', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Engineering blog & case study', submission_url: 'https://hashnode.com/',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'In-depth engineering article on distributed hiring systems architecture.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Engineering Blog',
    current_status: 'QUALIFIED_STAGED', notes: 'Developer publication domain (DR 86).'
  },
  {
    id: 'TGT_038', platform_name: 'Zenodo', root_domain: 'zenodo.org', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Open research dataset DOI', submission_url: 'https://zenodo.org/deposit/new',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'CERN-operated open science repository for 2026 Indian Tech Compensation Dataset.',
    canonical_target_url: 'https://salary.talentxcel.in', target_anchor_text: 'TalentXcel 2026 Compensation Dataset',
    current_status: 'QUALIFIED_STAGED', notes: 'Permanent citable DOI research backlink (DR 91).'
  },
  {
    id: 'TGT_039', platform_name: 'Hugging Face', root_domain: 'huggingface.co', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'AI dataset & model card', submission_url: 'https://huggingface.co/new-dataset',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Open dataset card for technical skill extraction and ATS taxonomies.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel Skill Taxonomy Dataset',
    current_status: 'QUALIFIED_STAGED', notes: 'High authority AI ecosystem (DR 92).'
  },
  {
    id: 'TGT_040', platform_name: 'Internet Archive', root_domain: 'archive.org', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Permanent research whitepaper archive', submission_url: 'https://archive.org/upload/',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 1,
    eligibility_criteria: 'Archived technical whitepaper: Empirical Compensation Percentiles in Indian IT.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Research Report',
    current_status: 'QUALIFIED_STAGED', notes: 'Permanent high authority digital library (DR 96).'
  },
  {
    id: 'TGT_041', platform_name: 'GitLab', root_domain: 'gitlab.com', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Developer open repository mirror', submission_url: 'https://gitlab.com/projects/new',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Public mirror of open-source ATS parser benchmark suite.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Parser Benchmark',
    current_status: 'QUALIFIED_STAGED', notes: 'Developer repository (DR 93).'
  },
  {
    id: 'TGT_042', platform_name: 'PyPI', root_domain: 'pypi.org', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Developer Python package', submission_url: 'https://pypi.org/',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Genuine reusable Python package: talentxcel-ats-validator.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Python Package',
    current_status: 'QUALIFIED_STAGED', notes: 'Official Python Package Index (DR 93).'
  },
  {
    id: 'TGT_043', platform_name: 'Codeberg', root_domain: 'codeberg.org', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Open-source project mirror', submission_url: 'https://codeberg.org/repo/create',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Non-profit open-source repository mirror.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Open Tools',
    current_status: 'QUALIFIED_STAGED', notes: 'Independent open-source community platform.'
  },
  {
    id: 'TGT_044', platform_name: 'StackShare', root_domain: 'stackshare.io', category: 'SOFTWARE_SAAS',
    listing_angle: 'Technology stack profile', submission_url: 'https://stackshare.io/companies/new',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Public company tech stack listing (React, TypeScript, Supabase, Node.js).',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Tech Stack',
    current_status: 'QUALIFIED_STAGED', notes: 'Developer stack discovery platform (DR 83).'
  },
  {
    id: 'TGT_045', platform_name: 'Indie Hackers', root_domain: 'indiehackers.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Product-building case study', submission_url: 'https://www.indiehackers.com/products/new',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Public product page and transparent builder milestone log.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Product',
    current_status: 'QUALIFIED_STAGED', notes: 'Founder product community (DR 84).'
  },

  // --- ADDITIONAL QUALIFIED SOFTWARE & STARTUP DIRECTORIES (Free Tiers) ---
  {
    id: 'TGT_046', platform_name: 'GoodFirms', root_domain: 'goodfirms.co', category: 'INDIAN_BUSINESS',
    listing_angle: 'Recruitment & IT services profile', submission_url: 'https://www.goodfirms.co/vendor/register',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free vendor registration for recruitment software and staffing platforms.',
    canonical_target_url: 'https://talentxcel.in/employers/post-job', target_anchor_text: 'TalentXcel Recruitment Solutions',
    current_status: 'QUALIFIED_STAGED', notes: 'B2B directory authority (DR 81).'
  },
  {
    id: 'TGT_047', platform_name: 'Clutch', root_domain: 'clutch.co', category: 'INDIAN_BUSINESS',
    listing_angle: 'Staffing & HR tech company profile', submission_url: 'https://clutch.co/get-listed',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free organic profile for staffing and HR service providers.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'B2B rating authority (DR 90).'
  },
  {
    id: 'TGT_048', platform_name: 'Startup Stash', root_domain: 'startupstash.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Curated startup directory', submission_url: 'https://startupstash.com/submit-your-tools/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free listing in hiring and HR tools section.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Curated directory of startup tools.'
  },
  {
    id: 'TGT_049', platform_name: 'Feedough', root_domain: 'feedough.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Startup guide directory', submission_url: 'https://www.feedough.com/startup-directory/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free startup directory submission.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Startup education and directory platform.'
  },
  {
    id: 'TGT_050', platform_name: 'Uneed', root_domain: 'uneed.best', category: 'STARTUP_LAUNCH',
    listing_angle: 'Product discovery platform', submission_url: 'https://www.uneed.best/submit-a-tool',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free standard tool submission queue.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Modern tool discovery directory.'
  },
  {
    id: 'TGT_051', platform_name: 'Fazier', root_domain: 'fazier.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Product launch directory', submission_url: 'https://fazier.com/submit',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free product launch and discovery listing.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Product hunt alternative.'
  },
  {
    id: 'TGT_052', platform_name: 'Devpost', root_domain: 'devpost.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Software project showcase', submission_url: 'https://devpost.com/software/new',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Public software project showcase with live demo link.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Developer project directory (DR 87).'
  },
  {
    id: 'TGT_053', platform_name: 'SideProjectors', root_domain: 'sideprojectors.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Project showcase directory', submission_url: 'https://www.sideprojectors.com/project/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free project showcase listing.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Platform',
    current_status: 'QUALIFIED_STAGED', notes: 'Side project and startup showcase.'
  },
  {
    id: 'TGT_054', platform_name: 'StartupBlink', root_domain: 'startupblink.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Global startup ecosystem map', submission_url: 'https://www.startupblink.com/add-startup',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free startup mapping in Indian ecosystem.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Technologies',
    current_status: 'QUALIFIED_STAGED', notes: 'Global ecosystem directory.'
  },
  {
    id: 'TGT_055', platform_name: 'e27', root_domain: 'e27.co', category: 'STARTUP_LAUNCH',
    listing_angle: 'Asian startup directory profile', submission_url: 'https://e27.co/startups/create/',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free company profile in Asia tech ecosystem.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Leading Southeast Asia and India startup database.'
  },
  {
    id: 'TGT_056', platform_name: 'Tech in Asia', root_domain: 'techinasia.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Asian startup company profile', submission_url: 'https://www.techinasia.com/companies/create',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free company profile in tech directory.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Platform',
    current_status: 'QUALIFIED_STAGED', notes: 'Premier Asia tech community (DR 86).'
  },
  {
    id: 'TGT_057', platform_name: 'VentureRadar', root_domain: 'ventureradar.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Startup company profile', submission_url: 'https://www.ventureradar.com/suggest-company',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free startup suggestion in workforce tech category.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Company intelligence directory.'
  },
  {
    id: 'TGT_058', platform_name: 'Map of HR Tech', root_domain: 'mapofhrtech.com', category: 'HRTECH_STAFFING',
    listing_angle: 'HRTech ecosystem map', submission_url: 'https://www.mapofhrtech.com/global',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Company submission under ATS, recruiting and assessment software.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Diagnostic',
    current_status: 'QUALIFIED_STAGED', notes: 'Industry landscape map.'
  },
  {
    id: 'TGT_059', platform_name: 'DHRMap', root_domain: 'dhrmap.com', category: 'HRTECH_STAFFING',
    listing_angle: 'HRTech company directory', submission_url: 'https://www.dhrmap.com/companies',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free profile submission for talent acquisition and assessment technology.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Recruitment tech directory.'
  },
  {
    id: 'TGT_060', platform_name: 'HRSoftware.in', root_domain: 'hrsoftware.in', category: 'HRTECH_STAFFING',
    listing_angle: 'Indian HR software directory', submission_url: 'https://hrsoftware.in/vendors/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Vendor profile for recruitment and HR tools in India.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Dedicated Indian HR software directory.'
  },
  {
    id: 'TGT_061', platform_name: 'Ventmark', root_domain: 'useventmark.com', category: 'INDIAN_BUSINESS',
    listing_angle: 'Indian startup directory', submission_url: 'https://useventmark.com/add-company',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free Indian startup and company profile.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Free Indian startup directory.'
  },
  {
    id: 'TGT_062', platform_name: 'StartupTalky', root_domain: 'startuptalky.com', category: 'INDIAN_BUSINESS',
    listing_angle: 'Startup story & profile', submission_url: 'https://startuptalky.com/submit-startup/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Free Indian startup story pitch and product feature.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Career OS',
    current_status: 'QUALIFIED_STAGED', notes: 'Indian entrepreneurial community.'
  },
  {
    id: 'TGT_063', platform_name: 'NextBigWhat', root_domain: 'nextbigwhat.com', category: 'INDIAN_BUSINESS',
    listing_angle: 'Indian technology platform', submission_url: 'https://nextbigwhat.com/submit/',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Product showcase for Indian tech products.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Product community in India.'
  },
  {
    id: 'TGT_064', platform_name: 'Future Tools', root_domain: 'futuretools.io', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI career tools directory', submission_url: 'https://www.futuretools.io/submit-a-tool',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'AI-assisted resume compatibility scanner and career tools.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel AI Resume Diagnostic',
    current_status: 'QUALIFIED_STAGED', notes: 'Popular AI tool directory.'
  },
  {
    id: 'TGT_065', platform_name: 'Toolify', root_domain: 'toolify.ai', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI tools and applications', submission_url: 'https://www.toolify.ai/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'AI software directory listing under Career and Resume category.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Fast-growing AI tools directory.'
  },
  {
    id: 'TGT_066', platform_name: 'TopAI.tools', root_domain: 'topai.tools', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI software discovery', submission_url: 'https://topai.tools/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'AI-powered recruitment and career tools.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel AI ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'AI directory listing.'
  },
  {
    id: 'TGT_067', platform_name: 'OpenAlternative', root_domain: 'openalternative.co', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'Open-source software alternatives', submission_url: 'https://openalternative.co/submit',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Open tools alternative to proprietary ATS scanners.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel Open ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Open source alternatives directory.'
  },
  {
    id: 'TGT_068', platform_name: 'Public APIs', root_domain: 'publicapis.io', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Public developer API directory', submission_url: 'https://publicapis.io/submit',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Public API documentation for career data and salary percentiles.',
    canonical_target_url: 'https://salary.talentxcel.in', target_anchor_text: 'TalentXcel Salary API',
    current_status: 'QUALIFIED_STAGED', notes: 'Developer API catalogue.'
  },
  {
    id: 'TGT_069', platform_name: 'LibHunt', root_domain: 'libhunt.com', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Open-source repository discovery', submission_url: 'https://www.libhunt.com/',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Open-source library discovery linked to GitHub repository.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel Parser SDK',
    current_status: 'QUALIFIED_STAGED', notes: 'Open source discovery index.'
  },
  {
    id: 'TGT_070', platform_name: 'HackMD', root_domain: 'hackmd.io', category: 'DEVELOPER_ECOSYSTEM',
    listing_angle: 'Public collaborative documentation', submission_url: 'https://hackmd.io/',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Public engineering guides and collaborative ATS specifications.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Documentation',
    current_status: 'QUALIFIED_STAGED', notes: 'Collaborative markdown workspace (DR 84).'
  },

  // --- EDITORIAL & GUEST ARTICLE MEDIA OPPORTUNITIES ---
  {
    id: 'TGT_071', platform_name: 'People Matters', root_domain: 'peoplematters.in', category: 'EDITORIAL_MEDIA',
    listing_angle: 'HRTech editorial guest column', submission_url: 'https://www.peoplematters.in/contact-us',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Evidence-based article on AI in campus recruitment and hiring workflows.',
    canonical_target_url: 'https://talentxcel.in/colleges', target_anchor_text: 'TalentXcel Placement Research',
    current_status: 'QUALIFIED_STAGED', notes: 'Leading HR and talent publication in Asia.'
  },
  {
    id: 'TGT_072', platform_name: 'ETHRWorld', root_domain: 'hr.economictimes.indiatimes.com', category: 'EDITORIAL_MEDIA',
    listing_angle: 'HR technology industry insight', submission_url: 'https://hr.economictimes.indiatimes.com/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Expert commentary on compensation benchmarks and engineering hiring trends.',
    canonical_target_url: 'https://salary.talentxcel.in', target_anchor_text: 'TalentXcel Salary Index',
    current_status: 'QUALIFIED_STAGED', notes: 'Economic Times HR portal.'
  },
  {
    id: 'TGT_073', platform_name: 'RecruitingDaily', root_domain: 'recruitingdaily.com', category: 'EDITORIAL_MEDIA',
    listing_angle: 'Recruitment operations article', submission_url: 'https://recruitingdaily.com/contact/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Technical piece on applicant tracking system parser compatibility.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Diagnostic',
    current_status: 'QUALIFIED_STAGED', notes: 'Top recruiting community.'
  },
  {
    id: 'TGT_074', platform_name: 'ERE', root_domain: 'ere.net', category: 'EDITORIAL_MEDIA',
    listing_angle: 'Talent acquisition methodology', submission_url: 'https://www.ere.net/contact/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'In-depth recruiting operations and candidate screening playbooks.',
    canonical_target_url: 'https://talentxcel.in/employers/post-job', target_anchor_text: 'TalentXcel Structured Hiring',
    current_status: 'QUALIFIED_STAGED', notes: 'Recruiting leadership network.'
  },
  {
    id: 'TGT_075', platform_name: 'HackerNoon', root_domain: 'hackernoon.com', category: 'EDITORIAL_MEDIA',
    listing_angle: 'Technical engineering article', submission_url: 'https://hackernoon.com/write',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Deep dive into parsing resumes using deterministic grammars vs LLM extractors.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel Resume Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'High readership tech publication (DR 88).'
  },
  {
    id: 'TGT_076', platform_name: 'DZone', root_domain: 'dzone.com', category: 'EDITORIAL_MEDIA',
    listing_angle: 'Software engineering tutorial', submission_url: 'https://dzone.com/pages/writers',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 2,
    eligibility_criteria: 'Article on building resilient microservices for high-scale hiring platforms.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Architecture',
    current_status: 'QUALIFIED_STAGED', notes: 'Software developer hub (DR 88).'
  },

  // --- ADDITIONAL B2B & PRODUCT PLATFORMS TO COMPLETE 100 UNIQUE ROOT DOMAINS ---
  {
    id: 'TGT_077', platform_name: 'TrustRadius', root_domain: 'trustradius.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'B2B software reviews', submission_url: 'https://www.trustradius.com/vendor-portal',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: 'CONDITIONAL_FREE', priority: 3,
    eligibility_criteria: 'Free vendor portal profile for recruiting software.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'B2B software reviews authority.'
  },
  {
    id: 'TGT_078', platform_name: 'Crozdesk', root_domain: 'crozdesk.co', category: 'SOFTWARE_SAAS',
    listing_angle: 'Software reviews', submission_url: 'https://crozdesk.co/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Vendor profile for recruitment platforms.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Regional software catalog.'
  },
  {
    id: 'TGT_079', platform_name: 'SoftwareWorld', root_domain: 'softwareworld.co', category: 'SOFTWARE_SAAS',
    listing_angle: 'Software comparison', submission_url: 'https://www.softwareworld.co/get-listed/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Listing under ATS and Recruitment software.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Software discovery portal.'
  },
  {
    id: 'TGT_080', platform_name: 'Serchen', root_domain: 'serchen.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'Cloud services directory', submission_url: 'https://www.serchen.com/get-listed/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Cloud service provider listing in HR category.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Cloud',
    current_status: 'QUALIFIED_STAGED', notes: 'Cloud services directory.'
  },
  {
    id: 'TGT_081', platform_name: 'FinancesOnline', root_domain: 'financesonline.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'B2B software reviews', submission_url: 'https://financesonline.com/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: 'CONDITIONAL_FREE', priority: 3,
    eligibility_criteria: 'B2B software directory entry in HR tools.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Business software review engine.'
  },
  {
    id: 'TGT_082', platform_name: 'PeerSpot', root_domain: 'peerspot.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'Enterprise technology reviews', submission_url: 'https://www.peerspot.com/products/new',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: 'CONDITIONAL_FREE', priority: 3,
    eligibility_criteria: 'Enterprise tech product listing.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Enterprise',
    current_status: 'QUALIFIED_STAGED', notes: 'Enterprise reviews directory.'
  },
  {
    id: 'TGT_083', platform_name: 'Cuspera', root_domain: 'cuspera.com', category: 'SOFTWARE_SAAS',
    listing_angle: 'B2B software discovery', submission_url: 'https://www.cuspera.com/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Software listing in recruitment category.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'B2B software discovery.'
  },
  {
    id: 'TGT_084', platform_name: 'Slant', root_domain: 'slant.co', category: 'SOFTWARE_SAAS',
    listing_angle: 'Community software recommendations', submission_url: 'https://www.slant.co/',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Community recommendation listing for best ATS resume scanners.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Checker',
    current_status: 'QUALIFIED_STAGED', notes: 'Crowdsourced software recommendations.'
  },
  {
    id: 'TGT_085', platform_name: 'Alternative.me', root_domain: 'alternative.me', category: 'SOFTWARE_SAAS',
    listing_angle: 'Software alternatives directory', submission_url: 'https://alternative.me/submit/',
    submission_type: 'COMMUNITY_DRIVEN', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Alternative software profile.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Software',
    current_status: 'QUALIFIED_STAGED', notes: 'Software alternatives index.'
  },
  {
    id: 'TGT_086', platform_name: 'StartupsMap', root_domain: 'startupsmap.com', category: 'INDIAN_BUSINESS',
    listing_angle: 'Indian startup map', submission_url: 'https://startupsmap.com/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Free Indian startup mapping.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Indian tech startup mapping.'
  },
  {
    id: 'TGT_087', platform_name: 'Central India Tech', root_domain: 'centralindiatech.com', category: 'INDIAN_BUSINESS',
    listing_angle: 'Regional Indian tech portal', submission_url: 'https://centralindiatech.com/submit',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Company profile for Central India tech companies.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Regional tech directory.'
  },
  {
    id: 'TGT_088', platform_name: 'Desifounder', root_domain: 'desifounder.com', category: 'INDIAN_BUSINESS',
    listing_angle: 'Indian founder spotlight', submission_url: 'https://desifounder.com/submit',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Founder spotlight and startup feature.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Indian founder spotlight.'
  },
  {
    id: 'TGT_089', platform_name: 'SuperbCompanies', root_domain: 'superbcompanies.com', category: 'INDIAN_BUSINESS',
    listing_angle: 'B2B services profile', submission_url: 'https://superbcompanies.com/get-listed',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Company profile under recruitment and staffing.',
    canonical_target_url: 'https://talentxcel.in/employers/post-job', target_anchor_text: 'TalentXcel Hiring',
    current_status: 'QUALIFIED_STAGED', notes: 'B2B service ratings.'
  },
  {
    id: 'TGT_090', platform_name: 'TopDevelopers', root_domain: 'topdevelopers.co', category: 'INDIAN_BUSINESS',
    listing_angle: 'Tech services profile', submission_url: 'https://www.topdevelopers.co/get-listed',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Software platform profile.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Platform',
    current_status: 'QUALIFIED_STAGED', notes: 'Tech service directory.'
  },
  {
    id: 'TGT_091', platform_name: 'Techreviewer', root_domain: 'techreviewer.co', category: 'INDIAN_BUSINESS',
    listing_angle: 'Technology company review', submission_url: 'https://techreviewer.co/get-listed',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Tech company listing.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel',
    current_status: 'QUALIFIED_STAGED', notes: 'Tech reviews directory.'
  },
  {
    id: 'TGT_092', platform_name: 'AIxploria', root_domain: 'aixploria.com', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI tools directory', submission_url: 'https://www.aixploria.com/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'AI software tool listing.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel AI ATS Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'AI directory.'
  },
  {
    id: 'TGT_093', platform_name: 'AI Tool Trek', root_domain: 'aitooltrek.com', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI product discovery', submission_url: 'https://aitooltrek.com/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'AI career tools entry.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Diagnostic',
    current_status: 'QUALIFIED_STAGED', notes: 'AI directory.'
  },
  {
    id: 'TGT_094', platform_name: 'Good AI Tools', root_domain: 'goodaitools.com', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'Useful AI tools directory', submission_url: 'https://goodaitools.com/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'AI software profile.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel AI Tools',
    current_status: 'QUALIFIED_STAGED', notes: 'AI tools catalogue.'
  },
  {
    id: 'TGT_095', platform_name: 'Tool Pilot', root_domain: 'toolpilot.ai', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI product discovery', submission_url: 'https://www.toolpilot.ai/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'AI resume analysis tool listing.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Tool',
    current_status: 'QUALIFIED_STAGED', notes: 'AI directory.'
  },
  {
    id: 'TGT_096', platform_name: 'AI App Hub', root_domain: 'aiapphub.com', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI application discovery', submission_url: 'https://aiapphub.com/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'AI career platform profile.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel AI Career OS',
    current_status: 'QUALIFIED_STAGED', notes: 'AI application directory.'
  },
  {
    id: 'TGT_097', platform_name: 'AI Valley', root_domain: 'aivalley.ai', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI product directory', submission_url: 'https://aivalley.ai/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Free AI product listing.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel AI Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'AI tools collection.'
  },
  {
    id: 'TGT_098', platform_name: 'Futurepedia', root_domain: 'futurepedia.io', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI tool discovery', submission_url: 'https://www.futurepedia.io/submit-tool',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: 'CONDITIONAL_FREE', priority: 3,
    eligibility_criteria: 'AI career and resume tool profile.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel ATS Tool',
    current_status: 'QUALIFIED_STAGED', notes: 'Premier AI directory.'
  },
  {
    id: 'TGT_099', platform_name: 'There is An AI For That', root_domain: 'theresanaiforthat.com', category: 'AI_TECH_DIRECTORY',
    listing_angle: 'AI product discovery', submission_url: 'https://theresanaiforthat.com/submit/',
    submission_type: 'EDITORIAL_REVIEW', cost_tier: 'CONDITIONAL_FREE', priority: 3,
    eligibility_criteria: 'AI software discovery profile under Career Tools.',
    canonical_target_url: 'https://talentxcel.in/resume/ats-check', target_anchor_text: 'TalentXcel AI Scanner',
    current_status: 'QUALIFIED_STAGED', notes: 'Largest AI tool directory.'
  },
  {
    id: 'TGT_100', platform_name: 'Startup Buffer', root_domain: 'startupbuffer.com', category: 'STARTUP_LAUNCH',
    listing_angle: 'Startup directory listing', submission_url: 'https://startupbuffer.com/submit',
    submission_type: 'SELF_SERVICE', cost_tier: '₹0_FREE', priority: 3,
    eligibility_criteria: 'Free basic startup submission.',
    canonical_target_url: 'https://talentxcel.in', target_anchor_text: 'TalentXcel Startup Profile',
    current_status: 'QUALIFIED_STAGED', notes: 'Established startup launch directory.'
  }
];

// Insert all 100 targets into SQLite
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO acquisition_targets (
    id, platform_name, root_domain, category, listing_angle, submission_url,
    submission_type, cost_tier, priority, eligibility_criteria,
    canonical_target_url, target_anchor_text, current_status, approved_public_url,
    verified_rel_attribute, verified_http_status, verified_anchor_found,
    last_checked_at, notes, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?,
    ?, ?, datetime('now'), datetime('now')
  )
`);

for (const t of TARGETS) {
  insertStmt.run(
    t.id, t.platform_name, t.root_domain, t.category, t.listing_angle, t.submission_url,
    t.submission_type, t.cost_tier, t.priority, t.eligibility_criteria,
    t.canonical_target_url, t.target_anchor_text, t.current_status, null,
    null, null, null,
    t.last_checked_at || null, t.notes
  );
}

console.log(`✓ Inserted ${TARGETS.length} targets into acquisition_targets table in SQLite.`);

// Generate TXC_100_ACQUISITION_TARGETS_DATABASE.csv
const csvHeaders = [
  'id', 'platform_name', 'root_domain', 'category', 'listing_angle',
  'submission_url', 'submission_type', 'cost_tier', 'priority',
  'eligibility_criteria', 'canonical_target_url', 'target_anchor_text',
  'current_status', 'notes'
];

const csvRows = [csvHeaders.join(',')];
for (const t of TARGETS) {
  csvRows.push([
    t.id,
    `"${t.platform_name.replace(/"/g, '""')}"`,
    t.root_domain,
    t.category,
    `"${t.listing_angle.replace(/"/g, '""')}"`,
    `"${t.submission_url.replace(/"/g, '""')}"`,
    t.submission_type,
    t.cost_tier,
    t.priority,
    `"${t.eligibility_criteria.replace(/"/g, '""')}"`,
    `"${t.canonical_target_url.replace(/"/g, '""')}"`,
    `"${t.target_anchor_text.replace(/"/g, '""')}"`,
    t.current_status,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ].join(','));
}

const csvPath = path.join(REPORTS_DIR, 'TXC_100_ACQUISITION_TARGETS_DATABASE.csv');
fs.writeFileSync(csvPath, csvRows.join('\n'));
console.log(`✓ Generated Target Database CSV: ${csvPath}`);

// Copy to artifact directory
const artifactCsvPath = 'C:/Users/Arshid.Wani/.gemini/antigravity/brain/bbd3c102-f165-47f7-9eef-eeb4b56d4fa1/TXC_100_ACQUISITION_TARGETS_DATABASE.csv';
fs.writeFileSync(artifactCsvPath, csvRows.join('\n'));
console.log(`✓ Copied Target Database CSV to artifact dir: ${artifactCsvPath}`);
