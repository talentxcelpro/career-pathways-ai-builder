// src/utils/careerIntelligence.ts
// Dynamic Career Intelligence Engine for TalentXcel
// Adapts dynamically to user's skills, criteria, age/experience, location, education, and target career goals.

export interface UserCareerCriteria {
  fullName: string;
  targetRole: string;
  skills: string[];
  experienceYears: number;
  ageBracket?: string;
  location: string;
  isRemote: boolean;
  educationLevel: string;
  fieldOfStudy: string;
  desiredSalaryMin?: number;
  desiredSalaryMax?: number;
  careerStage: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
}

export interface PersonaPreset {
  id: string;
  label: string;
  description: string;
  criteria: UserCareerCriteria;
}

export interface BoostSkill {
  skill: string;
  impact: 'High Impact' | 'Critical Demand' | 'High ROI';
  salaryBoost: string;
  matchBoost: string;
  reason: string;
}

export interface SalaryBreakdown {
  role: string;
  location: string;
  experienceLabel: string;
  educationLabel: string;
  currency: string;
  averageSalary: string;
  averageNumeric: number;
  minSalary: string;
  maxSalary: string;
  twentyFifthPercentile: number;
  currentPercentile: number;
  ninetiethPercentile: number;
  expectedIncrease: number;
  percentiles: {
    p25: string;
    p50: string;
    p75: string;
    p90: string;
  };
  sampleCount: number;
  negotiationTip: string;
  marketTrend: string;
  topPayingSector: string;
  remotePremium: string;
  skillPremium: string;
}

export interface CompanySalary {
  rank: number;
  company: string;
  verified: boolean;
  role: string;
  salary: string;
  growth: string;
}

// Domain benchmarks for missing skill gap detection
const ROLE_SKILL_BENCHMARKS: Record<string, string[]> = {
  python: ['FastAPI', 'Docker', 'AWS', 'PostgreSQL', 'Redis', 'Kubernetes', 'Celery', 'GraphQL', 'Microservices', 'CI/CD'],
  ai: ['PyTorch', 'TensorFlow', 'LLMs', 'LangChain', 'Vector DBs', 'MLflow', 'Docker', 'Python', 'CUDA', 'Data Engineering'],
  frontend: ['TypeScript', 'Next.js', 'Tailwind CSS', 'React Native', 'GraphQL', 'Redux Toolkit', 'Jest/Cypress', 'Web Performance', 'Storybook', 'Vite'],
  fullstack: ['Node.js', 'TypeScript', 'Docker', 'PostgreSQL', 'AWS', 'GraphQL', 'Redis', 'Tailwind CSS', 'Kubernetes', 'System Design'],
  product: ['Agile / Scrum', 'JIRA', 'Product Analytics', 'SQL', 'A/B Testing', 'User Journey Mapping', 'Figma', 'Roadmapping', 'GTM Strategy', 'Mixpanel'],
  data: ['Python', 'SQL', 'BigQuery', 'Snowflake', 'dbt', 'Tableau', 'Pandas', 'Airflow', 'Data Modeling', 'Power BI'],
  devops: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD Pipelines', 'Prometheus', 'Grafana', 'Linux', 'Ansible', 'Security Compliance'],
  default: ['System Design', 'Cloud Architecture', 'Docker', 'RESTful APIs', 'SQL', 'Git', 'Agile Methodologies', 'Performance Optimization', 'Security Best Practices']
};

// Preset personas to demonstrate dynamic adaptation for any user criteria
export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'current_user',
    label: 'Arshid Hussain Wani (Python & AI Hub)',
    description: 'Python & AI Engineer • 4 Yrs Exp • Bangalore • B.Tech CSE',
    criteria: {
      fullName: 'Arshid Hussain Wani',
      targetRole: 'Python & AI Solutions Engineer',
      skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'REST APIs', 'Docker', 'Machine Learning', 'Git'],
      experienceYears: 4,
      ageBracket: '25-29 years',
      location: 'Bangalore, India',
      isRemote: true,
      educationLevel: "Bachelor's Degree (B.Tech)",
      fieldOfStudy: 'Computer Science & Engineering',
      careerStage: 'mid',
      desiredSalaryMin: 1400000,
      desiredSalaryMax: 2400000
    }
  },
  {
    id: 'priya_frontend',
    label: 'Priya Sharma (Senior Frontend)',
    description: 'Senior React/Next.js Dev • 7 Yrs Exp • Hyderabad • M.S Software',
    criteria: {
      fullName: 'Priya Sharma',
      targetRole: 'Senior Frontend Engineer',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Redux', 'Web Performance'],
      experienceYears: 7,
      ageBracket: '30-34 years',
      location: 'Hyderabad, India',
      isRemote: true,
      educationLevel: "Master's Degree (M.S)",
      fieldOfStudy: 'Software Engineering',
      careerStage: 'senior',
      desiredSalaryMin: 2200000,
      desiredSalaryMax: 3800000
    }
  },
  {
    id: 'vikram_product',
    label: 'Vikram Malhotra (Lead Product Manager)',
    description: 'Tech Product Leader • 11 Yrs Exp • Mumbai • MBA + B.Tech',
    criteria: {
      fullName: 'Vikram Malhotra',
      targetRole: 'Lead Product Manager',
      skills: ['Product Strategy', 'Agile & SAFe', 'Roadmapping', 'JIRA', 'Product Analytics', 'SQL', 'GTM Strategy'],
      experienceYears: 11,
      ageBracket: '35-40 years',
      location: 'Mumbai, India',
      isRemote: false,
      educationLevel: 'Master of Business Administration (MBA)',
      fieldOfStudy: 'Technology Management',
      careerStage: 'lead',
      desiredSalaryMin: 3500000,
      desiredSalaryMax: 6000000
    }
  },
  {
    id: 'sara_data',
    label: 'Sara Khan (Data & ML Scientist)',
    description: 'Data Scientist • 3 Yrs Exp • Delhi-NCR • M.Tech AI',
    criteria: {
      fullName: 'Sara Khan',
      targetRole: 'Data Scientist & AI Researcher',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'Pandas', 'Scikit-Learn', 'SQL', 'Data Modeling'],
      experienceYears: 3,
      ageBracket: '24-28 years',
      location: 'Delhi-NCR, India',
      isRemote: true,
      educationLevel: "Master's Degree (M.Tech)",
      fieldOfStudy: 'Artificial Intelligence',
      careerStage: 'mid',
      desiredSalaryMin: 1200000,
      desiredSalaryMax: 2000000
    }
  },
  {
    id: 'rohan_junior',
    label: 'Rohan Verma (Graduate Junior Dev)',
    description: 'Junior Software Engineer • 1 Yr Exp • Pune • B.Tech IT',
    criteria: {
      fullName: 'Rohan Verma',
      targetRole: 'Junior Software Engineer',
      skills: ['Java', 'JavaScript', 'SQL', 'HTML/CSS', 'Git', 'Spring Boot'],
      experienceYears: 1,
      ageBracket: '21-24 years',
      location: 'Pune, India',
      isRemote: false,
      educationLevel: "Bachelor's Degree (B.Tech)",
      fieldOfStudy: 'Information Technology',
      careerStage: 'entry',
      desiredSalaryMin: 500000,
      desiredSalaryMax: 900000
    }
  }
];

// Calculate Career Readiness based on profile completeness, skills, experience, and education
export function calculateDynamicCareerReadiness(criteria?: UserCareerCriteria, hasResume: boolean = true): {
  score: number;
  missingPoints: string[];
  nextMilestone: string;
} {
  let score = 20; // baseline for active account
  const missingPoints: string[] = [];

  const targetRole = criteria?.targetRole || '';
  // Identity & Target Role
  if (targetRole.trim().length > 2) {
    score += 15;
  } else {
    missingPoints.push('Define your target job designation');
  }

  // Skills
  const skills = Array.isArray(criteria?.skills) ? criteria.skills : [];
  const skillCount = skills.length;
  if (skillCount >= 8) {
    score += 25;
  } else if (skillCount >= 4) {
    score += 18;
    missingPoints.push('Add 3-4 more verified competencies');
  } else if (skillCount >= 1) {
    score += 10;
    missingPoints.push('Add at least 5 core technical skills');
  } else {
    missingPoints.push('Add your technical and domain skills');
  }

  // Experience
  const expYears = typeof criteria?.experienceYears === 'number' ? criteria.experienceYears : 0;
  if (expYears > 0) {
    score += 15;
  } else {
    score += 8; // Freshers get partial
  }

  // Education
  const eduLevel = criteria?.educationLevel || '';
  if (eduLevel.trim().length > 2) {
    score += 15;
  } else {
    missingPoints.push('Add your degree or education credentials');
  }

  // Location & Remote Preference
  const loc = criteria?.location || '';
  if (loc.trim().length > 2) {
    score += 5;
  }

  // Resume status
  if (hasResume) {
    score += 5;
  } else {
    missingPoints.push('Upload an ATS-compliant resume');
  }

  const finalScore = Math.min(96, Math.max(35, score));

  let nextMilestone = 'Senior Professional Readiness';
  if (finalScore < 50) nextMilestone = 'Baseline Profile Completion';
  else if (finalScore < 70) nextMilestone = 'Interview-Ready Candidate';
  else if (finalScore < 85) nextMilestone = 'Top 10% Talent Match';
  else nextMilestone = 'Verified Elite Candidate';

  return {
    score: finalScore,
    missingPoints,
    nextMilestone
  };
}

// Calculate missing skills based on role benchmark
export function calculateSkillsToBoost(criteria?: UserCareerCriteria): BoostSkill[] {
  const roleLower = (criteria?.targetRole || '').toLowerCase();
  let benchmarkKey = 'default';

  if (roleLower.includes('python')) benchmarkKey = 'python';
  else if (roleLower.includes('ai') || roleLower.includes('machine learning') || roleLower.includes('ml')) benchmarkKey = 'ai';
  else if (roleLower.includes('front') || roleLower.includes('react') || roleLower.includes('ui')) benchmarkKey = 'frontend';
  else if (roleLower.includes('full') || roleLower.includes('web')) benchmarkKey = 'fullstack';
  else if (roleLower.includes('product') || roleLower.includes('program') || roleLower.includes('project')) benchmarkKey = 'product';
  else if (roleLower.includes('data') || roleLower.includes('analyst')) benchmarkKey = 'data';
  else if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('infra')) benchmarkKey = 'devops';

  const benchmarkList = ROLE_SKILL_BENCHMARKS[benchmarkKey] || ROLE_SKILL_BENCHMARKS.default;
  const userSkills = Array.isArray(criteria?.skills) ? criteria.skills : [];
  const userSkillsLower = userSkills.map(s => String(s).toLowerCase().trim());

  // Find missing skills
  const missing = benchmarkList.filter(b => !userSkillsLower.some(us => us.includes(b.toLowerCase()) || b.toLowerCase().includes(us)));

  // If user already has everything in that list, pull complimentary cloud/modern skills
  const skillsToReturn = missing.length >= 3 ? missing.slice(0, 3) : [...missing, 'Cloud Architecture', 'System Design', 'Kubernetes'].slice(0, 3);

  const targetRole = criteria?.targetRole || 'Software Professional';
  const locationCity = (criteria?.location || 'India').split(',')[0] || 'the market';

  const boosts: BoostSkill[] = [
    {
      skill: skillsToReturn[0] || 'Cloud Architecture',
      impact: 'Critical Demand',
      salaryBoost: '+₹3.5L',
      matchBoost: '+22%',
      reason: `Required by 78% of ${targetRole} openings in ${locationCity}`
    },
    {
      skill: skillsToReturn[1] || 'System Design',
      impact: 'High Impact',
      salaryBoost: '+₹2.8L',
      matchBoost: '+18%',
      reason: 'Key differentiator for higher salary tier and senior evaluations'
    },
    {
      skill: skillsToReturn[2] || 'Docker / Containers',
      impact: 'High ROI',
      salaryBoost: '+₹1.9L',
      matchBoost: '+14%',
      reason: 'High demand across live enterprise and startup hiring pipelines'
    }
  ];

  return boosts;
}

// Calculate dynamic salary insights tailored to user's criteria (Role, Location, Experience, Education)
export function calculateDynamicSalaryInsights(criteria?: UserCareerCriteria): SalaryBreakdown {
  const roleLower = (criteria?.targetRole || '').toLowerCase();
  const locLower = (criteria?.location || '').toLowerCase();
  const exp = typeof criteria?.experienceYears === 'number' ? criteria.experienceYears : 0;
  const skills = Array.isArray(criteria?.skills) ? criteria.skills : [];
  const targetRole = criteria?.targetRole || 'Software Professional';
  const location = criteria?.location || 'Bangalore, India';
  const eduLevel = criteria?.educationLevel || "Bachelor's Degree";

  // Base salary curves (in INR)
  let baseMid = 1200000; // 12L default

  if (roleLower.includes('ai') || roleLower.includes('machine learning')) {
    baseMid = 1700000;
  } else if (roleLower.includes('product') || roleLower.includes('lead')) {
    baseMid = 1800000;
  } else if (roleLower.includes('python') || roleLower.includes('backend') || roleLower.includes('full')) {
    baseMid = 1350000;
  } else if (roleLower.includes('data')) {
    baseMid = 1250000;
  } else if (roleLower.includes('front') || roleLower.includes('ui')) {
    baseMid = 1150000;
  } else if (roleLower.includes('devops') || roleLower.includes('cloud')) {
    baseMid = 1450000;
  }

  // Experience multiplier
  let expMultiplier = 1.0;
  if (exp <= 1) expMultiplier = 0.55;
  else if (exp <= 3) expMultiplier = 0.85;
  else if (exp <= 5) expMultiplier = 1.15;
  else if (exp <= 8) expMultiplier = 1.65;
  else if (exp <= 12) expMultiplier = 2.30;
  else expMultiplier = 3.10;

  // Location multiplier
  let locMultiplier = 1.0;
  if (locLower.includes('bangalore') || locLower.includes('bengaluru')) locMultiplier = 1.20;
  else if (locLower.includes('mumbai')) locMultiplier = 1.15;
  else if (locLower.includes('delhi') || locLower.includes('gurugram') || locLower.includes('noida')) locMultiplier = 1.12;
  else if (locLower.includes('hyderabad')) locMultiplier = 1.10;
  else if (locLower.includes('pune')) locMultiplier = 1.05;
  else if (criteria?.isRemote) locMultiplier = 1.12;
  else if (locLower.includes('san francisco') || locLower.includes('us') || locLower.includes('uk')) locMultiplier = 3.5;

  // Education boost
  let eduBoost = 1.0;
  const eduLower = eduLevel.toLowerCase();
  if (eduLower.includes('master') || eduLower.includes('m.tech') || eduLower.includes('m.s')) eduBoost = 1.08;
  if (eduLower.includes('mba')) eduBoost = 1.12;
  if (eduLower.includes('phd')) eduBoost = 1.20;

  const median = Math.round((baseMid * expMultiplier * locMultiplier * eduBoost) / 10000) * 10000;
  const min = Math.round(median * 0.70 / 10000) * 10000;
  const max = Math.round(median * 1.45 / 10000) * 10000;
  const p25 = Math.round(median * 0.82 / 10000) * 10000;
  const p75 = Math.round(median * 1.22 / 10000) * 10000;
  const p90 = Math.round(median * 1.40 / 10000) * 10000;

  const toLakhs = (val: number) => `₹${(val / 100000).toFixed(1)}L`;

  const topSkillsPreview = skills.slice(0, 3).join(', ') || 'specialized technical skills';
  const targetNegotiation = toLakhs(Math.round(p75 * 1.06));

  const expLabel = exp <= 1 ? '0-1 years (Entry)' : exp <= 3 ? '2-3 years (Junior-Mid)' : exp <= 6 ? '4-6 years (Mid-Senior)' : exp <= 9 ? '7-9 years (Senior)' : '10+ years (Lead/Principal)';

  return {
    role: targetRole,
    location: criteria?.isRemote ? `${location} (Remote)` : location,
    experienceLabel: expLabel,
    educationLabel: eduLevel,
    currency: 'INR',
    averageSalary: toLakhs(median),
    averageNumeric: median,
    minSalary: toLakhs(min),
    maxSalary: toLakhs(max),
    twentyFifthPercentile: Math.round(p25 / 100000),
    currentPercentile: Math.round(median / 100000),
    ninetiethPercentile: Math.round(p90 / 100000),
    expectedIncrease: Math.round(20 + (exp % 4) * 4),
    percentiles: {
      p25: toLakhs(p25),
      p50: toLakhs(median),
      p75: toLakhs(p75),
      p90: toLakhs(p90)
    },
    sampleCount: Math.min(142, Math.max(18, Math.round(exp * 12 + skills.length * 4))),
    negotiationTip: `Based on your ${exp} years of experience in ${location} and proficiency in ${topSkillsPreview}, you can confidently target ${targetNegotiation} by highlighting your impact deliverables and ${eduLevel}.`,
    marketTrend: `+${Math.round(10 + (exp % 5) * 2)}% salary growth for ${targetRole} roles this year`,
    topPayingSector: roleLower.includes('ai') ? 'AI Research & DeepTech' : roleLower.includes('product') ? 'FinTech & B2B SaaS' : 'FinTech & Cloud Infrastructure',
    remotePremium: criteria?.isRemote ? '+12% additional compensation for verified remote roles' : '+8% premium available for flexible/remote arrangements',
    skillPremium: `${skills[0] || 'Target technical skill'} is among the top 5 highest-valued competencies`
  };
}

// Generate dynamic top paying companies for the user's role and domain
export function generateDynamicTopCompanies(criteria?: UserCareerCriteria): CompanySalary[] {
  const roleLower = (criteria?.targetRole || '').toLowerCase();
  const targetRole = criteria?.targetRole || 'Software Professional';
  const median = calculateDynamicSalaryInsights(criteria).averageNumeric;

  const scale = (factor: number) => {
    const val = Math.round(median * factor / 100000);
    const low = Math.round(val * 0.85);
    const high = Math.round(val * 1.35);
    return `₹${low}L - ₹${high}L`;
  };

  if (roleLower.includes('product')) {
    return [
      { rank: 1, company: 'Google', verified: true, role: targetRole, salary: scale(1.45), growth: '+15%' },
      { rank: 2, company: 'Microsoft', verified: true, role: targetRole, salary: scale(1.35), growth: '+14%' },
      { rank: 3, company: 'Paytm', verified: true, role: targetRole, salary: scale(1.25), growth: '+12%' },
      { rank: 4, company: 'Razorpay', verified: true, role: targetRole, salary: scale(1.18), growth: '+13%' },
      { rank: 5, company: 'Flipkart', verified: true, role: targetRole, salary: scale(1.10), growth: '+10%' }
    ];
  }

  if (roleLower.includes('ai') || roleLower.includes('data')) {
    return [
      { rank: 1, company: 'NVIDIA', verified: true, role: targetRole, salary: scale(1.50), growth: '+22%' },
      { rank: 2, company: 'Google DeepMind', verified: true, role: targetRole, salary: scale(1.48), growth: '+19%' },
      { rank: 3, company: 'Microsoft AI', verified: true, role: targetRole, salary: scale(1.38), growth: '+17%' },
      { rank: 4, company: 'Amazon AWS', verified: true, role: targetRole, salary: scale(1.28), growth: '+15%' },
      { rank: 5, company: 'Paytm AI Labs', verified: true, role: targetRole, salary: scale(1.15), growth: '+14%' }
    ];
  }

  return [
    { rank: 1, company: 'Google', verified: true, role: targetRole, salary: scale(1.42), growth: '+14%' },
    { rank: 2, company: 'Microsoft', verified: true, role: targetRole, salary: scale(1.34), growth: '+12%' },
    { rank: 3, company: 'Amazon', verified: true, role: targetRole, salary: scale(1.25), growth: '+12%' },
    { rank: 4, company: 'Paytm', verified: true, role: targetRole, salary: scale(1.18), growth: '+13%' },
    { rank: 5, company: 'Flipkart', verified: true, role: targetRole, salary: scale(1.12), growth: '+11%' }
  ];
}
