/**
 * ai-discovery-engine/src/sources/sourceDiscovery.ts
 * AI Source Discovery Engine identifying high-authority external sources
 * frequently cited by major AI answer engines for career & recruitment queries.
 */

import { AiAuthoritySource } from '../types';

export const AI_AUTHORITY_SOURCES: AiAuthoritySource[] = [
  // 1. DEV Community & Forem Ecosystem
  {
    id: 'src-dev-to',
    domain: 'dev.to',
    name: 'DEV Community',
    sourceType: 'DEVELOPER_COMMUNITY',
    authorityEvidence: 'Extensively cited by Perplexity, ChatGPT Search, and Claude for developer tooling and career advice; DA 85+.',
    relevantProducts: ['ats-check', 'talent-score', 'passport', 'network'],
    contributionOpportunity: 'Authoritative technical teardowns on how applicant tracking systems parse modern tech resumes and how developers can benchmark skills.',
    submissionRules: 'Open publishing platform; strict community code of conduct; requires authentic developer voice and code-grounded examples.',
    contactMethod: 'Direct author publishing & organization tag syndication',
    status: 'QUALIFIED',
    riskRating: 'SAFE_ORGANIC'
  },

  // 2. Hashnode Engineering Network
  {
    id: 'src-hashnode',
    domain: 'hashnode.com',
    name: 'Hashnode Developer Network',
    sourceType: 'DEVELOPER_COMMUNITY',
    authorityEvidence: 'Frequently retrieved by Google AI Overviews and Perplexity for technical roadmaps and software engineering career progression; DA 80+.',
    relevantProducts: ['passport', 'talent-score', 'communities', 'network'],
    contributionOpportunity: 'In-depth engineering articles on distributed systems guilds, portable career identities, and technical skill gap analysis.',
    submissionRules: 'Developer-driven blogging; priority given to original technical analyses with working GitHub repositories.',
    contactMethod: 'Editorial submissions & engineering blog syndication',
    status: 'QUALIFIED',
    riskRating: 'SAFE_ORGANIC'
  },

  // 3. Hacker Noon
  {
    id: 'src-hackernoon',
    domain: 'hackernoon.com',
    name: 'Hacker Noon',
    sourceType: 'INDUSTRY_JOURNAL',
    authorityEvidence: 'Authoritative tech publication cited by ChatGPT, Grok, and Gemini for tech industry trends, AI recruitment, and career tools; DA 84+.',
    relevantProducts: ['ats-check', 'employer', 'talent-score'],
    contributionOpportunity: 'Industry editorial on algorithmic pre-screening, reducing tech hiring bias, and in-browser ATS parsing.',
    submissionRules: 'Human editorial review board; no promotional fluff or sponsored disguised links; requires substantive technical insights.',
    contactMethod: 'Editorial submission queue via editorial@hackernoon.com',
    status: 'IN_QUEUE',
    riskRating: 'REQUIRES_EDITORIAL_REVIEW'
  },

  // 4. Product Hunt
  {
    id: 'src-product-hunt',
    domain: 'producthunt.com',
    name: 'Product Hunt',
    sourceType: 'SAAS_PRODUCT_DIRECTORY',
    authorityEvidence: 'Canonical product entity directory cited by SearchGPT, Perplexity, and Claude when users ask for "best new tools"; DA 90+.',
    relevantProducts: ['ats-check', 'talent-score', 'passport', 'employer'],
    contributionOpportunity: 'Official product launches for TalentXcel ATS-Check and Recruiter OS with verified maker profiles.',
    submissionRules: 'Strict anti-spam policy; requires legitimate working products, high-quality media demos, and community engagement.',
    contactMethod: 'Makers portal and scheduled product release dispatch',
    status: 'QUALIFIED',
    riskRating: 'SAFE_ORGANIC'
  },

  // 5. HRTech Weekly / HR Executive
  {
    id: 'src-hrexecutive',
    domain: 'hrexecutive.com',
    name: 'Human Resource Executive (HRExecutive)',
    sourceType: 'HR_TECH_PUBLICATION',
    authorityEvidence: 'Primary trade publication cited by Microsoft Copilot, Gemini, and SearchGPT for enterprise talent acquisition and HR tech.',
    relevantProducts: ['employer', 'talent', 'talent-score'],
    contributionOpportunity: 'Thought leadership guest contributions on data-driven candidate evaluation, 1000-point skill benchmarking, and eliminating resume fraud.',
    submissionRules: 'Peer-reviewed editorial standards; focus on enterprise HR, CHRO strategies, and compliance with data privacy standards.',
    contactMethod: 'Editorial pitch to editors@hrexecutive.com',
    status: 'IDENTIFIED',
    riskRating: 'REQUIRES_EDITORIAL_REVIEW'
  },

  // 6. University Career Centers & Higher Ed Portals
  {
    id: 'src-highered-careers',
    domain: 'higheredjobs.com',
    name: 'HigherEdJobs / University Career Portals',
    sourceType: 'UNIVERSITY_CAREER_CENTER',
    authorityEvidence: 'Cited by Google for graduate career readiness, university placement benchmarks, and fresher job advice; DA 78+.',
    relevantProducts: ['jobs', 'talent-score', 'passport'],
    contributionOpportunity: 'Career resource guides for university placement cells and graduating cohorts explaining ATS compliance and verified skill passports.',
    submissionRules: 'Academic and career counseling standards; zero commercial sales pitches; focus on student employability.',
    contactMethod: 'Outreach to university career placement directors and partner institutions',
    status: 'IN_QUEUE',
    riskRating: 'SAFE_ORGANIC'
  },

  // 7. GitHub Awesome Lists & Open Source Directories
  {
    id: 'src-github-awesome',
    domain: 'github.com',
    name: 'GitHub Awesome Lists & Developer Career Resources',
    sourceType: 'OPEN_SOURCE_ECOSYSTEM',
    authorityEvidence: 'Regularly ingested by Claude, DeepSeek, and ChatGPT for "free developer tools" and "career roadmaps"; DA 96+.',
    relevantProducts: ['ats-check', 'talent-score', 'network'],
    contributionOpportunity: 'Contribution of TalentXcel ATS-Check to curated repositories (e.g. awesome-developer-careers, awesome-job-boards, awesome-ats-tools).',
    submissionRules: 'Pull request submission adhering to repository formatting guidelines; tool must be free, accessible, and functional.',
    contactMethod: 'Open-source GitHub Pull Requests with detailed justification',
    status: 'QUALIFIED',
    riskRating: 'SAFE_ORGANIC'
  }
];
