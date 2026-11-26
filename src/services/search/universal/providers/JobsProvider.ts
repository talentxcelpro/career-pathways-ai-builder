import { searchService } from '../../SearchService';
import type { SearchProviderContext, SearchProviderOutput, UniversalSearchItem, UniversalSearchProvider } from '../types';

export class JobsProvider implements UniversalSearchProvider {
  readonly type = 'jobs' as const;
  readonly label = 'Jobs';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page } = ctx;
    const { filters, entities } = intent;

    // Build clean search text for the optimized Jobs RPC
    const searchTokens: string[] = [];
    if (entities.roles.length > 0) searchTokens.push(entities.roles[0]);
    if (entities.skills.length > 0) searchTokens.push(...entities.skills.slice(0, 2));
    if (entities.companies.length > 0) searchTokens.push(entities.companies[0]);
    const rpcSearch = searchTokens.length > 0 ? searchTokens.join(' ') : intent.cleanText;

    const result = await searchService.searchJobs({
      query: rpcSearch,
      location: filters.location || '',
      cities: filters.cities,
      employment_types: filters.employmentTypes,
      is_remote: Boolean(filters.isRemote),
      skills: entities.skills,
      industries: entities.industries,
      is_fresher: filters.isFresher,
      is_internship: filters.isInternship,
      work_modes: filters.workModes,
      min_salary: filters.salaryCurrency === 'INR' ? filters.salaryMinAnnual : undefined,
      max_salary: filters.salaryCurrency === 'INR' ? filters.salaryMaxAnnual : undefined,
      sortBy: intent.sortBy === 'salary_desc' ? 'salary_max' : 'created_at',
      page,
      limit: Math.min(limit * 2, 30),
    });

    let jobs = result.jobs || [];

    // Apply time-range filter if requested (e.g. "last 24 hours", "last 7 days")
    if (filters.timeRange) {
      const now = Date.now();
      const windowMs =
        filters.timeRange === '24h'
          ? 24 * 60 * 60 * 1000
          : filters.timeRange === '7d'
            ? 7 * 24 * 60 * 60 * 1000
            : filters.timeRange === '30d'
              ? 30 * 24 * 60 * 60 * 1000
              : 90 * 24 * 60 * 60 * 1000;

      jobs = jobs.filter((j: any) => {
        const ts = j.posted_at || j.created_at;
        return ts ? now - new Date(ts).getTime() <= windowMs : true;
      });
    }

    // Apply experience max filter (e.g. "less than 3 years")
    if (filters.experienceMax !== undefined) {
      jobs = jobs.filter((j: any) => {
        if (typeof j.min_experience === 'number') {
          return j.min_experience <= filters.experienceMax!;
        }
        return true;
      });
    }

    const items: UniversalSearchItem[] = jobs.slice(0, limit).map((job: any) => {
      const company = job.companies?.name || job.company_name || 'Company';
      const loc = job.is_remote
        ? `${job.location || 'Remote'} (Remote)`
        : job.location_city || job.location || 'Location flexible';

      const salaryText = job.salary_range
        ? ` • ${job.salary_range}`
        : job.salary_min
          ? ` • ₹${Math.round(job.salary_min / 100000)}L+`
          : '';

      return {
        id: String(job.id),
        type: 'jobs',
        title: job.title,
        subtitle: `${company} • ${loc}${salaryText}`,
        snippet: job.description_snippet || job.description || '',
        url: job.seo_slug ? `/jobs/${job.seo_slug}` : `/jobs/${job.id}`,
        avatarUrl: job.companies?.logo_url || null,
        badge: job.is_remote ? 'Remote' : job.is_internship ? 'Internship' : job.employment_type || undefined,
        score: job.is_featured ? 15 : 10,
        matchReasons: [],
        createdAt: job.posted_at || job.created_at,
        metadata: {
          company_name: company,
          location: job.location_city || job.location,
          is_remote: Boolean(job.is_remote),
          skills: job.skills_required || [],
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          is_verified: Boolean(job.companies?.is_verified),
        },
      };
    });

    return {
      type: 'jobs',
      items,
      totalCount: result.totalCount || items.length,
      hasMore: Boolean(result.hasMore),
    };
  }
}
