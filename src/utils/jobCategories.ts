export const JOB_CATEGORIES = {
  TECHNOLOGY: {
    name: 'Technology',
    roles: [
      'Software Engineer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'Mobile App Developer',
      'DevOps Engineer',
      'Data Scientist',
      'Machine Learning Engineer',
      'AI Engineer',
      'Cybersecurity Specialist',
      'Cloud Architect',
      'Product Manager',
      'Technical Lead',
      'Engineering Manager',
      'QA Engineer',
      'UI/UX Designer',
      'Data Analyst',
      'Database Administrator',
      'Systems Administrator',
      'Network Engineer',
      'Site Reliability Engineer',
      'Platform Engineer',
      'Solutions Architect',
      'Embedded Systems Engineer',
      'Blockchain Developer',
      'Game Developer',
    ],
    skills: [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker',
      'Kubernetes', 'SQL', 'MongoDB', 'Git', 'HTML/CSS', 'TypeScript',
      'Angular', 'Vue.js', 'Spring Boot', 'Django', 'Flask', 'PostgreSQL',
      'Azure', 'GCP', 'Terraform', 'Linux', 'Microservices', 'GraphQL',
      'Redis', 'Kafka', 'Elasticsearch', 'CI/CD', 'Agile', 'Scrum',
    ]
  },
  HEALTHCARE: {
    name: 'Healthcare',
    roles: [
      'Doctor',
      'Nurse',
      'Medical Assistant',
      'Healthcare Administrator',
      'Pharmacist',
      'Physical Therapist',
      'Medical Technologist',
      'Healthcare Data Analyst',
      'Medical Device Engineer',
      'Clinical Research Coordinator',
      'Healthcare IT Specialist',
      'Medical Writer',
      'Biomedical Engineer',
      'Healthcare Consultant',
      'Medical Sales Representative'
    ],
    skills: [
      'Medical Knowledge', 'Patient Care', 'Healthcare Regulations', 'HIPAA Compliance',
      'Medical Devices', 'Electronic Health Records', 'Clinical Documentation',
      'Healthcare Analytics', 'Medical Coding', 'Patient Safety'
    ]
  },
  FINANCE: {
    name: 'Finance',
    roles: [
      'Financial Analyst',
      'Investment Banker',
      'Accountant',
      'Financial Advisor',
      'Risk Manager',
      'Credit Analyst',
      'Portfolio Manager',
      'Insurance Underwriter',
      'Tax Specialist',
      'Compliance Officer',
      'Financial Planner',
      'Audit Manager',
      'Treasury Analyst',
      'Corporate Finance Manager',
      'Quantitative Analyst'
    ],
    skills: [
      'Financial Modeling', 'Excel', 'Bloomberg Terminal', 'Risk Assessment',
      'Regulatory Compliance', 'Financial Reporting', 'Valuation', 'GAAP',
      'Investment Analysis', 'Portfolio Management', 'Credit Analysis'
    ]
  },
  MARKETING: {
    name: 'Marketing',
    roles: [
      'Digital Marketing Manager',
      'Content Creator',
      'Social Media Manager',
      'SEO Specialist',
      'Brand Manager',
      'Marketing Analyst',
      'Growth Hacker',
      'Email Marketing Specialist',
      'PPC Specialist',
      'Marketing Coordinator',
      'Product Marketing Manager',
      'Content Strategist',
      'Influencer Marketing Manager',
      'Event Marketing Manager',
      'Marketing Operations Manager'
    ],
    skills: [
      'Google Analytics', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
      'Email Marketing', 'Adobe Creative Suite', 'Copywriting', 'Brand Management',
      'Marketing Automation', 'A/B Testing', 'CRM Software'
    ]
  },
  SALES: {
    name: 'Sales',
    roles: [
      'Sales Representative',
      'Account Manager',
      'Business Development Manager',
      'Sales Manager',
      'Inside Sales Representative',
      'Field Sales Representative',
      'Sales Engineer',
      'Customer Success Manager',
      'Sales Operations Manager',
      'Territory Manager',
      'Key Account Manager',
      'Channel Partner Manager',
      'Sales Development Representative',
      'Regional Sales Manager',
      'Enterprise Sales Manager'
    ],
    skills: [
      'CRM Software', 'Lead Generation', 'Negotiation', 'Client Relationship Management',
      'Sales Forecasting', 'Pipeline Management', 'Presentation Skills',
      'Product Knowledge', 'Territory Management', 'Customer Acquisition'
    ]
  },
  EDUCATION: {
    name: 'Education',
    roles: [
      'Teacher',
      'Professor',
      'Educational Administrator',
      'Curriculum Developer',
      'Instructional Designer',
      'Education Consultant',
      'School Principal',
      'Academic Advisor',
      'Education Technology Specialist',
      'Training Manager',
      'Corporate Trainer',
      'Online Course Creator',
      'Learning Experience Designer',
      'Educational Researcher',
      'Student Affairs Coordinator'
    ],
    skills: [
      'Curriculum Development', 'Educational Technology', 'Classroom Management',
      'Assessment and Evaluation', 'Learning Management Systems', 'Instructional Design',
      'Student Engagement', 'Educational Research', 'Training Development'
    ]
  },
  MANUFACTURING: {
    name: 'Manufacturing',
    roles: [
      'Production Manager',
      'Quality Assurance Engineer',
      'Manufacturing Engineer',
      'Process Improvement Specialist',
      'Operations Manager',
      'Supply Chain Manager',
      'Maintenance Technician',
      'Production Supervisor',
      'Industrial Engineer',
      'Plant Manager',
      'Logistics Coordinator',
      'Inventory Manager',
      'Safety Manager',
      'Procurement Specialist',
      'Lean Manufacturing Specialist'
    ],
    skills: [
      'Lean Manufacturing', 'Six Sigma', 'Quality Control', 'Process Optimization',
      'Supply Chain Management', 'ERP Systems', 'Safety Protocols', 'ISO Standards',
      'Production Planning', 'Equipment Maintenance', 'Inventory Management'
    ]
  },
  CONSULTING: {
    name: 'Consulting',
    roles: [
      'Management Consultant',
      'Strategy Consultant',
      'IT Consultant',
      'Business Analyst',
      'Process Consultant',
      'Technology Consultant',
      'Financial Consultant',
      'HR Consultant',
      'Operations Consultant',
      'Digital Transformation Consultant',
      'Change Management Consultant',
      'Risk Consultant',
      'Sustainability Consultant',
      'Healthcare Consultant',
      'Education Consultant'
    ],
    skills: [
      'Strategic Planning', 'Business Analysis', 'Project Management', 'Client Management',
      'Problem Solving', 'Data Analysis', 'Presentation Skills', 'Process Improvement',
      'Change Management', 'Research Skills', 'Industry Knowledge'
    ]
  },
  RETAIL: {
    name: 'Retail',
    roles: [
      'Store Manager',
      'Sales Associate',
      'Visual Merchandiser',
      'Buyer',
      'Inventory Manager',
      'Customer Service Representative',
      'E-commerce Manager',
      'Retail Analyst',
      'Category Manager',
      'District Manager',
      'Loss Prevention Specialist',
      'Cashier',
      'Stock Associate',
      'Customer Experience Manager',
      'Retail Operations Manager'
    ],
    skills: [
      'Customer Service', 'Point of Sale Systems', 'Inventory Management', 'Visual Merchandising',
      'Retail Analytics', 'E-commerce Platforms', 'Supply Chain', 'Product Knowledge',
      'Sales Techniques', 'Loss Prevention', 'Team Leadership'
    ]
  },
  MEDIA: {
    name: 'Media & Entertainment',
    roles: [
      'Content Creator',
      'Video Editor',
      'Graphic Designer',
      'Social Media Specialist',
      'Journalist',
      'Producer',
      'Director',
      'Cinematographer',
      'Audio Engineer',
      'Marketing Manager',
      'Public Relations Specialist',
      'Creative Director',
      'Copywriter',
      'Art Director',
      'Media Buyer'
    ],
    skills: [
      'Adobe Creative Suite', 'Video Production', 'Social Media Management', 'Content Writing',
      'Photography', 'Audio Production', 'Storytelling', 'Brand Management',
      'Digital Marketing', 'Media Planning', 'Creative Strategy', 'Figma',
    ]
  },
  HR: {
    name: 'Human Resources',
    roles: [
      'HR Manager',
      'HR Business Partner',
      'Talent Acquisition Manager',
      'Recruiter',
      'HR Generalist',
      'Compensation & Benefits Manager',
      'Learning & Development Manager',
      'HR Operations Manager',
      'Payroll Specialist',
      'HR Analyst',
      'Employee Relations Manager',
      'Diversity & Inclusion Manager',
      'Organizational Development Consultant',
      'HRIS Specialist',
      'HR Director',
      'CHRO',
    ],
    skills: [
      'Talent Acquisition', 'Recruitment', 'HRMS', 'Payroll', 'Labor Law',
      'Employee Relations', 'Performance Management', 'Onboarding', 'HRIS',
      'Compensation & Benefits', 'Learning & Development', 'HR Analytics',
      'Employer Branding', 'Workforce Planning', 'Change Management',
      'Succession Planning', 'SAP HR', 'Workday', 'ATS',
    ]
  },
  LEGAL: {
    name: 'Legal & Compliance',
    roles: [
      'Legal Counsel',
      'Corporate Lawyer',
      'Compliance Officer',
      'Contract Manager',
      'Legal Analyst',
      'Paralegal',
      'Intellectual Property Lawyer',
      'Employment Lawyer',
      'Legal Associate',
      'Company Secretary',
      'Regulatory Affairs Manager',
      'Risk & Compliance Manager',
    ],
    skills: [
      'Contract Drafting', 'Legal Research', 'Corporate Law', 'Compliance Management',
      'Regulatory Affairs', 'Intellectual Property', 'Litigation', 'Legal Documentation',
      'Due Diligence', 'Labor Law', 'GDPR', 'Risk Management',
    ]
  },
  LOGISTICS: {
    name: 'Logistics & Supply Chain',
    roles: [
      'Supply Chain Manager',
      'Logistics Manager',
      'Warehouse Manager',
      'Procurement Manager',
      'Inventory Manager',
      'Fleet Manager',
      'Supply Chain Analyst',
      'Customs & Trade Compliance Manager',
      'Freight Coordinator',
      'Distribution Manager',
      'Import Export Manager',
      'Demand Planning Manager',
      'Last Mile Delivery Manager',
    ],
    skills: [
      'Supply Chain Management', 'Logistics Operations', 'Procurement', 'Inventory Management',
      'SAP SCM', 'ERP Systems', 'Warehouse Management Systems', 'Lean Logistics',
      'Freight Management', 'Trade Compliance', 'Demand Planning', 'Vendor Management',
      'Cold Chain Management', 'Reverse Logistics',
    ]
  },
  AUTOMOTIVE: {
    name: 'Automotive & Engineering',
    roles: [
      'Automotive Engineer',
      'Mechanical Design Engineer',
      'Quality Engineer',
      'Production Engineer',
      'R&D Engineer',
      'Embedded Systems Engineer',
      'Vehicle Dynamics Engineer',
      'Powertrain Engineer',
      'Manufacturing Engineer',
      'Tooling Engineer',
      'Safety Engineer',
      'Electric Vehicle Engineer',
      'Supply Chain Engineer',
    ],
    skills: [
      'AutoCAD', 'SolidWorks', 'CATIA', 'Vehicle Dynamics', 'Embedded Systems',
      'ADAS', 'Electric Vehicles', 'Manufacturing Processes', 'FMEA',
      'Six Sigma', 'Quality Control', 'AUTOSAR', 'CAN Bus', 'MATLAB',
    ]
  },
  TELECOM: {
    name: 'Telecommunications',
    roles: [
      'Network Engineer',
      'RF Engineer',
      'Telecom Solutions Architect',
      'NOC Engineer',
      '5G Network Engineer',
      'Telecom Project Manager',
      'OSS/BSS Engineer',
      'Fiber Optic Engineer',
      'Telecom Sales Manager',
      'VoIP Engineer',
      'Satellite Communication Engineer',
    ],
    skills: [
      '5G', 'LTE', 'RF Engineering', 'Network Planning', 'OSS/BSS',
      'Fiber Optics', 'IP Networking', 'VoIP', 'MPLS', 'SDN/NFV',
      'Telecom Billing', 'Network Optimization', 'Cisco', 'Ericsson', 'Nokia',
    ]
  },
  REAL_ESTATE: {
    name: 'Real Estate & Construction',
    roles: [
      'Real Estate Agent',
      'Property Manager',
      'Real Estate Developer',
      'Site Engineer',
      'Project Manager',
      'Quantity Surveyor',
      'Architect',
      'Civil Engineer',
      'Structural Engineer',
      'Interior Designer',
      'Facility Manager',
      'Real Estate Analyst',
      'Valuation Manager',
      'Safety Officer',
    ],
    skills: [
      'AutoCAD', 'Revit', 'Project Management', 'Quantity Surveying', 'Structural Analysis',
      'Construction Management', 'Building Regulations', 'RERA Compliance', 'Property Valuation',
      'Real Estate Law', 'Facility Management', 'MS Project', 'BIM', 'QGIS',
    ]
  },
  ENERGY: {
    name: 'Energy & Utilities',
    roles: [
      'Electrical Engineer',
      'Solar Project Engineer',
      'Wind Energy Engineer',
      'Power Plant Manager',
      'Energy Analyst',
      'EHS Manager',
      'Renewable Energy Consultant',
      'Grid Engineer',
      'Oil & Gas Engineer',
      'Energy Auditor',
      'Process Engineer',
      'Control Systems Engineer',
    ],
    skills: [
      'Electrical Engineering', 'Solar Energy', 'Wind Energy', 'Power Systems',
      'SCADA', 'PLC Programming', 'Energy Management', 'EHS', 'Grid Management',
      'AutoCAD Electrical', 'Power Plant Operations', 'Renewables Policy', 'Energy Auditing',
    ]
  },
  ECOMMERCE: {
    name: 'E-commerce & D2C',
    roles: [
      'E-commerce Manager',
      'Category Manager',
      'Marketplace Manager',
      'D2C Brand Manager',
      'Growth Hacker',
      'Performance Marketing Manager',
      'Catalog Manager',
      'Customer Experience Manager',
      'E-commerce Operations Manager',
      'Pricing Analyst',
      'Returns & Logistics Manager',
      'E-commerce Analyst',
    ],
    skills: [
      'Shopify', 'Amazon Seller Central', 'Flipkart Seller Panel', 'Digital Marketing',
      'Performance Marketing', 'SEO/SEM', 'Google Analytics', 'Facebook Ads',
      'Product Catalog Management', 'Pricing Strategy', 'Customer Retention',
      'Conversion Rate Optimization', 'Email Marketing', 'Customer Segmentation',
    ]
  },
};

export const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' }
];

export const EXPERIENCE_LEVELS = [
  { value: 'intern', label: 'Intern (0-1 years)' },
  { value: 'fresher', label: 'Fresher (0-2 years)' },
  { value: 'junior', label: 'Junior (1-3 years)' },
  { value: 'mid-level', label: 'Mid-level (3-7 years)' },
  { value: 'senior-level', label: 'Senior (5-10 years)' },
  { value: 'lead', label: 'Lead (7-12 years)' },
  { value: 'manager', label: 'Manager (8-15 years)' },
  { value: 'senior-manager', label: 'Senior Manager (10+ years)' },
  { value: 'director', label: 'Director (12+ years)' },
  { value: 'vp', label: 'VP (15+ years)' },
  { value: 'executive', label: 'Executive (15+ years)' }
];

export const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
  { value: 'flexible', label: 'Flexible' }
];

export const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-50)' },
  { value: 'small', label: 'Small (51-200)' },
  { value: 'medium', label: 'Medium (201-1000)' },
  { value: 'large', label: 'Large (1001-5000)' },
  { value: 'enterprise', label: 'Enterprise (5000+)' }
];

export function getSkillsForCategory(category: string): string[] {
  const categoryData = Object.values(JOB_CATEGORIES).find(
    cat => cat.name.toLowerCase() === category.toLowerCase()
  );
  return categoryData?.skills || [];
}

export function getRolesForCategory(category: string): string[] {
  const categoryData = Object.values(JOB_CATEGORIES).find(
    cat => cat.name.toLowerCase() === category.toLowerCase()
  );
  return categoryData?.roles || [];
}

export function getCategoryForRole(role: string): string | null {
  for (const [key, category] of Object.entries(JOB_CATEGORIES)) {
    if (category.roles.some(r => r.toLowerCase().includes(role.toLowerCase()))) {
      return category.name;
    }
  }
  return null;
}

export function validateJobData(jobData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required field validation
  if (!jobData.title?.trim()) {
    errors.push('Job title is required');
  }

  if (!jobData.company_name?.trim()) {
    errors.push('Company name is required');
  }

  if (!jobData.location?.trim()) {
    errors.push('Location is required');
  }

  if (!jobData.employment_type) {
    errors.push('Employment type is required');
  }

  if (!jobData.experience_level) {
    errors.push('Experience level is required');
  }

  // Description validation
  if (!jobData.description?.trim() && !jobData.job_summary?.trim()) {
    errors.push('Job description or summary is required');
  }

  // Skills validation
  if (!jobData.skills_required || jobData.skills_required.length === 0) {
    errors.push('At least one skill is required');
  }

  // Salary validation
  if (jobData.salary_min && jobData.salary_max && jobData.salary_min > jobData.salary_max) {
    errors.push('Minimum salary cannot be greater than maximum salary');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}