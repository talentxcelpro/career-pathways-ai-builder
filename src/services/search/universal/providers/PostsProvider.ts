import { supabase } from '@/integrations/supabase/client';
import type { SearchProviderContext, SearchProviderOutput, UniversalSearchItem, UniversalSearchProvider } from '../types';

export class PostsProvider implements UniversalSearchProvider {
  readonly type = 'posts' as const;
  readonly label = 'Posts & Discussions';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page, userContext } = ctx;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(
        'id, headline, content, tags, hashtags, post_type, location, likes_count, comments_count, created_at, author_id, user_id',
        { count: 'exact' }
      )
      .eq('status', 'published')
      .eq('is_deleted', false)
      .eq('is_public', true);

    // If "posts shared by my connections", restrict to accepted connections of userContext.userId
    if (intent.filters.relationship === 'connections') {
      if (!userContext.userId) {
        return { type: 'posts', items: [], totalCount: 0, hasMore: false };
      }
      const { data: connRows } = await supabase
        .from('connections')
        .select('requester_id, recipient_id, user_id, connected_user_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userContext.userId},recipient_id.eq.${userContext.userId},user_id.eq.${userContext.userId}`);

      const friendIds = new Set<string>();
      (connRows || []).forEach((c: any) => {
        [c.requester_id, c.recipient_id, c.user_id, c.connected_user_id].forEach((id) => {
          if (id && id !== userContext.userId) friendIds.add(id);
        });
      });

      if (friendIds.size === 0) {
        return { type: 'posts', items: [], totalCount: 0, hasMore: false };
      }
      query = query.in('user_id', Array.from(friendIds));
    }

    // Time range filter
    if (intent.filters.timeRange) {
      const hours =
        intent.filters.timeRange === '24h'
          ? 24
          : intent.filters.timeRange === '7d'
            ? 24 * 7
            : intent.filters.timeRange === '30d'
              ? 24 * 30
              : 24 * 90;
      const sinceIso = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', sinceIso);
    }

    // Text filter
    const searchTerms = [...intent.entities.skills, ...intent.keywords].filter((t) => t.length >= 2);
    const term = searchTerms[0] || intent.cleanText;
    if (term && term.length >= 2) {
      const safe = term.replace(/[,%()]/g, ' ').trim();
      query = query.or(`headline.ilike.%${safe}%,content.ilike.%${safe}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const items: UniversalSearchItem[] = (data || []).map((post) => {
      const snippet = (post.content || '').slice(0, 160);
      const title = post.headline || (snippet ? `${snippet.slice(0, 72)}${snippet.length > 72 ? '...' : ''}` : 'Community Post');
      return {
        id: String(post.id),
        type: 'posts',
        title,
        subtitle: `${post.likes_count || 0} likes • ${post.comments_count || 0} comments`,
        snippet,
        url: `/network/posts/${post.id}`,
        badge: post.post_type || 'Post',
        score: 8 + Math.min(10, (post.likes_count || 0) * 0.2),
        matchReasons: [],
        createdAt: post.created_at,
        metadata: {
          tags: post.tags || post.hashtags || [],
          location: post.location,
          likes_count: post.likes_count,
          comments_count: post.comments_count,
        },
      };
    });

    return {
      type: 'posts',
      items,
      totalCount: count ?? items.length,
      hasMore: (count ?? items.length) > offset + limit,
    };
  }
}
