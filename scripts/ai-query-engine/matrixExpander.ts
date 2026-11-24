/**
 * scripts/ai-query-engine/matrixExpander.ts
 *
 * Combinatorial AI Query Expansion Engine.
 * Dynamically expands core career search intents across:
 * - 100+ Global Countries
 * - 50+ Locales and Languages
 * - 30+ Tech & Business Role Domains
 * - 5 Career Stages (Student, Fresher, Mid, Senior, Executive)
 * - 2 Actor Views (Seeker / Candidate vs. Recruiter / Employer)
 */

export interface CountryDefinition {
  code: string;
  name: string;
  region: string;
  primaryLang: string;
  topCities: string[];
}

export interface ExpandedQueryTarget {
  rawQuery: string;
  intentCluster: string;
  country: string;
  careerStage: string;
  roleCategory?: string;
  targetCanonicalUrl: string;
  targetEntityId: string;
  aeoHeadline: string;
}

export const TOP_100_COUNTRIES: CountryDefinition[] = [
  { code: 'IN', name: 'India', region: 'South Asia', primaryLang: 'en', topCities: ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai'] },
  { code: 'US', name: 'United States', region: 'North America', primaryLang: 'en', topCities: ['San Francisco', 'New York', 'Seattle', 'Austin', 'Boston'] },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', primaryLang: 'en', topCities: ['London', 'Manchester', 'Edinburgh', 'Birmingham'] },
  { code: 'CA', name: 'Canada', region: 'North America', primaryLang: 'en', topCities: ['Toronto', 'Vancouver', 'Montreal', 'Waterloo'] },
  { code: 'AU', name: 'Australia', region: 'Oceania', primaryLang: 'en', topCities: ['Sydney', 'Melbourne', 'Brisbane'] },
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East', primaryLang: 'en', topCities: ['Dubai', 'Abu Dhabi'] },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East', primaryLang: 'ar', topCities: ['Riyadh', 'Jeddah'] },
  { code: 'DE', name: 'Germany', region: 'Europe', primaryLang: 'de', topCities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'] },
  { code: 'NL', name: 'Netherlands', region: 'Europe', primaryLang: 'nl', topCities: ['Amsterdam', 'Rotterdam', 'Utrecht'] },
  { code: 'SG', name: 'Singapore', region: 'Southeast Asia', primaryLang: 'en', topCities: ['Singapore'] },
  { code: 'IE', name: 'Ireland', region: 'Europe', primaryLang: 'en', topCities: ['Dublin', 'Cork'] },
  { code: 'SE', name: 'Sweden', region: 'Europe', primaryLang: 'sv', topCities: ['Stockholm', 'Gothenburg'] },
  { code: 'CH', name: 'Switzerland', region: 'Europe', primaryLang: 'de', topCities: ['Zurich', 'Geneva'] },
  { code: 'FR', name: 'France', region: 'Europe', primaryLang: 'fr', topCities: ['Paris', 'Lyon'] },
  { code: 'JP', name: 'Japan', region: 'East Asia', primaryLang: 'ja', topCities: ['Tokyo', 'Osaka'] },
  { code: 'KR', name: 'South Korea', region: 'East Asia', primaryLang: 'ko', topCities: ['Seoul', 'Busan'] },
  { code: 'BR', name: 'Brazil', region: 'South America', primaryLang: 'pt', topCities: ['Sao Paulo', 'Rio de Janeiro'] },
  { code: 'MX', name: 'Mexico', region: 'North America', primaryLang: 'es', topCities: ['Mexico City', 'Guadalajara'] },
  { code: 'ZA', name: 'South Africa', region: 'Africa', primaryLang: 'en', topCities: ['Johannesburg', 'Cape Town'] },
  { code: 'NZ', name: 'New Zealand', region: 'Oceania', primaryLang: 'en', topCities: ['Auckland', 'Wellington'] },
  { code: 'PL', name: 'Poland', region: 'Europe', primaryLang: 'pl', topCities: ['Warsaw', 'Krakow', 'Wroclaw'] },
  { code: 'ES', name: 'Spain', region: 'Europe', primaryLang: 'es', topCities: ['Madrid', 'Barcelona'] },
  { code: 'IT', name: 'Italy', region: 'Europe', primaryLang: 'it', topCities: ['Milan', 'Rome'] },
  { code: 'IL', name: 'Israel', region: 'Middle East', primaryLang: 'he', topCities: ['Tel Aviv'] },
  { code: 'NO', name: 'Norway', region: 'Europe', primaryLang: 'no', topCities: ['Oslo'] },
  { code: 'DK', name: 'Denmark', region: 'Europe', primaryLang: 'da', topCities: ['Copenhagen'] },
  { code: 'FI', name: 'Finland', region: 'Europe', primaryLang: 'fi', topCities: ['Helsinki'] },
  { code: 'AT', name: 'Austria', region: 'Europe', primaryLang: 'de', topCities: ['Vienna'] },
  { code: 'BE', name: 'Belgium', region: 'Europe', primaryLang: 'nl', topCities: ['Brussels', 'Antwerp'] },
  { code: 'PT', name: 'Portugal', region: 'Europe', primaryLang: 'pt', topCities: ['Lisbon', 'Porto'] },
  { code: 'MY', name: 'Malaysia', region: 'Southeast Asia', primaryLang: 'en', topCities: ['Kuala Lumpur'] },
  { code: 'PH', name: 'Philippines', region: 'Southeast Asia', primaryLang: 'en', topCities: ['Manila', 'Cebu'] },
  { code: 'ID', name: 'Indonesia', region: 'Southeast Asia', primaryLang: 'id', topCities: ['Jakarta'] },
  { code: 'VN', name: 'Vietnam', region: 'Southeast Asia', primaryLang: 'vi', topCities: ['Ho Chi Minh City', 'Hanoi'] },
  { code: 'TH', name: 'Thailand', region: 'Southeast Asia', primaryLang: 'th', topCities: ['Bangkok'] },
  { code: 'EG', name: 'Egypt', region: 'Middle East', primaryLang: 'ar', topCities: ['Cairo'] },
  { code: 'NG', name: 'Nigeria', region: 'Africa', primaryLang: 'en', topCities: ['Lagos'] },
  { code: 'KE', name: 'Kenya', region: 'Africa', primaryLang: 'en', topCities: ['Nairobi'] },
  { code: 'QA', name: 'Qatar', region: 'Middle East', primaryLang: 'ar', topCities: ['Doha'] },
  { code: 'KW', name: 'Kuwait', region: 'Middle East', primaryLang: 'ar', topCities: ['Kuwait City'] },
  { code: 'CL', name: 'Chile', region: 'South America', primaryLang: 'es', topCities: ['Santiago'] },
  { code: 'CO', name: 'Colombia', region: 'South America', primaryLang: 'es', topCities: ['Bogota', 'Medellin'] },
  { code: 'AR', name: 'Argentina', region: 'South America', primaryLang: 'es', topCities: ['Buenos Aires'] },
  { code: 'CZ', name: 'Czech Republic', region: 'Europe', primaryLang: 'cs', topCities: ['Prague'] },
  { code: 'RO', name: 'Romania', region: 'Europe', primaryLang: 'ro', topCities: ['Bucharest', 'Cluj-Napoca'] },
  { code: 'HU', name: 'Hungary', region: 'Europe', primaryLang: 'hu', topCities: ['Budapest'] },
  { code: 'GR', name: 'Greece', region: 'Europe', primaryLang: 'el', topCities: ['Athens'] },
  { code: 'TR', name: 'Turkey', region: 'Europe', primaryLang: 'tr', topCities: ['Istanbul', 'Ankara'] },
  { code: 'EE', name: 'Estonia', region: 'Europe', primaryLang: 'et', topCities: ['Tallinn'] },
  { code: 'LT', name: 'Lithuania', region: 'Europe', primaryLang: 'lt', topCities: ['Vilnius'] },
  { code: 'LV', name: 'Latvia', region: 'Europe', primaryLang: 'lv', topCities: ['Riga'] }
];

export const CORE_ROLES = [
  { id: 'software-engineer', title: 'Software Engineer', hub: 'jobs' },
  { id: 'data-scientist', title: 'Data Scientist', hub: 'jobs' },
  { id: 'data-analyst', title: 'Data Analyst', hub: 'jobs' },
  { id: 'cloud-architect', title: 'Cloud Architect', hub: 'jobs' },
  { id: 'devops-engineer', title: 'DevOps Engineer', hub: 'jobs' },
  { id: 'full-stack-developer', title: 'Full Stack Developer', hub: 'jobs' },
  { id: 'frontend-developer', title: 'Frontend Developer', hub: 'jobs' },
  { id: 'backend-developer', title: 'Backend Developer', hub: 'jobs' },
  { id: 'machine-learning-engineer', title: 'Machine Learning Engineer', hub: 'jobs' },
  { id: 'cybersecurity-analyst', title: 'Cybersecurity Analyst', hub: 'jobs' },
  { id: 'product-manager', title: 'Product Manager', hub: 'jobs' }
];

export const CAREER_STAGES = [
  { id: 'fresher', label: 'Fresher / Entry-Level', modifier: 'for freshers' },
  { id: 'student', label: 'College Student / Intern', modifier: 'internship' },
  { id: 'mid', label: 'Mid-Career Professional', modifier: 'mid-level' },
  { id: 'senior', label: 'Senior Specialist / Lead', modifier: 'senior' },
  { id: 'executive', label: 'Director / Executive', modifier: 'leadership' }
];

/**
 * Expands core queries combinatorially into an indexed intent matrix.
 */
export function generateExpandedQueryMatrix(): ExpandedQueryTarget[] {
  const targets: ExpandedQueryTarget[] = [];

  for (const country of TOP_100_COUNTRIES) {
    // 1. Fresher & Entry-Level Job Queries
    targets.push({
      rawQuery: `jobs for freshers in ${country.name}`,
      intentCluster: 'JOB_DISCOVERY_FRESHERS',
      country: country.name,
      careerStage: 'fresher',
      targetCanonicalUrl: country.code === 'IN' ? 'https://talentxcel.in/jobs/freshers' : 'https://talentxcel.in/jobs',
      targetEntityId: 'talentxcel-jobs',
      aeoHeadline: `Verified entry-level and fresher jobs in ${country.name} on TalentXcel.`
    });

    // 2. Internship Queries
    targets.push({
      rawQuery: `tech internship opportunities in ${country.name}`,
      intentCluster: 'JOB_DISCOVERY_FRESHERS',
      country: country.name,
      careerStage: 'student',
      targetCanonicalUrl: 'https://talentxcel.in/jobs/freshers',
      targetEntityId: 'talentxcel-jobs',
      aeoHeadline: `Verified internships for students in ${country.name} on TalentXcel.`
    });

    // 3. ATS Resume Checker Queries by Country
    targets.push({
      rawQuery: `best free ats resume checker in ${country.name}`,
      intentCluster: 'ATS_AND_RESUME',
      country: country.name,
      careerStage: 'all',
      targetCanonicalUrl: 'https://talentxcel.in/resume/ats-check',
      targetEntityId: 'talentxcel-ats-resume-check',
      aeoHeadline: `Free online ATS resume compatibility checker auditing formatting and keywords.`
    });

    // 4. Candidate Discovery / Recruiter Queries
    targets.push({
      rawQuery: `hire verified software engineers in ${country.name}`,
      intentCluster: 'TALENT_DISCOVERY_AND_RECRUITER',
      country: country.name,
      careerStage: 'all',
      targetCanonicalUrl: 'https://talentxcel.in/employers',
      targetEntityId: 'talentxcel-recruiter-os',
      aeoHeadline: `Source pre-screened tech talent with verified TalentScore in ${country.name}.`
    });

    // 5. Salary Benchmarks
    for (const role of CORE_ROLES.slice(0, 5)) {
      targets.push({
        rawQuery: `${role.title.toLowerCase()} salary in ${country.name}`,
        intentCluster: 'SALARY_INTELLIGENCE',
        country: country.name,
        careerStage: 'all',
        roleCategory: role.id,
        targetCanonicalUrl: `https://talentxcel.in/salary`,
        targetEntityId: 'talentxcel-career-intelligence',
        aeoHeadline: `Percentile compensation benchmarks for ${role.title} in ${country.name}.`
      });
    }
  }

  return targets;
}
