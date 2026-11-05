import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardPlayer {
  id: string;
  display_name: string;
  avatar_url: string | null;
  career_title: string;
  college: string;
  xp: number;
  level: number;
  rank: number;
  is_current_user: boolean;
}

export interface CampusGuild {
  id: string;
  name: string;
  college: string;
  description: string;
  badge_icon: string;
  member_count: number;
  campus_rank: number;
}

export class CareerLeaderboardService {
  static async getLeaderboard(
    tab: 'college' | 'react' | 'overall',
    currentUserId?: string,
    userCollege?: string
  ): Promise<LeaderboardPlayer[]> {
    let query = supabase
      .from('career_players' as any)
      .select('id, display_name, avatar_url, career_title, college, xp, level')
      .eq('is_public', true)
      .eq('is_activated', true)
      .gt('xp', 0)
      .order('xp', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20);

    if (tab === 'college' && userCollege && userCollege !== 'General') {
      query = query.eq('college', userCollege);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }

    const players = (data || []) as any[];

    // Calculate ranking and check if current user is present
    let result = players.map((p, idx) => ({
      id: p.id,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      career_title: p.career_title,
      college: p.college,
      xp: p.xp,
      level: p.level,
      rank: idx + 1,
      is_current_user: currentUserId ? p.id === currentUserId : false
    }));

    // If current user is logged in but not in top 20, fetch their rank and position
    if (currentUserId && currentUserId !== 'guest' && !result.some(p => p.is_current_user)) {
      const { data: userProfile } = await supabase
        .from('career_players' as any)
        .select('id, display_name, avatar_url, career_title, college, xp, level')
        .eq('id', currentUserId)
        .maybeSingle();

      if (userProfile) {
        const up = userProfile as any;
        const { count } = await supabase
          .from('career_players' as any)
          .select('id', { count: 'exact', head: true })
          .gt('xp', up.xp);

        result.push({
          id: up.id,
          display_name: `${up.display_name} (You)`,
          avatar_url: up.avatar_url,
          career_title: up.career_title,
          college: up.college,
          xp: up.xp,
          level: up.level,
          rank: (count || 0) + 1,
          is_current_user: true
        });
      }
    }

    return result;
  }

  static async getCampusGuild(guildId?: string | null): Promise<CampusGuild | null> {
    let query = supabase
      .from('career_guilds' as any)
      .select('*')
      .order('campus_rank', { ascending: true })
      .limit(1);

    if (guildId) {
      query = supabase.from('career_guilds' as any).select('*').eq('id', guildId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.warn('Error fetching guild:', error);
      return null;
    }
    return data as CampusGuild | null;
  }

  /**
   * Dedicated roster query for recently registered players with public visibility.
   * Completely decoupled from the competitive earned-XP leaderboard.
   */
  static async getRecentlyJoined(limit: number = 6): Promise<LeaderboardPlayer[]> {
    try {
      const { data, error } = await supabase
        .from('career_players' as any)
        .select('id, display_name, avatar_url, career_title, college, xp, level, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recently joined players:', error);
        return [];
      }

      return (data || []).map((p: any, idx: number) => ({
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        career_title: p.career_title,
        college: p.college || '',
        xp: p.xp || 0,
        level: p.level || 1,
        rank: idx + 1,
        is_current_user: false
      }));
    } catch (err) {
      console.error('getRecentlyJoined exception:', err);
      return [];
    }
  }

}
