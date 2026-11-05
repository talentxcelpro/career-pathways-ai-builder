// backlink-engine/src/campaigns/b2bDirectoryCampaign.cjs
// Workstream B: Verified B2B Directory Profile Preparation Engine.
// Prepares authentic, non-duplicative, zero-cost company & product profiles for 10 premier directories:
// Startup India, Crunchbase, Clutch, GoodFirms, SoftwareSuggest, Product Hunt, Capterra, G2, Wellfound, F6S.
// Strictly Free Organic Tier ($0.00 / ₹0.00). Awaits explicit user approval before live submission.

const config = require('../config.cjs');
const { getDatabase } = require('../db/schema.cjs');
const fs = require('fs');
const path = require('path');

const B2B_DIRECTORY_PROFILES = [
  {
    platform_id: 'startup-india',
    platform_name: 'Startup India (DPIIT Govt of India)',
    platform_domain: 'startupindia.gov.in',
    submission_url: 'https://www.startupindia.gov.in/content/sih/en/startup-scheme.html',
    listing_tier: 'Free Government Startup Recognition ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'Indian registered entity (Pvt Ltd/LLP), <10 years since incorporation, turnover <₹100 Cr, innovative tech-enabled workforce product.',
    verification_requirements: 'Certificate of Incorporation (MCA), PAN, Founder identity proof, pitch deck, official website domain.',
    company_name: 'TalentXcel Technologies',
    tagline: 'AI-Powered Career Intelligence, ATS Resume Scanner & Recruitment Platform',
    short_description: 'TalentXcel is an Indian AI recruitment infrastructure platform connecting engineering talent, universities, and enterprise recruiters with zero-cost ATS resume parsing and real-time compensation benchmarks.',
    full_description: 'TalentXcel Technologies provides next-generation workforce intelligence and AI-driven talent acquisition architecture. The platform features an institutional-grade ATS resume parsing and diagnostic engine, comprehensive compensation analytics across 50 Indian tech hubs, and direct job distribution matching candidates with high-growth employers.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/resume-scanner',
    target_anchor_text: 'TalentXcel AI Career Platform',
    primary_categories: 'Human Resources, Artificial Intelligence, EdTech, Workforce Development',
    verification_contact_email: 'contact@talentxcel.in',
    notes: 'Official National Startup Registry. Provides permanent sovereign .gov.in citation and DPIIT recognition.'
  },
  {
    platform_id: 'crunchbase',
    platform_name: 'Crunchbase',
    platform_domain: 'crunchbase.com',
    submission_url: 'https://www.crunchbase.com/add-new',
    listing_tier: 'Free Basic Organic Company Profile ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'Active operating technology company with official corporate domain and live product.',
    verification_requirements: 'Corporate email address matching domain (@talentxcel.in) or verified LinkedIn founder authorization.',
    company_name: 'TalentXcel',
    tagline: 'AI Recruitment Infrastructure & Career Platform',
    short_description: 'TalentXcel provides AI-driven career diagnostic utilities, ATS resume matching, and recruitment analytics for modern job markets.',
    full_description: 'TalentXcel is an artificial intelligence-powered career platform and recruiting technology suite. It enables candidates to optimize job readiness with real-time ATS scoring while offering recruiters high-precision talent matching and automated compensation benchmarking across tech hubs in India and international markets.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/jobs',
    target_anchor_text: 'TalentXcel',
    primary_categories: 'Recruiting, Artificial Intelligence, Human Resources, Career Planning',
    verification_contact_email: 'admin@talentxcel.in',
    notes: 'World primary venture and company database (DR 92). High-trust brand entity verification.'
  },
  {
    platform_id: 'clutch',
    platform_name: 'Clutch',
    platform_domain: 'clutch.co',
    submission_url: 'https://clutch.co/profile/get-listed',
    listing_tier: 'Free Basic Vendor Profile ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'Operating B2B recruitment, staffing, or HR technology provider.',
    verification_requirements: 'Verified LinkedIn company page, registered business phone, corporate email domain.',
    company_name: 'TalentXcel Technologies',
    tagline: 'AI-Powered Hiring Platform & Technical Recruitment Solutions',
    short_description: 'TalentXcel provides technical staffing tools, AI applicant screening, and candidate diagnostic software for enterprise and high-growth hiring teams.',
    full_description: 'TalentXcel Technologies bridges the gap between engineering talent and modern hiring organizations. Its proprietary platform offers applicant tracking system (ATS) compatibility analysis, candidate skill taxonomy classification, and high-velocity recruitment pipeline management.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/resume-scanner',
    target_anchor_text: 'Visit TalentXcel Website',
    primary_categories: 'Recruiting & Staffing, HR Consulting, Artificial Intelligence Software',
    verification_contact_email: 'partnerships@talentxcel.in',
    notes: 'Leading B2B ratings & reviews agency (DR 89). Zero paid sponsorship required for organic profile.'
  },
  {
    platform_id: 'goodfirms',
    platform_name: 'GoodFirms',
    platform_domain: 'goodfirms.co',
    submission_url: 'https://www.goodfirms.co/get-listed',
    listing_tier: 'Free Standard Software Listing ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'Operational software product or HR service firm with functioning customer interface.',
    verification_requirements: 'Official company website, operational head office address, business contact verification.',
    company_name: 'TalentXcel',
    tagline: 'AI-Driven Career OS & Applicant Tracking Suite',
    short_description: 'TalentXcel is an advanced recruiting platform featuring ATS resume analysis, salary benchmarking, and automated candidate sourcing.',
    full_description: 'TalentXcel delivers an all-in-one career and talent acquisition environment. Features include zero-cost ATS resume diagnostic scanning, real-time tech salary indices across 50 hubs, and structured job distribution schema for candidates and recruitment teams.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/resume-scanner',
    target_anchor_text: 'TalentXcel Profile',
    primary_categories: 'Recruiting Software, Applicant Tracking Systems (ATS), HR Software',
    verification_contact_email: 'support@talentxcel.in',
    notes: 'High-authority global software directory (DR 82). Zero cost organic tier.'
  },
  {
    platform_id: 'softwaresuggest',
    platform_name: 'SoftwareSuggest',
    platform_domain: 'softwaresuggest.com',
    submission_url: 'https://www.softwaresuggest.com/list-your-software',
    listing_tier: 'Free Listing ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'SaaS product or enterprise software tool available in India or globally.',
    verification_requirements: 'Product feature screenshots, live product URL, company email verification.',
    company_name: 'TalentXcel ATS & Career OS',
    tagline: 'Intelligent ATS Resume Scanner & Recruitment Platform',
    short_description: 'TalentXcel is a top-rated AI recruitment tool offering instant resume scoring, candidate ranking, and salary analytics for Indian job markets.',
    full_description: 'TalentXcel ATS & Career OS streamlines recruitment workflows from resume evaluation to candidate discovery. Built for colleges, recruiters, and candidates, it features an instant ATS resume roast and scanner, detailed market compensation breakdowns, and verified employer postings.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/resume-scanner',
    target_anchor_text: 'TalentXcel ATS',
    primary_categories: 'Applicant Tracking System (ATS), HRMS Software, Recruitment Software',
    verification_contact_email: 'vendor@talentxcel.in',
    notes: 'India leading software discovery platform (DR 79). Free listing tier.'
  },
  {
    platform_id: 'producthunt',
    platform_name: 'Product Hunt',
    platform_domain: 'producthunt.com',
    submission_url: 'https://www.producthunt.com/posts/new',
    listing_tier: 'Free Community Product Launch ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'Live, publicly accessible software product or tool available for user testing.',
    verification_requirements: 'Personal Maker account, product tagline under 60 chars, screenshots/demo GIF, maker introduction comment.',
    company_name: 'TalentXcel Resume Scanner',
    tagline: 'Free ATS Resume Diagnostic & AI Career Navigator',
    short_description: 'Instant, institutional-grade ATS resume parsing with real-time score feedback, keyword gap analysis, and 50-hub tech salary benchmarks.',
    full_description: 'TalentXcel empowers engineering graduates and job seekers with zero-cost ATS resume diagnostics. Test your resume against live industry parsing algorithms, discover missing competencies, and benchmark your target compensation across 24 canonical engineering roles.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/resume-scanner',
    target_anchor_text: 'TalentXcel on Product Hunt',
    primary_categories: 'Career, Artificial Intelligence, Developer Tools, Productivity',
    verification_contact_email: 'maker@talentxcel.in',
    notes: 'Top global tech discovery hub (DR 92). High referral traffic and natural backlink acquisition.'
  },
  {
    platform_id: 'capterra',
    platform_name: 'Capterra (Gartner Digital Markets)',
    platform_domain: 'capterra.com',
    submission_url: 'https://www.capterra.com/vendors/sign-up',
    listing_tier: 'Free Basic Vendor Account ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'Functional B2B software product with user onboarding.',
    verification_requirements: 'Corporate business email domain, product documentation, screenshots.',
    company_name: 'TalentXcel Recruiting Suite',
    tagline: 'AI Recruitment Software & Candidate Diagnostic System',
    short_description: 'TalentXcel Recruiting Suite provides applicant screening, ATS resume parsing, and verified compensation benchmarking for modern hiring teams.',
    full_description: 'TalentXcel Recruiting Suite combines AI-driven candidate evaluation with streamlined applicant tracking. Recruiters can parse incoming CVs instantly, compare candidate qualifications with market standards, and leverage open salary benchmarks.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/jobs',
    target_anchor_text: 'TalentXcel Capterra Profile',
    primary_categories: 'Applicant Tracking Systems, Recruitment Software, Career Planning',
    verification_contact_email: 'capterra-admin@talentxcel.in',
    notes: 'Gartner primary software catalog (DR 90). Free organic vendor listing.'
  },
  {
    platform_id: 'g2',
    platform_name: 'G2',
    platform_domain: 'g2.com',
    submission_url: 'https://www.g2.com/products/new',
    listing_tier: 'Free Claim Your Profile ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'Active software product with live users and support contact.',
    verification_requirements: 'Business email matching official domain (@talentxcel.in), product overview.',
    company_name: 'TalentXcel',
    tagline: 'AI Career Platform & Candidate ATS Architecture',
    short_description: 'Peer-reviewed AI career platform offering resume optimization, skill diagnostics, and tech hiring solutions.',
    full_description: 'TalentXcel is an AI-powered talent architecture platform. It enables candidates to navigate career progression through automated resume audits and real-time market insights, while giving recruiters structured access to pre-screened technical talent.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/resume-scanner',
    target_anchor_text: 'TalentXcel on G2',
    primary_categories: 'Job Search Sites, Recruitment Platforms, Resume Parsing',
    verification_contact_email: 'g2-admin@talentxcel.in',
    notes: 'Largest B2B peer-review marketplace (DR 91). Free organic profile claim.'
  },
  {
    platform_id: 'wellfound',
    platform_name: 'Wellfound (formerly AngelList Talent)',
    platform_domain: 'wellfound.com',
    submission_url: 'https://wellfound.com/recruit/overview',
    listing_tier: 'Free Startup Profile ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'Active technology company or startup with operating team and official domain.',
    verification_requirements: 'Founder identity verification, business email, LinkedIn connection.',
    company_name: 'TalentXcel',
    tagline: 'AI Recruitment Infrastructure Transforming Engineering Hiring',
    short_description: 'TalentXcel builds next-generation AI recruitment infrastructure connecting top technical talent with innovative enterprises.',
    full_description: 'TalentXcel is a technology company building open career infrastructure. By combining automated ATS diagnostics, comprehensive salary data across India, and predictive skill matching, TalentXcel empowers candidates and tech companies to hire faster and more accurately.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/jobs',
    target_anchor_text: 'TalentXcel on Wellfound',
    primary_categories: 'Recruiting, Artificial Intelligence, Human Resources, Future of Work',
    verification_contact_email: 'talent@talentxcel.in',
    notes: 'Global startup talent and company database (DR 86). High developer and founder audience.'
  },
  {
    platform_id: 'f6s',
    platform_name: 'F6S Startup Community',
    platform_domain: 'f6s.com',
    submission_url: 'https://www.f6s.com/programs',
    listing_tier: 'Free Startup Profile ($0 / ₹0)',
    cost_usd: 0.0,
    cost_inr: 0.0,
    eligibility_criteria: 'Active startup or tech venture.',
    verification_requirements: 'Founder profile, company headquarters, official domain.',
    company_name: 'TalentXcel Technologies',
    tagline: 'AI Career Intelligence & Workforce Infrastructure',
    short_description: 'TalentXcel provides AI-driven career diagnostic utilities and recruitment analytics for modern job markets.',
    full_description: 'TalentXcel Technologies is a tech venture developing intelligent workforce infrastructure. The platform offers real-time ATS resume scanning, verified salary benchmarking across 50 Indian tech hubs, and structured job distribution.',
    primary_target_url: 'https://talentxcel.in',
    deep_link_url: 'https://talentxcel.in/resume-scanner',
    target_anchor_text: 'TalentXcel on F6S',
    primary_categories: 'HRTech, AI, EdTech, Workforce',
    verification_contact_email: 'contact@talentxcel.in',
    notes: 'Global founder and accelerator community (DR 84). Free company profile.'
  }
];

class B2bDirectoryCampaign {
  constructor(db) {
    this.db = db || getDatabase();
  }

  /**
   * Initializes and stages the 10 B2B directory profiles in SQLite
   */
  stageDirectoryProfiles() {
    console.log(`\n🏢 [Workstream B: B2B Directories] Staging official profiles for 10 premier directories...`);
    const now = new Date().toISOString();

    const insertStmt = this.db.prepare(`
      INSERT INTO b2b_directory_profiles (
        platform_id, platform_name, platform_domain, submission_url,
        listing_tier, cost_usd, cost_inr, eligibility_criteria,
        verification_requirements, profile_status, company_name,
        tagline, short_description, full_description, primary_target_url,
        deep_link_url, target_anchor_text, primary_categories,
        verification_contact_email, notes, created_at, updated_at
      ) VALUES (
        @platform_id, @platform_name, @platform_domain, @submission_url,
        @listing_tier, @cost_usd, @cost_inr, @eligibility_criteria,
        @verification_requirements, 'PROFILE_READY_FOR_SUBMISSION', @company_name,
        @tagline, @short_description, @full_description, @primary_target_url,
        @deep_link_url, @target_anchor_text, @primary_categories,
        @verification_contact_email, @notes, @now, @now
      )
      ON CONFLICT(platform_id) DO UPDATE SET
        company_name = excluded.company_name,
        tagline = excluded.tagline,
        short_description = excluded.short_description,
        full_description = excluded.full_description,
        updated_at = excluded.updated_at
    `);

    this.db.exec('BEGIN TRANSACTION;');
    for (const p of B2B_DIRECTORY_PROFILES) {
      insertStmt.run({
        ...p,
        now
      });
    }
    this.db.exec('COMMIT;');

    console.log(`✅ [Workstream B: B2B Directories] Staged ${B2B_DIRECTORY_PROFILES.length} official profiles in database.`);
    const exportFiles = this.exportProfiles();
    return exportFiles;
  }

  /**
   * Exports manifest files for review
   */
  exportProfiles() {
    if (!fs.existsSync(config.PATHS.EXPORTS)) {
      fs.mkdirSync(config.PATHS.EXPORTS, { recursive: true });
    }

    const records = this.db.prepare('SELECT * FROM b2b_directory_profiles ORDER BY id ASC').all();

    const jsonFile = path.join(config.PATHS.EXPORTS, 'b2b_directory_profiles_manifest.json');
    fs.writeFileSync(jsonFile, JSON.stringify(records, null, 2), 'utf8');

    const csvFile = path.join(config.PATHS.EXPORTS, 'b2b_directory_profiles.csv');
    const headers = 'id,platform_id,platform_name,platform_domain,submission_url,listing_tier,cost_usd,cost_inr,eligibility_criteria,verification_requirements,profile_status,company_name,tagline,primary_target_url,deep_link_url,target_anchor_text,primary_categories,verification_contact_email\n';
    const rows = records.map(r => [
      r.id,
      `"${r.platform_id}"`,
      `"${r.platform_name}"`,
      `"${r.platform_domain}"`,
      `"${r.submission_url}"`,
      `"${r.listing_tier}"`,
      r.cost_usd,
      r.cost_inr,
      `"${(r.eligibility_criteria || '').replace(/"/g, '""')}"`,
      `"${(r.verification_requirements || '').replace(/"/g, '""')}"`,
      r.profile_status,
      `"${r.company_name}"`,
      `"${(r.tagline || '').replace(/"/g, '""')}"`,
      `"${r.primary_target_url}"`,
      `"${r.deep_link_url || ''}"`,
      `"${r.target_anchor_text}"`,
      `"${(r.primary_categories || '').replace(/"/g, '""')}"`,
      `"${r.verification_contact_email}"`
    ].join(',')).join('\n');

    fs.writeFileSync(csvFile, headers + rows, 'utf8');
    console.log(`📄 Exported B2B Directory Profiles to ${jsonFile} & ${csvFile}`);
    return { jsonFile, csvFile };
  }
}

module.exports = {
  B2bDirectoryCampaign,
  B2B_DIRECTORY_PROFILES
};
