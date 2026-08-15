/**
 * Universal Skill Intelligence & Domain-Adaptive Dictionary Service
 * Extensible multi-industry skill taxonomy & canonical skill normalizer.
 */

export interface SkillItem {
  id: string;
  name: string;
  canonicalName: string;
  category: 'technical' | 'domain' | 'tools' | 'leadership' | 'soft' | 'language' | 'frameworks' | 'methodologies';
  domain: string; // Technology, Finance, Sales, Operations, Healthcare, Engineering, Facilities, NGO, Legal, etc.
  confidence?: number;
}

// Canonical Synonym Dictionary
const SYNONYM_MAP: Record<string, { canonical: string; category: SkillItem['category']; domain: string }> = {
  // Technology & Cloud
  'react': { canonical: 'React.js', category: 'frameworks', domain: 'Technology' },
  'reactjs': { canonical: 'React.js', category: 'frameworks', domain: 'Technology' },
  'react.js': { canonical: 'React.js', category: 'frameworks', domain: 'Technology' },
  'nodejs': { canonical: 'Node.js', category: 'technical', domain: 'Technology' },
  'node.js': { canonical: 'Node.js', category: 'technical', domain: 'Technology' },
  'expressjs': { canonical: 'Express.js', category: 'frameworks', domain: 'Technology' },
  'express.js': { canonical: 'Express.js', category: 'frameworks', domain: 'Technology' },
  'express': { canonical: 'Express.js', category: 'frameworks', domain: 'Technology' },
  'nestjs': { canonical: 'Nest.js', category: 'frameworks', domain: 'Technology' },
  'nest.js': { canonical: 'Nest.js', category: 'frameworks', domain: 'Technology' },
  'nextjs': { canonical: 'Next.js', category: 'frameworks', domain: 'Technology' },
  'next.js': { canonical: 'Next.js', category: 'frameworks', domain: 'Technology' },
  'vuejs': { canonical: 'Vue.js', category: 'frameworks', domain: 'Technology' },
  'vue.js': { canonical: 'Vue.js', category: 'frameworks', domain: 'Technology' },
  'angularjs': { canonical: 'Angular', category: 'frameworks', domain: 'Technology' },
  'angular': { canonical: 'Angular', category: 'frameworks', domain: 'Technology' },
  'typescript': { canonical: 'TypeScript', category: 'technical', domain: 'Technology' },
  'javascript': { canonical: 'JavaScript', category: 'technical', domain: 'Technology' },
  'js': { canonical: 'JavaScript', category: 'technical', domain: 'Technology' },
  'ts': { canonical: 'TypeScript', category: 'technical', domain: 'Technology' },
  'python': { canonical: 'Python', category: 'technical', domain: 'Technology' },
  'java': { canonical: 'Java', category: 'technical', domain: 'Technology' },
  'c#': { canonical: 'C#', category: 'technical', domain: 'Technology' },
  'c++': { canonical: 'C++', category: 'technical', domain: 'Technology' },
  'golang': { canonical: 'Go', category: 'technical', domain: 'Technology' },
  'go': { canonical: 'Go', category: 'technical', domain: 'Technology' },
  'aws': { canonical: 'AWS', category: 'tools', domain: 'Cloud' },
  'amazon web services': { canonical: 'AWS', category: 'tools', domain: 'Cloud' },
  'azure': { canonical: 'Microsoft Azure', category: 'tools', domain: 'Cloud' },
  'gcp': { canonical: 'Google Cloud Platform (GCP)', category: 'tools', domain: 'Cloud' },
  'google cloud': { canonical: 'Google Cloud Platform (GCP)', category: 'tools', domain: 'Cloud' },
  'docker': { canonical: 'Docker', category: 'tools', domain: 'Cloud' },
  'k8s': { canonical: 'Kubernetes', category: 'tools', domain: 'Cloud' },
  'kubernetes': { canonical: 'Kubernetes', category: 'tools', domain: 'Cloud' },
  'postgres': { canonical: 'PostgreSQL', category: 'technical', domain: 'Data' },
  'postgresql': { canonical: 'PostgreSQL', category: 'technical', domain: 'Data' },
  'mongodb': { canonical: 'MongoDB', category: 'technical', domain: 'Data' },
  'mongo': { canonical: 'MongoDB', category: 'technical', domain: 'Data' },
  'mysql': { canonical: 'MySQL', category: 'technical', domain: 'Data' },
  'redis': { canonical: 'Redis', category: 'technical', domain: 'Data' },
  'sql': { canonical: 'SQL', category: 'technical', domain: 'Data' },
  'nosql': { canonical: 'NoSQL', category: 'technical', domain: 'Data' },
  'graphql': { canonical: 'GraphQL', category: 'technical', domain: 'Technology' },
  'rest api': { canonical: 'REST API', category: 'technical', domain: 'Technology' },
  'restful apis': { canonical: 'REST API', category: 'technical', domain: 'Technology' },

  // Facilities, Electrical & Data Center
  'lvap': { canonical: 'LVAP (Low Voltage Authorized Person)', category: 'domain', domain: 'Facilities' },
  'hvap': { canonical: 'HVAP (High Voltage Authorized Person)', category: 'domain', domain: 'Facilities' },
  'low voltage': { canonical: 'Low Voltage Operations', category: 'domain', domain: 'Facilities' },
  'high voltage': { canonical: 'High Voltage Operations', category: 'domain', domain: 'Facilities' },
  '18th edition': { canonical: '18th Edition Wiring Regulations', category: 'domain', domain: 'Facilities' },
  'wiring regulations': { canonical: '18th Edition Wiring Regulations', category: 'domain', domain: 'Facilities' },
  'bms': { canonical: 'BMS (Building Management System)', category: 'tools', domain: 'Facilities' },
  'cmms': { canonical: 'CMMS (Computerized Maintenance Management)', category: 'tools', domain: 'Facilities' },
  'maximo': { canonical: 'IBM Maximo', category: 'tools', domain: 'Facilities' },
  'cafm': { canonical: 'CAFM (Computer-Aided Facility Management)', category: 'tools', domain: 'Facilities' },
  'm&e': { canonical: 'M&E (Mechanical & Electrical)', category: 'domain', domain: 'Facilities' },
  'data center': { canonical: 'Data Center Critical Infrastructure', category: 'domain', domain: 'Data Center' },
  'data centre': { canonical: 'Data Center Critical Infrastructure', category: 'domain', domain: 'Data Center' },
  'hvac': { canonical: 'HVAC Systems', category: 'domain', domain: 'Facilities' },
  'ups': { canonical: 'UPS & Generator Backup Systems', category: 'domain', domain: 'Facilities' },
  'ppm': { canonical: 'Planned Preventive Maintenance (PPM)', category: 'methodologies', domain: 'Facilities' },

  // Finance, Audit & Compliance
  'p&l': { canonical: 'P&L Management', category: 'domain', domain: 'Finance' },
  'p&l management': { canonical: 'P&L Management', category: 'domain', domain: 'Finance' },
  'sox': { canonical: 'SOX Compliance', category: 'domain', domain: 'Finance' },
  'sox compliance': { canonical: 'SOX Compliance', category: 'domain', domain: 'Finance' },
  'sap': { canonical: 'SAP ERP', category: 'tools', domain: 'Finance' },
  'sap erp': { canonical: 'SAP ERP', category: 'tools', domain: 'Finance' },
  'cpa': { canonical: 'CPA (Certified Public Accountant)', category: 'domain', domain: 'Finance' },
  'statutory audit': { canonical: 'Statutory Audit', category: 'domain', domain: 'Finance' },
  'financial modeling': { canonical: 'Financial Modeling', category: 'technical', domain: 'Finance' },

  // Sales, Operations & Strategy
  'quota attainment': { canonical: 'Quota Attainment', category: 'domain', domain: 'Sales' },
  'enterprise sales': { canonical: 'Enterprise SaaS Sales', category: 'domain', domain: 'Sales' },
  'b2b sales': { canonical: 'B2B Sales', category: 'domain', domain: 'Sales' },
  'salesforce': { canonical: 'Salesforce CRM', category: 'tools', domain: 'Sales' },
  'm&a': { canonical: 'Mergers & Acquisitions (M&A)', category: 'domain', domain: 'Operations' },
  'growth strategy': { canonical: 'Growth Strategy', category: 'leadership', domain: 'Operations' },
  'revenue operations': { canonical: 'Revenue Operations (RevOps)', category: 'domain', domain: 'Operations' },
  'sla management': { canonical: 'SLA & KPI Management', category: 'methodologies', domain: 'Operations' },
  'kpi management': { canonical: 'SLA & KPI Management', category: 'methodologies', domain: 'Operations' },

  // Civil Engineering & Construction
  'autocad': { canonical: 'AutoCAD', category: 'tools', domain: 'Engineering' },
  'primavera p6': { canonical: 'Primavera P6', category: 'tools', domain: 'Engineering' },
  'revit': { canonical: 'Autodesk Revit', category: 'tools', domain: 'Engineering' },
  'qa/qc': { canonical: 'QA/QC Inspection', category: 'methodologies', domain: 'Engineering' },
  'hse': { canonical: 'HSE (Health, Safety & Environment)', category: 'methodologies', domain: 'Engineering' },
  'site supervision': { canonical: 'Site Supervision', category: 'leadership', domain: 'Engineering' },

  // NGO, Development & Government
  'humanitarian response': { canonical: 'Humanitarian Emergency Response', category: 'domain', domain: 'NGO / Development' },
  'food security': { canonical: 'Food Security & Livelihoods', category: 'domain', domain: 'NGO / Development' },
  'cluster coordination': { canonical: 'Cluster Coordination', category: 'leadership', domain: 'NGO / Development' },
  'meal': { canonical: 'MEAL (Monitoring, Evaluation, Accountability & Learning)', category: 'methodologies', domain: 'NGO / Development' },
  'ipc': { canonical: 'IPC & Market-Based Approaches', category: 'methodologies', domain: 'NGO / Development' },

  // General Leadership & Management
  'agile': { canonical: 'Agile Methodology', category: 'methodologies', domain: 'Project Management' },
  'scrum': { canonical: 'Scrum Framework', category: 'methodologies', domain: 'Project Management' },
  'pmp': { canonical: 'PMP Project Management', category: 'methodologies', domain: 'Project Management' },
  'cross-functional leadership': { canonical: 'Cross-Functional Leadership', category: 'leadership', domain: 'Operations' },
  'stakeholder management': { canonical: 'Stakeholder Management', category: 'leadership', domain: 'Operations' }
};

/**
 * Universal Skill Normalizer
 * Converts raw skill string to canonical skill entity with domain context.
 */
export function normalizeSkill(rawName: string): SkillItem {
  const clean = rawName.replace(/^[•\-*v]\s*/, '').trim();
  const lowerKey = clean.toLowerCase();

  const mapped = SYNONYM_MAP[lowerKey];
  if (mapped) {
    return {
      id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: clean,
      canonicalName: mapped.canonical,
      category: mapped.category,
      domain: mapped.domain,
      confidence: 0.98
    };
  }

  // Fallback heuristics for unmapped skills
  let category: SkillItem['category'] = 'technical';
  if (/leadership|management|supervision|strategy|executive|director|lead/i.test(clean)) {
    category = 'leadership';
  } else if (/communication|teamwork|collaboration|problem-solving|adaptability/i.test(clean)) {
    category = 'soft';
  } else if (/agile|scrum|kanban|waterfall|ppm|meal|qa\/qc|sox|iso/i.test(clean)) {
    category = 'methodologies';
  }

  // Preserve Acronyms in ALL-CAPS if length <= 5
  let canonicalName = clean;
  if (clean.length <= 5 && clean === clean.toUpperCase()) {
    canonicalName = clean;
  } else if (clean === clean.toLowerCase()) {
    canonicalName = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return {
    id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: clean,
    canonicalName,
    category,
    domain: 'General',
    confidence: 0.85
  };
}

/**
 * Batch Skill Normalizer & Deduplicator
 */
export function normalizeSkillList(skills: string[]): SkillItem[] {
  const map = new Map<string, SkillItem>();

  skills.forEach(raw => {
    if (!raw || typeof raw !== 'string' || raw.trim().length < 2) return;
    const normalized = normalizeSkill(raw);
    const key = normalized.canonicalName.toLowerCase();
    if (!map.has(key)) {
      map.set(key, normalized);
    }
  });

  return Array.from(map.values());
}
