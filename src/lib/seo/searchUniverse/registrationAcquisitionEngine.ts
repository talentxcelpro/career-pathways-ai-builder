// src/lib/seo/searchUniverse/registrationAcquisitionEngine.ts
/**
 * TalentXcel Registration Acquisition Engine
 *
 * Implements the executive mandate:
 * "Build a Registration Acquisition Engine around the existing Career Graph.
 * Target: 40,000–50,000 registrations/day.
 * At the current 10.99% signup rate, requires ~455,000 qualified visits/day.
 *
 * The operating funnel:
 * 500k qualified visits/day -> 50k registrations/day -> 12k+ applications/day -> measurable matches -> referrals.
 *
 * Four Acquisition Engines:
 * 1. SEO Acquisition Engine: Turn 31 search universes into high-quality landing surfaces with 12-factor evidence gate.
 * 2. Programmatic Career Intent Engine: Multi-intent expansion (occupation × location × intent) evidence-backed only.
 * 3. Job-to-Career Conversion Engine: Every job page sells a career action ('Check my match', 'Build ATS resume', etc.).
 * 4. Viral / Referral Acquisition Engine: Shareable Career Passport & ATS artifacts with viral loop.
 *
 * Milestone Gates:
 * 44 proven -> 100 validated occupations -> 1,000 high-demand landing pages -> 10k daily -> 25k daily -> 50k daily.
 */

import { SearchUniverseId, SEARCH_UNIVERSES_CATALOG } from './searchUniverseRegistry';
import { OccupationLedgerRegistry } from './occupationLedger';
import { GlobalOccupationEvidenceFactory } from './globalOccupationEvidenceFactory';

export type AcquisitionEngineType =
  | 'SEO_ACQUISITION_ENGINE'
  | 'PROGRAMMATIC_CAREER_INTENT_ENGINE'
  | 'JOB_TO_CAREER_CONVERSION_ENGINE'
  | 'VIRAL_REFERRAL_ACQUISITION_ENGINE';

export type HighValueAcquisitionSurface =
  | 'JOBS'
  | 'RESUME_ATS'
  | 'SALARY'
  | 'INTERVIEW_QUESTIONS'
  | 'CAREER_MAP'
  | 'SKILLS'
  | 'COMPANIES'
  | 'COLLEGES'
  | 'GOVERNMENT_JOBS'
  | 'LOCATION_INTELLIGENCE';

export type CareerActionHook =
  | 'CHECK_MY_MATCH'          // 10-second instant match to live vacancies
  | 'BUILD_MY_ATS_RESUME'     // Real-time ATS resume scorer & bullet optimizer
  | 'SEE_SALARY_BENCHMARK'    // Live percentile distribution & pay calculator
  | 'PRACTICE_INTERVIEW'      // STAR framework role-specific question banks
  | 'CLAIM_CAREER_PASSPORT'   // Public digital profile & verifiable credentials
  | 'DIAGNOSE_SKILL_GAPS'     // Role gap analysis & course recommendation
  | 'GOVERNMENT_JOB_ALERTS';  // Official exam eligibility & vacancy tracker

export interface SurfaceConversionPath {
  searchIntent: string;
  usefulToolOrAnswer: string;
  personalizedResult: string;
  googleAuthTrigger: string;
  careerPassportOutcome: string;
  downstreamAction: string;
}

export interface OccupationMultiIntentSurface {
  surfaceId: string;
  occupationSlug: string;
  occupationName: string;
  surfaceType: HighValueAcquisitionSurface;
  canonicalRoute: string;
  searchIntentKeyword: string;
  actionHook: CareerActionHook;
  conversionPath: SurfaceConversionPath;
  evidenceGated: boolean;
  isEvidenceSatisfied: boolean;
  expectedDailyQualifiedVisitsAtScale: number;
}

export interface AcquisitionMilestoneGate {
  stage: number;
  stageName: string;
  status: 'ACTIVE_NOW' | 'NEXT_IN_PROGRESS' | 'PLANNED_MILESTONE';
  canonicalOccupationsTarget: number;
  evidenceBackedLandingSurfaces: number;
  dailyQualifiedVisitsTarget: number;
  dailyRegistrationsTarget: number;
  dailyApplicationsTarget: number;
  signupRateExpected: number;
  description: string;
}

export const ACQUISITION_MILESTONE_GATES: AcquisitionMilestoneGate[] = [
  {
    stage: 0,
    stageName: 'Stage 0: Phase A Empirical Baseline',
    status: 'ACTIVE_NOW',
    canonicalOccupationsTarget: 44,
    evidenceBackedLandingSurfaces: 44,
    dailyQualifiedVisitsTarget: 710, // Cumulative empirical snapshot
    dailyRegistrationsTarget: 78,    // 10.99% signup rate
    dailyApplicationsTarget: 19,     // 24.36% app rate
    signupRateExpected: 10.99,
    description: 'Empirical starting foundation: 28.4k impressions, 710 clicks, 78 signups, 19 apps, 3 matches.',
  },
  {
    stage: 1,
    stageName: 'Stage 1: B1 Cohort & Intent Seeding (100 Occupations)',
    status: 'NEXT_IN_PROGRESS',
    canonicalOccupationsTarget: 100,
    evidenceBackedLandingSurfaces: 1000,
    dailyQualifiedVisitsTarget: 1000,
    dailyRegistrationsTarget: 110,
    dailyApplicationsTarget: 27,
    signupRateExpected: 11.0,
    description: '100 validated occupations expanded across 10 high-value intent surfaces (Jobs, Salary, ATS, Interview).',
  },
  {
    stage: 2,
    stageName: 'Stage 2: 1,000 High-Demand Surfaces Indexed',
    status: 'PLANNED_MILESTONE',
    canonicalOccupationsTarget: 100,
    evidenceBackedLandingSurfaces: 1000,
    dailyQualifiedVisitsTarget: 10000,
    dailyRegistrationsTarget: 1100,
    dailyApplicationsTarget: 270,
    signupRateExpected: 11.0,
    description: '1,000 top occupation-location-intent landing pages fully indexed with 12-factor evidence saturation.',
  },
  {
    stage: 3,
    stageName: 'Stage 3: 10,000 Daily Registrations Gate',
    status: 'PLANNED_MILESTONE',
    canonicalOccupationsTarget: 250,
    evidenceBackedLandingSurfaces: 3500,
    dailyQualifiedVisitsTarget: 91000,
    dailyRegistrationsTarget: 10000,
    dailyApplicationsTarget: 2430,
    signupRateExpected: 11.0,
    description: 'Crosses first mega-scale distribution threshold: 91k qualified daily visits driving 10k registrations/day.',
  },
  {
    stage: 4,
    stageName: 'Stage 4: 25,000 Daily Registrations Gate',
    status: 'PLANNED_MILESTONE',
    canonicalOccupationsTarget: 500,
    evidenceBackedLandingSurfaces: 7500,
    dailyQualifiedVisitsTarget: 228000,
    dailyRegistrationsTarget: 25000,
    dailyApplicationsTarget: 6100,
    signupRateExpected: 11.0,
    description: 'Broad national + global coverage across 68 specialized sectors delivering 228k daily visits.',
  },
  {
    stage: 5,
    stageName: 'Stage 5: Target Operating Scale (50,000 Daily Registrations)',
    status: 'PLANNED_MILESTONE',
    canonicalOccupationsTarget: 500,
    evidenceBackedLandingSurfaces: 15000,
    dailyQualifiedVisitsTarget: 455000,
    dailyRegistrationsTarget: 50000,
    dailyApplicationsTarget: 12200,
    signupRateExpected: 11.0,
    description: 'Ultimate acquisition objective: 455k qualified visits/day -> 50k registrations/day -> 12.2k+ applications/day.',
  },
];

export class RegistrationAcquisitionEngine {
  /**
   * Generates the 10 High-Value Acquisition Surfaces for a canonical occupation
   * Enforces that every surface has an explicit 6-step conversion path.
   */
  public static getAcquisitionSurfacesForOccupation(
    occupationSlug: string,
    occupationName: string
  ): OccupationMultiIntentSurface[] {
    const verification = GlobalOccupationEvidenceFactory.verifyEvidenceSaturation(occupationSlug);
    const isEvidenceSatisfied = verification.isEligibleForIndex;

    return [
      {
        surfaceId: `${occupationSlug}-jobs`,
        occupationSlug,
        occupationName,
        surfaceType: 'JOBS',
        canonicalRoute: `/jobs/${occupationSlug}`,
        searchIntentKeyword: `${occupationName.toLowerCase()} jobs`,
        actionHook: 'CHECK_MY_MATCH',
        conversionPath: {
          searchIntent: `Looking for active ${occupationName} job vacancies`,
          usefulToolOrAnswer: 'Live verified openings with salary, experience, and employer trust badges',
          personalizedResult: '10-Second Instant Match score calculated against job requirements',
          googleAuthTrigger: 'Sign in with Google to apply with 1-click & save match score',
          careerPassportOutcome: 'Instantly creates verified Candidate Career Passport with matching skills',
          downstreamAction: 'Submits job application to employer with verified credentials',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 85,
      },
      {
        surfaceId: `${occupationSlug}-resume-ats`,
        occupationSlug,
        occupationName,
        surfaceType: 'RESUME_ATS',
        canonicalRoute: `/resume-examples/${occupationSlug}`,
        searchIntentKeyword: `${occupationName.toLowerCase()} resume example`,
        actionHook: 'BUILD_MY_ATS_RESUME',
        conversionPath: {
          searchIntent: `Looking for high-scoring ATS resume templates and keywords for ${occupationName}`,
          usefulToolOrAnswer: 'Google XYZ bullet generator + top 20 verified ATS keywords benchmark',
          personalizedResult: 'Real-time ATS compatibility score & missing keyword diagnosis',
          googleAuthTrigger: 'Sign in with Google to download ATS-optimized PDF resume',
          careerPassportOutcome: 'Resume data automatically syncs into user’s digital Career Passport',
          downstreamAction: 'Prompts immediate match to 3 open jobs matching optimized resume',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 65,
      },
      {
        surfaceId: `${occupationSlug}-salary`,
        occupationSlug,
        occupationName,
        surfaceType: 'SALARY',
        canonicalRoute: `/salary/${occupationSlug}`,
        searchIntentKeyword: `${occupationName.toLowerCase()} salary`,
        actionHook: 'SEE_SALARY_BENCHMARK',
        conversionPath: {
          searchIntent: `Researching market compensation and pay scale for ${occupationName}`,
          usefulToolOrAnswer: 'Empirical 25th-75th percentile salary distribution by city and experience',
          personalizedResult: 'Instant salary percentile calculator: "Where do you stand against peers?"',
          googleAuthTrigger: 'Sign in with Google to unlock exact company-level pay breakdowns',
          careerPassportOutcome: 'Stores target compensation & seniority in Career Passport',
          downstreamAction: 'Shows verified jobs paying in the user’s target salary band',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 55,
      },
      {
        surfaceId: `${occupationSlug}-interview-questions`,
        occupationSlug,
        occupationName,
        surfaceType: 'INTERVIEW_QUESTIONS',
        canonicalRoute: `/interview-questions/${occupationSlug}`,
        searchIntentKeyword: `${occupationName.toLowerCase()} interview questions`,
        actionHook: 'PRACTICE_INTERVIEW',
        conversionPath: {
          searchIntent: `Preparing for interview rounds for ${occupationName}`,
          usefulToolOrAnswer: 'Verified question banks formatted with STAR model answers',
          personalizedResult: 'Interactive mock answer feedback & scoring',
          googleAuthTrigger: 'Sign in with Google to practice AI mock voice/text interview',
          careerPassportOutcome: 'Records interview readiness score badge on public profile',
          downstreamAction: 'Connects candidate with hiring managers currently interviewing for the role',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 40,
      },
      {
        surfaceId: `${occupationSlug}-career-map`,
        occupationSlug,
        occupationName,
        surfaceType: 'CAREER_MAP',
        canonicalRoute: `/career-pathways/${occupationSlug}`,
        searchIntentKeyword: `${occupationName.toLowerCase()} career path`,
        actionHook: 'CLAIM_CAREER_PASSPORT',
        conversionPath: {
          searchIntent: `Planning long-term career progression from ${occupationName}`,
          usefulToolOrAnswer: '4-stage career ladder with required skills, timeline, and salary jumps',
          personalizedResult: 'Next-level promotion roadmap customized to current experience',
          googleAuthTrigger: 'Sign in with Google to save personalized career roadmap',
          careerPassportOutcome: 'Generates shareable public Career Passport roadmap',
          downstreamAction: 'Recommends target leadership roles and promotion pathways',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 35,
      },
      {
        surfaceId: `${occupationSlug}-skills`,
        occupationSlug,
        occupationName,
        surfaceType: 'SKILLS',
        canonicalRoute: `/skills/${occupationSlug}`,
        searchIntentKeyword: `${occupationName.toLowerCase()} skills required`,
        actionHook: 'DIAGNOSE_SKILL_GAPS',
        conversionPath: {
          searchIntent: `Looking for top in-demand skills for ${occupationName}`,
          usefulToolOrAnswer: 'Taxonomy of core clinical/technical, soft, and tool proficiencies',
          personalizedResult: 'Skill gap quiz comparing user skills against current market demand',
          googleAuthTrigger: 'Sign in with Google to save skill audit and badge endorsements',
          careerPassportOutcome: 'Displays verified skill badges on Career Passport',
          downstreamAction: 'Matches candidate to jobs filtering on demonstrated skill proficiencies',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 30,
      },
      {
        surfaceId: `${occupationSlug}-companies`,
        occupationSlug,
        occupationName,
        surfaceType: 'COMPANIES',
        canonicalRoute: `/companies/${occupationSlug}`,
        searchIntentKeyword: `top companies hiring ${occupationName.toLowerCase()}`,
        actionHook: 'CHECK_MY_MATCH',
        conversionPath: {
          searchIntent: `Searching for leading employers and organizations hiring ${occupationName}`,
          usefulToolOrAnswer: 'Directory of top hiring enterprises with active vacancy count & rating',
          personalizedResult: 'Culture & benefits match score with hiring employers',
          googleAuthTrigger: 'Sign in with Google to send direct expressions of interest',
          careerPassportOutcome: 'Shares candidate Career Passport with employer recruiters',
          downstreamAction: 'Enables direct employer candidate messaging and interview scheduling',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 25,
      },
      {
        surfaceId: `${occupationSlug}-colleges`,
        occupationSlug,
        occupationName,
        surfaceType: 'COLLEGES',
        canonicalRoute: `/courses/${occupationSlug}`,
        searchIntentKeyword: `how to become a ${occupationName.toLowerCase()} courses`,
        actionHook: 'DIAGNOSE_SKILL_GAPS',
        conversionPath: {
          searchIntent: `Looking for degrees, certifications, and courses to become ${occupationName}`,
          usefulToolOrAnswer: 'Accredited curriculum directory, entry prerequisites, and eligibility',
          personalizedResult: 'Course ROI calculator & scholarship matching',
          googleAuthTrigger: 'Sign in with Google to download course syllabus & application guide',
          careerPassportOutcome: 'Tracks educational milestones in digital Career Passport',
          downstreamAction: 'Connects student to entry-level internships and fresher jobs upon completion',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 25,
      },
      {
        surfaceId: `${occupationSlug}-government-jobs`,
        occupationSlug,
        occupationName,
        surfaceType: 'GOVERNMENT_JOBS',
        canonicalRoute: `/government-jobs/${occupationSlug}`,
        searchIntentKeyword: `government jobs for ${occupationName.toLowerCase()}`,
        actionHook: 'GOVERNMENT_JOB_ALERTS',
        conversionPath: {
          searchIntent: `Seeking public sector / government exams and posts for ${occupationName}`,
          usefulToolOrAnswer: 'Official gazette notifications, exam dates, eligibility age, and pay grade',
          personalizedResult: 'Eligibility checker against official public sector service rules',
          googleAuthTrigger: 'Sign in with Google to activate instant WhatsApp/SMS notification alerts',
          careerPassportOutcome: 'Stores civil service eligibility profile in Career Passport',
          downstreamAction: 'Provides direct application links to verified government portals',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 35,
      },
      {
        surfaceId: `${occupationSlug}-location-delhi`,
        occupationSlug,
        occupationName,
        surfaceType: 'LOCATION_INTELLIGENCE',
        canonicalRoute: `/jobs/${occupationSlug}-delhi`,
        searchIntentKeyword: `${occupationName.toLowerCase()} jobs delhi`,
        actionHook: 'CHECK_MY_MATCH',
        conversionPath: {
          searchIntent: `Seeking localized ${occupationName} vacancies in major metro center`,
          usefulToolOrAnswer: 'Hyperlocal verified job board with commute distance & city salary index',
          personalizedResult: 'Localized instant match score with nearby hospitals/firms',
          googleAuthTrigger: 'Sign in with Google to unlock direct recruiter contact in Delhi NCR',
          careerPassportOutcome: 'Sets preferred geographic radius in Career Passport',
          downstreamAction: 'Applies to top 3 local employers within 15km radius',
        },
        evidenceGated: true,
        isEvidenceSatisfied,
        expectedDailyQualifiedVisitsAtScale: 40,
      },
    ];
  }

  /**
   * Returns executive funnel calculations for achieving the 50,000 registrations/day target
   */
  public static calculateFunnelRequirements(targetDailyRegistrations = 50000) {
    const signupRate = 0.1099; // Empirical 10.99% signup rate
    const appRate = 0.2436;    // Empirical 24.36% application rate from registrations
    const matchRate = 0.1579;  // Empirical 15.79% match rate from applications

    const requiredQualifiedVisits = Math.round(targetDailyRegistrations / signupRate);
    const expectedApplications = Math.round(targetDailyRegistrations * appRate);
    const expectedMatches = Math.round(expectedApplications * matchRate);

    return {
      targetDailyRegistrations,
      signupRatePercent: Math.round(signupRate * 10000) / 100, // 10.99%
      applicationRatePercent: Math.round(appRate * 10000) / 100, // 24.36%
      matchRatePercent: Math.round(matchRate * 10000) / 100, // 15.79%
      requiredDailyQualifiedVisits: requiredQualifiedVisits, // ~454,959 (~455k)
      expectedDailyApplications: expectedApplications, // ~12,180 (~12.2k)
      expectedDailyMatches: expectedMatches, // ~1,923 (~1.9k)
      growthMultiplierFromBaseline: Math.round(targetDailyRegistrations / 78), // ~641x
    };
  }

  /**
   * Returns overview of the 4 Acquisition Engines
   */
  public static getFourAcquisitionEngines() {
    return [
      {
        id: 'SEO_ACQUISITION_ENGINE',
        name: '1. SEO Acquisition Engine',
        focus: 'Turn 31 search universes into high-quality landing surfaces with the 12-factor evidence gate.',
        mechanism: 'Maps query intent across 32 global industries; satisfies jobs, salary, and ATS keyword density before indexation.',
        keyArtifacts: ['Verified Job Postings', 'Salary Distribution Tables', 'ATS Keyword Lexicons'],
      },
      {
        id: 'PROGRAMMATIC_CAREER_INTENT_ENGINE',
        name: '2. Programmatic Career Intent Engine',
        focus: 'Multi-intent expansion per occupation (Jobs, Salary, Resume, Interview, Skills, Locations).',
        mechanism: 'Expands 1 canonical role into 10 high-value acquisition surfaces, publishing only combinations satisfying evidence contract.',
        keyArtifacts: ['10 Surface Multi-Intent Matrix', 'STAR Interview Frameworks', 'Career Pathway Ladders'],
      },
      {
        id: 'JOB_TO_CAREER_CONVERSION_ENGINE',
        name: '3. Job-to-Career Conversion Engine',
        focus: 'Every job page sells a career action, not merely a vacancy.',
        mechanism: '10-Second Instant Match, ATS Resume Scorer, Salary Benchmarking, and STAR prep leading to Google Sign-in & Career Passport creation.',
        keyArtifacts: ['10-Second Instant Match', 'Real-Time ATS Scorer', 'Zero-Friction Google/OTP Auth'],
      },
      {
        id: 'VIRAL_REFERRAL_ACQUISITION_ENGINE',
        name: '4. Viral / Referral Acquisition Engine',
        focus: 'Every generated artifact produces a shareable link that brings another user in.',
        mechanism: 'Public Career Passports, verified ATS scorecard badges, and career progression maps with open-graph cards and invite hooks.',
        keyArtifacts: ['Public Career Passport Link', 'Verifiable Skill Badges', 'Peer Benchmark Invitations'],
      },
    ];
  }

  /**
   * Returns the milestone progression gates
   */
  public static getMilestoneGates(): AcquisitionMilestoneGate[] {
    return ACQUISITION_MILESTONE_GATES;
  }
}
