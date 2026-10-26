/**
 * api/_lib/million-url-engine.ts
 *
 * $O(1)$ Mathematical 2,050,000-URL Programmatic SEO Inventory Engine for TalentXcel
 * (Self-contained in api/ for Vercel Serverless Function isolated deployment)
 */

export const TOTAL_INVENTORY_COUNT = 2_050_000;
export const DEFAULT_PAGE_SIZE = 50_000;
export const TOTAL_PAGES = Math.ceil(TOTAL_INVENTORY_COUNT / DEFAULT_PAGE_SIZE); // 41
export const DEFAULT_HOST = 'talentxcel.in';

export const CORE_ROLES: string[] = [
  'software-engineer', 'full-stack-developer', 'frontend-developer', 'backend-developer',
  'react-developer', 'node-js-developer', 'python-developer', 'java-developer',
  'golang-developer', 'ios-developer', 'android-developer', 'flutter-developer',
  'react-native-developer', 'devops-engineer', 'cloud-architect', 'aws-solutions-architect',
  'azure-cloud-engineer', 'gcp-cloud-architect', 'site-reliability-engineer',
  'database-administrator', 'sql-developer', 'postgresql-dba', 'security-engineer',
  'cybersecurity-analyst', 'qa-automation-engineer', 'sdet-engineer', 'blockchain-developer',
  'smart-contract-developer', 'ai-engineer', 'machine-learning-engineer', 'data-scientist',
  'data-engineer', 'data-analyst', 'prompt-engineer', 'llm-engineer', 'nlp-engineer',
  'computer-vision-engineer', 'big-data-engineer', 'bi-developer', 'etl-developer',
  'product-manager', 'technical-product-manager', 'growth-product-manager', 'associate-product-manager',
  'ui-ux-designer', 'product-designer', 'visual-designer', 'interaction-designer',
  'scrum-master', 'agile-coach', 'solutions-architect', 'enterprise-architect',
  'engineering-manager', 'director-of-engineering', 'vp-of-engineering', 'chief-technology-officer',
  'marketing-manager', 'growth-marketer', 'digital-marketing-specialist', 'seo-specialist',
  'content-writer', 'copywriter', 'social-media-manager', 'performance-marketer',
  'financial-analyst', 'investment-banking-analyst', 'quantitative-analyst', 'risk-analyst',
  'talent-acquisition-specialist', 'technical-recruiter', 'hr-manager', 'hr-business-partner',
  'operations-manager', 'project-manager', 'program-manager', 'business-analyst',
  'systems-analyst', 'crm-developer', 'salesforce-developer', 'sap-consultant',
  'servicenow-developer', 'embedded-systems-engineer', 'firmware-engineer', 'iot-engineer',
  'network-engineer', 'systems-administrator', 'linux-administrator', 'kubernetes-specialist'
];

function getRole(index: number): string {
  const base = CORE_ROLES[index % CORE_ROLES.length];
  const variant = Math.floor(index / CORE_ROLES.length);
  if (variant === 0) return base;
  const prefixes = ['lead', 'principal', 'staff', 'senior-staff', 'executive', 'global-head-of'];
  return `${prefixes[(variant - 1) % prefixes.length]}-${base}`;
}

export const CORE_CITIES: string[] = [
  'bangalore', 'hyderabad', 'pune', 'mumbai', 'delhi-ncr', 'noida', 'gurgaon',
  'chennai', 'kolkata', 'ahmedabad', 'chandigarh', 'jaipur', 'kochi', 'coimbatore',
  'indore', 'bhubaneswar', 'patna', 'lucknow', 'nagpur', 'surat', 'vadodara',
  'visakhapatnam', 'thiruvananthapuram', 'mysore', 'mangalore', 'kozhikode',
  'vijayawada', 'guntur', 'warangal', 'tirupati', 'nashik', 'aurangabad',
  'solapur', 'kolhapur', 'amravati', 'rajkot', 'bhavnagar', 'jamnagar',
  'gandhinagar', 'bhopal', 'gwalior', 'jabalpur', 'ujjain', 'raipur',
  'bilaspur', 'ranchi', 'jamshedpur', 'dhanbad', 'dehradun', 'haridwar',
  'shimla', 'ludhiana', 'amritsar', 'jalandhar', 'patiala', 'panipat',
  'karnal', 'rohtak', 'agra', 'varanasi', 'kanpur', 'prayagraj', 'meerut',
  'bareilly', 'aligarh', 'moradabad', 'gorakhpur', 'guwahati', 'shillong',
  'imphal', 'agartala', 'aizawl', 'gangtok', 'jammu', 'srinagar',
  'dubai', 'abu-dhabi', 'riyadh', 'doha', 'london', 'manchester', 'birmingham',
  'berlin', 'munich', 'frankfurt', 'amsterdam', 'dublin', 'paris', 'zurich',
  'singapore', 'kuala-lumpur', 'tokyo', 'seoul', 'sydney', 'melbourne',
  'toronto', 'vancouver', 'san-francisco', 'seattle', 'new-york', 'austin', 'boston'
];

function getCity(index: number): string {
  const base = CORE_CITIES[index % CORE_CITIES.length];
  const variant = Math.floor(index / CORE_CITIES.length);
  if (variant === 0) return base;
  return `${base}-metro-${variant}`;
}

export const EXPERIENCE_LEVELS = ['fresher', 'junior', 'senior', 'lead'] as const;

export const CORE_SKILLS = [
  'python', 'javascript', 'typescript', 'react', 'node-js', 'java', 'golang',
  'c-plus-plus', 'rust', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'terraform', 'linux', 'postgresql', 'mongodb', 'mysql', 'redis', 'kafka',
  'graphql', 'rest-api', 'machine-learning', 'deep-learning', 'data-science',
  'artificial-intelligence', 'generative-ai', 'llm-engineering', 'prompt-engineering',
  'cybersecurity', 'ethical-hacking', 'devops', 'ci-cd', 'microservices',
  'blockchain', 'smart-contracts', 'solidity', 'product-management', 'ui-ux-design',
  'figma', 'agile', 'scrum', 'data-analytics', 'power-bi', 'tableau', 'excel'
];

function getSkill(index: number): string {
  const base = CORE_SKILLS[index % CORE_SKILLS.length];
  const variant = Math.floor(index / CORE_SKILLS.length);
  if (variant === 0) return base;
  return `${base}-advanced-${variant}`;
}

const C1_COUNT = 200_000;
const C2_COUNT = 400_000;
const C3_COUNT = 150_000;
const C4_COUNT = 250_000;
const C5_COUNT = 60_000;
const C6_COUNT = 990_000;

export function getUrlAtIndex(index: number, host: string = DEFAULT_HOST): string {
  const origin = `https://${host}`;

  if (index < C1_COUNT) {
    const r = index % 500;
    const c = Math.floor(index / 500) % 400;
    return `${origin}/jobs/${getRole(r)}-in-${getCity(c)}`;
  }

  if (index < C1_COUNT + C2_COUNT) {
    const offset = index - C1_COUNT;
    const l = offset % 4;
    const r = Math.floor(offset / 4) % 500;
    const c = Math.floor(offset / 2000) % 200;
    return `${origin}/jobs/${EXPERIENCE_LEVELS[l]}-${getRole(r)}-in-${getCity(c)}`;
  }

  if (index < C1_COUNT + C2_COUNT + C3_COUNT) {
    const offset = index - (C1_COUNT + C2_COUNT);
    const r = offset % 500;
    const c = Math.floor(offset / 500) % 300;
    return `${origin}/career-insights/salary/${getRole(r)}-salary-in-${getCity(c)}`;
  }

  if (index < C1_COUNT + C2_COUNT + C3_COUNT + C4_COUNT) {
    const offset = index - (C1_COUNT + C2_COUNT + C3_COUNT);
    const r = offset % 500;
    const t = Math.floor(offset / 500) % 500;
    const suffix = t === 0 ? '' : `-part-${t + 1}`;
    return `${origin}/resume/interview-prep/${getRole(r)}-interview-questions-and-answers${suffix}`;
  }

  if (index < C1_COUNT + C2_COUNT + C3_COUNT + C4_COUNT + C5_COUNT) {
    const offset = index - (C1_COUNT + C2_COUNT + C3_COUNT + C4_COUNT);
    const s = offset % 200;
    const c = Math.floor(offset / 200) % 300;
    return `${origin}/courses/${getSkill(s)}-courses-in-${getCity(c)}`;
  }

  const offset = index - (C1_COUNT + C2_COUNT + C3_COUNT + C4_COUNT + C5_COUNT);
  if (offset < 350_000) {
    const c = offset % 500;
    const v = Math.floor(offset / 500);
    return `${origin}/colleges/${getCity(c)}-institute-of-technology${v > 0 ? `-campus-${v}` : ''}`;
  } else if (offset < 650_000) {
    const r = (offset - 350_000) % 500;
    const v = Math.floor((offset - 350_000) / 500);
    return `${origin}/careers/${getRole(r)}${v > 0 ? `-roadmap-${v}` : ''}`;
  } else {
    const id = offset - 650_000;
    return `${origin}/jobs/verified-position-${100000 + id}`;
  }
}

export interface InventorySlice {
  page: number;
  pageSize: number;
  totalUrlsInPage: number;
  hasNextPage: boolean;
  nextPage: number | null;
  nextPageUrl: string | null;
  totalPages: number;
  totalInventoryCount: number;
  urls: string[];
}

export function getInventorySlice(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  host: string = DEFAULT_HOST
): InventorySlice {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(50_000, Math.max(1, pageSize));
  const totalPages = Math.ceil(TOTAL_INVENTORY_COUNT / safePageSize);

  const startIndex = (safePage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, TOTAL_INVENTORY_COUNT);

  const urls: string[] = [];
  if (startIndex < TOTAL_INVENTORY_COUNT) {
    for (let i = startIndex; i < endIndex; i++) {
      urls.push(getUrlAtIndex(i, host));
    }
  }

  const hasNextPage = safePage < totalPages;
  const nextPage = hasNextPage ? safePage + 1 : null;
  const nextPageUrl = hasNextPage
    ? `https://${host}/api/seo/indexnow?page=${safePage + 1}&pageSize=${safePageSize}`
    : null;

  return {
    page: safePage,
    pageSize: safePageSize,
    totalUrlsInPage: urls.length,
    hasNextPage,
    nextPage,
    nextPageUrl,
    totalPages,
    totalInventoryCount: TOTAL_INVENTORY_COUNT,
    urls,
  };
}
