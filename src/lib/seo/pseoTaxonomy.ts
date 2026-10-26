/**
 * src/lib/seo/pseoTaxonomy.ts
 *
 * Single Source of Truth for TalentXcel Programmatic SEO Matrix (pSEO)
 * Synchronized across:
 * - api/seo/indexnow.ts (IndexNow push engine)
 * - scripts/generate-sitemap.ts (XML sitemap sharding engine)
 * - src/components/seo/PopularRoleCityLinks.tsx (Internal PageRank mesh)
 */

export const CANONICAL_ROLES = [
  'software-engineer', 'full-stack-developer', 'frontend-developer', 'backend-developer',
  'react-developer', 'node-js-developer', 'python-developer', 'java-developer',
  'golang-developer', 'ios-developer', 'android-developer', 'flutter-developer',
  'react-native-developer', 'devops-engineer', 'cloud-architect', 'aws-solutions-architect',
  'azure-cloud-engineer', 'gcp-cloud-architect', 'site-reliability-engineer',
  'database-administrator', 'sql-developer', 'postgresql-dba', 'security-engineer',
  'cybersecurity-analyst', 'qa-automation-engineer', 'sdet-engineer', 'blockchain-developer',
  'smart-contract-developer', 'ai-engineer', 'machine-learning-engineer', 'data-scientist',
  'data-engineer', 'data-analyst', 'prompt-engineer', 'llm-engineer',
  'product-manager', 'technical-product-manager', 'growth-product-manager',
  'ui-ux-designer', 'product-designer', 'scrum-master', 'solutions-architect',
  'marketing-manager', 'growth-marketer', 'digital-marketing-specialist', 'seo-specialist',
  'content-writer', 'copywriter', 'social-media-manager',
  'financial-analyst', 'talent-acquisition-specialist', 'technical-recruiter',
  'hr-manager', 'operations-manager', 'project-manager'
];

export const CANONICAL_CITIES = [
  { slug: 'bangalore', name: 'Bangalore', state: 'Karnataka' },
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
  { slug: 'pune', name: 'Pune', state: 'Maharashtra' },
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { slug: 'delhi-ncr', name: 'Delhi NCR', state: 'Delhi NCR' },
  { slug: 'noida', name: 'Noida', state: 'Uttar Pradesh' },
  { slug: 'gurgaon', name: 'Gurgaon', state: 'Haryana' },
  { slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { slug: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
  { slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
  { slug: 'chandigarh', name: 'Chandigarh', state: 'Punjab' },
  { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan' },
  { slug: 'kochi', name: 'Kochi', state: 'Kerala' },
  { slug: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu' },
  { slug: 'indore', name: 'Indore', state: 'Madhya Pradesh' },
  { slug: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha' },
  { slug: 'patna', name: 'Patna', state: 'Bihar' },
  { slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh' },
  { slug: 'nagpur', name: 'Nagpur', state: 'Maharashtra' },
  { slug: 'surat', name: 'Surat', state: 'Gujarat' },
  { slug: 'vadodara', name: 'Vadodara', state: 'Gujarat' },
  { slug: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { slug: 'dubai', name: 'Dubai', state: 'UAE' },
  { slug: 'london', name: 'London', state: 'UK' },
  { slug: 'singapore', name: 'Singapore', state: 'Singapore' },
];

export const CORE_STATIC_ROUTES = [
  '/',
  '/jobs',
  '/colleges',
  '/learning',
  '/resume',
  '/resume/build',
  '/resume/ats-check',
  '/resume/cover-letter',
  '/resume/interview-prep',
  '/career-insights',
  '/hire',
  '/network',
  '/passport',
  '/rankings',
  '/services',
  '/companies',
  '/about',
  '/contact',
  '/faq',
  '/terms',
  '/privacypolicy',
  '/colleges/global-programs',
  '/colleges/scholarships',
  '/colleges/career-pathway',
  '/uae',
  '/uk',
  '/usa',
  '/europe',
  '/world',
];

/**
 * Generate Combinatorial Programmatic URLs
 */
export function generateProgrammaticRoleCityUrls(origin = 'https://talentxcel.in'): string[] {
  const urls: string[] = [];
  for (const role of CANONICAL_ROLES) {
    for (const city of CANONICAL_CITIES) {
      urls.push(`${origin}/jobs/${role}-in-${city.slug}`);
    }
  }
  return urls;
}
