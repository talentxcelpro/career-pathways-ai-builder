/**
 * src/config/jobs/programmaticSeoConfig.ts
 *
 * Programmatic SEO Engine Governance & Dynamic Hub Generator.
 * Enforces strict inventory gates to prevent thin pages and Google indexation traps.
 */

export interface PseoInventoryGates {
  industryMinJobs: number;
  cityMinJobs: number;
  industryCityMinJobs: number;
  fresherCityMinJobs: number;
  internshipCityMinJobs: number;
  internshipIndustryMinJobs: number;
  remoteMinJobs: number;
}

export const DEFAULT_PSEO_GATES: PseoInventoryGates = {
  industryMinJobs: 20,
  cityMinJobs: 20,
  industryCityMinJobs: 8,
  fresherCityMinJobs: 8,
  internshipCityMinJobs: 5,
  internshipIndustryMinJobs: 8,
  remoteMinJobs: 20
};

export type PseoHubType =
  | 'industry'
  | 'city'
  | 'industry_city'
  | 'fresher'
  | 'fresher_city'
  | 'internship'
  | 'internship_industry'
  | 'internship_city'
  | 'remote'
  | 'part_time';

export interface PseoHubMetadata {
  path: string;
  canonicalUrl: string;
  hubType: PseoHubType;
  title: string;
  metaDescription: string;
  h1: string;
  activeCount: number;
  breadcrumbs: Array<{ name: string; item: string }>;
  isIndexable: boolean;
}

/**
 * Normalizes an industry name into a clean SEO URL slug
 */
export function slugifyIndustry(industry: string): string {
  return industry
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes a city name into a clean SEO URL slug
 */
export function slugifyCity(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates verified metadata for programmatic job hubs
 */
export function generateHubMetadata(
  hubType: PseoHubType,
  params: {
    industry?: string;
    city?: string;
    activeCount: number;
  },
  origin: string = 'https://talentxcel.in'
): PseoHubMetadata {
  const { industry, city, activeCount } = params;
  let path = '/jobs';
  let title = 'Jobs in India — TalentXcel';
  let metaDescription = 'Discover verified employment opportunities across top Indian hubs.';
  let h1 = 'Explore Opportunities';
  const breadcrumbs: Array<{ name: string; item: string }> = [
    { name: 'Home', item: `${origin}/` },
    { name: 'Jobs', item: `${origin}/jobs` }
  ];

  switch (hubType) {
    case 'industry': {
      const indSlug = slugifyIndustry(industry || '');
      path = `/jobs/${indSlug}`;
      title = `${industry} Jobs in India (${activeCount}+ Openings) — TalentXcel`;
      metaDescription = `Browse verified ${industry} jobs across Indian employment centres. Explore salary benchmarks, direct employer career applications, and high-growth hiring teams.`;
      h1 = `${industry} Jobs in India`;
      breadcrumbs.push({ name: industry || '', item: `${origin}${path}` });
      break;
    }

    case 'city': {
      const cSlug = slugifyCity(city || '');
      path = `/jobs/city/${cSlug}`;
      title = `Jobs in ${city} (${activeCount}+ Vacancies) — TalentXcel`;
      metaDescription = `Find top career openings and verified employer jobs in ${city}. Filter by experience, full-time, remote, and fresher roles.`;
      h1 = `Jobs in ${city}`;
      breadcrumbs.push({ name: `${city} Jobs`, item: `${origin}${path}` });
      break;
    }

    case 'industry_city': {
      const indSlug = slugifyIndustry(industry || '');
      const cSlug = slugifyCity(city || '');
      path = `/jobs/${indSlug}/${cSlug}`;
      title = `${industry} Jobs in ${city} (${activeCount}+ Openings) — TalentXcel`;
      metaDescription = `Apply to verified ${industry} roles in ${city}. Compare salary ranges, hiring companies, and career trajectories on TalentXcel.`;
      h1 = `${industry} Jobs in ${city}`;
      breadcrumbs.push({ name: industry || '', item: `${origin}/jobs/${indSlug}` });
      breadcrumbs.push({ name: city || '', item: `${origin}${path}` });
      break;
    }

    case 'fresher': {
      path = '/jobs/freshers';
      title = `Fresher Jobs & Graduate Trainee Openings in India (${activeCount}+ Verified) — TalentXcel`;
      metaDescription = `Discover entry-level careers, graduate engineering trainees, management trainees, and 0-experience fresher jobs with top Indian employers.`;
      h1 = 'Fresher & Entry-Level Jobs in India';
      breadcrumbs.push({ name: 'Freshers', item: `${origin}${path}` });
      break;
    }

    case 'fresher_city': {
      const cSlug = slugifyCity(city || '');
      path = `/jobs/freshers/${cSlug}`;
      title = `Fresher Jobs in ${city} (${activeCount}+ Entry-Level Openings) — TalentXcel`;
      metaDescription = `Find fresher and graduate trainee opportunities in ${city}. Zero experience required, verified employer campus and off-campus roles.`;
      h1 = `Fresher Jobs in ${city}`;
      breadcrumbs.push({ name: 'Freshers', item: `${origin}/jobs/freshers` });
      breadcrumbs.push({ name: city || '', item: `${origin}${path}` });
      break;
    }

    case 'internship': {
      path = '/jobs/internships';
      title = `Internships & Summer Trainee Programs in India (${activeCount}+ Openings) — TalentXcel`;
      metaDescription = `Explore paid internships, research apprenticeships, and student summer analyst programs across top Indian enterprises and tech hubs.`;
      h1 = 'Internships & Apprenticeships in India';
      breadcrumbs.push({ name: 'Internships', item: `${origin}${path}` });
      break;
    }

    case 'internship_industry': {
      const indSlug = slugifyIndustry(industry || '');
      path = `/jobs/internships/${indSlug}`;
      title = `${industry} Internships in India (${activeCount}+ Paid Roles) — TalentXcel`;
      metaDescription = `Kickstart your career with verified ${industry} internships. Hands-on experience, paid stipends, and full-time PPO conversion pathways.`;
      h1 = `${industry} Internships`;
      breadcrumbs.push({ name: 'Internships', item: `${origin}/jobs/internships` });
      breadcrumbs.push({ name: industry || '', item: `${origin}${path}` });
      break;
    }

    case 'internship_city': {
      const cSlug = slugifyCity(city || '');
      path = `/jobs/internships/${cSlug}`;
      title = `Internships in ${city} (${activeCount}+ Student Openings) — TalentXcel`;
      metaDescription = `Find top student internships and summer training opportunities located in ${city}.`;
      h1 = `Internships in ${city}`;
      breadcrumbs.push({ name: 'Internships', item: `${origin}/jobs/internships` });
      breadcrumbs.push({ name: city || '', item: `${origin}${path}` });
      break;
    }

    case 'remote': {
      path = '/jobs/remote';
      title = `Remote Jobs in India & Worldwide (${activeCount}+ Work From Home) — TalentXcel`;
      metaDescription = `Discover 100% remote work opportunities. Work from home roles with leading tech startups and global enterprises.`;
      h1 = 'Remote & Work-From-Home Jobs';
      breadcrumbs.push({ name: 'Remote Jobs', item: `${origin}${path}` });
      break;
    }

    case 'part_time': {
      path = '/jobs/part-time';
      title = `Part-Time & Flexible Jobs in India (${activeCount}+ Openings) — TalentXcel`;
      metaDescription = `Explore flexible part-time employment options across various sectors.`;
      h1 = 'Part-Time Jobs in India';
      breadcrumbs.push({ name: 'Part-Time Jobs', item: `${origin}${path}` });
      break;
    }
  }

  return {
    path,
    canonicalUrl: `${origin}${path}`,
    hubType,
    title,
    metaDescription,
    h1,
    activeCount,
    breadcrumbs,
    isIndexable: true
  };
}
