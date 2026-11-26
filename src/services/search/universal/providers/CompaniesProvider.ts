import { supabase } from '@/integrations/supabase/client';
import type { SearchProviderContext, SearchProviderOutput, UniversalSearchItem, UniversalSearchProvider } from '../types';

export class CompaniesProvider implements UniversalSearchProvider {
  readonly type = 'companies' as const;
  readonly label = 'Companies';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page } = ctx;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('companies')
      .select('id, name, industry, location, description, size_range, is_verified, logo_url, website_url, created_at', {
        count: 'exact',
      });

    const term = intent.entities.companies[0] || intent.keywords[0] || intent.cleanText;
    if (term && term.length >= 2) {
      const safe = term.replace(/[,%()]/g, ' ').trim();
      query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%,industry.ilike.%${safe}%`);
    }

    if (intent.filters.location) {
      query = query.ilike('location', `%${intent.filters.location.replace(/[,%()]/g, '')}%`);
    }

    if (intent.entities.industries.length > 0) {
      const indOr = intent.entities.industries
        .map((i) => `industry.ilike.%${i.replace(/[,%()]/g, '')}%`)
        .join(',');
      query = query.or(indOr);
    }

    const { data, error, count } = await query
      .order('is_verified', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const items: UniversalSearchItem[] = (data || []).map((c) => ({
      id: String(c.id),
      type: 'companies',
      title: c.name,
      subtitle: [c.industry, c.location, c.size_range].filter(Boolean).join(' • ') || 'Company',
      snippet: c.description ? String(c.description).slice(0, 140) : undefined,
      url: `/companies/${c.id}`,
      avatarUrl: c.logo_url,
      badge: c.is_verified ? 'Verified' : undefined,
      score: c.is_verified ? 14 : 10,
      matchReasons: [],
      createdAt: c.created_at,
      metadata: {
        industry: c.industry,
        location: c.location,
        size_range: c.size_range,
        is_verified: Boolean(c.is_verified),
      },
    }));

    return {
      type: 'companies',
      items,
      totalCount: count ?? items.length,
      hasMore: (count ?? items.length) > offset + limit,
    };
  }
}
