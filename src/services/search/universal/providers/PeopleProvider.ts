import { supabase } from '@/integrations/supabase/client';
import type { SearchProviderContext, SearchProviderOutput, UniversalSearchItem, UniversalSearchProvider } from '../types';

/**
 * People Search Provider.
 * SECURITY: Always queries `public.public_profiles` (22 sanitized columns, is_profile_public = true)
 * instead of raw `public.profiles`, ensuring strict compliance with Migration B RLS & zero PII leakage.
 */
export class PeopleProvider implements UniversalSearchProvider {
  readonly type = 'people' as const;
  readonly label = 'People';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page } = ctx;
    const { entities, filters } = intent;
    const offset = (page - 1) * limit;

    let query = (supabase as any)
      .from('public_profiles')
      .select(
        'id, full_name, username, title, headline, about, location, profile_picture_url, profile_photo_url, skills, experience_years, industry, current_company, verification_status, created_at',
        { count: 'exact' }
      )
      .not('full_name', 'is', null)
      .neq('full_name', '');

    // Text search across name, title, headline, company, about
    const isRecentlyJoined = filters.activities.includes('recently_joined');
    const textTerms = [...entities.roles, ...intent.keywords].filter((t) => t.length >= 2);
    const primaryTerm = entities.roles[0] || intent.keywords[0] || (!isRecentlyJoined ? intent.cleanText : '');
    if (primaryTerm && primaryTerm.length >= 2 && (!isRecentlyJoined || entities.roles.length > 0)) {
      const safe = primaryTerm.replace(/[,%()]/g, ' ').trim();
      query = query.or(
        `full_name.ilike.%${safe}%,title.ilike.%${safe}%,headline.ilike.%${safe}%,current_company.ilike.%${safe}%,about.ilike.%${safe}%`
      );
    }

    // Location filter (handles Delhi NCR multi-city)
    if (filters.cities.length > 0) {
      const cityOr = filters.cities.map((c) => `location.ilike.%${c.replace(/[,%()]/g, '')}%`).join(',');
      query = query.or(cityOr);
    } else if (filters.location) {
      query = query.ilike('location', `%${filters.location.replace(/[,%()]/g, '')}%`);
    }

    // Company filter
    if (entities.companies.length > 0) {
      const compOr = entities.companies
        .map((c) => `current_company.ilike.%${c.replace(/[,%()]/g, '')}%`)
        .join(',');
      query = query.or(compOr);
    }

    // Industry filter
    if (entities.industries.length > 0) {
      const indOr = entities.industries
        .map((i) => `industry.ilike.%${i.replace(/[,%()]/g, '')}%`)
        .join(',');
      query = query.or(indOr);
    }

    // Experience filters
    if (filters.experienceMin !== undefined) {
      query = query.gte('experience_years', filters.experienceMin);
    }
    if (filters.experienceMax !== undefined) {
      query = query.lte('experience_years', filters.experienceMax);
    }

    // Skills containment (AND) vs overlap (OR)
    if (entities.skills.length > 0) {
      if (filters.skillMatchMode === 'and') {
        query = query.contains('skills', entities.skills);
      } else {
        query = query.overlaps('skills', entities.skills);
      }
    }

    // Ordering
    if (filters.activities.includes('recently_joined') || intent.sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('experience_years', { ascending: false, nullsFirst: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const rows = (data || []) as any[];

    // Optional post-filter for additional text terms if multiple keywords were provided
    const filteredRows =
      textTerms.length > 1
        ? rows.filter((p) => {
            const blob = `${p.full_name || ''} ${p.title || ''} ${p.headline || ''} ${p.about || ''} ${p.current_company || ''} ${(p.skills || []).join(' ')}`.toLowerCase();
            return textTerms.some((t) => blob.includes(t.toLowerCase()));
          })
        : rows;

    const items: UniversalSearchItem[] = filteredRows.map((p) => {
      const roleLine = [p.title || p.headline || 'Professional', p.current_company ? `at ${p.current_company}` : '']
        .filter(Boolean)
        .join(' ');
      const subtitle = [roleLine, p.location].filter(Boolean).join(' • ');
      const cleanUsername = p.username && String(p.username).startsWith('@') ? String(p.username).slice(1) : p.username;

      return {
        id: String(p.id),
        type: 'people',
        title: p.full_name || 'Professional',
        subtitle,
        snippet: p.about ? String(p.about).slice(0, 140) : undefined,
        url: cleanUsername ? `/u/${cleanUsername}` : `/u/${p.id}`,
        avatarUrl: p.profile_photo_url || p.profile_picture_url || null,
        badge: p.verification_status === 'verified' ? 'Verified' : p.industry || undefined,
        score: p.verification_status === 'verified' ? 14 : 10,
        matchReasons: [],
        createdAt: p.created_at,
        metadata: {
          location: p.location,
          skills: p.skills || [],
          experience_years: p.experience_years,
          current_company: p.current_company,
          industry: p.industry,
          is_verified: p.verification_status === 'verified',
        },
      };
    });

    return {
      type: 'people',
      items,
      totalCount: count ?? items.length,
      hasMore: (count ?? items.length) > offset + limit,
    };
  }
}
