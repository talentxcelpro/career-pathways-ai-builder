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
    industry: 'HR & People Analytics',
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
  },
  {
    id: 'digital-marketing-manager',
    title: 'Digital Marketing Manager',
    slug: 'digital-marketing-manager',
    industry: 'Marketing & Digital Growth',
    domain: 'Digital Marketing',
    description: 'Drive multi-channel acquisition campaigns using Google Ads, SEO, social media analytics, and conversion optimization.',
    required_skills: [
      { name: 'Digital Marketing', weight: 30, category: 'Marketing' },
      { name: 'SEO & Content Strategy', weight: 25, category: 'SEO' },
      { name: 'Google Ads & PPC', weight: 20, category: 'Ads' },
      { name: 'Social Media Analytics', weight: 15, category: 'Analytics' },
      { name: 'Conversion Optimization', weight: 10, category: 'Growth' }
    ],
    matching_job_count: 168
  },
  {
    id: 'devops-engineer',
    title: 'DevOps & Infrastructure Engineer',
    slug: 'devops-engineer',
    industry: 'Technology & IT',
    domain: 'DevOps',
    description: 'Build automated CI/CD pipelines, container orchestration, infrastructure as code, and site reliability monitoring.',
    required_skills: [
      { name: 'DevOps', weight: 30, category: 'DevOps' },
      { name: 'Docker & Kubernetes', weight: 25, category: 'Containers' },
      { name: 'CI/CD Pipelines', weight: 20, category: 'Automation' },
      { name: 'Linux System Admin', weight: 15, category: 'OS' },
      { name: 'Monitoring & Alerting', weight: 10, category: 'Reliability' }
    ],
    matching_job_count: 192
  },
  {
    id: 'ux-designer',
    title: 'UI/UX Product Designer',
    slug: 'ux-designer',
    industry: 'Design & Creative Technology',
    domain: 'UI/UX Design',
    description: 'Create user journeys, interactive wireframes, design systems, and responsive component libraries in Figma.',
    required_skills: [
      { name: 'UI/UX Design', weight: 30, category: 'Design' },
      { name: 'Figma & Wireframing', weight: 25, category: 'Tools' },
      { name: 'Design Systems', weight: 20, category: 'Systems' },
      { name: 'User Research', weight: 15, category: 'Research' },
      { name: 'Prototyping & Handoff', weight: 10, category: 'Execution' }
    ],
    matching_job_count: 135
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist & ML Engineer',
    slug: 'data-scientist',
    industry: 'Technology & IT',
    domain: 'Data Science',
    description: 'Build predictive machine learning models, statistical neural networks, feature pipelines, and PyTorch deep learning models.',
    required_skills: [
      { name: 'Data Science', weight: 30, category: 'Analytics' },
      { name: 'Python & Pandas', weight: 25, category: 'Programming' },
      { name: 'Machine Learning', weight: 20, category: 'AI' },
      { name: 'PyTorch / TensorFlow', weight: 15, category: 'Deep Learning' },
      { name: 'SQL Data Pipelines', weight: 10, category: 'Database' }
    ],
    matching_job_count: 215
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    slug: 'cybersecurity-analyst',
    industry: 'Technology & IT',
    domain: 'Cybersecurity',
    description: 'Monitor enterprise security incident logs, perform vulnerability management, penetration testing, and SOC response.',
    required_skills: [
      { name: 'Cybersecurity', weight: 30, category: 'Security' },
      { name: 'Network Security', weight: 25, category: 'Networking' },
      { name: 'SIEM Log Analysis', weight: 20, category: 'SOC' },
      { name: 'Vulnerability Management', weight: 15, category: 'Audit' },
      { name: 'Incident Response', weight: 10, category: 'Response' }
    ],
    matching_job_count: 178
  },
  {
    id: 'project-manager',
    title: 'Project Manager (PMP)',
    slug: 'project-manager',
    industry: 'Business & Management',
    domain: 'Project Management',
    description: 'Direct cross-functional project lifecycles, Agile sprint planning, budget tracking, risk mitigation, and stakeholder management.',
    required_skills: [
      { name: 'Project Management', weight: 30, category: 'Management' },
      { name: 'Agile & Scrum', weight: 25, category: 'Agile' },
      { name: 'Risk Management', weight: 20, category: 'Governance' },
      { name: 'Budgeting & Cost Control', weight: 15, category: 'Finance' },
      { name: 'Stakeholder Communication', weight: 10, category: 'Communication' }
    ],
    matching_job_count: 210
  },
  {
    id: 'full-stack-developer',
    title: 'Full Stack Software Engineer',
    slug: 'full-stack-developer',
    industry: 'Technology & IT',
    domain: 'Software Engineering',
    description: 'Develop full-stack web applications using React, Node.js, TypeScript, PostgreSQL, and GraphQL APIs.',
    required_skills: [
      { name: 'Software Engineering', weight: 30, category: 'Development' },
      { name: 'React & TypeScript', weight: 25, category: 'Frontend' },
      { name: 'Node.js & Express', weight: 20, category: 'Backend' },
      { name: 'PostgreSQL & SQL', weight: 15, category: 'Database' },
      { name: 'Git & CI/CD', weight: 10, category: 'DevOps' }
    ],
    matching_job_count: 310
  },
  {
    id: 'construction-manager',
    title: 'Construction Manager',
    slug: 'construction-manager',
    industry: 'Construction & Real Estate',
    domain: 'Construction Management',
    description: 'Supervise commercial site construction operations, safety compliance, building code enforcement, and sub-contractor scheduling.',
    required_skills: [
      { name: 'Construction Management', weight: 30, category: 'Construction' },
      { name: 'Site Safety & OSHA', weight: 25, category: 'Safety' },
      { name: 'Building Codes & Permits', weight: 20, category: 'Compliance' },
      { name: 'Contractor Scheduling', weight: 15, category: 'Operations' },
      { name: 'Cost Estimation', weight: 10, category: 'Finance' }
    ],
    matching_job_count: 72
  },
  {
    id: 'business-operations-lead',
    title: 'Business Operations Lead',
    slug: 'business-operations-lead',
    industry: 'Business & Management',
    domain: 'Operations',
    description: 'Streamline operational workflows, KPI performance tracking, cross-departmental strategy, and organizational efficiency.',
    required_skills: [
      { name: 'Operations Strategy', weight: 30, category: 'Operations' },
      { name: 'Process Optimization', weight: 25, category: 'Process' },
      { name: 'KPI Analytics', weight: 20, category: 'Analytics' },
      { name: 'Resource Allocation', weight: 15, category: 'Management' },
      { name: 'Change Management', weight: 10, category: 'Leadership' }
    ],
    matching_job_count: 145
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
    if (term.includes('cloud') || term.includes('aws') || term.includes('architect')) {
      return WEIGHTED_CAREER_GRAPH[4]; // Cloud Solutions Architect
    }
    if (term.includes('supply') || term.includes('logistics') || term.includes('procurement')) {
      return WEIGHTED_CAREER_GRAPH[5]; // Supply Chain Manager
    }
    if (term.includes('marketing') || term.includes('seo') || term.includes('digital')) {
      return WEIGHTED_CAREER_GRAPH[6]; // Digital Marketing Manager
    }
    if (term.includes('devops') || term.includes('docker') || term.includes('kubernetes')) {
      return WEIGHTED_CAREER_GRAPH[7]; // DevOps Engineer
    }
    if (term.includes('ux') || term.includes('ui') || term.includes('design') || term.includes('figma')) {
      return WEIGHTED_CAREER_GRAPH[8]; // UX Designer
    }
    if (term.includes('data science') || term.includes('machine learning') || term.includes('python')) {
      return WEIGHTED_CAREER_GRAPH[9]; // Data Scientist
    }
    if (term.includes('cyber') || term.includes('security') || term.includes('infosec')) {
      return WEIGHTED_CAREER_GRAPH[10]; // Cybersecurity Analyst
    }
    if (term.includes('project manager') || term.includes('pmp') || term.includes('agile')) {
      return WEIGHTED_CAREER_GRAPH[11]; // Project Manager
    }
    if (term.includes('full stack') || term.includes('developer') || term.includes('software engineer')) {
      return WEIGHTED_CAREER_GRAPH[12]; // Full Stack Developer
    }
    if (term.includes('construction') || term.includes('building') || term.includes('site')) {
      return WEIGHTED_CAREER_GRAPH[13]; // Construction Manager
    }
    if (term.includes('operations') || term.includes('business lead')) {
      return WEIGHTED_CAREER_GRAPH[14]; // Business Operations Lead
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
