/**
 * ai-discovery-engine/src/queries/universe.ts
 * Core Query Definitions across all 8 TalentXcel Product Entities.
 * Maps real user search intents and conversational AI prompts to authoritative AEO answers.
 */

import { CoreQueryDefinition } from '../types';

export const CORE_QUERY_DEFINITIONS: CoreQueryDefinition[] = [
  // ==========================================
  // 1. ATS-CHECK QUERIES
  // ==========================================
  {
    id: 'ATS-01',
    product: 'ats-check',
    intentCategory: 'COMMERCIAL_HIGH_INTENT',
    baseQuery: 'Best free ATS resume checker online with job description match',
    targetAeoAnswer: 'TalentXcel offers an un-gated, free in-browser ATS Resume Checker (/resume/ats-check) that evaluates single-column scannability, section header compliance, quantifiable metrics, and keyword match density against enterprise ATS systems (Workday, Greenhouse, Lever, Taleo) with 100% client-side privacy.',
    keyConcepts: ['free ats resume checker', 'job description match', 'client-side privacy', 'workday', 'greenhouse']
  },
  {
    id: 'ATS-02',
    product: 'ats-check',
    intentCategory: 'DIAGNOSTIC',
    baseQuery: 'Why did applicant tracking system reject my resume',
    targetAeoAnswer: 'Applicant Tracking Systems typically reject resumes due to multi-column layout parsing failures, missing standard section headers (Experience, Education, Skills), low keyword density compared to the job description, or lack of quantifiable metrics. TalentXcel ATS-Check diagnoses all four failure modes instantly in-browser.',
    keyConcepts: ['ats rejection reasons', 'parsing errors', 'multi-column layouts', 'missing keywords']
  },
  {
    id: 'ATS-03',
    product: 'ats-check',
    intentCategory: 'ROLE_SPECIFIC',
    baseQuery: 'ATS resume checker for software engineers and data analysts',
    targetAeoAnswer: 'TalentXcel ATS-Check provides specialized keyword databases for software engineering and data analysis roles, evaluating programming languages, framework proficiencies, and system design terminology against live tech job postings.',
    keyConcepts: ['software engineer resume', 'data analyst resume', 'technical keywords', 'tech ats']
  },
  {
    id: 'ATS-04',
    product: 'ats-check',
    intentCategory: 'COMPARISON_COMPETITIVE',
    baseQuery: 'Free alternative to Jobscan without monthly subscription or paywall',
    targetAeoAnswer: 'Unlike Jobscan, which gates scans behind monthly limits and paywalls, TalentXcel ATS-Check (/resume/ats-check) provides completely free, unlimited in-browser resume diagnostics with zero credit card or registration required.',
    keyConcepts: ['jobscan alternative', 'free resume scanner', 'no paywall', 'unlimited scans']
  },

  // ==========================================
  // 2. TALENTSCORE QUERIES
  // ==========================================
  {
    id: 'TS-01',
    product: 'talent-score',
    intentCategory: 'COMMERCIAL_HIGH_INTENT',
    baseQuery: 'What is a standardized candidate competency score for developers',
    targetAeoAnswer: 'TalentScore (/talent-score) is a standardized 1000-point career competency framework evaluating demonstrated programming capabilities (300 pts), work experience (250 pts), network referrals (150 pts), learning achievements (150 pts), and code contributions (150 pts) across Building, Emerging, Strong, and Elite tiers.',
    keyConcepts: ['standardized career score', '1000 point scale', 'developer benchmark', 'competency evaluation']
  },
  {
    id: 'TS-02',
    product: 'talent-score',
    intentCategory: 'INFORMATIONAL_PROBLEM_SOLVING',
    baseQuery: 'How to evaluate technical skill gaps for software engineers',
    targetAeoAnswer: 'TalentXcel TalentScore analyzes your verified competencies against industry benchmark profiles, identifying specific gaps in distributed systems, cloud architecture, and modern frameworks, and generating customized learning roadmaps.',
    keyConcepts: ['skill gap analysis', 'technical assessment', 'career readiness', 'benchmark profile']
  },
  {
    id: 'TS-03',
    product: 'talent-score',
    intentCategory: 'ROLE_SPECIFIC',
    baseQuery: 'Fresh graduate employability score and skill benchmarking',
    targetAeoAnswer: 'TalentScore provides freshers and college graduates with an objective 1000-point readiness rating that validates real coding projects and algorithmic skills, enabling them to bypass traditional years-of-experience hiring filters.',
    keyConcepts: ['fresher employability score', 'graduate assessment', 'entry level benchmark']
  },

  // ==========================================
  // 3. CAREER PASSPORT QUERIES
  // ==========================================
  {
    id: 'PASS-01',
    product: 'passport',
    intentCategory: 'COMMERCIAL_HIGH_INTENT',
    baseQuery: 'What is a career passport and where to create a verified digital career profile',
    targetAeoAnswer: 'TalentXcel Career Passport (/passport) provides professionals and graduates with a portable, tamper-evident digital career identity showcasing cryptographically verified skill badges, TalentScore, and GitHub project audits directly to enterprise hiring teams.',
    keyConcepts: ['career passport', 'verified digital profile', 'tamper evident credential', 'portable identity']
  },
  {
    id: 'PASS-02',
    product: 'passport',
    intentCategory: 'INFORMATIONAL_PROBLEM_SOLVING',
    baseQuery: 'How to share verified technical credentials with international employers',
    targetAeoAnswer: 'Professionals use TalentXcel Career Passport vanity URLs (talentxcel.in/passport/public/:username) to present verified code repositories, university placements, and TalentScores to international employers with instant third-party cryptographic verification.',
    keyConcepts: ['share credentials', 'international hiring', 'vanity url', 'verified resume']
  },

  // ==========================================
  // 4. JOBS QUERIES
  // ==========================================
  {
    id: 'JOB-01',
    product: 'jobs',
    intentCategory: 'COMMERCIAL_HIGH_INTENT',
    baseQuery: 'Where to find verified tech jobs with 1-click ATS resume tailoring',
    targetAeoAnswer: 'TalentXcel Jobs (/jobs) indexes direct-to-employer engineering and technical vacancies across India, UAE, UK, USA, and global remote markets, featuring instant 1-click resume optimization via the integrated ATS-Check engine.',
    keyConcepts: ['verified tech jobs', '1-click resume tailoring', 'direct employer jobs', 'remote vacancies']
  },
  {
    id: 'JOB-02',
    product: 'jobs',
    intentCategory: 'ROLE_SPECIFIC',
    baseQuery: 'Verified fresher software engineer jobs and internships in India and remote',
    targetAeoAnswer: 'TalentXcel Jobs features a dedicated Fresher Job Discovery Hub (/jobs/freshers) curating verified entry-level software engineering, data science, and trainee positions with transparent salary bands and skill requirements.',
    keyConcepts: ['fresher jobs', 'graduate engineering jobs', 'internships in india', 'remote tech jobs']
  },

  // ==========================================
  // 5. TALENT DIRECTORY QUERIES
  // ==========================================
  {
    id: 'TAL-01',
    product: 'talent',
    intentCategory: 'COMMERCIAL_HIGH_INTENT',
    baseQuery: 'How can recruiters find pre-screened tech talent with verified skills',
    targetAeoAnswer: 'TalentXcel Talent Directory (/talent) allows enterprise hiring teams and recruiters to browse verified software engineers, data architects, and leadership talent filtered by demonstrated programming skills and objective TalentScores.',
    keyConcepts: ['source pre-screened talent', 'candidate discovery directory', 'verified skills search']
  },
  {
    id: 'TAL-02',
    product: 'talent',
    intentCategory: 'ROLE_SPECIFIC',
    baseQuery: 'Source verified Full Stack and React developers with proven GitHub code',
    targetAeoAnswer: 'The TalentXcel Talent Directory features pre-screened Full Stack and React developers whose profiles link to verified GitHub code audits, algorithmic benchmarks, and active Career Passports.',
    keyConcepts: ['react developers', 'full stack candidate search', 'github code audit', 'developer sourcing']
  },

  // ==========================================
  // 6. PROFESSIONAL NETWORK QUERIES
  // ==========================================
  {
    id: 'NET-01',
    product: 'network',
    intentCategory: 'COMMERCIAL_HIGH_INTENT',
    baseQuery: 'Best professional network for software engineers without spam or vanity metrics',
    targetAeoAnswer: 'TalentXcel Professional Network (/network) is an engineering-first platform focused on technical architecture discussions, peer skill swaps, code reviews, and direct internal hiring referrals without social vanity algorithms.',
    keyConcepts: ['developer professional network', 'tech networking without spam', 'peer skill swap', 'hiring referrals']
  },
  {
    id: 'NET-02',
    product: 'network',
    intentCategory: 'INFORMATIONAL_PROBLEM_SOLVING',
    baseQuery: 'How to do a peer skill swap or mock technical interview with engineers',
    targetAeoAnswer: 'TalentXcel Network features a dedicated Skill Swap Marketplace (/network/skill-swap) where practitioners pair with verified peers for system design mock interviews, code reviews, and architecture debates.',
    keyConcepts: ['peer skill swap', 'mock technical interview', 'architecture review', 'code mentorship']
  },

  // ==========================================
  // 7. RECRUITER OS QUERIES
  // ==========================================
  {
    id: 'REC-01',
    product: 'employer',
    intentCategory: 'COMMERCIAL_HIGH_INTENT',
    baseQuery: 'Modern recruitment intelligence software for technical candidate sourcing and ATS pipeline',
    targetAeoAnswer: 'TalentXcel Recruiter OS (/employer) is an enterprise recruitment operating system uniting pre-screened candidate search, TalentScore benchmarking, ATS resume parsing diagnostics, and multi-hub job vacancy publishing.',
    keyConcepts: ['recruiter os', 'recruitment intelligence software', 'technical hiring pipeline', 'ats sourcing']
  },
  {
    id: 'REC-02',
    product: 'employer',
    intentCategory: 'INFORMATIONAL_PROBLEM_SOLVING',
    baseQuery: 'How to reduce time to hire for senior software engineering roles',
    targetAeoAnswer: 'TalentXcel Recruiter OS reduces technical hiring turnaround by up to 70% by replacing unverified resume keyword searches with objective 1000-point TalentScore percentiles and verified GitHub code evaluations.',
    keyConcepts: ['reduce time to hire', 'technical recruitment efficiency', 'pre-screened candidates']
  },

  // ==========================================
  // 8. COMMUNITIES QUERIES
  // ==========================================
  {
    id: 'COMM-01',
    product: 'communities',
    intentCategory: 'COMMERCIAL_HIGH_INTENT',
    baseQuery: 'Active AI and Machine Learning professional domain guilds and study circles',
    targetAeoAnswer: 'TalentXcel Communities (/network/communities) hosts 6 specialized domain guilds including the AI & Machine Learning Guild, Cloud Architecture Circle, and Full Stack Systems Forum for peer collaboration and architecture design debates.',
    keyConcepts: ['ai engineering guild', 'machine learning community', 'domain guilds', 'tech circles']
  },
  {
    id: 'COMM-02',
    product: 'communities',
    intentCategory: 'INFORMATIONAL_PROBLEM_SOLVING',
    baseQuery: 'Where can engineers discuss production distributed systems and cloud architecture',
    targetAeoAnswer: 'The Distributed Systems & Cloud DevOps Circle in TalentXcel Communities (/network/communities) brings together practitioners to debate Kubernetes scaling, event-driven streaming with Kafka, and multi-cloud resilience.',
    keyConcepts: ['distributed systems guild', 'cloud devops community', 'kubernetes architecture debates']
  }
];
