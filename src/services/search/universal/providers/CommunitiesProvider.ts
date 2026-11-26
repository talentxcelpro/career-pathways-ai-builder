import { supabase } from '@/integrations/supabase/client';
import type { SearchProviderContext, SearchProviderOutput, UniversalSearchItem, UniversalSearchProvider } from '../types';

export class CommunitiesProvider implements UniversalSearchProvider {
  readonly type = 'communities' as const;
  readonly label = 'Communities';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page } = ctx;
    const offset = (page - 1) * limit;

    const term = intent.keywords[0] || intent.cleanText;
    const safe = term ? term.replace(/[,%()]/g, ' ').trim() : '';

    let groupsQuery = supabase
      .from('groups')
      .select('id, name, description, category, member_count, cover_image_url, created_at', { count: 'exact' })
      .eq('is_public', true);

    if (safe.length >= 2) {
      groupsQuery = groupsQuery.or(`name.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`);
    }

    let goalQuery = supabase
      .from('goal_communities')
      .select('id, name, description, goal_type, member_count, tags, cover_image_url, created_at', { count: 'exact' })
      .eq('is_active', true);

    if (safe.length >= 2) {
      goalQuery = goalQuery.or(`name.ilike.%${safe}%,description.ilike.%${safe}%,goal_type.ilike.%${safe}%`);
    }

    const [groupsRes, goalRes] = await Promise.all([
      groupsQuery.order('member_count', { ascending: false, nullsFirst: false }).range(offset, offset + limit - 1),
      goalQuery.order('member_count', { ascending: false, nullsFirst: false }).range(offset, offset + Math.max(2, Math.floor(limit / 2)) - 1),
    ]);

    const items: UniversalSearchItem[] = [];

    if (!groupsRes.error && groupsRes.data) {
      for (const g of groupsRes.data) {
        items.push({
          id: `group-${g.id}`,
          type: 'communities',
          title: g.name,
          subtitle: `${g.category || 'Community'} • ${g.member_count || 0} members`,
          snippet: g.description ? String(g.description).slice(0, 140) : undefined,
          url: `/communities?group=${g.id}`,
          avatarUrl: g.cover_image_url,
          badge: g.category || 'Group',
          score: 10 + Math.min(10, (g.member_count || 0) * 0.05),
          matchReasons: [],
          createdAt: g.created_at,
          metadata: { member_count: g.member_count, category: g.category },
        });
      }
    }

    if (!goalRes.error && goalRes.data) {
      for (const gc of goalRes.data) {
        items.push({
          id: `goal-${gc.id}`,
          type: 'communities',
          title: gc.name,
          subtitle: `${gc.goal_type || 'Goal Community'} • ${gc.member_count || 0} members`,
          snippet: gc.description ? String(gc.description).slice(0, 140) : undefined,
          url: `/communities?goal=${gc.id}`,
          avatarUrl: gc.cover_image_url,
          badge: gc.goal_type || 'Community',
          score: 10 + Math.min(10, (gc.member_count || 0) * 0.05),
          matchReasons: [],
          createdAt: gc.created_at,
          metadata: { member_count: gc.member_count, tags: gc.tags || [] },
        });
      }
    }

    const total = (groupsRes.count || 0) + (goalRes.count || 0);
    return {
      type: 'communities',
      items: items.slice(0, limit),
      totalCount: total || items.length,
      hasMore: total > offset + limit,
    };
  }
}
