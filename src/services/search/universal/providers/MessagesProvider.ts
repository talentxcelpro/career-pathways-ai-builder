import { supabase } from '@/integrations/supabase/client';
import type { SearchProviderContext, SearchProviderOutput, UniversalSearchItem, UniversalSearchProvider } from '../types';

/**
 * Private Messages Search Provider.
 * SECURITY:
 * - Never included in global/default search scopes.
 * - Requires authenticated `userContext.userId`.
 * - Strictly filters to `sender_id = userId OR recipient_id = userId`.
 * - Never exposes another user's private messages.
 */
export class MessagesProvider implements UniversalSearchProvider {
  readonly type = 'messages' as const;
  readonly label = 'My Messages';

  async search(ctx: SearchProviderContext): Promise<SearchProviderOutput> {
    const { intent, limit, page, userContext } = ctx;
    if (!userContext.userId) {
      return { type: 'messages', items: [], totalCount: 0, hasMore: false };
    }

    const uid = userContext.userId;
    const offset = (page - 1) * limit;
    const term = intent.cleanText.replace(/[,%()]/g, ' ').trim();

    if (!term || term.length < 2) {
      return { type: 'messages', items: [], totalCount: 0, hasMore: false };
    }

    const { data, error, count } = await supabase
      .from('direct_messages')
      .select('id, message_content, sender_id, recipient_id, created_at', { count: 'exact' })
      .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
      .ilike('message_content', `%${term}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const items: UniversalSearchItem[] = (data || []).map((m) => {
      const peerId = m.sender_id === uid ? m.recipient_id : m.sender_id;
      const snippet = (m.message_content || '').slice(0, 120);
      return {
        id: String(m.id),
        type: 'messages',
        title: snippet || 'Direct Message',
        subtitle: m.sender_id === uid ? 'Sent by you' : 'Received message',
        url: `/network/messages/${peerId}`,
        badge: 'Private',
        score: 10,
        matchReasons: ['Your conversation'],
        createdAt: m.created_at,
        metadata: { peer_id: peerId },
      };
    });

    return {
      type: 'messages',
      items,
      totalCount: count ?? items.length,
      hasMore: (count ?? items.length) > offset + limit,
    };
  }
}
