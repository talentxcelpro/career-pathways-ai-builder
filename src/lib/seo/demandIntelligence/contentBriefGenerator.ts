// src/lib/seo/demandIntelligence/contentBriefGenerator.ts
// Generates evidence-grounded SEO content gap briefs across all 25 opportunity types.
// Never invents salary ranges, company counts, or testimonials; marks absent datasets NEEDS_DATA_COLLECTION.

import { computeKeywordFingerprint } from './normalizer';
import type { ContentBrief, SearchIntentType, SeoOpportunityType } from './types';

export interface ContentBriefInput {
  targetUrl: string;
  opportunityType: SeoOpportunityType;
  primaryKeyword: string;
  supportingKeywords: string[];
  targetIntent: SearchIntentType;
  estimatedImpactScore: number;
  verifiedJobsCount: number;
  verifiedProfilesCount: number;
  verifiedCoursesCount: number;
  observedGscImpressions: number;
  observedGscClicks: number;
  observedAvgPosition?: number | null;
}

const ARCHETYPE_OUTLINE_TEMPLATES: Record<
  SeoOpportunityType,
  Array<{ heading: string; purpose: string }>
> = {
  'role-city-job': [
    { heading: 'Active Openings Overview', purpose: 'Summarize verified live roles and application eligibility.' },
    { heading: 'Core Required Skills & Hiring Criteria', purpose: 'List skills observed in active TalentXcel job listings.' },
    { heading: 'ATS Resume Readiness & TalentScore CTA', purpose: 'Connect applicants directly to /resume/ats-check and /talent-score.' },
  ],
  'role-country-job': [
    { heading: 'National Role Demand & Verified Listings', purpose: 'Aggregate verified opportunities across major hubs.' },
    { heading: 'Employer & Experience Tiers', purpose: 'Break down entry-level vs senior openings from live DB.' },
  ],
  'remote-role-job': [
    { heading: 'Verified Remote Openings', purpose: 'Display exclusively active remote-tagged listings.' },
    { heading: 'Async Readiness & Digital Career Passport', purpose: 'Highlight verified profile credentials for remote hiring.' },
  ],
  'hybrid-role-job': [
    { heading: 'Hybrid Roles by Hub', purpose: 'Filter active hybrid listings without duplicating full-onsite listings.' },
  ],
  'fresher-role-job': [
    { heading: 'Fresher & 0–2 Year Openings', purpose: 'Show only verified is_fresher_eligible vacancies.' },
    { heading: 'Fresher Portfolio & TalentScore Checklist', purpose: 'Guide fresh graduates to build proof before applying.' },
  ],
  'internship-role': [
    { heading: 'Active Internships & Campus Tracks', purpose: 'List verified is_internship listings cleanly.' },
  ],
  'skill-job': [
    { heading: 'Jobs Requiring This Verified Skill', purpose: 'Match active listings tagged with this competency.' },
    { heading: 'Skill Gap Self-Check', purpose: 'Route users to TalentScore skill verification & courses.' },
  ],
  'skill-career': [
    { heading: 'Career Paths Unlocked by This Skill', purpose: 'Map target job roles requiring the skill.' },
    { heading: 'Related Learning Courses', purpose: 'Link matching verified courses from aggregated_courses.' },
  ],
  'industry-job': [
    { heading: 'Industry Employment Overview', purpose: 'Show verified jobs and active employers in the sector.' },
  ],
  'industry-career-guide': [
    { heading: 'Role Progression & Entry Pathways', purpose: 'Structure real occupational taxonomy transitions.' },
    { heading: 'Credentials & Portfolio Verification', purpose: 'Highlight Career Passport verification.' },
  ],
  'salary-benchmark': [
    { heading: 'Observed Compensation Distribution', purpose: 'Render min/median/max strictly from verified salary postings or mark NEEDS_DATA_COLLECTION.' },
    { heading: 'Skills Influencing Compensation Bands', purpose: 'Compare requirements observed in higher-band postings.' },
  ],
  'interview-prep': [
    { heading: 'Role Competency Pillars Tested in Interviews', purpose: 'Align questions to verified job role skills.' },
    { heading: 'Resume & Readiness Self-Audit', purpose: 'Internal CTA to /resume/ats-check.' },
  ],
  'ats-check': [
    { heading: 'Instant ATS Resume Parse & Keyword Match Diagnostics', purpose: 'Direct product utility action on /resume/ats-check.' },
    { heading: 'Role-Specific ATS Checklist', purpose: 'Actionable formatting & skill alignment tips.' },
  ],
  'resume-template': [
    { heading: 'ATS-Safe Resume Structure by Role Level', purpose: 'Download/test structure against /resume/ats-check.' },
  ],
  'talentscore-assessment': [
    { heading: 'Employability Benchmark Overview', purpose: 'Explain TalentScore dimensions & employer visibility.' },
  ],
  'career-passport': [
    { heading: 'Verified Career Passport Benefits', purpose: 'Show how verified credentials improve shortlisting.' },
  ],
  'career-transition': [
    { heading: 'Transferable Skills Bridge', purpose: 'Compare origin and target role skills deterministically.' },
  ],
  'recruiter-os': [
    { heading: 'TalentXcel Recruiter OS Capabilities', purpose: 'Highlight AI screening, TalentScore ranking, and verified candidate discovery.' },
  ],
  'employer-brand': [
    { heading: 'Verified Company Directory & Active Roles', purpose: 'Show real company profiles and open positions.' },
  ],
  'talent-discovery': [
    { heading: 'Discover Verified Pre-Screened Talent', purpose: 'Recruiter funnel highlighting aggregated anonymized skill availability.' },
  ],
  'college-placement': [
    { heading: 'Campus Readiness & Hiring Hub', purpose: 'Connect institutional cohorts with TalentScore and live fresher openings.' },
  ],
  'learning-path': [
    { heading: 'Curated Courses & Verified Outcomes', purpose: 'Surface real verified modules from aggregated_courses.' },
  ],
  'community-discussion': [
    { heading: 'Peer Network Hubs & Topic Discussions', purpose: 'Aggregate public community groups and discussions safely.' },
  ],
  'global-visa-jobs': [
    { heading: 'International & Cross-Border Hiring Markets', purpose: 'Show verified country-level jobs and localization context.' },
  ],
  'city-employment-hub': [
    { heading: 'City Hiring Ecosystem Summary', purpose: 'Break down verified active roles, top skills, and hiring companies in the city.' },
  ],
};

/**
 * Generates an evidence-backed SEO content brief without any fabricated statistics.
 */
export function generateContentBrief(input: ContentBriefInput): ContentBrief {
  const hash = computeKeywordFingerprint(`${input.targetUrl}|${input.primaryKeyword}`).slice(0, 14);
  const templateSteps = ARCHETYPE_OUTLINE_TEMPLATES[input.opportunityType] || ARCHETYPE_OUTLINE_TEMPLATES['role-country-job'];

  const jobGroundStatus =
    input.verifiedJobsCount > 0
      ? `VERIFIED_DB_JOBS (${input.verifiedJobsCount} active rows)`
      : 'NEEDS_DATA_COLLECTION (0 active jobs matched yet)';

  const profileGroundStatus =
    input.verifiedProfilesCount > 0
      ? `VERIFIED_PUBLIC_PROFILES_AGGREGATE (${input.verifiedProfilesCount} opted-in public profiles; no PII exposed)`
      : 'NEEDS_DATA_COLLECTION';

  const gscGroundStatus =
    input.observedGscImpressions > 0
      ? `VERIFIED_GSC (${input.observedGscImpressions} impressions, ${input.observedGscClicks} clicks, pos ${input.observedAvgPosition ?? 'N/A'})`
      : 'UNOBSERVED_IN_GSC (generated/taxonomy candidate; volume unknown)';

  const outline = templateSteps.map((step, i) => ({
    heading: step.heading,
    purpose: step.purpose,
    dataGroundedFrom: i === 0 ? `${jobGroundStatus}; ${gscGroundStatus}` : profileGroundStatus,
  }));

  const capitalizedKw = input.primaryKeyword.replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    briefKey: `brief-${hash}`,
    targetUrl: input.targetUrl,
    opportunityType: input.opportunityType,
    primaryKeyword: input.primaryKeyword,
    supportingKeywords: input.supportingKeywords.slice(0, 12),
    targetIntent: input.targetIntent,
    recommendedTitle: `${capitalizedKw} | Verified Opportunities & Readiness | TalentXcel`,
    metaDescription: `Explore ${input.primaryKeyword} on TalentXcel. Verified live opportunities, skill benchmarks, ATS resume diagnostics, and career readiness insights.`,
    outline,
    faqQuestions: [
      {
        question: `What skills are most frequently listed for ${input.primaryKeyword}?`,
        groundingNote: input.verifiedJobsCount > 0 ? 'Derive dynamically from skills_required across matching active jobs.' : 'NEEDS_DATA_COLLECTION',
      },
      {
        question: `How can candidates improve readiness for ${input.primaryKeyword}?`,
        groundingNote: 'Link directly to TalentXcel ATS-Check (/resume/ats-check) and TalentScore (/talent-score).',
      },
    ],
    internalLinks: Array.from(
      new Set([
        input.targetUrl.startsWith('/jobs') ? '/resume/ats-check' : '/jobs',
        '/talent-score',
        '/passport',
        '/salary',
      ])
    ).filter((l) => l !== input.targetUrl),
    evidenceSummary: {
      verifiedJobsCount: input.verifiedJobsCount,
      verifiedProfilesAggregateCount: input.verifiedProfilesCount,
      verifiedCoursesCount: input.verifiedCoursesCount,
      observedGscImpressions: input.observedGscImpressions,
      observedGscClicks: input.observedGscClicks,
      observedAvgPosition: input.observedAvgPosition ?? null,
      policyCompliance: 'NO_FABRICATED_STATS_OR_TESTIMONIALS',
    },
    estimatedImpactScore: Math.round(input.estimatedImpactScore * 100) / 100,
  };
}
