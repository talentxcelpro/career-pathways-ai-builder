// src/lib/seo/searchUniverse/intentTaxonomyRegistry.ts
/**
 * TalentXcel Machine-Readable 22 Intent Dimensions Registry
 *
 * Maps search intent classes to primary products, required evidence types,
 * target page templates, interactive conversion widgets, and schema types.
 */

import { SearchUniverseId } from './searchUniverseRegistry';

export type IntentTypeId =
  | 'JOBS'
  | 'HIRING'
  | 'RESUME'
  | 'CV'
  | 'TEMPLATE'
  | 'EXAMPLE'
  | 'ATS_CHECKER'
  | 'KEYWORDS'
  | 'SALARY'
  | 'SKILLS'
  | 'COURSES'
  | 'CERTIFICATIONS'
  | 'COLLEGES'
  | 'ADMISSIONS'
  | 'PLACEMENTS'
  | 'INTERVIEWS'
  | 'CAREER_PATHWAY'
  | 'CAREER_SWITCH'
  | 'REMOTE'
  | 'FRESHER'
  | 'INTERNSHIP'
  | 'GOVT_JOBS';

export type EvidenceRequirementType =
  | 'JOB_INVENTORY'
  | 'SALARY_DATASET'
  | 'RESUME_TEMPLATE_CATALOG'
  | 'ATS_KEYWORD_TAXONOMY'
  | 'COLLEGE_PLACEMENT_REPORT'
  | 'COURSE_CURRICULUM'
  | 'CERTIFICATION_BODY_DATA'
  | 'INTERVIEW_QUESTION_BANK'
  | 'SKILL_TAXONOMY_INTELLIGENCE'
  | 'GOVT_GAZETTE_NOTIFICATION'
  | 'EMPLOYER_VERIFIED_PROFILE';

export interface IntentDimensionDefinition {
  id: IntentTypeId;
  name: string;
  universeId: SearchUniverseId;
  productPillar: 'FIND_A_JOB' | 'BUILD_MY_CAREER' | 'HIRE_TALENT';
  description: string;
  evidenceRequirement: EvidenceRequirementType;
  minimumEvidenceThreshold: number; // e.g. 3 jobs, 15 salary data points, 10 interview questions
  targetTemplateArchetype: string;
  primaryConversionWidget: string;
  schemaType: string;
  urlPattern: string;
}

export const INTENT_TAXONOMY_REGISTRY: Record<IntentTypeId, IntentDimensionDefinition> = {
  JOBS: {
    id: 'JOBS',
    name: 'Active Job Listings & Vacancies',
    universeId: 'JOBS',
    productPillar: 'FIND_A_JOB',
    description: 'User seeks current job openings and direct application opportunities',
    evidenceRequirement: 'JOB_INVENTORY',
    minimumEvidenceThreshold: 3,
    targetTemplateArchetype: 'JOB_ROLE_CITY_PAGE',
    primaryConversionWidget: 'InteractiveJobMatchWidget (Check My Match in 10s)',
    schemaType: 'CollectionPage',
    urlPattern: '/jobs/{role}/{location}',
  },
  HIRING: {
    id: 'HIRING',
    name: 'Employer Recruitment & Sourcing',
    universeId: 'TALENT_ACQUISITION',
    productPillar: 'HIRE_TALENT',
    description: 'Recruiters and founders seeking candidate talent and job posting services',
    evidenceRequirement: 'EMPLOYER_VERIFIED_PROFILE',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'EMPLOYER_ACQUISITION_PAGE',
    primaryConversionWidget: 'MultiLocationJobComposer',
    schemaType: 'Service',
    urlPattern: '/hire/{role}/{location}',
  },
  RESUME: {
    id: 'RESUME',
    name: 'Resume Builder & Writing Guide',
    universeId: 'RESUME_BUILDER',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Jobseeker seeking guidance and online tools to craft an effective resume',
    evidenceRequirement: 'RESUME_TEMPLATE_CATALOG',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'RESUME_ROLE_LEVEL',
    primaryConversionWidget: 'UnifiedResumeBuilder',
    schemaType: 'WebApplication',
    urlPattern: '/resume/build/{role}',
  },
  CV: {
    id: 'CV',
    name: 'Curriculum Vitae Guide & Templates',
    universeId: 'RESUME_TEMPLATES',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Academic or executive curriculum vitae structure and layout',
    evidenceRequirement: 'RESUME_TEMPLATE_CATALOG',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'RESUME_ROLE_LEVEL',
    primaryConversionWidget: 'UnifiedResumeBuilder',
    schemaType: 'WebApplication',
    urlPattern: '/cv-templates/{role}',
  },
  TEMPLATE: {
    id: 'TEMPLATE',
    name: 'Downloadable Resume Layouts',
    universeId: 'RESUME_TEMPLATES',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Formatted Word, PDF, and ATS-tested document templates',
    evidenceRequirement: 'RESUME_TEMPLATE_CATALOG',
    minimumEvidenceThreshold: 3,
    targetTemplateArchetype: 'RESUME_ROLE_LEVEL',
    primaryConversionWidget: 'TemplateGallery',
    schemaType: 'ItemPage',
    urlPattern: '/resume-templates/{role}',
  },
  EXAMPLE: {
    id: 'EXAMPLE',
    name: 'Resume Bullet Points & Summary Examples',
    universeId: 'RESUME_EXAMPLES',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Real-world achievement bullets, summary statements, and project descriptions',
    evidenceRequirement: 'RESUME_TEMPLATE_CATALOG',
    minimumEvidenceThreshold: 5,
    targetTemplateArchetype: 'RESUME_ROLE_LEVEL',
    primaryConversionWidget: 'UnifiedResumeBuilder',
    schemaType: 'Article',
    urlPattern: '/resume-examples/{role}',
  },
  ATS_CHECKER: {
    id: 'ATS_CHECKER',
    name: 'ATS Score Diagnostic & Parser',
    universeId: 'ATS_CHECKER',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Free resume scoring and parsing audit against enterprise ATS algorithms',
    evidenceRequirement: 'ATS_KEYWORD_TAXONOMY',
    minimumEvidenceThreshold: 20,
    targetTemplateArchetype: 'ATS_CHECKER_TOOL',
    primaryConversionWidget: 'ATSOptimizer (Instant Drag & Drop Scan)',
    schemaType: 'WebApplication',
    urlPattern: '/resume/ats-check/{role}',
  },
  KEYWORDS: {
    id: 'KEYWORDS',
    name: 'High-Impact ATS Keywords',
    universeId: 'ATS_KEYWORDS',
    productPillar: 'BUILD_MY_CAREER',
    description: 'High-frequency keywords extracted from Fortune 500 job descriptions',
    evidenceRequirement: 'ATS_KEYWORD_TAXONOMY',
    minimumEvidenceThreshold: 15,
    targetTemplateArchetype: 'ATS_CHECKER_TOOL',
    primaryConversionWidget: 'ATSOptimizer',
    schemaType: 'DefinedTermSet',
    urlPattern: '/resume/keywords/{role}',
  },
  SALARY: {
    id: 'SALARY',
    name: 'Compensation Benchmarks & Pay Bands',
    universeId: 'SALARY',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Salary percentiles (P10, P50, P90), compensation trends, and city comparisons',
    evidenceRequirement: 'SALARY_DATASET',
    minimumEvidenceThreshold: 15, // 15 verified data points
    targetTemplateArchetype: 'SALARY_BENCHMARK_PAGE',
    primaryConversionWidget: 'SalaryAnalyzer',
    schemaType: 'MonetaryAmountDistribution',
    urlPattern: '/salary/{role}/{location}',
  },
  SKILLS: {
    id: 'SKILLS',
    name: 'Skill Market Demand & Career Value',
    universeId: 'SKILLS',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Technical competency value, related roles, and hiring demand trajectory',
    evidenceRequirement: 'SKILL_TAXONOMY_INTELLIGENCE',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'SKILL_INTELLIGENCE_PAGE',
    primaryConversionWidget: 'SkillAssessor',
    schemaType: 'DefinedTerm',
    urlPattern: '/skills/{skill}',
  },
  COURSES: {
    id: 'COURSES',
    name: 'Online Learning Courses & Training',
    universeId: 'COURSES',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Accredited courses, bootcamps, and video masterclasses',
    evidenceRequirement: 'COURSE_CURRICULUM',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'COURSE_DESTINATION_PAGE',
    primaryConversionWidget: 'CoursePlayer',
    schemaType: 'Course',
    urlPattern: '/learning/courses/{skill}',
  },
  CERTIFICATIONS: {
    id: 'CERTIFICATIONS',
    name: 'Industry Professional Certifications',
    universeId: 'CERTIFICATIONS',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Official vendor and board certification preparation and ROI benchmarks',
    evidenceRequirement: 'CERTIFICATION_BODY_DATA',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'COURSE_DESTINATION_PAGE',
    primaryConversionWidget: 'CoursePlayer',
    schemaType: 'EducationalOccupationalCredential',
    urlPattern: '/certifications/{certification}',
  },
  COLLEGES: {
    id: 'COLLEGES',
    name: 'College Profiles & Institutional Dossier',
    universeId: 'COLLEGES',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Comprehensive college guide, campus facilities, and ranking dossiers',
    evidenceRequirement: 'COLLEGE_PLACEMENT_REPORT',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'COLLEGE_DOSSIER_PLACEMENTS',
    primaryConversionWidget: 'CareerPathway',
    schemaType: 'CollegeOrUniversity',
    urlPattern: '/colleges/{slug}',
  },
  ADMISSIONS: {
    id: 'ADMISSIONS',
    name: 'College Admissions & Cutoffs',
    universeId: 'COLLEGES',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Entrance exam cutoffs, eligibility criteria, and fee structures',
    evidenceRequirement: 'COLLEGE_PLACEMENT_REPORT',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'COLLEGE_DOSSIER_PLACEMENTS',
    primaryConversionWidget: 'CareerPathway',
    schemaType: 'CollegeOrUniversity',
    urlPattern: '/colleges/{slug}/admissions',
  },
  PLACEMENTS: {
    id: 'PLACEMENTS',
    name: 'Campus Placement Audited Reports',
    universeId: 'PLACEMENTS',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Highest CTC, median CTC, top recruiting companies, and batch placement rate',
    evidenceRequirement: 'COLLEGE_PLACEMENT_REPORT',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'COLLEGE_DOSSIER_PLACEMENTS',
    primaryConversionWidget: 'CareerPathway',
    schemaType: 'CollegeOrUniversity',
    urlPattern: '/colleges/{slug}/placements',
  },
  INTERVIEWS: {
    id: 'INTERVIEWS',
    name: 'Interview Questions & STAR Answers',
    universeId: 'INTERVIEW_QUESTIONS',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Technical, behavioral, and domain interview questions with structured answers',
    evidenceRequirement: 'INTERVIEW_QUESTION_BANK',
    minimumEvidenceThreshold: 10,
    targetTemplateArchetype: 'INTERVIEW_QUESTIONS_PAGE',
    primaryConversionWidget: 'PublicInterviewPrep',
    schemaType: 'FAQPage',
    urlPattern: '/interview-questions/{role}',
  },
  CAREER_PATHWAY: {
    id: 'CAREER_PATHWAY',
    name: 'Career Progression Roadmap',
    universeId: 'CAREER_MAP',
    productPillar: 'BUILD_MY_CAREER',
    description: 'End-to-end promotion ladder, requisite skills, and transition milestones',
    evidenceRequirement: 'SKILL_TAXONOMY_INTELLIGENCE',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'SKILL_INTELLIGENCE_PAGE',
    primaryConversionWidget: 'InteractiveCareerRoadmapBuilder',
    schemaType: 'Occupation',
    urlPattern: '/career-pathway/{role}',
  },
  CAREER_SWITCH: {
    id: 'CAREER_SWITCH',
    name: 'Career Pivot & Transition Guides',
    universeId: 'CAREER_MAP',
    productPillar: 'BUILD_MY_CAREER',
    description: 'Step-by-step transition roadmap from current occupation to target domain',
    evidenceRequirement: 'SKILL_TAXONOMY_INTELLIGENCE',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'SKILL_INTELLIGENCE_PAGE',
    primaryConversionWidget: 'InteractiveCareerRoadmapBuilder',
    schemaType: 'Guide',
    urlPattern: '/career-switch/{fromRole}-to-{toRole}',
  },
  REMOTE: {
    id: 'REMOTE',
    name: 'Remote & WFH Opportunities Worldwide',
    universeId: 'REMOTE_JOBS',
    productPillar: 'FIND_A_JOB',
    description: 'Telecommute, borderless, and work-from-home employment vacancies',
    evidenceRequirement: 'JOB_INVENTORY',
    minimumEvidenceThreshold: 3,
    targetTemplateArchetype: 'JOB_ROLE_CITY_PAGE',
    primaryConversionWidget: 'InteractiveJobMatchWidget',
    schemaType: 'CollectionPage',
    urlPattern: '/jobs/remote/{role}',
  },
  FRESHER: {
    id: 'FRESHER',
    name: 'Fresher & Entry-Level Openings',
    universeId: 'FRESHER_JOBS',
    productPillar: 'FIND_A_JOB',
    description: 'Campus recruitment and 0-year experience opportunities for graduates',
    evidenceRequirement: 'JOB_INVENTORY',
    minimumEvidenceThreshold: 3,
    targetTemplateArchetype: 'JOB_ROLE_CITY_PAGE',
    primaryConversionWidget: 'InteractiveJobMatchWidget',
    schemaType: 'CollectionPage',
    urlPattern: '/jobs/{role}/freshers',
  },
  INTERNSHIP: {
    id: 'INTERNSHIP',
    name: 'Student Internships & Traineeships',
    universeId: 'JOBS',
    productPillar: 'FIND_A_JOB',
    description: 'Paid student internships, summer traineeships, and apprentice roles',
    evidenceRequirement: 'JOB_INVENTORY',
    minimumEvidenceThreshold: 2,
    targetTemplateArchetype: 'JOB_ROLE_CITY_PAGE',
    primaryConversionWidget: 'InteractiveJobMatchWidget',
    schemaType: 'CollectionPage',
    urlPattern: '/internships/{role}/{location}',
  },
  GOVT_JOBS: {
    id: 'GOVT_JOBS',
    name: 'Public Sector & Government Notifications',
    universeId: 'GOVERNMENT_JOBS',
    productPillar: 'FIND_A_JOB',
    description: 'Official notifications, exams, age limits, and gazette vacancies',
    evidenceRequirement: 'GOVT_GAZETTE_NOTIFICATION',
    minimumEvidenceThreshold: 1,
    targetTemplateArchetype: 'GOVERNMENT_JOB_PAGE',
    primaryConversionWidget: 'InteractiveJobMatchWidget',
    schemaType: 'JobPosting',
    urlPattern: '/government-jobs/{country}/{body}',
  },
};

export class IntentTaxonomyRegistry {
  static getIntentDefinition(id: IntentTypeId): IntentDimensionDefinition | undefined {
    return INTENT_TAXONOMY_REGISTRY[id];
  }

  static getAllIntents(): IntentDimensionDefinition[] {
    return Object.values(INTENT_TAXONOMY_REGISTRY);
  }
}
