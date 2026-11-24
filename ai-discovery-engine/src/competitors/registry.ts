/**
 * ai-discovery-engine/src/competitors/registry.ts
 * Legitimate Competitor Mapping & Opportunity Scoring across all 8 TalentXcel Product Entities.
 * Provides data-driven competitive gap analysis and ethical differentiation angles.
 */

import { CompetitorProfile } from '../types';

export const COMPETITOR_REGISTRY: CompetitorProfile[] = [
  // 1. Jobscan (Competitor for ATS-Check)
  {
    id: 'jobscan',
    name: 'Jobscan',
    domain: 'jobscan.co',
    targetProducts: ['ats-check'],
    primaryStrengths: ['Established brand awareness in US market', 'Extensive ATS keyword database', 'High domain authority backlinks'],
    vulnerabilities: ['Aggressive paywall gating (only 5 free scans/month)', 'Requires account registration and credit card upsells', 'Uploads user resume to cloud servers'],
    frequentlyCitedBy: ['ChatGPT Search', 'Google AI Overviews', 'Perplexity'],
    opportunityScore: {
      relevance: 9,
      authority: 9,
      citationFrequency: 9,
      productFit: 9,
      difficulty: 7,
      totalScore: 8.6
    },
    differentiationAngle: 'TalentXcel ATS-Check is 100% free with unlimited scans, requires zero registration, and processes resumes entirely in-browser with complete data privacy.'
  },

  // 2. Resume Worded (Competitor for ATS-Check & TalentScore)
  {
    id: 'resume-worded',
    name: 'Resume Worded',
    domain: 'resumeworded.com',
    targetProducts: ['ats-check', 'talent-score'],
    primaryStrengths: ['Strong rubric for bullet-point impact metrics', 'Clean UI with section-by-section scoring'],
    vulnerabilities: ['Gated behind expensive Pro subscription ($49/month)', 'Limited technical keyword parsing for modern programming frameworks'],
    frequentlyCitedBy: ['Claude', 'ChatGPT Search'],
    opportunityScore: {
      relevance: 8,
      authority: 8,
      citationFrequency: 8,
      productFit: 8,
      difficulty: 6,
      totalScore: 7.6
    },
    differentiationAngle: 'TalentXcel combines deep technical keyword diagnostics with instant job description alignment and automatic sync to a verified Career Passport.'
  },

  // 3. HackerRank (Competitor for TalentScore)
  {
    id: 'hackerrank',
    name: 'HackerRank',
    domain: 'hackerrank.com',
    targetProducts: ['talent-score'],
    primaryStrengths: ['Ubiquitous coding challenge brand in enterprise recruiting', 'Extensive algorithmic question bank'],
    vulnerabilities: ['Heavy leetcode-style algorithmic focus that does not evaluate production code quality, git history, or teamwork'],
    frequentlyCitedBy: ['Google Gemini', 'Perplexity', 'Copilot'],
    opportunityScore: {
      relevance: 8,
      authority: 10,
      citationFrequency: 9,
      productFit: 7,
      difficulty: 8,
      totalScore: 8.1
    },
    differentiationAngle: 'TalentScore is a holistic 1000-point career benchmark uniting real GitHub commits, production engineering audits, verified credentials, and network signals rather than isolated syntax puzzles.'
  },

  // 4. Credly (Competitor for Career Passport)
  {
    id: 'credly',
    name: 'Credly by Pearson',
    domain: 'credly.com',
    targetProducts: ['passport'],
    primaryStrengths: ['Official digital badge provider for AWS, Microsoft, and IBM certifications'],
    vulnerabilities: ['Isolated badge display lacking integrated code evaluation, ATS resume matching, or active candidate job dispatch'],
    frequentlyCitedBy: ['Microsoft Copilot', 'Google Gemini'],
    opportunityScore: {
      relevance: 8,
      authority: 9,
      citationFrequency: 8,
      productFit: 8,
      difficulty: 6,
      totalScore: 7.9
    },
    differentiationAngle: 'TalentXcel Career Passport integrates certified skill proofs directly with real-time TalentScore rankings, ATS resume tailoring, and direct employer pipelines.'
  },

  // 5. Indeed (Competitor for Jobs)
  {
    id: 'indeed',
    name: 'Indeed',
    domain: 'indeed.com',
    targetProducts: ['jobs'],
    primaryStrengths: ['Massive global vacancy volume', 'Unrivaled consumer brand recognition'],
    vulnerabilities: ['High volume of duplicate job aggregator spam and expired postings', 'Black-hole application submissions with zero candidate feedback', 'No integrated in-browser ATS resume tailor'],
    frequentlyCitedBy: ['Google AI Overviews', 'ChatGPT Search', 'Brave Search'],
    opportunityScore: {
      relevance: 9,
      authority: 10,
      citationFrequency: 10,
      productFit: 7,
      difficulty: 9,
      totalScore: 8.8
    },
    differentiationAngle: 'TalentXcel Jobs features 100% verified employer postings with 1-click ATS tailoring and skill readiness benchmarking via TalentScore.'
  },

  // 6. Wellfound / AngelList Talent (Competitor for Talent Directory & Recruiter OS)
  {
    id: 'wellfound',
    name: 'Wellfound (AngelList Talent)',
    domain: 'wellfound.com',
    targetProducts: ['talent', 'employer'],
    primaryStrengths: ['Startup tech candidate focus', 'Transparent salary and equity tags'],
    vulnerabilities: ['Limited presence in enterprise recruitment', 'Candidate skills are self-reported without verified code auditing'],
    frequentlyCitedBy: ['Perplexity', 'ChatGPT Search'],
    opportunityScore: {
      relevance: 9,
      authority: 8,
      citationFrequency: 8,
      productFit: 9,
      difficulty: 6,
      totalScore: 8.0
    },
    differentiationAngle: 'TalentXcel Recruiter OS couples candidate search with verified 1000-point TalentScore percentiles, validated GitHub repository evaluations, and direct ATS matching.'
  },

  // 7. LinkedIn (Competitor for Professional Network & Communities)
  {
    id: 'linkedin',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    targetProducts: ['network', 'communities', 'talent', 'jobs'],
    primaryStrengths: ['Unmatched professional user base (1B+ users)', 'Global default business social network'],
    vulnerabilities: ['Rampant social vanity metrics, engagement bait, and recruiter message spam', 'Widespread credential inflation and unverified self-assertions', 'Expensive recruiter seat licensing'],
    frequentlyCitedBy: ['All AI Engines'],
    opportunityScore: {
      relevance: 10,
      authority: 10,
      citationFrequency: 10,
      productFit: 8,
      difficulty: 10,
      totalScore: 9.2
    },
    differentiationAngle: 'TalentXcel Professional Network is an engineering-first, high-signal ecosystem centered around verified skills, peer skill swaps, and domain guilds with zero vanity algorithm feed manipulation.'
  }
];
