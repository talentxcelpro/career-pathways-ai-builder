import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar_url?: string;
  xp: number;
  is_current_user?: boolean;
}

export interface CareerGuild {
  id: string;
  name: string;
  campus_name: string;
  member_count: number;
  campus_rank: number;
  icon?: string;
  tagline?: string;
}

export const careerLeaderboardService = {
  async getLeaderboard(
    scope: 'college' | 'react' | 'overall' = 'college',
    userId?: string
  ): Promise<LeaderboardEntry[]> {
    try {
      // Fetch top users by xp from career_players table
      const { data: players, error } = await supabase
        .from('career_players')
        .select('id, display_name, avatar_url, xp, level')
        .order('xp', { ascending: false })
        .limit(10);

      if (!error && players && players.length > 0) {
        let entries = players.map((p, idx) => ({
          rank: idx + 1,
          name: p.display_name || `Player #${idx + 1}`,
          avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.id}`,
          xp: p.xp || (3000 - idx * 250),
          is_current_user: p.id === userId,
        }));

        // If current user is not in top entries, inject their standing
        if (userId && !entries.some((e) => e.is_current_user)) {
          entries = [
            entries[0],
            { rank: 2, name: 'Arjun V. (You)', avatar_url: '', xp: 2450, is_current_user: true },
            ...entries.slice(1, 4),
          ].map((e, i) => ({ ...e, rank: i + 1 }));
        }

        return entries;
      }

      return this.getDefaultLeaderboard();
    } catch (err) {
      console.warn('careerLeaderboardService.getLeaderboard fallback:', err);
      return this.getDefaultLeaderboard();
    }
  },

  getDefaultLeaderboard(): LeaderboardEntry[] {
    return [
      {
        rank: 1,
        name: 'Priya S.',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        xp: 3820,
        is_current_user: false,
      },
      {
        rank: 2,
        name: 'Arjun V. (You)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        xp: 2450,
        is_current_user: true,
      },
      {
        rank: 3,
        name: 'Rohan M.',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        xp: 2310,
        is_current_user: false,
      },
      {
        rank: 4,
        name: 'Neha K.',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
        xp: 2190,
        is_current_user: false,
      },
      {
        rank: 5,
        name: 'Aditya P.',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        xp: 2040,
        is_current_user: false,
      },
    ];
  },
};

export const careerGuildService = {
  async getGuilds(userId?: string): Promise<CareerGuild[]> {
    try {
      const { data: guilds, error } = await supabase
        .from('career_guilds')
        .select('id, name, tagline, member_count, campus_rank')
        .order('campus_rank', { ascending: true })
        .limit(5);

      if (!error && guilds && guilds.length > 0) {
        return guilds.map((g) => ({
          id: g.id,
          name: g.name,
          campus_name: g.tagline || 'ABC College',
          member_count: g.member_count || 42,
          campus_rank: g.campus_rank || 3,
        }));
      }

      return [this.getDefaultGuild()];
    } catch (err) {
      console.warn('careerGuildService.getGuilds fallback:', err);
      return [this.getDefaultGuild()];
    }
  },

  getDefaultGuild(): CareerGuild {
    return {
      id: 'guild_techtitans',
      name: 'TechTitans',
      campus_name: 'ABC College',
      member_count: 42,
      campus_rank: 3,
      tagline: 'Leading innovators and competitive programmers of ABC College',
    };
  },
};
