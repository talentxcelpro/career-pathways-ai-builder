// src/lib/seo/programmatic/matrixExpansionEngine.ts
// 8-Dimensional Search Intent Programmatic Matrix Engine (Apna / Naukri Blueprint)

export interface IntentDimensionCatalog {
  roles: { title: string; slug: string; category: string }[];
  locations: { name: string; slug: string; tier: string }[];
  workModes: { label: string; slug: string }[];
  experienceBands: { label: string; slug: string }[];
  employmentTypes: { label: string; slug: string }[];
  salaryBands: { label: string; slug: string }[];
  skills: { name: string; slug: string }[];
  industries: { name: string; slug: string }[];
}

export const INTENT_DIMENSIONS: IntentDimensionCatalog = {
  roles: [
    { title: 'Software Engineer', slug: 'software-engineer', category: 'ENGINEERING' },
    { title: 'Content Writer', slug: 'content-writer', category: 'MARKETING' },
    { title: 'Marketing Executive', slug: 'marketing-executive', category: 'MARKETING' },
    { title: 'Recruiter', slug: 'recruiter', category: 'HR' },
    { title: 'Data Analyst', slug: 'data-analyst', category: 'DATA' },
    { title: 'AI Engineer', slug: 'ai-engineer', category: 'AI_ML' },
    { title: 'HR Executive', slug: 'hr-executive', category: 'HR' },
    { title: 'DevOps Engineer', slug: 'devops-engineer', category: 'CLOUD' },
    { title: 'Frontend Developer', slug: 'frontend-developer', category: 'ENGINEERING' },
    { title: 'Backend Developer', slug: 'backend-developer', category: 'ENGINEERING' },
    { title: 'Product Manager', slug: 'product-manager', category: 'PRODUCT' },
    { title: 'Curriculum Developer', slug: 'curriculum-developer', category: 'EDUCATION' },
    { title: 'Financial Analyst', slug: 'financial-analyst', category: 'FINANCE' },
  ],
  locations: [
    { name: 'India', slug: 'india', tier: 'NATIONAL' },
    { name: 'Bangalore', slug: 'bangalore', tier: 'TIER_1' },
    { name: 'Noida', slug: 'noida', tier: 'TIER_1' },
    { name: 'Gurgaon', slug: 'gurgaon', tier: 'TIER_1' },
    { name: 'Delhi NCR', slug: 'delhi', tier: 'TIER_1' },
    { name: 'Mumbai', slug: 'mumbai', tier: 'TIER_1' },
    { name: 'Hyderabad', slug: 'hyderabad', tier: 'TIER_1' },
    { name: 'Pune', slug: 'pune', tier: 'TIER_1' },
    { name: 'Chennai', slug: 'chennai', tier: 'TIER_1' },
    { name: 'Srinagar', slug: 'srinagar', tier: 'TIER_2' },
    { name: 'Jammu', slug: 'jammu', tier: 'TIER_2' },
    { name: 'Kolkata', slug: 'kolkata', tier: 'TIER_1' },
  ],
  workModes: [
    { label: 'Work From Home', slug: 'work-from-home' },
    { label: 'Remote', slug: 'remote' },
    { label: 'Hybrid', slug: 'hybrid' },
    { label: 'Office', slug: 'office' },
  ],
  experienceBands: [
    { label: 'Fresher', slug: 'fresher' },
    { label: '0-1 Years', slug: '0-1-years' },
    { label: '1-3 Years', slug: '1-3-years' },
    { label: '3-5 Years', slug: '3-5-years' },
    { label: '5+ Years', slug: 'senior' },
  ],
  employmentTypes: [
    { label: 'Full Time', slug: 'full-time' },
    { label: 'Part Time', slug: 'part-time' },
    { label: 'Internship', slug: 'internship' },
    { label: 'Contract', slug: 'contract' },
  ],
  salaryBands: [
    { label: '₹20,000+', slug: '20k-plus' },
    { label: '₹50,000+', slug: '50k-plus' },
    { label: '₹1 Lakh+', slug: '1-lakh-plus' },
    { label: '₹25 LPA+', slug: '25-lpa-plus' },
  ],
  skills: [
    { name: 'Python', slug: 'python' },
    { name: 'Java', slug: 'java' },
    { name: 'React', slug: 'react' },
    { name: 'SQL', slug: 'sql' },
    { name: 'AWS', slug: 'aws' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'AI Prompt Engineering', slug: 'ai-prompt-engineering' },
    { name: 'SEO & Content Strategy', slug: 'seo-content-strategy' },
  ],
  industries: [
    { name: 'IT & Software', slug: 'it-software' },
    { name: 'Banking & Finance', slug: 'banking-finance' },
    { name: 'Healthcare & Pharma', slug: 'healthcare-pharma' },
    { name: 'EdTech & Higher Ed', slug: 'edtech-education' },
    { name: 'Staffing & HR Tech', slug: 'staffing-hrtech' },
  ],
};

export interface ProgrammaticCandidate {
  targetUrl: string;
  layer: 'LAYER_A_JOBS' | 'LAYER_B_CAREERS' | 'LAYER_C_LOCATIONS' | 'LAYER_D_TOOLS';
  roleSlug: string;
  locationSlug?: string;
  workModeSlug?: string;
  experienceSlug?: string;
  hasRealInventory: boolean;
  pageQualityScore: number;
  consolidationTarget?: string;
  action: 'INDEX_GENUINE_PAGE' | 'CONSOLIDATE_TO_PARENT' | 'NOINDEX_THIN';
}

export function evaluateProgrammaticCandidate(
  roleSlug: string,
  locationSlug?: string,
  workModeSlug?: string,
  experienceSlug?: string
): ProgrammaticCandidate {
  // 1. Core Role x Location combinations (e.g. /jobs/software-engineer/bangalore) -> HIGH VALUE
  if (roleSlug && locationSlug && !workModeSlug && !experienceSlug) {
    return {
      targetUrl: `https://talentxcel.in/jobs/${roleSlug}/${locationSlug}`,
      layer: 'LAYER_A_JOBS',
      roleSlug,
      locationSlug,
      hasRealInventory: true,
      pageQualityScore: 95,
      action: 'INDEX_GENUINE_PAGE',
    };
  }

  // 2. Core Role Career Guides (e.g. /roles/software-engineer) -> HIGH VALUE
  if (roleSlug && !locationSlug && !workModeSlug && !experienceSlug) {
    return {
      targetUrl: `https://talentxcel.in/roles/${roleSlug}`,
      layer: 'LAYER_B_CAREERS',
      roleSlug,
      hasRealInventory: true,
      pageQualityScore: 98,
      action: 'INDEX_GENUINE_PAGE',
    };
  }

  // 3. Core Location Hubs (e.g. /locations/bangalore, /locations/srinagar) -> HIGH VALUE
  if (!roleSlug && locationSlug) {
    return {
      targetUrl: `https://talentxcel.in/locations/${locationSlug}`,
      layer: 'LAYER_C_LOCATIONS',
      roleSlug: '',
      locationSlug,
      hasRealInventory: true,
      pageQualityScore: 94,
      action: 'INDEX_GENUINE_PAGE',
    };
  }

  // 4. Overly thin multi-parameter combinations -> CONSOLIDATE to primary Role x City
  return {
    targetUrl: `https://talentxcel.in/jobs/${roleSlug}/${locationSlug || 'india'}`,
    layer: 'LAYER_A_JOBS',
    roleSlug,
    locationSlug,
    workModeSlug,
    experienceSlug,
    hasRealInventory: false,
    pageQualityScore: 70,
    consolidationTarget: `https://talentxcel.in/jobs/${roleSlug}/${locationSlug || 'india'}`,
    action: 'CONSOLIDATE_TO_PARENT',
  };
}
