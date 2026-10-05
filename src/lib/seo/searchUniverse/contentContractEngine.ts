// src/lib/seo/searchUniverse/contentContractEngine.ts
/**
 * TalentXcel Content Contract Engine
 *
 * Defines the rigorous data contract for each search destination archetype.
 * Prevents thin programmatic generation by mandating substantive, verified modules
 * and integrating high-conversion interactive free tools on every landing surface.
 */

export interface ContentModuleContract {
  moduleName: string;
  isMandatory: boolean;
  minDataPoints: number;
  description: string;
}

export interface ArchetypeContentContract {
  archetypeId: string;
  templateName: string;
  requiredStructuredDataType: string;
  primaryConversionWidget: string;
  modules: ContentModuleContract[];
}

export const ARCHETYPE_CONTRACTS: Record<string, ArchetypeContentContract> = {
  JOB_ROLE_CITY_PAGE: {
    archetypeId: 'JOB_ROLE_CITY_PAGE',
    templateName: 'Job Search Destination Hub',
    requiredStructuredDataType: 'CollectionPage',
    primaryConversionWidget: 'InteractiveJobMatchWidget (Check My Match in 10s)',
    modules: [
      { moduleName: 'Hero & Canonical Intent H1', isMandatory: true, minDataPoints: 1, description: 'Role title, city name, active vacancy count' },
      { moduleName: 'Live Verified Job Inventory', isMandatory: true, minDataPoints: 3, description: 'Direct Supabase job cards with verified salaries, dates, and 1-click apply' },
      { moduleName: 'Local Compensation Benchmarks', isMandatory: true, minDataPoints: 3, description: 'P25, P50, P75 salary distributions in local currency (INR, AED, GBP, USD)' },
      { moduleName: 'Top Hiring Companies', isMandatory: true, minDataPoints: 3, description: 'Direct links to active employers recruiting in the target city' },
      { moduleName: 'Core Technical Skill Demands', isMandatory: true, minDataPoints: 5, description: 'Skill badges with frequency percentages in local job descriptions' },
      { moduleName: 'Interactive ATS Match CTA', isMandatory: true, minDataPoints: 1, description: 'Immediate skill selector returning real-time fit score before authentication' },
      { moduleName: 'Role Interview Prep Questions', isMandatory: false, minDataPoints: 3, description: 'Technical questions and verified answers for the role' },
      { moduleName: 'Related Cities & Sub-Roles', isMandatory: true, minDataPoints: 4, description: 'Contextual internal graph links to adjacent tech hubs' },
    ],
  },

  RESUME_ROLE_LEVEL: {
    archetypeId: 'RESUME_ROLE_LEVEL',
    templateName: 'ATS-Compliant Resume & CV Destination',
    requiredStructuredDataType: 'CreativeWork',
    primaryConversionWidget: 'InteractiveResumeBulletCustomizer (Free Template Editor)',
    modules: [
      { moduleName: 'Editable ATS Resume Preview', isMandatory: true, minDataPoints: 1, description: 'Live interactive canvas previewing clean, single-column ATS formatting' },
      { moduleName: 'Role-Specific Achievement Bullets', isMandatory: true, minDataPoints: 10, description: 'Metrics-driven bullet points (e.g. Reduced latency by 40% using Go)' },
      { moduleName: 'High-Frequency ATS Keyword Heatmap', isMandatory: true, minDataPoints: 15, description: 'Essential hard skills, libraries, and certifications required by ATS parsers' },
      { moduleName: 'Experience-Level Phrasing Variations', isMandatory: true, minDataPoints: 3, description: 'Fresher vs Mid-level vs Senior phrasing comparisons' },
      { moduleName: 'One-Click Template Download (Word/PDF)', isMandatory: true, minDataPoints: 2, description: 'Free unwatermarked ATS-friendly export' },
      { moduleName: 'Job-to-Resume Live Match Scanner', isMandatory: true, minDataPoints: 1, description: 'Paste target job description to reveal missing keywords' },
    ],
  },

  ATS_CHECKER_TOOL: {
    archetypeId: 'ATS_CHECKER_TOOL',
    templateName: 'Free ATS Resume Score Checker',
    requiredStructuredDataType: 'WebApplication',
    primaryConversionWidget: 'LiveAtsScannerEngine (10-Second Score Reveal)',
    modules: [
      { moduleName: 'Instant Drag-and-Drop Resume Scanner', isMandatory: true, minDataPoints: 1, description: 'Supports PDF/DOCX with zero upfront registration barrier' },
      { moduleName: 'Multi-Dimensional Score Breakdown', isMandatory: true, minDataPoints: 4, description: 'Formatting score, keyword density, section detection, and impact metrics' },
      { moduleName: 'Critical ATS Red Flags Warning', isMandatory: true, minDataPoints: 1, description: 'Highlights tables, multi-columns, images, or missing contact info' },
      { moduleName: 'Live Role Keyword Comparison', isMandatory: true, minDataPoints: 5, description: 'Real-time gap analysis against target role job descriptions' },
      { moduleName: 'One-Click Quick Auth Profile Save', isMandatory: true, minDataPoints: 1, description: 'Google login to save score and auto-match to 548 active jobs' },
    ],
  },

  COLLEGE_DOSSIER_PLACEMENTS: {
    archetypeId: 'COLLEGE_DOSSIER_PLACEMENTS',
    templateName: 'Audited College Placement Dossier',
    requiredStructuredDataType: 'Dataset',
    primaryConversionWidget: 'CampusToCorporateCareerMatcher',
    modules: [
      { moduleName: 'Audited Placement Statistics', isMandatory: true, minDataPoints: 4, description: 'Average CTC, median CTC, highest domestic, and international offers' },
      { moduleName: 'Top Recruiting Corporations', isMandatory: true, minDataPoints: 5, description: 'Verified hiring companies with offer volumes' },
      { moduleName: 'Department & Branch Placements', isMandatory: true, minDataPoints: 3, description: 'CSE vs ECE vs Mechanical vs MBA placement ratios' },
      { moduleName: 'Historical 3-Year Trend Analysis', isMandatory: true, minDataPoints: 3, description: 'Verified compensation trajectories across NIRF cohorts' },
      { moduleName: 'Alumni Employment Graph Links', isMandatory: true, minDataPoints: 5, description: 'Where graduates work, roles they hold, and skill requirements' },
    ],
  },

  SALARY_BENCHMARK_PAGE: {
    archetypeId: 'SALARY_BENCHMARK_PAGE',
    templateName: 'Evidence-Based Salary Intelligence Hub',
    requiredStructuredDataType: 'Dataset',
    primaryConversionWidget: 'InteractiveSalaryCalculator & Negotiation Tool',
    modules: [
      { moduleName: 'Compensation Percentile Distribution', isMandatory: true, minDataPoints: 5, description: 'Verified P10, P25, P50, P75, P90 salary data' },
      { moduleName: 'Experience Band Compensation Graph', isMandatory: true, minDataPoints: 4, description: '0-2 yrs, 3-5 yrs, 6-9 yrs, 10+ yrs salary progression' },
      { moduleName: 'Observed Sample Size & Audit Date', isMandatory: true, minDataPoints: 2, description: 'Sample count of analyzed offers and methodology disclosure' },
      { moduleName: 'Top Paying Companies in Target Region', isMandatory: true, minDataPoints: 4, description: 'Corporations offering above-median compensation' },
      { moduleName: 'Skill Premium Multipliers', isMandatory: true, minDataPoints: 4, description: 'How much AWS, System Design, or Python increases base CTC' },
      { moduleName: 'Live Matching Vacancies CTA', isMandatory: true, minDataPoints: 1, description: 'Browse open jobs paying within this salary tier' },
    ],
  },

  SKILL_INTELLIGENCE_PAGE: {
    archetypeId: 'SKILL_INTELLIGENCE_PAGE',
    templateName: 'Skill Market Demand & Career Destination',
    requiredStructuredDataType: 'DefinedTerm',
    primaryConversionWidget: 'SkillGapAnalyzer & Course Pathway Generator',
    modules: [
      { moduleName: 'Authoritative Skill Definition & Taxonomy', isMandatory: true, minDataPoints: 1, description: 'What the capability entails and industry adoption context' },
      { moduleName: 'Job Market Hiring Volume', isMandatory: true, minDataPoints: 1, description: 'Total active vacancies requiring this skill badge' },
      { moduleName: 'Associated Technical Roles', isMandatory: true, minDataPoints: 3, description: 'Career pathways requiring this capability' },
      { moduleName: 'Accredited Courses & Certifications', isMandatory: true, minDataPoints: 2, description: 'Verified learning paths to acquire proficiency' },
      { moduleName: 'Interview Technical Questions', isMandatory: true, minDataPoints: 5, description: 'Live coding and conceptual interview questions' },
      { moduleName: 'Resume Action Keywords', isMandatory: true, minDataPoints: 8, description: 'How to write impactful resume bullets featuring this skill' },
    ],
  },

  GOVERNMENT_JOB_PAGE: {
    archetypeId: 'GOVERNMENT_JOB_PAGE',
    templateName: 'Official Government Recruitment Dossier',
    requiredStructuredDataType: 'JobPosting',
    primaryConversionWidget: 'InteractiveJobMatchWidget (Check Eligibility in 10s)',
    modules: [
      { moduleName: 'Official Gazette Notification & PDF', isMandatory: true, minDataPoints: 1, description: 'Direct verification link to official gazette recruitment notice' },
      { moduleName: 'Vacancy Count & Reservation Breakdown', isMandatory: true, minDataPoints: 1, description: 'General, OBC, SC, ST, EWS vacancy distribution' },
      { moduleName: 'Age Limit & Educational Eligibility', isMandatory: true, minDataPoints: 2, description: 'Age criteria, relaxations, and degree requirements' },
      { moduleName: 'Selection Process & Exam Pattern', isMandatory: true, minDataPoints: 2, description: 'Prelims, Mains, Interview, Physical test structure' },
      { moduleName: 'Key Application Dates & Deadlines', isMandatory: true, minDataPoints: 2, description: 'Start date, end date, admit card release, exam dates' },
      { moduleName: 'Direct Official Apply Portal Link', isMandatory: true, minDataPoints: 1, description: 'Direct government portal URL with zero intermediary redirect' },
    ],
  },

  COMPANY_CAREERS_DOSSIER: {
    archetypeId: 'COMPANY_CAREERS_DOSSIER',
    templateName: 'Employer Intelligence & Careers Dossier',
    requiredStructuredDataType: 'Organization',
    primaryConversionWidget: 'InteractiveJobMatchWidget (Check My Company Fit)',
    modules: [
      { moduleName: 'Company Profile & Sector Classification', isMandatory: true, minDataPoints: 1, description: 'Verified employer identity, headquarters, and industry' },
      { moduleName: 'Active Verified Openings', isMandatory: true, minDataPoints: 1, description: 'Live unexpired job postings' },
      { moduleName: 'Audited Salary Distributions', isMandatory: true, minDataPoints: 3, description: 'Compensation bands for entry, mid, and senior levels' },
      { moduleName: 'Interview Process & Question Bank', isMandatory: true, minDataPoints: 3, description: 'Real interview rounds and technical questions asked' },
      { moduleName: 'Core Tech Stack & Skills', isMandatory: true, minDataPoints: 5, description: 'Primary tools, technologies, and methodologies utilized' },
      { moduleName: 'Office Locations & Work Mode Policy', isMandatory: true, minDataPoints: 1, description: 'Physical hubs and hybrid/remote flexibility' },
    ],
  },

  INTERVIEW_QUESTIONS_PAGE: {
    archetypeId: 'INTERVIEW_QUESTIONS_PAGE',
    templateName: 'Interview Question Bank & Preparation Hub',
    requiredStructuredDataType: 'FAQPage',
    primaryConversionWidget: 'PublicInterviewPrep (Mock Interview Simulator)',
    modules: [
      { moduleName: 'Curated Question Bank', isMandatory: true, minDataPoints: 10, description: 'High-frequency technical and behavioral questions' },
      { moduleName: 'STAR Answer Frameworks', isMandatory: true, minDataPoints: 5, description: 'Situation, Task, Action, Result structured model answers' },
      { moduleName: 'Difficulty & Seniority Tags', isMandatory: true, minDataPoints: 3, description: 'Junior vs Mid vs Senior question classification' },
      { moduleName: 'Live Code / Architecture Solutions', isMandatory: true, minDataPoints: 3, description: 'Complete working code snippets or architectural diagrams' },
      { moduleName: 'Related Role Interview Hubs', isMandatory: true, minDataPoints: 4, description: 'Contextual internal graph links to adjacent roles' },
    ],
  },
};

export class ContentContractEngine {
  /**
   * Validates whether a candidate page satisfies all mandatory modules of its content contract.
   */
  public static validateContentContract(archetypeId: string, providedData: Record<string, any[]>): {
    isValid: boolean;
    missingModules: string[];
    contract: ArchetypeContentContract;
  } {
    const contract = ARCHETYPE_CONTRACTS[archetypeId] || ARCHETYPE_CONTRACTS.JOB_ROLE_CITY_PAGE;
    const missingModules: string[] = [];

    contract.modules.forEach(m => {
      if (m.isMandatory) {
        const data = providedData[m.moduleName];
        if (!data || data.length < m.minDataPoints) {
          missingModules.push(`${m.moduleName} (Requires >= ${m.minDataPoints} items, found ${data ? data.length : 0})`);
        }
      }
    });

    return {
      isValid: missingModules.length === 0,
      missingModules,
      contract,
    };
  }
}
