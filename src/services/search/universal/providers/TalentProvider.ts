import { supabase } from '@/integrations/supabase/client';
import type { SearchProviderContext, SearchProviderOutput, UniversalSearchItem, UniversalSearchProvider } from '../types';

/**
 * Talent / Candidate Discovery Provider.
 * SECURITY: Queries `unified_candidates` ONLY when the authenticated user has recruiter/employer/admin authority.
 * For non-recruiters, falls back strictly to `public_profiles` (sanitized public data only, no private CVs/emails/phones).
 */
export class TalentProvider implements UniversalSearchProvider {
  readonly type = 'talent' as const;
  readonly label = 'Talent';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page, userContext } = ctx;
    const offset = (page - 1) * limit;
    const isAuthorizedRecruiter = Boolean(
      userContext.userId && (userContext.isRecruiter || userContext.isEmployer || userContext.isAdmin)
    );

    if (isAuthorizedRecruiter) {
      let query = supabase
        .from('unified_candidates')
        .select('id, name, title, company, location, industry, skills, experience_years, looking_for_job, profile_picture_url, created_at', {
          count: 'exact',
        });

      const primary = intent.entities.roles[0] || intent.keywords[0] || intent.cleanText;
      if (primary && primary.length >= 2) {
        const safe = primary.replace(/[,%()]/g, ' ').trim();
        query = query.or(`name.ilike.%${safe}%,title.ilike.%${safe}%,company.ilike.%${safe}%`);
      }

      if (intent.filters.location) {
        query = query.ilike('location', `%${intent.filters.location.replace(/[,%()]/g, '')}%`);
      }
      if (intent.entities.skills.length > 0) {
        if (intent.filters.skillMatchMode === 'and') {
          query = query.contains('skills', intent.entities.skills);
        } else {
          query = query.overlaps('skills', intent.entities.skills);
        }
      }
      if (intent.filters.experienceMin !== undefined) {
        query = query.gte('experience_years', intent.filters.experienceMin);
      }
      if (intent.filters.experienceMax !== undefined) {
        query = query.lte('experience_years', intent.filters.experienceMax);
      }
      if (intent.filters.activities.includes('immediate_joining')) {
        query = query.eq('looking_for_job', true);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data) {
        const items: UniversalSearchItem[] = data.map((c) => ({
          id: String(c.id),
          type: 'talent',
          title: c.name || 'Candidate',
          subtitle: [c.title, c.company, c.location].filter(Boolean).join(' • '),
          url: `/talent?candidate=${c.id}`,
          avatarUrl: c.profile_picture_url,
          badge: c.looking_for_job ? 'Open to Work' : c.industry || undefined,
          score: c.looking_for_job ? 14 : 10,
          matchReasons: [],
          createdAt: c.created_at || undefined,
          metadata: {
            location: c.location,
            skills: c.skills || [],
            experience_years: c.experience_years,
            industry: c.industry,
          },
        }));

        return {
          type: 'talent',
          items,
          totalCount: count ?? items.length,
          hasMore: (count ?? items.length) > offset + limit,
        };
      }
    }

    // Fallback for non-recruiters: sanitized public_profiles only (never exposes private CV/contact PII)
    let pubQuery = (supabase as any)
      .from('public_profiles')
      .select('id, full_name, username, title, headline, location, profile_picture_url, skills, experience_years, industry, current_company, created_at', {
        count: 'exact',
      })
      .not('full_name', 'is', null);

    if (intent.entities.skills.length > 0) {
      if (intent.filters.skillMatchMode === 'and') {
        pubQuery = pubQuery.contains('skills', intent.entities.skills);
      } else {
        pubQuery = pubQuery.overlaps('skills', intent.entities.skills);
      }
    } else if (intent.cleanText.length >= 2) {
      const safe = intent.cleanText.replace(/[,%()]/g, ' ').trim();
      pubQuery = pubQuery.or(`title.ilike.%${safe}%,headline.ilike.%${safe}%,full_name.ilike.%${safe}%`);
    }

    if (intent.filters.location) {
      pubQuery = pubQuery.ilike('location', `%${intent.filters.location.replace(/[,%()]/g, '')}%`);
    }

    const { data, error, count } = await pubQuery.range(offset, offset + limit - 1);
    if (error) throw error;

    const items: UniversalSearchItem[] = (data || []).map((p: any) => ({
      id: String(p.id),
      type: 'talent',
      title: p.full_name || 'Professional',
      subtitle: [p.title || p.headline, p.current_company, p.location].filter(Boolean).join(' • '),
      url: p.username ? `/u/${String(p.username).replace(/^@/, '')}` : `/u/${p.id}`,
      avatarUrl: p.profile_picture_url,
      badge: 'Public Profile',
      score: 9,
      matchReasons: [],
      createdAt: p.created_at,
      metadata: {
        location: p.location,
        skills: p.skills || [],
        experience_years: p.experience_years,
        industry: p.industry,
      },
    }));

    return {
      type: 'talent',
      items,
      totalCount: count ?? items.length,
      hasMore: (count ?? items.length) > offset + limit,
    };
  }
}
