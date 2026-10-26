/**
 * api/sitemaps.ts
 * GET /api/sitemaps?shard=1 (or /sitemaps/:path* via vercel.json rewrite)
 *
 * Dynamic 50,000-URL Sitemap Shard Provider for TalentXcel
 * Serves shards 1 through 41 covering all 2,050,000 Programmatic URLs for Googlebot.
 * Fully Edge-cached by Cloudflare (7 days TTL).
 *
 * Runtime: Vercel Edge Runtime (Ultra-fast, zero cold starts, global replication)
 */

export const config = {
  runtime: 'edge',
};

export const TOTAL_INVENTORY_COUNT = 2_050_000;
export const DEFAULT_PAGE_SIZE = 50_000;
export const TOTAL_PAGES = Math.ceil(TOTAL_INVENTORY_COUNT / DEFAULT_PAGE_SIZE); // 41
export const DEFAULT_HOST = 'talentxcel.in';

const CORE_ROLES: string[] = [
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

const CORE_CITIES: string[] = [
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

const EXPERIENCE_LEVELS = ['fresher', 'junior', 'senior', 'lead'] as const;

const CORE_SKILLS = [
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

function getUrlAtIndex(index: number, host: string = DEFAULT_HOST): string {
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

  // Cohort 6: Colleges, Careers, Passports, Network, Posts & User Profiles (990,000 URLs)
  const offset = index - (C1_COUNT + C2_COUNT + C3_COUNT + C4_COUNT + C5_COUNT);
  if (offset < 250_000) {
    // 6A: Colleges & Higher Ed (250,000 URLs)
    const c = offset % 500;
    const v = Math.floor(offset / 500);
    return `${origin}/colleges/${getCity(c)}-institute-of-technology${v > 0 ? `-campus-${v}` : ''}`;
  } else if (offset < 400_000) {
    // 6B: Career Pathways & Roadmaps (150,000 URLs)
    const rel = offset - 250_000;
    const r = rel % 500;
    const v = Math.floor(rel / 500);
    return `${origin}/careers/${getRole(r)}${v > 0 ? `-roadmap-${v}` : ''}`;
  } else if (offset < 550_000) {
    // 6C: Verified Career Passports & Proof Credentials (150,000 URLs)
    const rel = offset - 400_000;
    const r = rel % 500;
    const v = Math.floor(rel / 500);
    return `${origin}/passport/proof/txc-verify-${getRole(r)}-${1000 + v}`;
  } else if (offset < 690_000) {
    // 6D: Professional Network & Communities (140,000 URLs)
    const rel = offset - 550_000;
    const r = rel % 500;
    const c = Math.floor(rel / 500) % 280;
    return `${origin}/network/communities/${getRole(r)}-leaders-in-${getCity(c)}`;
  } else if (offset < 840_000) {
    // 6E: Knowledge Posts & Industry Insights (150,000 URLs)
    const rel = offset - 690_000;
    const r = rel % 500;
    const v = Math.floor(rel / 500);
    return `${origin}/posts/${getRole(r)}-market-trends-and-insights${v > 0 ? `-edition-${v + 1}` : ''}`;
  } else {
    // 6F: Verified Talent & Public User Profiles (150,000 URLs)
    const rel = offset - 840_000;
    const r = rel % 500;
    const v = Math.floor(rel / 500);
    const role = getRole(r);
    const badge = role.endsWith('-specialist') ? '' : '-specialist';
    return `${origin}/profile/${role}${badge}-${1000 + v}`;
  }
}

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const rawShard = url.searchParams.get('shard') || url.searchParams.get('page') || '1';
  const cleanShard = String(rawShard).replace(/\.xml$/, '').trim();
  const shardNum = parseInt(cleanShard, 10);

  if (isNaN(shardNum) || shardNum < 1 || shardNum > TOTAL_PAGES) {
    return new Response(`Sitemap shard ${cleanShard} not found. Valid shards are 1 to ${TOTAL_PAGES}.`, {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const host = (url.hostname || DEFAULT_HOST).toLowerCase().trim();
  const startIndex = (shardNum - 1) * DEFAULT_PAGE_SIZE;
  const endIndex = Math.min(startIndex + DEFAULT_PAGE_SIZE, TOTAL_INVENTORY_COUNT);
  const lastmod = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (let i = startIndex; i < endIndex; i++) {
    xml += `  <url>\n    <loc>${getUrlAtIndex(i, host)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  xml += '</urlset>';

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'max-age=604800, stale-while-revalidate=86400',
      'X-Sitemap-Shard': String(shardNum),
      'X-Sitemap-Total-Urls': String(endIndex - startIndex),
    },
  });
}
