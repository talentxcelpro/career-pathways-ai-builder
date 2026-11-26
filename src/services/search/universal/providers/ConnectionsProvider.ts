import { supabase } from '@/integrations/supabase/client';
import type { SearchProviderContext, SearchProviderOutput, UniversalSearchItem, UniversalSearchProvider } from '../types';

/**
 * Connections & Network Relationship Search Provider.
 * SECURITY: Strictly scoped to the authenticated user (`userContext.userId`).
 * Unauthenticated users receive an empty result set.
 */
export class ConnectionsProvider implements UniversalSearchProvider {
  readonly type = 'connections' as const;
  readonly label = 'My Network';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, userContext } = ctx;
    if (!userContext.userId) {
      return { type: 'connections', items: [], totalCount: 0, hasMore: false };
    }

    const uid = userContext.userId;
    const rel = intent.filters.relationship || 'connections';

    if (rel === 'following' || rel === 'followers') {
      const col = rel === 'following' ? 'follower_id' : 'followed_id';
      const targetCol = rel === 'following' ? 'followed_id' : 'follower_id';
      const { data: followRows, error } = await supabase
        .from('follows')
        .select('follower_id, followed_id')
        .eq(col, uid)
        .limit(100);

      if (error) throw error;
      const ids = Array.from(new Set((followRows || []).map((r: any) => r[targetCol]).filter(Boolean)));
      return this.fetchPublicProfilesByIds(ids, intent.cleanText, intent.filters.location, limit, rel === 'following' ? 'Following' : 'Follower');
    }

    // Connections or pending requests
    const statusFilter = rel === 'pending_requests' ? 'pending' : 'accepted';
    let connQuery = supabase
      .from('connections')
      .select('requester_id, recipient_id, user_id, connected_user_id, status')
      .eq('status', statusFilter);

    if (rel === 'pending_requests') {
      connQuery = connQuery.eq('recipient_id', uid);
    } else {
      connQuery = connQuery.or(`requester_id.eq.${uid},recipient_id.eq.${uid},user_id.eq.${uid}`);
    }

    const { data: connRows, error } = await connQuery.limit(150);
    if (error) throw error;

    const connectedIds = new Set<string>();
    (connRows || []).forEach((c: any) => {
      [c.requester_id, c.recipient_id, c.user_id, c.connected_user_id].forEach((id) => {
        if (id && id !== uid) connectedIds.add(id);
      });
    });

    if (rel === 'not_connected') {
      // Find public profiles not in connectedIds
      let pubQuery = (supabase as any)
        .from('public_profiles')
        .select('id, full_name, username, title, headline, location, profile_picture_url, skills, industry, current_company, created_at')
        .neq('id', uid)
        .not('full_name', 'is', null)
        .limit(limit * 2);

      if (intent.cleanText.length >= 2) {
        const safe = intent.cleanText.replace(/[,%()]/g, ' ').trim();
        pubQuery = pubQuery.or(`full_name.ilike.%${safe}%,title.ilike.%${safe}%,current_company.ilike.%${safe}%`);
      }

      const { data: profiles, error: pErr } = await pubQuery;
      if (pErr) throw pErr;

      const items: UniversalSearchItem[] = (profiles || [])
        .filter((p: any) => !connectedIds.has(p.id))
        .slice(0, limit)
        .map((p: any) => ({
          id: String(p.id),
          type: 'connections',
          title: p.full_name || 'Professional',
          subtitle: [p.title || p.headline, p.current_company, p.location].filter(Boolean).join(' • '),
          url: p.username ? `/u/${String(p.username).replace(/^@/, '')}` : `/u/${p.id}`,
          avatarUrl: p.profile_picture_url,
          badge: 'Not Connected',
          score: 10,
          matchReasons: ['Not yet connected'],
          createdAt: p.created_at,
          metadata: { location: p.location, skills: p.skills || [], industry: p.industry },
        }));

      return { type: 'connections', items, totalCount: items.length, hasMore: false };
    }

    return this.fetchPublicProfilesByIds(
      Array.from(connectedIds),
      intent.cleanText,
      intent.filters.location,
      limit,
      rel === 'pending_requests' ? 'Pending Request' : 'Connected'
    );
  }

  private async fetchPublicProfilesByIds(
    ids: string[],
    cleanText: string,
    locationFilter: string | undefined,
    limit: number,
    badge: string
  ): Promise<SearchProviderOutput> {
    if (ids.length === 0) {
      return { type: 'connections', items: [], totalCount: 0, hasMore: false };
    }

    let query = (supabase as any)
      .from('public_profiles')
      .select('id, full_name, username, title, headline, location, profile_picture_url, skills, industry, current_company, created_at')
      .in('id', ids.slice(0, 100));

    if (locationFilter) {
      query = query.ilike('location', `%${locationFilter.replace(/[,%()]/g, '')}%`);
    }

    const { data, error } = await query.limit(limit * 2);
    if (error) throw error;

    const termLower = cleanText.toLowerCase();
    const filtered = (data || []).filter((p: any) => {
      if (!termLower || termLower.length < 2) return true;
      const blob = `${p.full_name || ''} ${p.title || ''} ${p.headline || ''} ${p.current_company || ''} ${p.industry || ''} ${(p.skills || []).join(' ')}`.toLowerCase();
      return termLower.split(/\s+/).some((t) => t.length >= 2 && blob.includes(t));
    });

    const items: UniversalSearchItem[] = filtered.slice(0, limit).map((p: any) => ({
      id: String(p.id),
      type: 'connections',
      title: p.full_name || 'Connection',
      subtitle: [p.title || p.headline, p.current_company, p.location].filter(Boolean).join(' • '),
      url: p.username ? `/u/${String(p.username).replace(/^@/, '')}` : `/u/${p.id}`,
      avatarUrl: p.profile_picture_url,
      badge,
      score: 15,
      matchReasons: [badge],
      createdAt: p.created_at,
      metadata: { location: p.location, skills: p.skills || [], industry: p.industry },
    }));

    return {
      type: 'connections',
      items,
      totalCount: items.length,
      hasMore: filtered.length > limit,
    };
  }
}
