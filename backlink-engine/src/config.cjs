// backlink-engine/src/config.cjs
// Independent Backlink Acquisition Engine Configuration for TalentXcel
// ZERO Vercel dependencies, ZERO Vercel workload/costs, completely autonomous execution.

const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'backlink_engine.db');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
const SEEDS_DIR = path.join(DATA_DIR, 'seeds');

module.exports = {
  // Target Specification
  TARGET_WEBSITE: 'https://talentxcel.in',
  CANONICAL_DOMAIN: 'talentxcel.in',

  // Ultimate Strategic Goals
  TARGETS: {
    REFERRING_DOMAINS: 10000, // Target B: 10,000+ unique referring domains (Domain Diversity & Authority)
    BACKLINKS: 100000         // Target A: 100,000+ backlinks (Link Volume & Deep Linking)
  },

  // Storage Paths
  PATHS: {
    ROOT: ROOT_DIR,
    DATA: DATA_DIR,
    DB: DB_PATH,
    EXPORTS: EXPORTS_DIR,
    SEEDS: SEEDS_DIR,
    INSTITUTIONS_CATALOG: path.resolve(__dirname, '../../src/data/indianInstitutionsCatalog.json'),
  },

  // Strict Acquisition Pipeline Stages (Separating domains, prospects, outreach & verified links)
  PIPELINE_STAGES: {
    DISCOVERED: 'DISCOVERED_DOMAIN',         // Candidate domain discovered in raw universe
    QUALIFIED: 'QUALIFIED_PROSPECT',          // Passed multi-factor relevance & anti-spam gates
    CONTACTED: 'CONTACTED_PROSPECT',          // Direct outreach / partnership pitch dispatched
    PLEDGED: 'PARTNERSHIP_AGREED',           // Partner committed to adding resource link
    PUBLISHED: 'PUBLISHED_BACKLINK',          // Link placed on live external page (pending verification)
    VERIFIED: 'VERIFIED_REFERRING_DOMAIN'     // Confirmed live via HTTP DOM inspection
  },

  // Focus Categories (Strictly legitimate, non-spam)
  CATEGORIES: {
    EDUCATION_HIGHER: {
      id: 'EDUCATION_HIGHER',
      label: 'Accredited Higher Education & Universities (TPO & Career Services)',
      priority: 1,
      authorityEvidence: 'NIRF / AICTE / UGC Accreditation'
    },
    HR_RECRUITMENT: {
      id: 'HR_RECRUITMENT',
      label: 'Licensed HR, Staffing Agencies & Recruitment Platforms',
      priority: 2,
      authorityEvidence: 'ISF / ERA / Corporate Registry'
    },
    STARTUP_BUSINESS: {
      id: 'STARTUP_BUSINESS',
      label: 'Verified Business Directories & SaaS Registries',
      priority: 3,
      authorityEvidence: 'DPIIT Startup India / Official Directory'
    },
    TECH_DEVELOPER: {
      id: 'TECH_DEVELOPER',
      label: 'Developer Ecosystems, Tech Publications & Open Source',
      priority: 4,
      authorityEvidence: 'Developer Community & Open Data'
    },
    MEDIA_EDITORIAL: {
      id: 'MEDIA_EDITORIAL',
      label: 'HR & Business Media, Journalism & Industry Research',
      priority: 5,
      authorityEvidence: 'National Press & Editorial Journal'
    }
  },

  // Geographies
  MARKETS: {
    INDIA: 'India',
    GLOBAL: 'Global',
    US: 'United States',
    UK: 'United Kingdom',
    UAE: 'United Arab Emirates',
    SEA: 'Southeast Asia'
  },

  // Legitimate Link Modalities (Google Link Spam Guideline Compliant)
  MODALITIES: {
    UNIVERSITY_TPO_RESOURCE: {
      id: 'UNIVERSITY_TPO_RESOURCE',
      label: 'Campus TPO Student Career Resource Page',
      description: 'Voluntary inclusion of free ATS resume scanner and placement tools on student resource pages',
      riskProfile: 'Zero Risk / High Trust',
      expectedRel: 'follow'
    },
    EDITORIAL_MENTION: {
      id: 'EDITORIAL_MENTION',
      label: 'Editorial Hiring Study Citation',
      description: 'Journalistic citations of TalentXcel open-data salary and employment studies',
      riskProfile: 'Zero Risk / High Trust',
      expectedRel: 'follow'
    },
    DIRECTORY_LISTING: {
      id: 'DIRECTORY_LISTING',
      label: 'Verified Business Directory Profile',
      description: 'Official company profile in legitimate directories (Startup India, Crunchbase, Clutch)',
      riskProfile: 'Low Risk',
      expectedRel: 'follow_or_nofollow'
    },
    OPEN_DATA_CITATION: {
      id: 'OPEN_DATA_CITATION',
      label: 'Open-Data & GitHub Technical Attribution',
      description: 'Attribution links in technical repositories and developer datasets',
      riskProfile: 'Low Risk',
      expectedRel: 'nofollow'
    },
    JOB_FEED_SYNDICATION: {
      id: 'JOB_FEED_SYNDICATION',
      label: 'Job Aggregator Distribution & Referral',
      description: 'Organic vacancy distribution for user acquisition (Referral traffic primary, backlink secondary)',
      riskProfile: 'Low Risk / Distribution Focus',
      expectedRel: 'canonical_or_referral'
    },
    VOLUNTARY_BRAND_BADGE: {
      id: 'VOLUNTARY_BRAND_BADGE',
      label: 'Voluntary Brand Attribution',
      description: 'Strictly voluntary partner badge with nofollow qualification (Zero template link spam)',
      riskProfile: 'Compliant / Nofollow Qualified',
      expectedRel: 'nofollow'
    }
  },

  // Crawler & Live Verification Settings
  VERIFIER: {
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 TalentXcelBacklinkAuditBot/2.0',
    TIMEOUT_MS: 12000,
    MAX_CONCURRENCY: 8,
    MAX_REDIRECTS: 5
  },

  // Spam Filters & Anti-Spam Gate
  SPAM_GATE: {
    MAX_ALLOWED_SPAM_SCORE: 25,
    FORBIDDEN_KEYWORDS: [
      'casino', 'gambling', 'betting', 'poker', 'slots',
      'crypto-airdrop', 'free-tokens', 'payday-loan', 'adult', 'escort',
      'buy-cheap-backlinks', 'private-blog-network', 'pbn-network',
      'link-exchange-club', 'free-dofollow-submission-xyz'
    ],
    SUSPICIOUS_TLDS: ['.xyz', '.top', '.click', '.monster', '.loan', '.gdn', '.racing']
  }
};
