// backlink-engine/src/scripts/generateTrueTrackingDeliverables.cjs
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const reportsDir = path.join(__dirname, '..', '..', '..', 'reports');
const artifactDir = 'C:\\Users\\Arshid.Wani\\.gemini\\antigravity\\brain\\bbd3c102-f165-47f7-9eef-eeb4b56d4fa1';
const dbPath = path.join(__dirname, '..', '..', 'data', 'backlink_engine.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

function saveFile(filename, content) {
  const repPath = path.join(reportsDir, filename);
  fs.writeFileSync(repPath, content, 'utf8');
  const artPath = path.join(artifactDir, filename);
  fs.writeFileSync(artPath, content, 'utf8');
  console.log(`Saved ${filename} to reports/ and artifact dir.`);
}

console.log('=== GENERATING TRUE ACQUISITION TRACKING DELIVERABLES ===');

// ========================================================
// 1. DELIVERABLE 2: TXC-VERIFIED-LIVE-REFERRING-DOMAINS.csv
// ========================================================
// Verified live referring domains: Exactly 1 (rentry.co)
const liveRows = [
  [
    'Referring_Domain',
    'Root_Domain_Status',
    'Total_Live_Pages',
    'Total_Live_Hyperlinks',
    'Link_Classification',
    'Editorial_Endorsement_Status',
    'Rel_Attribute',
    'Verification_Method',
    'Audit_Status',
    'Notes'
  ],
  [
    'rentry.co',
    'PUBLIC_SUFFIX_ROOT_DOMAIN',
    '120',
    '240',
    'SELF_PUBLISHED_CITATION (User-Generated Paste)',
    'ZERO_EDITORIAL_ENDORSEMENT (Unreviewed Markdown Paste)',
    'follow',
    'Automated HTTP 200 DOM Crawl',
    'FROZEN_BASELINE_IMMUTABLE',
    '240 links across 120 unique pages on rentry.co. Represents exactly ONE technical referring root domain, not 240 independent endorsements. Permanently frozen.'
  ]
];
saveFile('TXC-VERIFIED-LIVE-REFERRING-DOMAINS.csv', liveRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'));

// ========================================================
// 2. DELIVERABLE 3: TXC-PENDING-DISPATCHED-SUBMISSIONS.csv
// ========================================================
// Dispatched submissions awaiting publication: Exactly 3 (hrstack.tech, softwaresuggest.com, techpluto.com)
const pendingDispatchedRows = [
  [
    'Submission_ID',
    'Platform_Name',
    'Registrable_Root_Domain',
    'Opportunity_Category',
    'Submission_Endpoint',
    'Dispatch_Timestamp',
    'Dispatch_Receipt_Evidence',
    'Current_Publication_Status',
    'Live_TalentXcel_Backlink_Found',
    'Pipeline_Stage'
  ],
  [
    'TXC_DISP_001',
    'HRStack',
    'hrstack.tech',
    'Free HRTech Directory',
    'https://hrstack.tech/api/submissions',
    '2026-11-03T10:34:00Z',
    'HTTP 200 {"ok":true,"demo":false}',
    'EDITORIAL_REVIEW_PENDING',
    'NO (Awaiting moderator review)',
    'DISPATCHED_AWAITING_PUBLICATION'
  ],
  [
    'TXC_DISP_002',
    'SoftwareSuggest',
    'softwaresuggest.com',
    'Commercial B2B Marketplace (India)',
    'https://www.softwaresuggest.com/registerverifyvendor/vendorsave',
    '2026-11-03T02:45:02Z',
    'HTTP 200 comp_id: 1578622, hubspot_comp_id: 359202092784',
    'VENDOR_VERIFICATION_PENDING',
    'NO (Email verification pending)',
    'DISPATCHED_AWAITING_PUBLICATION'
  ],
  [
    'TXC_DISP_003',
    'TechPluto',
    'techpluto.com',
    'Editorial Tech Media (India)',
    'https://docs.google.com/forms/d/e/1FAIpQLScmzHxA16yQUsr_pCwIjlMd3jvvValvon9zXs2NevoFosQ8Cg/formResponse',
    '2026-11-03T10:42:00Z',
    'HTTP 200 Form POST Response Receipt',
    'EDITORIAL_SELECTION_PENDING',
    'NO (Editorial pipeline)',
    'DISPATCHED_AWAITING_PUBLICATION'
  ]
];
saveFile('TXC-PENDING-DISPATCHED-SUBMISSIONS.csv', pendingDispatchedRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'));

// ========================================================
// 3. DELIVERABLE 4: TXC-STAGED-PROFILES.csv
// ========================================================
// Staged but not submitted profiles: Exactly 3 (saashub.com, launchingnext.com, pitchwall.co)
const stagedProfilesRows = [
  [
    'Profile_ID',
    'Platform_Name',
    'Registrable_Root_Domain',
    'Opportunity_Category',
    'Staging_Database_Table',
    'Profile_Tier',
    'Listing_Cost',
    'Staged_Listing_URL',
    'Outbound_Network_Status',
    'Pipeline_Stage'
  ],
  [
    'TXC_STG_001',
    'SaaSHub',
    'saashub.com',
    'Free Software Discovery Directory',
    'b2b_directory_profiles (ID 31)',
    'Free Organic Profile Queue',
    '₹0.00',
    'https://saashub.com/submit',
    'ZERO_NETWORK_SUBMISSION (Local Staging Only)',
    'STAGED_NOT_SUBMITTED'
  ],
  [
    'TXC_STG_002',
    'Launching Next',
    'launchingnext.com',
    'Free Product Launch Directory',
    'b2b_directory_profiles (ID 32)',
    'Free Standard Queue',
    '₹0.00',
    'https://launchingnext.com/submit',
    'ZERO_NETWORK_SUBMISSION (Local Staging Only)',
    'STAGED_NOT_SUBMITTED'
  ],
  [
    'TXC_STG_003',
    'PitchWall',
    'pitchwall.co',
    'Free Product Directory',
    'b2b_directory_profiles (ID 33)',
    'Free Product Tier',
    '₹0.00',
    'https://pitchwall.co/submit',
    'ZERO_NETWORK_SUBMISSION (Local Staging Only)',
    'STAGED_NOT_SUBMITTED'
  ]
];
saveFile('TXC-STAGED-PROFILES.csv', stagedProfilesRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'));

// ========================================================
// 4. DELIVERABLE 5: TXC-APPROVED-OPPORTUNITIES.csv
// ========================================================
// Human-approved submission opportunities: The 8 pilot candidates staged awaiting authorization
const approvedOpportunitiesRows = [
  [
    'Approval_Queue_ID',
    'Platform_Name',
    'Registrable_Root_Domain',
    'Opportunity_Category',
    'Submission_URL',
    'Audience_Relevance_30',
    'Editorial_Independence_20',
    'Public_Indexability_20',
    'Backlink_Opportunity_15',
    'Free_Terms_15',
    'Total_Quality_Score_100',
    'Grounded_Product_Description',
    'Destination_Landing_URL',
    'Outbound_Submission_Status'
  ],
  [
    'TXC_APPR_001',
    'AI SaaS Radar',
    'aisaasradar.com',
    'Free Directory',
    'https://aisaasradar.com/submit',
    '26',
    '17',
    '19',
    '14',
    '15',
    '91',
    'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
    'https://talentxcel.in/resume/ats-check',
    'STAGED_PENDING_HUMAN_APPROVAL (Zero external submission)'
  ],
  [
    'TXC_APPR_002',
    'ToolDock',
    'zalize.com',
    'Free Directory',
    'https://tools.zalize.com/submit',
    '25',
    '16',
    '18',
    '13',
    '15',
    '87',
    'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
    'https://talentxcel.in/resume/ats-check',
    'STAGED_PENDING_HUMAN_APPROVAL (Zero external submission)'
  ],
  [
    'TXC_APPR_003',
    'ThatsMyAI',
    'thatsmy.ai',
    'Free Directory',
    'https://thatsmy.ai/submit-tool',
    '25',
    '16',
    '18',
    '12',
    '14',
    '85',
    'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
    'https://talentxcel.in/resume/ats-check',
    'STAGED_PENDING_HUMAN_APPROVAL (Zero external submission)'
  ],
  [
    'TXC_APPR_004',
    'Deekoya AI',
    'deekoyaai.in',
    'Free Directory (India ccTLD)',
    'https://deekoyaai.in/submit-tool',
    '27',
    '15',
    '18',
    '12',
    '13',
    '85',
    'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
    'https://talentxcel.in/resume/ats-check',
    'STAGED_PENDING_HUMAN_APPROVAL (Zero external submission)'
  ],
  [
    'TXC_APPR_005',
    'AI ToolsXplorer',
    'aitoolsxplorer.in',
    'Free Directory (India ccTLD)',
    'https://www.aitoolsxplorer.in/submit-tool',
    '26',
    '14',
    '16',
    '12',
    '14',
    '82',
    'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
    'https://talentxcel.in/resume/ats-check',
    'STAGED_PENDING_HUMAN_APPROVAL (Zero external submission)'
  ],
  [
    'TXC_APPR_006',
    'AI Bookmarks',
    'aibookmarks.net',
    'Free Directory',
    'https://aibookmarks.net/submit',
    '24',
    '15',
    '17',
    '12',
    '14',
    '82',
    'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
    'https://talentxcel.in/resume/ats-check',
    'STAGED_PENDING_HUMAN_APPROVAL (Zero external submission)'
  ],
  [
    'TXC_APPR_007',
    'Stackdrop',
    'getstackdrop.com',
    'Free Directory',
    'https://getstackdrop.com/submit',
    '24',
    '15',
    '17',
    '11',
    '14',
    '81',
    'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
    'https://talentxcel.in/resume/ats-check',
    'STAGED_PENDING_HUMAN_APPROVAL (Zero external submission)'
  ],
  [
    'TXC_APPR_008',
    'AI Gear Base',
    'aigearbase.com',
    'Free Directory',
    'https://aigearbase.com/submit',
    '22',
    '15',
    '17',
    '12',
    '14',
    '80',
    'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
    'https://talentxcel.in/resume/ats-check',
    'STAGED_PENDING_HUMAN_APPROVAL (Zero external submission)'
  ]
];
saveFile('TXC-APPROVED-OPPORTUNITIES.csv', approvedOpportunitiesRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'));

// ========================================================
// 5. DELIVERABLE 6: TXC-HRTECH-AUTHORITY-PIPELINE.csv
// ========================================================
// Separate research prospects by distinct opportunity categories
const hrPipelineRows = [
  [
    'Research_ID',
    'Platform_Or_Entity',
    'Registrable_Root_Domain',
    'Opportunity_Category',
    'Audience_Profile',
    'Topical_Relationship_To_TalentXcel',
    'Submission_Or_Engagement_Route',
    'Cost_Tier',
    'Current_Pipeline_Stage',
    'Governance_Qualification_Notes'
  ],
  [
    'TXC_RES_001',
    'GoodFirms (ATS Category)',
    'goodfirms.co',
    'Commercial Vendor Marketplace',
    'Corporate HR Buyers & IT Decision Makers',
    'Dedicated Applicant Tracking System (ATS) Software and Resume Parsing software categories',
    'Vendor Profile Registration & Verification',
    '₹0 Free Profile Tier',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'Requires business verification; provides crawlable profile anchor link upon approval.'
  ],
  [
    'TXC_RES_002',
    'Clutch (Recruiting Category)',
    'clutch.co',
    'Commercial Vendor Marketplace',
    'Enterprise Talent Leaders & Staffing Agencies',
    'Recruiting Software & Staffing Technology categories',
    'Company Profile Creation & Claiming',
    '₹0 Free Basic Tier',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'Requires corporate email verification; established business authority.'
  ],
  [
    'TXC_RES_003',
    'Map of HR Tech',
    'mapofhrtech.com',
    'Free Directory (Niche HRTech)',
    'Global CHROs & HR Technology Consultants',
    'Curated landscape of global talent acquisition and candidate screening software',
    'Editorial Vendor Submission Form',
    '₹0 Free Inclusion',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'High topical relevance; manual editorial review by HR analyst.'
  ],
  [
    'TXC_RES_004',
    'HRSoftware.in',
    'hrsoftware.in',
    'Free Directory (India HRTech)',
    'Indian HR Managers & Talent Acquisition Teams',
    'India dedicated HRMS, ATS, and recruitment software evaluation directory',
    'Listing Application Form',
    '₹0 Free Listing',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'Direct regional ccTLD (.in) match for TalentXcel.in.'
  ],
  [
    'TXC_RES_005',
    'SHRM Vendor Directory',
    'shrm.org',
    'Membership-Based Association',
    '300,000+ Certified HR Practitioners Worldwide',
    'Society for Human Resource Management official technology vendor directory',
    'Vendor Marketplace Submission',
    'Free Basic Listing Available',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'Apex global HR professional body; high governance threshold.'
  ],
  [
    'TXC_RES_006',
    'NASSCOM Community',
    'nasscom.in',
    'Membership-Based Association',
    'Indian IT & Tech Industry Leadership',
    'India premier tech industry council; workforce and skills initiatives',
    'Member Spotlight & Tech Resource Article',
    '₹0 Member/Partner Resource',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'Institutional industry body; editorial review required.'
  ],
  [
    'TXC_RES_007',
    'ETHRWorld',
    'indiatimes.com',
    'Editorial Publication',
    'HR Executives & Talent Strategists in India',
    'The Economic Times HR media vertical covering recruitment technology innovations',
    'Editorial Pitch / Press Submission',
    '₹0 Editorial (Zero Sponsored Pay)',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'Tier-1 Indian business press; requires editorial newsworthiness.'
  ],
  [
    'TXC_RES_008',
    'RecruitingDaily',
    'recruitingdaily.com',
    'Editorial Publication',
    'Talent Acquisition Practitioners & Recruiters',
    'Leading global publication dedicated to recruitment tech, sourcing, and ATS tools',
    'Editorial Contribution / Product Review',
    '₹0 Editorial Consideration',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'Specialist recruitment journalism; high topical authority.'
  ],
  [
    'TXC_RES_009',
    'IIT Placement Cells (5 Institutes)',
    'iitm.ac.in',
    'Campus & University Partnerships',
    'Graduating Technical Students & Placement TPOs',
    'Campus placement cells recommending student resume preparation tools',
    'Educational ATS Diagnostic Partnership Proposal',
    '₹0 Institutional Partnership',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'Direct outreach to placement officers; .ac.in high-trust resource anchor.'
  ],
  [
    'TXC_RES_010',
    'Startup India Hub',
    'startupindia.gov.in',
    'Government Employment & Startup Portal',
    'Indian Startup Ecosystem & Workforce',
    'Official DPIIT Government of India portal recognizing tech innovations',
    'Startup Entity Profile & DPIIT Recognition',
    '₹0 Government Portal',
    'UNVERIFIED_RESEARCH_PROSPECT',
    'Requires corporate registration documents; official .gov.in domain.'
  ]
];
saveFile('TXC-HRTECH-AUTHORITY-PIPELINE.csv', hrPipelineRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'));

// ========================================================
// 6. DELIVERABLE 7: TXC-EIGHT-CANDIDATE-LINK-VERIFICATION.csv
// ========================================================
// Detailed link audit separating directory architecture from TalentXcel live listing status
const eightLinkAuditRows = [
  [
    'Candidate_Num',
    'Platform_Name',
    'Registrable_Root_Domain',
    'Platform_Outbound_Link_Architecture',
    'Actual_TalentXcel_Listing_Status',
    'Public_Listing_URL_Status',
    'Actual_Hyperlink_Destination',
    'HTTP_Status_Of_Form',
    'Canonical_Form_URL',
    'Indexability_And_Robots_Policy',
    'Expected_Rel_Attribute',
    'Free_Listing_Terms',
    'Evidence_Timestamp',
    'Quality_Gate_Audit_Notes'
  ],
  [
    '13',
    'AI SaaS Radar',
    'aisaasradar.com',
    'Direct HTML Anchor on detail pages',
    'NONE (Not yet submitted)',
    'NONE (Pending human approval)',
    'NONE (Zero link currently live)',
    '200 OK',
    'https://aisaasradar.com/submit',
    'INDEXABLE: robots.txt User-agent: * Allow: /',
    'rel="noopener" (follow)',
    'Explicit Free Standard Queue ($0 fee)',
    '2026-11-03T19:47:27Z',
    'Generic directory contains other direct links; does NOT constitute a live TalentXcel backlink until approved and published.'
  ],
  [
    '92',
    'ToolDock',
    'zalize.com',
    'Direct HTML Anchor on showcase page',
    'NONE (Not yet submitted)',
    'NONE (Pending human approval)',
    'NONE (Zero link currently live)',
    '200 OK',
    'https://tools.zalize.com/submit',
    'INDEXABLE: robots.txt Allow: /; Sitemap enabled',
    'rel="noopener" (follow)',
    '100% Free Standard Tier verified',
    '2026-11-03T19:47:27Z',
    'Directory architecture supports direct links; zero link currently live.'
  ],
  [
    '90',
    'ThatsMyAI',
    'thatsmy.ai',
    'Direct HTML Anchor on tool profile',
    'NONE (Not yet submitted)',
    'NONE (Pending human approval)',
    'NONE (Zero link currently live)',
    '200 OK',
    'https://thatsmy.ai/submit-tool',
    'INDEXABLE: robots.txt Allow: / (Fully indexed on Google)',
    'rel="noopener" (follow)',
    'Free Plan ($0) in Tier Selector',
    '2026-11-03T19:47:27Z',
    'Submission form verified with $0 option; zero live backlink established yet.'
  ],
  [
    '48',
    'Deekoya AI',
    'deekoyaai.in',
    'Direct HTML Anchor (41 outbound links crawled)',
    'NONE (Not yet submitted)',
    'NONE (Pending human approval)',
    'NONE (Zero link currently live)',
    '200 OK',
    'https://deekoyaai.in/submit-tool',
    'INDEXABLE: User-Agent: * Allow: / User-Agent: GPTBot Allow: /',
    'rel="noopener" (follow)',
    'Free submission route confirmed',
    '2026-11-03T19:56:42Z',
    'Indian ccTLD directory renders direct dofollow links; TalentXcel listing pending approval.'
  ],
  [
    '24',
    'AI ToolsXplorer',
    'aitoolsxplorer.in',
    'Direct HTML Anchor on catalog card',
    'NONE (Not yet submitted)',
    'NONE (Pending human approval)',
    'NONE (Zero link currently live)',
    '200 OK (307 redirect)',
    'https://www.aitoolsxplorer.in/submit-tool',
    'INDEXABLE: Search engine crawlable',
    'rel="noopener" (follow)',
    '$0 Standard Option verified in form',
    '2026-11-03T19:47:27Z',
    'Indian software directory; zero link currently live.'
  ],
  [
    '3',
    'AI Bookmarks',
    'aibookmarks.net',
    'Direct HTML Anchor on detail listing',
    'NONE (Not yet submitted)',
    'NONE (Pending human approval)',
    'NONE (Zero link currently live)',
    '200 OK',
    'https://aibookmarks.net/submit',
    'INDEXABLE: User-agent: GPTBot Allow: /',
    'rel="noopener" (follow)',
    'Explicit Free Submission tier option',
    '2026-11-03T19:47:27Z',
    'Curated bookmark archive; submission form active, zero live backlink.'
  ],
  [
    '87',
    'Stackdrop',
    'getstackdrop.com',
    'Direct HTML Anchor on tool profile',
    'NONE (Not yet submitted)',
    'NONE (Pending human approval)',
    'NONE (Zero link currently live)',
    '200 OK',
    'https://getstackdrop.com/submit',
    'INDEXABLE: User-agent: * Allow: /',
    'rel="noopener noreferrer" (follow)',
    '$0 Basic Listing route verified',
    '2026-11-03T19:56:42Z',
    'Open source & tech stack index; zero link currently live.'
  ],
  [
    '7',
    'AI Gear Base',
    'aigearbase.com',
    'Direct HTML Anchor on gear profile',
    'NONE (Not yet submitted)',
    'NONE (Pending human approval)',
    'NONE (Zero link currently live)',
    '200 OK',
    'https://aigearbase.com/submit',
    'INDEXABLE: User-agent: * Allow: /',
    'rel="me nofollow noopener noreferrer"',
    '100% Free Tier verified',
    '2026-11-03T19:56:42Z',
    'Productivity tool directory; direct nofollow link architecture.'
  ]
];
saveFile('TXC-EIGHT-CANDIDATE-LINK-VERIFICATION.csv', eightLinkAuditRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'));

// ========================================================
// 7. DELIVERABLE 8: TXC-25-DOMAIN-MILESTONE-TRACKER.csv
// ========================================================
// Strict tracking separating the 5 distinct pipeline metrics
const trackerRows = [
  [
    'Metric_Category_ID',
    'Metric_Category_Name',
    'Distinct_Root_Domains_Count',
    'Total_Hyperlinks_Count',
    'Milestone_Qualification_Status',
    'Governance_Integrity_Rule'
  ],
  [
    'STAGE_1_LIVE',
    '1. Verified Live Referring Domains',
    '1 (rentry.co)',
    '240',
    'QUALIFIED_ACQUIRED_BASELINE (1 / 25 = 4.0%)',
    'Strictly counted as ONE referring domain. Backed by 240 live links across 120 pages. Zero third-party editorial endorsement.'
  ],
  [
    'STAGE_2_DISPATCHED',
    '2. Dispatched Submissions Awaiting Publication',
    '3 (hrstack.tech, softwaresuggest.com, techpluto.com)',
    '0 Live (3 Pending Review)',
    'PIPELINE_ONLY_NOT_QUALIFIED (0 / 25)',
    'Legitimate HTTPS dispatches with HTTP 200 receipts. Cannot be counted toward the 25 qualified milestone until published and verified live.'
  ],
  [
    'STAGE_3_STAGED_PROFILES',
    '3. Staged But Not Submitted Profiles',
    '3 (saashub.com, launchingnext.com, pitchwall.co)',
    '0 Live',
    'PIPELINE_ONLY_NOT_QUALIFIED (0 / 25)',
    'Staged in native SQLite engine. Zero external network packets sent. Cannot be counted toward milestone.'
  ],
  [
    'STAGE_4_APPROVED_OPPORTUNITIES',
    '4. Human-Approved Submission Opportunities',
    '8 Candidates (aisaasradar.com, zalize.com, thatsmy.ai, etc.)',
    '0 Live',
    'PIPELINE_ONLY_NOT_QUALIFIED (0 / 25)',
    'Quality-gate approved opportunities staged awaiting human authorization. Zero forms submitted.'
  ],
  [
    'STAGE_5_RESEARCH_PROSPECTS',
    '5. Unqualified or Unverified Research Prospects',
    '10 High-Priority Pillars + 360 Ledger Prospects',
    '0 Live',
    'RESEARCH_ONLY_NOT_QUALIFIED (0 / 25)',
    'Research pool across HRTech, staffing, associations, and publications. Not submitted; unverified.'
  ]
];
saveFile('TXC-25-DOMAIN-MILESTONE-TRACKER.csv', trackerRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'));

// ========================================================
// 8. DELIVERABLE 1: TXC-QUALIFIED-DOMAIN-DASHBOARD-FINAL.md
// ========================================================
const dashboardFinalMd = `# TALENTXCEL — QUALIFIED REFERRING DOMAIN MASTER DASHBOARD

**Mission ID:** TXC-QUALIFIED-DOMAIN-DASHBOARD-CORRECTION-001  
**Target Platform:** \`https://talentxcel.in\`  
**Target Asset:** \`https://talentxcel.in/resume/ats-check\` (Resume ATS Compatibility Checker)  
**Database:** Native SQLite Backlink Engine (\`backlink-engine/data/backlink_engine.db\`)  
**Operating Standard:** Ground-Truth Independent Verification | Strict Stage Separation | Zero Inferred Authority  
**Milestone Target:** 25 Qualified Referring Domains (Phase 1)  
**Budget Consumed:** ₹0.00 strictly  

---

## 1. Executive Milestone Standing: The Five Distinct Acquisition Metrics

In strict accordance with Governance Directives, pipeline metrics are decoupled. Live backlinks, pending submissions, staged profiles, approved opportunities, and research prospects are **never summed together**:

\`\`\`
================================================================================
           TALENTXCEL — TRUE REFERRING ROOT DOMAIN ACQUISITION DASHBOARD
================================================================================
  Target Website                  : https://talentxcel.in
  Verified Milestone Baseline     : 1 / 25 Qualified Referring Domains (4.0%)
  Remaining to Milestone Target   : 24 Qualified Referring Domains
--------------------------------------------------------------------------------
📊 THE FIVE DISTINCT ACQUISITION PIPELINE METRICS
--------------------------------------------------------------------------------
  [Metric 1] Verified Live Referring Domains         : 1 Domain  (rentry.co - 240 live links)
  [Metric 2] Dispatched Submissions Awaiting Review  : 3 Domains (hrstack, softwaresuggest, techpluto)
  [Metric 3] Staged But Not Submitted Profiles       : 3 Domains (saashub, launchingnext, pitchwall)
  [Metric 4] Human-Approved Opportunities (Staged)   : 8 Domains (Quality-Gate Approved Pilot)
  [Metric 5] Unverified Research Prospects Pool     : 10 HRTech Pillars + 360 Ledger Prospects
--------------------------------------------------------------------------------
  TOTAL QUALIFIED ACQUIRED REFERRING DOMAINS       : EXACTLY 1 (4.0% of Milestone)
================================================================================
\`\`\`

---

## 2. Forensic Audit of the Rentry Baseline

- **Total Live Hyperlinks:** **240** verified live links across **120 unique Rentry pages**.
- **Technical Referring Domain Status:** Exactly **ONE** technical referring root domain (\`rentry.co\`, DR 78).
- **Link Nature:** \`SELF_PUBLISHED_CITATION\` (Open markdown paste created during programmatic research publishing).
- **Editorial Endorsement Status:** **Zero third-party editorial review or independent endorsement.** Rentry pages are open user-generated pastes.
- **Rel Attribute:** \`rel="follow"\` throughout.
- **Governance Mandate:** The baseline is **frozen and immutable**. Zero further Rentry pages will be created. Rentry is counted strictly as **1 qualified referring domain**, never as 240 independent endorsements.

---

## 3. Dispatched Submissions Awaiting Publication (Metric 2)

These 3 platforms received authentic outbound HTTPS dispatches with recorded HTTP 200 receipts. They remain in editorial queues and do **not** count as acquired domains until a live TalentXcel backlink is crawled:

| Submission ID | Platform Name | Registrable Root | Category | Outbound Evidence | Live Backlink Detected | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TXC_DISP_001** | **HRStack** | \`hrstack.tech\` | Free HRTech Directory | Production API POST returned HTTP 200 (\`{"ok":true,"demo":false}\`) | **NO** (Editorial Queue) | \`DISPATCHED_PENDING_REVIEW\` |
| **TXC_DISP_002** | **SoftwareSuggest** | \`softwaresuggest.com\` | Commercial B2B Marketplace | Vendor API POST returned HTTP 200 (\`comp_id: 1578622\`) | **NO** (Email Verification) | \`DISPATCHED_PENDING_REVIEW\` |
| **TXC_DISP_003** | **TechPluto** | \`techpluto.com\` | Editorial Media (India) | Google Form POST returned HTTP 200 Receipt | **NO** (Editorial Queue) | \`DISPATCHED_PENDING_REVIEW\` |

---

## 4. Staged But Not Submitted Profiles (Metric 3)

These 3 opportunities were staged into \`b2b_directory_profiles\` during Stage 4.1. **Zero external network packets were transmitted**:

| Profile ID | Platform Name | Registrable Root | Category | Staging Table | Listing Cost | Outbound Transmission Status | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TXC_STG_001** | **SaaSHub** | \`saashub.com\` | Free Software Directory | \`b2b_directory_profiles\` (ID 31) | ₹0.00 | **ZERO_NETWORK_TRANSMISSION** | \`STAGED_NOT_SUBMITTED\` |
| **TXC_STG_002** | **Launching Next** | \`launchingnext.com\` | Free Startup Directory | \`b2b_directory_profiles\` (ID 32) | ₹0.00 | **ZERO_NETWORK_TRANSMISSION** | \`STAGED_NOT_SUBMITTED\` |
| **TXC_STG_003** | **PitchWall** | \`pitchwall.co\` | Free Product Directory | \`b2b_directory_profiles\` (ID 33) | ₹0.00 | **ZERO_NETWORK_TRANSMISSION** | \`STAGED_NOT_SUBMITTED\` |

---

## 5. Human-Approved Submission Opportunities (Metric 4: The Top 8 Pilot)

All 8 candidates have been re-evaluated under the five-factor quality scoring model. A generic directory containing other external links does **not** establish a TalentXcel backlink; all 8 currently have **zero live links to TalentXcel** and are staged awaiting human approval:

| Rank | # | Directory Name | Registrable Root | Score | Category | Form Status | Outbound Link Architecture | TalentXcel Backlink Status | Approval State |
| :-: | :-: | :--- | :--- | :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | 13 | **AI SaaS Radar** | \`aisaasradar.com\` | **91** | Free Directory | HTTP 200 Form | Direct HTML Anchor (\`follow\`) | **NONE (Not Yet Submitted)** | \`STAGED_READY_FOR_APPROVAL\` |
| **2** | 92 | **ToolDock** | \`zalize.com\` | **87** | Free Directory | HTTP 200 Form | Direct HTML Anchor (\`follow\`) | **NONE (Not Yet Submitted)** | \`STAGED_READY_FOR_APPROVAL\` |
| **3** | 90 | **ThatsMyAI** | \`thatsmy.ai\` | **85** | Free Directory | HTTP 200 Form | Direct HTML Anchor (\`follow\`) | **NONE (Not Yet Submitted)** | \`STAGED_READY_FOR_APPROVAL\` |
| **4** | 48 | **Deekoya AI** | \`deekoyaai.in\` | **85** | Free Directory (.in)| HTTP 200 Form | Direct HTML Anchor (\`follow\`) | **NONE (Not Yet Submitted)** | \`STAGED_READY_FOR_APPROVAL\` |
| **5** | 24 | **AI ToolsXplorer** | \`aitoolsxplorer.in\`| **82** | Free Directory (.in)| HTTP 200 Form | Direct HTML Anchor (\`follow\`) | **NONE (Not Yet Submitted)** | \`STAGED_READY_FOR_APPROVAL\` |
| **6** | 3 | **AI Bookmarks** | \`aibookmarks.net\` | **82** | Free Directory | HTTP 200 Form | Direct HTML Anchor (\`follow\`) | **NONE (Not Yet Submitted)** | \`STAGED_READY_FOR_APPROVAL\` |
| **7** | 87 | **Stackdrop** | \`getstackdrop.com\` | **81** | Free Directory | HTTP 200 Form | Direct HTML Anchor (\`follow\`) | **NONE (Not Yet Submitted)** | \`STAGED_READY_FOR_APPROVAL\` |
| **8** | 7 | **AI Gear Base** | \`aigearbase.com\` | **80** | Free Directory | HTTP 200 Form | Direct HTML Anchor (\`nofollow\`)| **NONE (Not Yet Submitted)** | \`STAGED_READY_FOR_APPROVAL\` |

---

## 6. Separate Opportunity Categories for Future Acquisition

To prevent treating all prospective targets as ordinary directory submissions, pipeline prospects are categorized into distinct operational workflows:

1. **Free Directories (Self-Serve Form):**  
   - Direct web form submission with \$0 organic queue (e.g. AI SaaS Radar, Deekoya AI, Stackdrop).
2. **Commercial Vendor Marketplaces (Vendor Verification):**  
   - Structured vendor onboarding requiring corporate web verification and product profile claiming (e.g. GoodFirms, Clutch, SoftwareSuggest, Capterra, G2).
3. **Membership-Based Industry Associations (Member Resources):**  
   - Professional ecosystem listing requiring association alignment or thought leadership (e.g. SHRM Vendor Directory, NASSCOM Community).
4. **Editorial Media & Publications (Journalistic Review):**  
   - Requires journalistic pitch, founder narrative, or product launch review (e.g. TechPluto, ETHRWorld / indiatimes.com, RecruitingDaily).
5. **Campus & University Partnerships (Institutional TPO Outreach):**  
   - Direct engagement with institutional Training & Placement Officers offering student resume diagnostic resources (e.g. IIT Madras, IIT Delhi, IIT Bombay, BITS Pilani).
6. **Government Employment & Startup Portals (Official Authorization):**  
   - Requires verified legal corporate registration (e.g. Startup India Hub, National Career Service India).

---

## 7. Approved Truthful Product Description

All draft payloads staged in the human approval queue use strictly verified product copy:

> *"TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications."*

- **Destination URL:** \`https://talentxcel.in/resume/ats-check\`
- **Pricing:** \`Free (\$0 / Zero-Cost for Job Seekers)\`

---

## 8. Authoritative Deliverables Index

All 8 deliverables are compiled in [\`reports/\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/) and mirrored to the artifact directory:

1. [\`TXC-QUALIFIED-DOMAIN-DASHBOARD-FINAL.md\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-QUALIFIED-DOMAIN-DASHBOARD-FINAL.md) — Master acquisition dashboard.
2. [\`TXC-VERIFIED-LIVE-REFERRING-DOMAINS.csv\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-VERIFIED-LIVE-REFERRING-DOMAINS.csv) — 2 lines (Exact live baseline: 1 domain, 240 hyperlinks).
3. [\`TXC-PENDING-DISPATCHED-SUBMISSIONS.csv\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-PENDING-DISPATCHED-SUBMISSIONS.csv) — 4 lines (3 legitimate outbound dispatches awaiting review).
4. [\`TXC-STAGED-PROFILES.csv\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-STAGED-PROFILES.csv) — 4 lines (3 staged organic B2B profiles).
5. [\`TXC-APPROVED-OPPORTUNITIES.csv\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-APPROVED-OPPORTUNITIES.csv) — 9 lines (8 quality-gate approved pilot opportunities).
6. [\`TXC-HRTECH-AUTHORITY-PIPELINE.csv\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-HRTECH-AUTHORITY-PIPELINE.csv) — 11 lines (10 HRTech/recruitment research prospects).
7. [\`TXC-EIGHT-CANDIDATE-LINK-VERIFICATION.csv\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-EIGHT-CANDIDATE-LINK-VERIFICATION.csv) — 9 lines (Detailed link architecture vs TalentXcel listing audit).
8. [\`TXC-25-DOMAIN-MILESTONE-TRACKER.csv\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-25-DOMAIN-MILESTONE-TRACKER.csv) — 6 lines (Strict 5-stage milestone tracker).
`;

saveFile('TXC-QUALIFIED-DOMAIN-DASHBOARD-FINAL.md', dashboardFinalMd);
console.log('All 8 true acquisition tracking deliverables successfully generated!');
