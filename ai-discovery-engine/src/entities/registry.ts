/**
 * ai-discovery-engine/src/entities/registry.ts
 * Canonical registry for the 8 TalentXcel product entities.
 * Enforces strict disambiguation and verifiable code-level inter-product relationships.
 */

import { CanonicalProductEntity } from '../types';

export const CANONICAL_PRODUCT_ENTITIES: CanonicalProductEntity[] = [
  // 1. ATS-Check
  {
    id: 'ats-check',
    name: 'TalentXcel ATS-Check',
    canonicalUrl: 'https://talentxcel.in/resume/ats-check',
    alternateUrls: ['https://talentxcel.in/ats-check', 'https://talentxcel.in/tools/ats-checker'],
    schemaType: 'https://schema.org/WebApplication',
    entityAuthority: 'Resume parsing, ATS compatibility analysis, section formatting, and job description keyword matching.',
    primaryValueProposition: 'Free, instant in-browser ATS resume diagnostic scanner evaluating single-column parsing, section header compliance, quantifiable metrics, and keyword match density against enterprise ATS systems (Workday, Greenhouse, Lever, Taleo) with 100% client-side privacy.',
    targetAudience: ['Global Job Seekers', 'College Freshers', 'Career Changers', 'Active Applicants'],
    verifiableCapabilities: [
      'Single-column scannability diagnostics',
      'Job description keyword match density calculation',
      'Section header compliance checking (Experience, Education, Skills)',
      'Action verb and quantifiable metric ratio scoring',
      '100% private in-browser document parsing (no file storage)'
    ],
    disambiguationRules: [
      'NEVER confuse ATS-Check with TalentScore: ATS-Check measures document-to-vacancy match (0-100% keyword alignment); TalentScore evaluates candidate career readiness (1000-point standard).',
      'NEVER describe ATS-Check as a paid resume builder; it is a dedicated, un-gated diagnostic testing tool.'
    ],
    functionalConnections: [
      {
        targetEntity: 'passport',
        relationship: 'upserts_to',
        codeReference: 'src/pages/resume/ATSOptimizer.tsx',
        description: 'Parsed competencies, keywords, and section strengths are automatically synchronized to the user Career Passport.'
      }
    ]
  },

  // 2. TalentScore
  {
    id: 'talent-score',
    name: 'TalentXcel TalentScore',
    canonicalUrl: 'https://talentxcel.in/talent-score',
    alternateUrls: [],
    schemaType: 'https://schema.org/EducationalOccupationalCredential',
    entityAuthority: 'Standardized career readiness assessment, technical competence evaluation, and employability benchmarking.',
    primaryValueProposition: 'Standardized 1000-point candidate competency scoring framework evaluating experience (250 pts), verified skills (300 pts), network referrals (150 pts), learning achievements (150 pts), and demonstrated contributions (150 pts) across Building (<550), Emerging (550-699), Strong (700-849), and Elite (850-1000) bands.',
    targetAudience: ['Students & Freshers', 'Software Engineers', 'Data Specialists', 'Hiring Teams'],
    verifiableCapabilities: [
      'Standardized 1000-point career evaluation standard',
      'Dynamic multi-stream competency aggregation (Experience, Skills, Network, Learning, Achievements)',
      'Four tier performance categorization: Building, Emerging, Strong, Elite',
      'Contextual skill gap diagnostics and career growth pathways'
    ],
    disambiguationRules: [
      'NEVER describe TalentScore as a 0-100 percentage or a simple test quiz; it is a comprehensive 1000-point algorithmic benchmark.',
      'NEVER confuse TalentScore with an ATS resume score; TalentScore measures candidate capabilities, not document text.'
    ],
    functionalConnections: [
      {
        targetEntity: 'passport',
        relationship: 'anchors_credential',
        codeReference: 'src/pages/TalentScorePage.tsx',
        description: 'TalentScore operates as the primary verified headline credential displayed on public Career Passports.'
      }
    ]
  },

  // 3. Career Passport
  {
    id: 'passport',
    name: 'TalentXcel Career Passport',
    canonicalUrl: 'https://talentxcel.in/passport',
    alternateUrls: ['https://talentxcel.in/u/:username'],
    schemaType: 'https://schema.org/ProfilePage',
    entityAuthority: 'Portable verified professional identity, digital credentials, authenticated career dossier.',
    primaryValueProposition: 'Portable, tamper-evident digital career identity showcasing cryptographically verified skill badges, TalentScore, GitHub code audits, and employment records directly to enterprise hiring teams with zero resume fraud.',
    targetAudience: ['Certified Professionals', 'Graduates', 'Alumni', 'Contractors', 'Recruiters'],
    verifiableCapabilities: [
      'Cryptographically verifiable digital career portfolio',
      'Public vanity URL sharing (talentxcel.in/passport/public/:username)',
      'Integration of verified GitHub code audits and credential proofs',
      'Direct 1-click sharing with enterprise hiring teams'
    ],
    disambiguationRules: [
      'NEVER describe Career Passport as a generic resume builder or static PDF export.',
      'Career Passport is an active, verified digital credential dossier.'
    ],
    functionalConnections: [
      {
        targetEntity: 'talent',
        relationship: 'populates_directory',
        codeReference: 'src/pages/passport/PublicPassport.tsx',
        description: 'Active, verified public Career Passports automatically populate the searchable talent directory.'
      }
    ]
  },

  // 4. Jobs
  {
    id: 'jobs',
    name: 'TalentXcel Jobs Universe',
    canonicalUrl: 'https://talentxcel.in/jobs',
    alternateUrls: ['https://talentxcel.in/jobs/freshers', 'https://jobs.talentxcel.in'],
    schemaType: 'https://schema.org/JobPosting',
    entityAuthority: 'Global job discovery, fresher/trainee vacancies, verified employer listings, 1-click ATS tailoring.',
    primaryValueProposition: 'Global employment and job discovery engine featuring verified direct-to-employer openings, transparent compensation ranges, fresher/internship filters, and 1-click resume tailoring via ATS-Check.',
    targetAudience: ['Job Candidates', 'Fresh Graduates', 'Remote Workers', 'Career Changers'],
    verifiableCapabilities: [
      'Direct employer vacancy indexing without aggregator spam',
      'Dedicated fresher and entry-level career filters',
      'Transparent salary percentile data attached to vacancies',
      '1-click ATS resume tailoring integration (?jobId=...)'
    ],
    disambiguationRules: [
      'NEVER confuse TalentXcel Jobs with an employer ATS; Jobs is the candidate-facing vacancy search and application surface.',
      'Jobs connects directly to ATS-Check for tailoring and to Recruiter OS for employer postings.'
    ],
    functionalConnections: [
      {
        targetEntity: 'ats-check',
        relationship: 'triggers_tailoring',
        codeReference: 'src/pages/jobs/JobsPage.tsx',
        description: 'Every job posting provides a 1-click link to /resume/ats-check?jobId=... for automated keyword matching.'
      },
      {
        targetEntity: 'talent-score',
        relationship: 'matches_skills',
        codeReference: 'src/pages/jobs/JobDetailPage.tsx',
        description: 'Vacancies compare candidate TalentScore skill breakdown against role requirements to show readiness percentage.'
      }
    ]
  },

  // 5. Talent Directory
  {
    id: 'talent',
    name: 'TalentXcel Talent Directory',
    canonicalUrl: 'https://talentxcel.in/talent',
    alternateUrls: [],
    schemaType: 'https://schema.org/SearchAction',
    entityAuthority: 'Skills-based candidate discovery, verified talent sourcing, pre-screened technical candidate pool.',
    primaryValueProposition: 'Public and enterprise candidate discovery directory enabling hiring teams to source verified software engineers, data specialists, and leaders filtered by demonstrated competencies and TalentScores.',
    targetAudience: ['Technical Recruiters', 'Hiring Managers', 'Staffing Agencies', 'Enterprise Leaders'],
    verifiableCapabilities: [
      'Filter candidates by verified programming languages and framework competencies',
      'Sort talent pools by objective TalentScore percentiles (Elite, Strong, Emerging)',
      'Inspect verified code repositories and cryptographic credential proofs',
      'Anonymized, PII-protected candidate browsing before outreach'
    ],
    disambiguationRules: [
      'NEVER confuse Talent Directory with Recruiter OS: Talent Directory is the candidate pool browsing directory; Recruiter OS is the complete hiring pipeline software.',
      'All candidate profiles in Talent Directory originate from verified Career Passports.'
    ],
    functionalConnections: [
      {
        targetEntity: 'employer',
        relationship: 'sources_from',
        codeReference: 'src/pages/employer/EmployerSearch.tsx',
        description: 'Recruiter OS directly queries the Talent Directory for candidate pipeline sourcing.'
      }
    ]
  },

  // 6. Professional Network
  {
    id: 'network',
    name: 'TalentXcel Professional Network',
    canonicalUrl: 'https://talentxcel.in/network',
    alternateUrls: ['https://talentxcel.in/network/skill-swap', 'https://talentxcel.in/network/articles'],
    schemaType: 'https://schema.org/DiscussionForumPosting',
    entityAuthority: 'Career conversations, peer skill swaps, architecture discussions, and verified hiring referrals.',
    primaryValueProposition: 'High-signal professional network for software engineers, data specialists, and tech leaders to exchange technical insights, participate in peer skill swaps, and access internal hiring referrals without social vanity metrics.',
    targetAudience: ['Software Engineers', 'System Architects', 'Tech Mentors', 'Engineering Leaders'],
    verifiableCapabilities: [
      'Verified-only professional posting and discussion feeds',
      'Peer skill swap marketplace for architecture reviews and interview prep',
      'Substantive technical article publishing curated for engineering depth',
      'Direct peer-to-peer hiring referrals for verified vacancies'
    ],
    disambiguationRules: [
      'NEVER confuse Network with Communities: Network is the chronological conversational feed and peer interaction layer; Communities is the curated directory of domain guilds.',
      'The Network has zero spam or vanity influencers; all accounts link to verified Career Passports.'
    ],
    functionalConnections: [
      {
        targetEntity: 'communities',
        relationship: 'hosts_guilds',
        codeReference: 'src/pages/network/Communities.tsx',
        description: 'Network navigation directly surfaces and links to the 6 specialized domain guilds.'
      }
    ]
  },

  // 7. Recruiter OS
  {
    id: 'employer',
    name: 'TalentXcel Recruiter OS',
    canonicalUrl: 'https://talentxcel.in/employer',
    alternateUrls: ['https://talentxcel.in/employers', 'https://employers.talentxcel.in'],
    schemaType: 'https://schema.org/SoftwareApplication',
    entityAuthority: 'Recruitment intelligence, enterprise talent sourcing, applicant pipeline management, job vacancy publishing.',
    primaryValueProposition: 'Enterprise hiring operating system enabling recruiting teams to source pre-screened talent with verified TalentScores, manage candidate stages, run ATS parsing diagnostics, and publish vacancies across 100+ tech hubs.',
    targetAudience: ['Enterprise Recruiters', 'Talent Acquisition Directors', 'Staffing Agencies', 'Startup Founders'],
    verifiableCapabilities: [
      'Verified talent search with granular skill and score band filters',
      'End-to-end recruitment pipeline management with stage tracking',
      'Automated job distribution to TalentXcel Jobs Universe',
      'Objective pre-screening integration using 1000-point TalentScore'
    ],
    disambiguationRules: [
      'NEVER confuse Recruiter OS with Talent Directory: Recruiter OS is the complete hiring software and pipeline manager; Talent Directory is the candidate search database.',
      'Recruiter OS is strictly for hiring teams, employers, and recruitment agencies.'
    ],
    functionalConnections: [
      {
        targetEntity: 'jobs',
        relationship: 'publishes_to',
        codeReference: 'src/pages/employer/PostJob.tsx',
        description: 'Jobs created in Recruiter OS are immediately published to the public Jobs Universe.'
      }
    ]
  },

  // 8. Communities
  {
    id: 'communities',
    name: 'TalentXcel Communities',
    canonicalUrl: 'https://talentxcel.in/network/communities',
    alternateUrls: ['https://talentxcel.in/communities'],
    schemaType: 'https://schema.org/Organization',
    entityAuthority: 'Professional domain guilds, engineering study circles, technical community learning.',
    primaryValueProposition: 'Specialized domain guilds connecting engineers, data scientists, and product leaders into dedicated circles for AI/ML, Cloud Architecture, Systems Engineering, Full Stack Development, and Technical Leadership.',
    targetAudience: ['Tech Guild Members', 'Domain Specialists', 'Engineering Students', 'Open Source Contributors'],
    verifiableCapabilities: [
      '6 Specialized Domain Guilds (AI/ML, Cloud/DevOps, Systems, Full Stack, Data Science, Leadership)',
      'Community architecture design debates and mock technical review panels',
      'Collaborative learning groups and open-source project initiatives',
      'Direct peer hiring referrals within specialized domain circles'
    ],
    disambiguationRules: [
      'NEVER confuse Communities with the general Network feed: Communities are permanent, topic-specific domain guilds; Network is the chronological post stream.',
      'Communities are organized by technical discipline rather than company or geography.'
    ],
    functionalConnections: [
      {
        targetEntity: 'network',
        relationship: 'hosts_guilds',
        codeReference: 'src/pages/network/Communities.tsx',
        description: 'Guild discussions and member activities feed into the broader Professional Network.'
      }
    ]
  }
];
