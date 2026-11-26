import { supabase } from '@/integrations/supabase/client';
import type { SearchProviderContext, SearchProviderOutput, UniversalSearchItem, UniversalSearchProvider } from '../types';

export class ArticlesProvider implements UniversalSearchProvider {
  readonly type = 'articles' as const;
  readonly label = 'Articles & Guides';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page } = ctx;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('content_hub')
      .select('id, title, excerpt, content_type, tags, publish_date, created_at', { count: 'exact' })
      .eq('status', 'published');

    const term = intent.keywords[0] || intent.cleanText;
    if (term && term.length >= 2) {
      const safe = term.replace(/[,%()]/g, ' ').trim();
      query = query.or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%,content.ilike.%${safe}%`);
    }

    const { data, error, count } = await query
      .order('publish_date', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const items: UniversalSearchItem[] = (data || []).map((a) => ({
      id: String(a.id),
      type: 'articles',
      title: a.title,
      subtitle: a.content_type || 'Article',
      snippet: a.excerpt ? String(a.excerpt).slice(0, 140) : undefined,
      url: `/resources/${a.id}`,
      badge: a.content_type || 'Guide',
      score: 10,
      matchReasons: [],
      createdAt: a.publish_date || a.created_at,
      metadata: { tags: a.tags || [] },
    }));

    return {
      type: 'articles',
      items,
      totalCount: count ?? items.length,
      hasMore: (count ?? items.length) > offset + limit,
    };
  }
}

export class CoursesProvider implements UniversalSearchProvider {
  readonly type = 'courses' as const;
  readonly label = 'Courses & Learning';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page } = ctx;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('courses')
      .select('id, title, description, category, difficulty_level, is_free, skills_taught, thumbnail_url, rating, enrolled_count, created_at', {
        count: 'exact',
      })
      .eq('is_active', true)
      .eq('published', true);

    const term = intent.entities.skills[0] || intent.keywords[0] || intent.cleanText;
    if (term && term.length >= 2) {
      const safe = term.replace(/[,%()]/g, ' ').trim();
      query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`);
    }

    if (intent.filters.isFree !== undefined) {
      query = query.eq('is_free', intent.filters.isFree);
    }

    const { data, error, count } = await query
      .order('enrolled_count', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const items: UniversalSearchItem[] = (data || []).map((c) => ({
      id: String(c.id),
      type: 'courses',
      title: c.title,
      subtitle: [c.category, c.difficulty_level, c.is_free ? 'Free' : null].filter(Boolean).join(' • '),
      snippet: c.description ? String(c.description).slice(0, 140) : undefined,
      url: `/learning/courses/${c.id}`,
      avatarUrl: c.thumbnail_url,
      badge: c.is_free ? 'Free' : c.difficulty_level || 'Course',
      score: 10,
      matchReasons: [],
      createdAt: c.created_at,
      metadata: { skills: c.skills_taught || [], rating: c.rating },
    }));

    return {
      type: 'courses',
      items,
      totalCount: count ?? items.length,
      hasMore: (count ?? items.length) > offset + limit,
    };
  }
}

export class ReelsProvider implements UniversalSearchProvider {
  readonly type = 'reels' as const;
  readonly label = 'Reels & Videos';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page } = ctx;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reels')
      .select('id, title, description, tags, thumbnail_url, views_count, likes_count, published_at, created_at', {
        count: 'exact',
      })
      .eq('status', 'published');

    const term = intent.keywords[0] || intent.cleanText;
    if (term && term.length >= 2) {
      const safe = term.replace(/[,%()]/g, ' ').trim();
      query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
    }

    const { data, error, count } = await query
      .order('views_count', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const items: UniversalSearchItem[] = (data || []).map((r) => ({
      id: String(r.id),
      type: 'reels',
      title: r.title || 'Career Reel',
      subtitle: `${r.views_count || 0} views • ${r.likes_count || 0} likes`,
      snippet: r.description ? String(r.description).slice(0, 140) : undefined,
      url: `/reels/${r.id}`,
      avatarUrl: r.thumbnail_url,
      badge: 'Reel',
      score: 9,
      matchReasons: [],
      createdAt: r.published_at || r.created_at,
      metadata: { tags: r.tags || [] },
    }));

    return {
      type: 'reels',
      items,
      totalCount: count ?? items.length,
      hasMore: (count ?? items.length) > offset + limit,
    };
  }
}

export class CollegesProvider implements UniversalSearchProvider {
  readonly type = 'colleges' as const;
  readonly label = 'Colleges';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page } = ctx;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('colleges')
      .select('id, name, location, type, logo_url, rating, placement_percentage, created_at', { count: 'exact' });

    const term = intent.keywords[0] || intent.cleanText;
    if (term && term.length >= 2) {
      const safe = term.replace(/[,%()]/g, ' ').trim();
      query = query.or(`name.ilike.%${safe}%,location.ilike.%${safe}%`);
    }
    if (intent.filters.location) {
      query = query.ilike('location', `%${intent.filters.location.replace(/[,%()]/g, '')}%`);
    }

    const { data, error, count } = await query
      .order('rating', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const items: UniversalSearchItem[] = (data || []).map((c) => ({
      id: String(c.id),
      type: 'colleges',
      title: c.name,
      subtitle: [c.type, c.location, c.placement_percentage ? `${c.placement_percentage}% placement` : null]
        .filter(Boolean)
        .join(' • '),
      url: `/colleges/${c.id}`,
      avatarUrl: c.logo_url,
      badge: c.type || 'College',
      score: 9,
      matchReasons: [],
      createdAt: c.created_at,
      metadata: { location: c.location },
    }));

    return {
      type: 'colleges',
      items,
      totalCount: count ?? items.length,
      hasMore: (count ?? items.length) > offset + limit,
    };
  }
}
