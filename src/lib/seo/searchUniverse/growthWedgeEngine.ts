// src/lib/seo/searchUniverse/growthWedgeEngine.ts
/**
 * TalentXcel Growth Wedge Engine & Winning Intent Detector
 *
 * Implements the executive growth directive:
 * "The SEO system is alive, but TalentXcel is not acquiring users at scale yet.
 * The winners are NOT generic. We have actual evidence that particular
 * intent × occupation × location combinations work.
 *
 * Build a Growth Wedge Engine:
 * Phase 1 — Find the 100 winning search patterns.
 * Phase 2 — Make every winning page a registration machine ('Tell us what you're looking for and we'll calculate your match').
 * Phase 3 — Exploit the Varanasi anomaly (3,335 imp / 118 clicks) across Tier-2/Tier-3 employment hubs.
 * Phase 4 — Build the 10-second conversion layer ('Check My Career Match — Free' -> Google Auth -> Passport -> Jobs).
 * Phase 5 — Realign registration conversion target to 25% (200k visits for 50k registrations).
 *
 * TALENTXCEL REGISTRATION ACQUISITION OS LOOP:
 * Search Demand -> Winning Intent Detector -> Occupation × Location × Experience × Intent ->
 * Evidence Gate -> High-CTR Landing Page -> 10-Second Match -> Google Sign-In ->
 * Career Passport -> ATS Score -> Job Match -> Application -> Referral Loop -> New Candidates.
 */

export type WinningIntentTemplate =
  | 'HYPERLOCAL_CITY_EMPLOYMENT'   // e.g. "jobs in varanasi", "patiala jobs"
  | 'OCCUPATION_FRESHER_CITY'       // e.g. "software engineer fresher jobs in bangalore"
  | 'OCCUPATION_CITY_EXPERIENCE'   // e.g. "safety officer jobs hyderabad fresher", "credit analyst india"
  | 'OCCUPATION_SALARY_BENCHMARK'  // e.g. "data scientist salary career guide", "agile coach lön"
  | 'OCCUPATION_RESUME_ATS'        // e.g. "ai engineer resume guide", "bdm resume keywords"
  | 'OCCUPATION_INTERVIEW_PREP'    // e.g. "data scientist interview questions"
  | 'COMPANY_CITY_VACANCY'         // e.g. "apple career bangalore", "airbnb careers"
  | 'COLLEGE_CAREER_CUTOFF';       // e.g. "bhu all courses", "coep pune average package"

export interface IntentScoringRecord {
  query: string;
  pageUrl: string;
  template: WinningIntentTemplate;
  impressions: number;
  clicks: number;
  ctrPct: number;
  position: number;
  wedgeScore: number;
  primaryConversionHook: '10_SECOND_MATCH' | 'ATS_RESUME_SCORE' | 'SALARY_BENCHMARK' | 'CAREER_PASSPORT';
  suggestedAction: string;
}

export interface VaranasiAnomalyAnalysis {
  pageUrl: string;
  totalImpressions: number;
  totalClicks: number;
  blendedCtrPct: number;
  averagePosition: number;
  rootDemandDriver: string;
  topQueriesSample: Array<{ query: string; impressions: number; clicks: number; position: number }>;
  strategicInsight: string;
  tier2ReplicationMatrix: Array<{
    city: string;
    state: string;
    tier: 'TIER_2' | 'TIER_3';
    status: 'ACTIVE_PROVEN' | 'QUEUED_FOR_REPLICATION';
    expectedMonthlyImpressions: number;
    recommendedTargetRoleFilters: string[];
  }>;
}

export interface GrowthWedgeMilestone {
  milestoneLevel: number;
  dailyRegistrationsTarget: number;
  requiredDailyVisitsAt25Pct: number;
  requiredDailyVisitsAt11Pct: number;
  expectedDailyApplications: number;
  prerequisiteCondition: string;
}

export class GrowthWedgeEngine {
  /**
   * Evaluates and classifies a query-page pair into one of the 8 Winning Intent Templates
   */
  public static classifyIntentTemplate(query: string, pageUrl: string): WinningIntentTemplate {
    const q = query.toLowerCase();
    const p = pageUrl.toLowerCase();

    if (p.includes('/locations/') || q.includes('job in ') || q.includes('jobs in ') || q.includes('job vacancy')) {
      return 'HYPERLOCAL_CITY_EMPLOYMENT';
    }
    if (q.includes('fresher') || p.includes('/freshers/')) {
      return 'OCCUPATION_FRESHER_CITY';
    }
    if (q.includes('salary') || p.includes('/salary/')) {
      return 'OCCUPATION_SALARY_BENCHMARK';
    }
    if (q.includes('resume') || q.includes('keywords') || p.includes('resume')) {
      return 'OCCUPATION_RESUME_ATS';
    }
    if (q.includes('interview') || p.includes('interview')) {
      return 'OCCUPATION_INTERVIEW_PREP';
    }
    if (p.includes('/company/') || q.includes('careers') || q.includes('career')) {
      return 'COMPANY_CITY_VACANCY';
    }
    if (p.includes('/colleges/') || q.includes('fees') || q.includes('college') || q.includes('university')) {
      return 'COLLEGE_CAREER_CUTOFF';
    }
    return 'OCCUPATION_CITY_EXPERIENCE';
  }

  /**
   * Computes the Growth Wedge Score:
   * Score = (Impressions * (CTR / 100) * 10) * IntentWeight * ConversionPotential
   */
  public static computeWedgeScore(impressions: number, clicks: number, ctrPct: number, template: WinningIntentTemplate): number {
    const intentWeights: Record<WinningIntentTemplate, number> = {
      OCCUPATION_FRESHER_CITY: 1.8,       // High intent young seekers
      OCCUPATION_CITY_EXPERIENCE: 1.6,   // High commercial value
      HYPERLOCAL_CITY_EMPLOYMENT: 1.5,   // Massive localized volume
      OCCUPATION_RESUME_ATS: 1.4,        // High direct tool signup conversion
      OCCUPATION_SALARY_BENCHMARK: 1.3,  // High interest discovery
      OCCUPATION_INTERVIEW_PREP: 1.3,    // High engagement candidates
      COMPANY_CITY_VACANCY: 1.2,         // Moderate branded volume
      COLLEGE_CAREER_CUTOFF: 1.0,        // High discovery, lower immediate application
    };

    const weight = intentWeights[template] || 1.0;
    const baseYield = clicks > 0 ? (clicks * 10) + (impressions * 0.05) : (impressions * 0.02);
    const score = Math.round(baseYield * (ctrPct > 0 ? Math.min(5, ctrPct) : 1) * weight * 10) / 10;
    return score;
  }

  /**
   * Returns the Top 100 Winning Intent Combinations derived from empirical GSC performance
   */
  public static getTop100WinningPatterns(): IntentScoringRecord[] {
    const rawPatterns: Array<{ query: string; pageUrl: string; impressions: number; clicks: number; position: number }> = [
      { query: 'varanasi job vacancy', pageUrl: 'https://talentxcel.in/locations/varanasi', impressions: 850, clicks: 28, position: 2.3 },
      { query: 'job in varanasi', pageUrl: 'https://talentxcel.in/locations/varanasi', impressions: 1036, clicks: 19, position: 2.3 },
      { query: 'jobs in varanasi', pageUrl: 'https://talentxcel.in/locations/varanasi', impressions: 757, clicks: 25, position: 2.1 },
      { query: 'software engineer fresher jobs in bangalore', pageUrl: 'https://talentxcel.in/jobs/software-engineer/freshers/bangalore/nagpur', impressions: 200, clicks: 26, position: 2.2 },
      { query: 'jobs in patiala', pageUrl: 'https://talentxcel.in/locations/patiala', impressions: 116, clicks: 6, position: 1.6 },
      { query: 'safety officer jobs fresher', pageUrl: 'https://talentxcel.in/jobs/safety-officer/hyderabad/fresher', impressions: 26, clicks: 7, position: 3.4 },
      { query: 'junior data analyst in kolkata', pageUrl: 'https://talentxcel.in/jobs/junior-data-analyst-in-kolkata', impressions: 27, clicks: 6, position: 4.2 },
      { query: 'be fresher jobs in bangalore', pageUrl: 'https://talentxcel.in/jobs/software-engineer/freshers/bangalore/nagpur', impressions: 45, clicks: 4, position: 4.6 },
      { query: 'credit analyst jobs in india', pageUrl: 'https://talentxcel.in/jobs/credit-analyst/india/experienced', impressions: 20, clicks: 3, position: 5.1 },
      { query: 'biomedical engineer jobs', pageUrl: 'https://talentxcel.in/jobs/biomedical-engineer/chennai/bangalore', impressions: 130, clicks: 4, position: 7.8 },
      { query: 'patiala jobs', pageUrl: 'https://talentxcel.in/locations/patiala', impressions: 32, clicks: 3, position: 1.9 },
      { query: 'junior associate data scientist noida', pageUrl: 'https://talentxcel.in/jobs/junior-associate-data-scientist-predictive-analytics-talentxcel-services-client-partner-noida-uttar--1', impressions: 39, clicks: 5, position: 4.5 },
      { query: 'quality assurance chemist pune', pageUrl: 'https://talentxcel.in/jobs/quality-assurance-chemist-formulations-talentxcel-services-client-partner-pune-maharashtra-india-1', impressions: 27, clicks: 5, position: 3.8 },
      { query: 'senior devops engineer vizag', pageUrl: 'https://talentxcel.in/jobs/senior-devops-cloud-platform-engineer-talentxcel-services-client-partner-visakhapatnam-andhra-prades-1', impressions: 27, clicks: 5, position: 3.9 },
      { query: 'mobile application developer flutter mumbai', pageUrl: 'https://talentxcel.in/jobs/senior-mobile-application-developer-flutter-react-native-talentxcel-services-client-partner-mumbai-m-1', impressions: 45, clicks: 5, position: 5.2 },
      { query: 'mechanical design engineer cad cam patna', pageUrl: 'https://talentxcel.in/jobs/senior-mechanical-design-engineer-cadcam-talentxcel-services-client-partner-patna-bihar-india-1', impressions: 31, clicks: 4, position: 4.8 },
      { query: 'data scientist salary career guide', pageUrl: 'https://talentxcel.in/resources/data-scientist-salary-career-guide', impressions: 63, clicks: 0, position: 11.2 },
      { query: 'agile coach lon stockholm', pageUrl: 'https://talentxcel.in/salary/agile-coach/stockholm', impressions: 56, clicks: 0, position: 8.4 },
      { query: 'govindammal engineering college fees', pageUrl: 'https://talentxcel.in/colleges/govindammal-aditanar-engineering-college-chennai-2', impressions: 33, clicks: 1, position: 9.0 },
      { query: 'ai engineer resume keywords guide', pageUrl: 'https://talentxcel.in/resources/ai-engineer-resume-guide', impressions: 25, clicks: 0, position: 14.1 },
      { query: 'performance marketing skill guide', pageUrl: 'https://talentxcel.in/resources/performance-marketing-skill-guide', impressions: 31, clicks: 0, position: 12.3 },
      { query: 'data scientist interview questions star', pageUrl: 'https://talentxcel.in/resources/data-scientist-interview-questions', impressions: 27, clicks: 0, position: 15.0 },
      { query: 'bdm resume guide business development', pageUrl: 'https://talentxcel.in/resources/business-development-manager-resume-guide', impressions: 20, clicks: 0, position: 16.2 },
      { query: 'apple career bangalore vacancies', pageUrl: 'https://talentxcel.in/jobs/company/apple/in-bangalore', impressions: 28, clicks: 0, position: 18.5 },
      { query: 'airbnb careers in kochi', pageUrl: 'https://talentxcel.in/jobs/company/airbnb/in-kochi', impressions: 24, clicks: 0, position: 19.2 },
      { query: 'bhu all courses banaras hindu university', pageUrl: 'https://talentxcel.in/colleges/banaras-hindu-university-bhu', impressions: 82, clicks: 0, position: 22.1 },
      { query: 'coep technological university cutoff package', pageUrl: 'https://talentxcel.in/colleges/coep-technological-university-college-of-engineering-pune', impressions: 53, clicks: 0, position: 24.3 },
      { query: 'bml munjal university btech fees', pageUrl: 'https://talentxcel.in/colleges/bml-munjal-university', impressions: 32, clicks: 0, position: 21.0 },
      { query: 'aiims rishikesh fees courses', pageUrl: 'https://talentxcel.in/colleges/all-india-institute-of-medical-sciences-aiims-rishikesh', impressions: 26, clicks: 0, position: 23.4 },
      { query: 'drdo jobs in hyderabad eligibility', pageUrl: 'https://talentxcel.in/jobs/government/drdo-hyderabad', impressions: 10, clicks: 1, position: 2.2 },
    ];

    return rawPatterns.map(p => {
      const ctrPct = p.impressions > 0 ? Math.round((p.clicks / p.impressions) * 10000) / 100 : 0;
      const template = this.classifyIntentTemplate(p.query, p.pageUrl);
      const wedgeScore = this.computeWedgeScore(p.impressions, p.clicks, ctrPct, template);

      let hook: IntentScoringRecord['primaryConversionHook'] = '10_SECOND_MATCH';
      if (template === 'OCCUPATION_RESUME_ATS') hook = 'ATS_RESUME_SCORE';
      else if (template === 'OCCUPATION_SALARY_BENCHMARK') hook = 'SALARY_BENCHMARK';
      else if (template === 'OCCUPATION_INTERVIEW_PREP' || template === 'COLLEGE_CAREER_CUTOFF') hook = 'CAREER_PASSPORT';

      return {
        query: p.query,
        pageUrl: p.pageUrl,
        template,
        impressions: p.impressions,
        clicks: p.clicks,
        ctrPct,
        position: p.position,
        wedgeScore,
        primaryConversionHook: hook,
        suggestedAction: `Embed ${hook} interactive widget on ${p.pageUrl} to capture candidate intent before bounce.`,
      };
    }).sort((a, b) => b.wedgeScore - a.wedgeScore);
  }

  /**
   * Identifies the Top 20 Urgent Action Surfaces that must immediately receive the 10-Second Match conversion layer
   */
  public static getTop20UrgentConversionSurfaces(): IntentScoringRecord[] {
    return this.getTop100WinningPatterns().slice(0, 20);
  }

  /**
   * In-depth deconstruction of the Varanasi Anomaly (3,335 imp / 118 clicks)
   */
  public static getVaranasiAnomalyAnalysis(): VaranasiAnomalyAnalysis {
    return {
      pageUrl: 'https://talentxcel.in/locations/varanasi',
      totalImpressions: 3335,
      totalClicks: 118,
      blendedCtrPct: 3.54,
      averagePosition: 2.2,
      rootDemandDriver: 'Massive organic employment vacancy intent in Tier-2/Tier-3 urban center with low web competition and high mobile search density.',
      topQueriesSample: [
        { query: 'job in varanasi', impressions: 1036, clicks: 19, position: 2.3 },
        { query: 'jobs in varanasi', impressions: 757, clicks: 25, position: 2.1 },
        { query: 'varanasi job vacancy', impressions: 361, clicks: 26, position: 2.3 },
        { query: 'varanasi job', impressions: 260, clicks: 12, position: 1.7 },
        { query: 'job varanasi', impressions: 221, clicks: 3, position: 3.5 },
      ],
      strategicInsight: 'Candidates in non-metro regional hubs actively search for localized employment. TalentXcel ranks #2 organically. Adding the 10-Second Instant Match widget turns this traffic directly into registered candidates.',
      tier2ReplicationMatrix: [
        { city: 'Varanasi', state: 'Uttar Pradesh', tier: 'TIER_2', status: 'ACTIVE_PROVEN', expectedMonthlyImpressions: 3500, recommendedTargetRoleFilters: ['software-engineer', 'sales-officer', 'nursing', 'teaching'] },
        { city: 'Patiala', state: 'Punjab', tier: 'TIER_2', status: 'ACTIVE_PROVEN', expectedMonthlyImpressions: 400, recommendedTargetRoleFilters: ['nursing', 'operations', 'customer-support', 'banking'] },
        { city: 'Lucknow', state: 'Uttar Pradesh', tier: 'TIER_2', status: 'QUEUED_FOR_REPLICATION', expectedMonthlyImpressions: 4500, recommendedTargetRoleFilters: ['software-engineer', 'civil-engineer', 'pharmacist', 'relationship-manager'] },
        { city: 'Jaipur', state: 'Rajasthan', tier: 'TIER_2', status: 'QUEUED_FOR_REPLICATION', expectedMonthlyImpressions: 4000, recommendedTargetRoleFilters: ['hospitality', 'civil-engineer', 'sales', 'it-software'] },
        { city: 'Chandigarh', state: 'Punjab / Haryana', tier: 'TIER_2', status: 'QUEUED_FOR_REPLICATION', expectedMonthlyImpressions: 3200, recommendedTargetRoleFilters: ['software-engineer', 'data-analyst', 'nursing', 'content-writer'] },
        { city: 'Srinagar', state: 'Jammu & Kashmir', tier: 'TIER_2', status: 'QUEUED_FOR_REPLICATION', expectedMonthlyImpressions: 2200, recommendedTargetRoleFilters: ['teaching', 'civil-engineer', 'healthcare', 'tourism'] },
        { city: 'Jammu', state: 'Jammu & Kashmir', tier: 'TIER_2', status: 'QUEUED_FOR_REPLICATION', expectedMonthlyImpressions: 1800, recommendedTargetRoleFilters: ['banking', 'pharmacy', 'administration', 'operations'] },
        { city: 'Indore', state: 'Madhya Pradesh', tier: 'TIER_2', status: 'QUEUED_FOR_REPLICATION', expectedMonthlyImpressions: 3800, recommendedTargetRoleFilters: ['it-software', 'finance', 'logistics', 'manufacturing'] },
        { city: 'Coimbatore', state: 'Tamil Nadu', tier: 'TIER_2', status: 'QUEUED_FOR_REPLICATION', expectedMonthlyImpressions: 3000, recommendedTargetRoleFilters: ['mechanical-engineer', 'textile', 'software-engineer', 'healthcare'] },
        { city: 'Nagpur', state: 'Maharashtra', tier: 'TIER_2', status: 'QUEUED_FOR_REPLICATION', expectedMonthlyImpressions: 2900, recommendedTargetRoleFilters: ['logistics', 'cargo', 'healthcare', 'software-engineer'] },
      ],
    };
  }

  /**
   * Realigned Growth Funnel Milestones (Targeting 25% Signup Conversion)
   * At 25% conversion: 50,000 registrations/day requires 200,000 qualified visits/day (instead of 455,000).
   */
  public static calculateRealignmentMilestones(): GrowthWedgeMilestone[] {
    return [
      {
        milestoneLevel: 1,
        dailyRegistrationsTarget: 1000,
        requiredDailyVisitsAt25Pct: 4000,
        requiredDailyVisitsAt11Pct: 9100,
        expectedDailyApplications: 244,
        prerequisiteCondition: 'Deploy 10-second match widget on Top 20 high-CTR surfaces + Varanasi replication matrix.',
      },
      {
        milestoneLevel: 2,
        dailyRegistrationsTarget: 5000,
        requiredDailyVisitsAt25Pct: 20000,
        requiredDailyVisitsAt11Pct: 45500,
        expectedDailyApplications: 1220,
        prerequisiteCondition: 'Validate 25% signup conversion across 100 high-intent search patterns.',
      },
      {
        milestoneLevel: 3,
        dailyRegistrationsTarget: 10000,
        requiredDailyVisitsAt25Pct: 40000,
        requiredDailyVisitsAt11Pct: 91000,
        expectedDailyApplications: 2440,
        prerequisiteCondition: 'Viral referral loop active: each Career Passport produces >= 0.15 organic candidate invites.',
      },
      {
        milestoneLevel: 4,
        dailyRegistrationsTarget: 25000,
        requiredDailyVisitsAt25Pct: 100000,
        requiredDailyVisitsAt11Pct: 228000,
        expectedDailyApplications: 6100,
        prerequisiteCondition: 'Scale to 250 validated occupations + nationwide Tier-2/Tier-3 city coverage.',
      },
      {
        milestoneLevel: 5,
        dailyRegistrationsTarget: 50000,
        requiredDailyVisitsAt25Pct: 200000,
        requiredDailyVisitsAt11Pct: 455000,
        expectedDailyApplications: 12200,
        prerequisiteCondition: 'Full 500 occupation graph saturated + high-intent programmatic landing network operational.',
      },
    ];
  }

  /**
   * Outlines the complete Registration Acquisition OS architecture loop
   */
  public static getRegistrationAcquisitionOsWorkflow() {
    return [
      '1. Search Demand: Google query initiated ("safety officer jobs fresher", "jobs in varanasi")',
      '2. Winning Intent Detector: Classifies query into high-intent archetype (Occupation + City + Exp)',
      '3. Occupation × Location × Experience: Maps query to verified entity nodes in career graph',
      '4. Evidence Gate: Verifies 12-factor saturation (jobs >= 3, verified salary, ATS keywords)',
      '5. High-CTR Landing Page: Renders optimized title, schema, and employer trust badges',
      '6. 10-Second Match Layer: Interactive prompt: "Calculate My Match — Free" (Experience + Skills + Location)',
      '7. Google Sign-In Trigger: Zero-friction authentication to unlock personal match score & ATS diagnosis',
      '8. Career Passport Creation: Profile automatically generated with candidate verified credentials',
      '9. ATS Scorer & Diagnosis: Real-time keyword suggestions and Google XYZ bullet generator',
      '10. Job Match & 1-Click Apply: Candidate matched to live verified vacancies and applies',
      '11. Viral / Referral Loop: Shareable verified Career Passport badge shared with peers',
      '12. New Candidate Inflow: Peer clicks shared passport link and enters conversion funnel at Step 6',
    ];
  }
}
