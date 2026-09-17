/**
 * src/lib/growth-os/ProductMagnetRegistry.ts
 *
 * Canonical Registry of the 10 Global Product Magnets.
 * Converts raw search/social/AI discovery directly into high-utility diagnostic tools.
 *
 * Free-first · Instant results · Personalized diagnostics · No artificial lock gates
 */

import { ProductMagnetId, ProductMagnetMeta } from './types';

export class ProductMagnetRegistry {
  private static readonly MAGNETS: Record<ProductMagnetId, ProductMagnetMeta> = {
    ATS_SCANNER: {
      id: 'ATS_SCANNER',
      name: 'Free ATS Resume Checker & Optimizer',
      path: '/resume/ats-checker',
      freeTierUtility: 'Instant parse score against target role + keyword deficiency breakdown + formatting audit',
      instantResultType: 'ATS Compatibility Score (0-100) + Missing Hard Skills List',
      diagnosticCardType: 'RESUME_ATS_SCORE',
      nextIntentAction: 'Auto-optimize resume bullets or match against verified job openings',
      targetMonthlyUniques: 50000,
    },
    SALARY_INTELLIGENCE: {
      id: 'SALARY_INTELLIGENCE',
      name: 'Global Verified Salary & Compensation Explorer',
      path: '/tools/salary',
      freeTierUtility: 'Interactive compensation percentiles (25th/50th/75th/90th) by role, location, and years of experience',
      instantResultType: 'Market Percentile Benchmark + Compensation Distribution Curve',
      diagnosticCardType: 'SALARY_PERCENTILE',
      nextIntentAction: 'Compare current salary or discover companies paying at top quartile',
      targetMonthlyUniques: 35000,
    },
    IN_HAND_CALCULATOR: {
      id: 'IN_HAND_CALCULATOR',
      name: 'Take-Home & In-Hand Salary Calculator',
      path: '/tools/in-hand-salary',
      freeTierUtility: 'Accurate breakdown of CTC to net monthly payout across tax regimes (Old vs New), PF, and statutory deductions',
      instantResultType: 'Exact Net Monthly Take-Home + Itemized Deductions Chart',
      diagnosticCardType: 'SALARY_PERCENTILE',
      nextIntentAction: 'Evaluate upcoming job offers or structure salary for tax efficiency',
      targetMonthlyUniques: 30000,
    },
    CAREER_TRANSITION: {
      id: 'CAREER_TRANSITION',
      name: 'Career Pivot & Skill Bridge Engine',
      path: '/career/change-career',
      freeTierUtility: 'Skill adjacency matrix mapping current role capabilities to high-growth adjacent tech careers',
      instantResultType: 'Portability Percentage (0-100%) + Required Skill Gap Checklist',
      diagnosticCardType: 'SKILL_OVERLAP_MATRIX',
      nextIntentAction: 'Generate 90-day learning roadmap to close capability delta',
      targetMonthlyUniques: 20000,
    },
    JOB_SKILL_MATCHER: {
      id: 'JOB_SKILL_MATCHER',
      name: 'Capability-to-Job Direct Matcher',
      path: '/jobs/match',
      freeTierUtility: 'Match resume skills against real, live first-party verified vacancies with zero ghost listings',
      instantResultType: 'Match Quality Score + Direct Apply Routes for Verified Supply',
      diagnosticCardType: 'SKILL_OVERLAP_MATRIX',
      nextIntentAction: 'One-click application with verified skill passport',
      targetMonthlyUniques: 25000,
    },
    INTERVIEW_SIMULATOR: {
      id: 'INTERVIEW_SIMULATOR',
      name: 'AI Technical & Behavioral Mock Interviewer',
      path: '/tools/interview',
      freeTierUtility: 'Simulate 5 realistic role-specific interview questions with instant answer evaluation and scoring rubric',
      instantResultType: 'Interview Readiness Score (0-100) + Specific Answer Critique',
      diagnosticCardType: 'INTERVIEW_READINESS_INDEX',
      nextIntentAction: 'Review sample top-tier candidate answers or schedule practice session',
      targetMonthlyUniques: 15000,
    },
    CAREER_PASSPORT: {
      id: 'CAREER_PASSPORT',
      name: 'Verified Career Passport & Skill Credentials',
      path: '/career-passport',
      freeTierUtility: 'Cryptographically anchored digital career identity showcasing verified assessments, projects, and work history',
      instantResultType: 'Shareable Public Passport URL with Verified Badges',
      diagnosticCardType: 'SKILL_OVERLAP_MATRIX',
      nextIntentAction: 'Share credential directly with hiring managers or on LinkedIn',
      targetMonthlyUniques: 10000,
    },
    COLLEGE_INTELLIGENCE: {
      id: 'COLLEGE_INTELLIGENCE',
      name: 'College Degree & Placement Intelligence',
      path: '/colleges',
      freeTierUtility: 'Unbiased ROI, median placement salaries, and verified curriculum review across 1,000+ Indian universities',
      instantResultType: 'Tuition-to-Median-Salary Ratio + Real Placement Outcomes',
      diagnosticCardType: 'COLLEGE_ROI_ANALYSIS',
      nextIntentAction: 'Filter colleges matching budget and career pathway goals',
      targetMonthlyUniques: 10000,
    },
    UDX_DISCOVERY: {
      id: 'UDX_DISCOVERY',
      name: 'Universal Intent Discovery Operating System',
      path: '/discovery',
      freeTierUtility: 'Multi-domain reality resolver across Career, Education, Business, Finance, and Personal intents',
      instantResultType: 'Best Resolution Path with Verified Supply and Evidence Links',
      diagnosticCardType: 'SKILL_OVERLAP_MATRIX',
      nextIntentAction: 'Execute verified single-click action or inspect immutable ProofLedger',
      targetMonthlyUniques: 15000,
    },
    CAREER_ROADMAPS: {
      id: 'CAREER_ROADMAPS',
      name: 'Interactive Career Progression Maps',
      path: '/career/',
      freeTierUtility: 'Step-by-step career ladders from junior to principal for 50+ modern disciplines (AI, Cloud, Data, Frontend)',
      instantResultType: 'Visual Progression Tree with Milestone Skills & Salary Milestones',
      diagnosticCardType: 'SKILL_OVERLAP_MATRIX',
      nextIntentAction: 'Benchmark current progress on the ladder and identify next milestone skill',
      targetMonthlyUniques: 10000,
    },
  };

  public static getAll(): ProductMagnetMeta[] {
    return Object.values(this.MAGNETS);
  }

  public static get(id: ProductMagnetId): ProductMagnetMeta | undefined {
    return this.MAGNETS[id];
  }

  public static getTotalTargetTraffic(): number {
    return Object.values(this.MAGNETS).reduce((sum, m) => sum + m.targetMonthlyUniques, 0);
  }
}
