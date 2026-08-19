export interface WeightedSkill {
  name: string;
  weight: number; // Percentage weight (summing to 100%)
  category: string;
}

export interface WeightedCareer {
  id: string;
  title: string;
  slug: string;
  industry: string;
  domain: string;
  description: string;
  required_skills: WeightedSkill[];
  matching_job_count: number;
}

export const WEIGHTED_CAREER_GRAPH: WeightedCareer[] = [
  {
    id: 'financial-analyst',
    title: 'Financial Analyst',
    slug: 'financial-analyst',
    industry: 'Finance & Accounting',
    domain: 'Corporate Finance',
    description: 'Perform financial statement analysis, discounted cash flow (DCF) valuation, budgeting, and investment modeling.',
    required_skills: [
      { name: 'Financial Analysis', weight: 25, category: 'Finance' },
      { name: 'Excel', weight: 20, category: 'Analytics' },
      { name: 'Accounting', weight: 20, category: 'Finance' },
      { name: 'Financial Modeling', weight: 20, category: 'Modeling' },
      { name: 'Valuation', weight: 15, category: 'Valuation' }
    ],
    matching_job_count: 142
  },
  {
    id: 'hotel-operations-manager',
    title: 'Hotel Operations Manager',
    slug: 'hotel-operations-manager',
    industry: 'Hospitality & Tourism',
    domain: 'Hotel Management',
    description: 'Lead front office logistics, guest satisfaction frameworks, housekeeping operations, and resort revenue strategy.',
    required_skills: [
      { name: 'Hotel Operations', weight: 30, category: 'Hospitality' },
      { name: 'Guest Experience', weight: 25, category: 'Service' },
      { name: 'Front Office Management', weight: 20, category: 'Operations' },
      { name: 'Revenue Management', weight: 15, category: 'Finance' },
      { name: 'Staff Management', weight: 10, category: 'Leadership' }
    ],
    matching_job_count: 86
  },
  {
    id: 'hr-analytics-specialist',
    title: 'HR Analytics Specialist',
    slug: 'hr-analytics-specialist',
    industry: 'HR & People',
    domain: 'People Analytics',
    description: 'Transform HR data into workforce insights using turnover forecasting, Power BI HR dashboards, and talent metrics.',
    required_skills: [
      { name: 'People Analytics', weight: 30, category: 'Analytics' },
      { name: 'Power BI', weight: 25, category: 'BI Tools' },
      { name: 'HR Metrics', weight: 20, category: 'HR' },
      { name: 'Recruitment & Operations', weight: 15, category: 'HR' },
      { name: 'Employee Relations', weight: 10, category: 'HR' }
    ],
    matching_job_count: 94
  },
  {
    id: 'healthcare-administrator',
    title: 'Healthcare Administrator',
    slug: 'healthcare-administrator',
    industry: 'Healthcare & Life Sciences',
    domain: 'Healthcare Administration',
    description: 'Manage patient flow, hospital clinical quality standards, regulatory compliance, and medical facility logistics.',
    required_skills: [
      { name: 'Healthcare Operations', weight: 30, category: 'Healthcare' },
      { name: 'Patient Flow Management', weight: 25, category: 'Operations' },
      { name: 'Clinical Quality Control', weight: 20, category: 'Quality' },
      { name: 'Health Policy & HIPAA', weight: 15, category: 'Compliance' },
      { name: 'Medical Logistics', weight: 10, category: 'Logistics' }
    ],
    matching_job_count: 118
  },
  {
    id: 'cloud-architect',
    title: 'Cloud Solutions Architect',
    slug: 'cloud-architect',
    industry: 'Technology & IT',
    domain: 'Cloud Computing',
    description: 'Design resilient, scalable multi-cloud architectures across AWS, Azure, and Google Cloud with strict security.',
    required_skills: [
      { name: 'AWS Architecture', weight: 30, category: 'Cloud' },
      { name: 'Cloud Security', weight: 25, category: 'Security' },
      { name: 'Kubernetes & Containers', weight: 20, category: 'DevOps' },
      { name: 'Terraform IaC', weight: 15, category: 'Automation' },
      { name: 'Cost Optimization', weight: 10, category: 'Finance' }
    ],
    matching_job_count: 245
  },
  {
    id: 'supply-chain-manager',
    title: 'Supply Chain & Logistics Manager',
    slug: 'supply-chain-manager',
    industry: 'Supply Chain & Logistics',
    domain: 'Supply Chain',
    description: 'Optimize inventory control, demand forecasting, warehouse logistics, freight transportation, and procurement.',
    required_skills: [
      { name: 'Supply Chain Management', weight: 30, category: 'Supply Chain' },
      { name: 'Demand Forecasting', weight: 25, category: 'Analytics' },
      { name: 'Warehouse Logistics', weight: 20, category: 'Operations' },
      { name: 'Procurement Strategy', weight: 15, category: 'Purchasing' },
      { name: 'Inventory Control', weight: 10, category: 'Inventory' }
    ],
    matching_job_count: 104
  }
];

export const weightedCareerService = {
  getCareerByIntent(intentText: string): WeightedCareer {
    const term = (intentText || '').toLowerCase().trim();
    if (term.includes('hotel') || term.includes('hospitality') || term.includes('resort')) {
      return WEIGHTED_CAREER_GRAPH[1]; // Hotel Operations Manager
    }
    if (term.includes('hr') || term.includes('people') || term.includes('recruitment')) {
      return WEIGHTED_CAREER_GRAPH[2]; // HR Analytics Specialist
    }
    if (term.includes('health') || term.includes('hospital') || term.includes('medical') || term.includes('nurse')) {
      return WEIGHTED_CAREER_GRAPH[3]; // Healthcare Administrator
    }
    if (term.includes('cloud') || term.includes('aws') || term.includes('devops') || term.includes('architect')) {
      return WEIGHTED_CAREER_GRAPH[4]; // Cloud Solutions Architect
    }
    if (term.includes('supply') || term.includes('logistics') || term.includes('procurement')) {
      return WEIGHTED_CAREER_GRAPH[5]; // Supply Chain Manager
    }
    // Default fallback: Financial Analyst
    return WEIGHTED_CAREER_GRAPH[0];
  },

  calculateUserAlignment(career: WeightedCareer, userSkills: string[]): {
    matchPercentage: number;
    userSkillsFound: string[];
    missingSkills: WeightedSkill[];
  } {
    const userSkillsSet = new Set(userSkills.map(s => s.toLowerCase().trim()));

    let acquiredWeight = 0;
    const userSkillsFound: string[] = [];
    const missingSkills: WeightedSkill[] = [];

    career.required_skills.forEach(req => {
      const isFound = Array.from(userSkillsSet).some(us => 
        us.includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(us)
      );

      if (isFound) {
        acquiredWeight += req.weight;
        userSkillsFound.push(req.name);
      } else {
        missingSkills.push(req);
      }
    });

    return {
      matchPercentage: Math.round(acquiredWeight),
      userSkillsFound,
      missingSkills
    };
  }
};
