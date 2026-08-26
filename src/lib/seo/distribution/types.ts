// src/lib/seo/distribution/types.ts
// Core TypeScript Definitions for TalentXcel Global Distribution Engine
// Unifies Search, AI Discovery, Product-Led Growth, UGC Entities, and Viral Sharing Loops

export type DistributionEngineChannel =
  | 'SEARCH_ENGINE'       // Google, Bing, DuckDuckGo organic search
  | 'AI_DISCOVERY'        // ChatGPT, Gemini, Perplexity, Google AI Overviews (GEO)
  | 'PRODUCT_LED_UTILITY' // Instant free tools (ATS Scanner, Salary Calc, Passport Generator)
  | 'USER_GENERATED_UGC'  // Public Career Passports, verified candidate profiles, employer pages
  | 'VIRAL_REFERRAL'      // Shareable ATS scorecards, passport badges, peer invites, member referral
  | 'EXTERNAL_ECOSYSTEM'; // Campus partnerships, tech communities, LinkedIn sharing, WhatsApp loops

export interface ViralObjectMetadata {
  objectId: string;
  objectType: 'CAREER_PASSPORT' | 'ATS_SCORECARD' | 'SALARY_CALCULATION' | 'CAREER_ROADMAP' | 'JOB_REFERRAL';
  title: string;
  description: string;
  canonicalUrl: string;
  shareUrl: string;
  ogImageUrl: string;
  shareTriggers: {
    linkedinText: string;
    whatsAppText: string;
    twitterText: string;
    emailSubject: string;
    emailBody: string;
  };
  viralKFactorAssumption: number;
}

export interface ProgrammaticUtilityEntity {
  entityType: 'SALARY_INTELLIGENCE' | 'INTEGRATION_MATRIX' | 'ATS_TEMPLATE' | 'COLLEGE_BENCHMARK';
  primaryKey: string;
  role: string;
  location?: string;
  skill?: string;
  company?: string;
  experienceYears?: number;
  calculatedData: {
    medianSalaryInr?: number;
    salaryPercentiles?: { p25: number; p50: number; p75: number; p90: number };
    inHandMonthlyInr?: number;
    taxDeductionInr?: number;
    topHiringCompanies?: string[];
    relatedSkills?: string[];
    nextCareerSteps?: string[];
    activeJobCount?: number;
    atsKeywordRecommendations?: string[];
  };
  schemaGraph: Record<string, any>;
}

export interface AiCitationGraph {
  entityUri: string;
  entityName: string;
  entityType: string;
  factualExtracts: string[];
  directAnswerSummary: string;
  structuredComparisonTable?: Array<Record<string, string | number>>;
  primarySources: string[];
  lastVerifiedIso: string;
}

export interface DistributionFunnelCohort {
  cohortId: string;
  channel: DistributionEngineChannel;
  monthlyVisitors: number;
  freeToolEngagementRatePct: number;
  firstValueMomentCompletionRatePct: number;
  visitorToSignupRatePct: number;
  signupToActiveUserRatePct: number;
  viralSharesPerActiveUser: number;
  viralInviteConversionRatePct: number;
  calculatedViralKFactor: number;
  projectedCompoundingUsers6Months: number;
  projectedCompoundingUsers12Months: number;
}
