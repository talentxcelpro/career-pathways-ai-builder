const fs = require('fs');
const filePath = 'src/services/careerverse/careerLeaderboardService.ts';
let code = fs.readFileSync(filePath, 'utf8');

// Replace query in getLeaderboard
const oldQuery = `    let query = supabase
      .from('career_players' as any)
      .select('id, display_name, avatar_url, career_title, college, xp, level')
      .order('xp', { ascending: false })
      .limit(20);`;

const newQuery = `    let query = supabase
      .from('career_players' as any)
      .select('id, display_name, avatar_url, career_title, college, xp, level')
      .eq('is_public', true)
      .eq('is_activated', true)
      .gt('xp', 0)
      .order('xp', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20);`;

code = code.replace(oldQuery.replace(/\r?\n/g, '\r\n'), newQuery.replace(/\r?\n/g, '\r\n'));

// Add getRecentlyJoined method before the closing brace of CareerLeaderboardService
const addition = `
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
`;

// Insert before the last closing brace
const lastIndex = code.lastIndexOf('}');
code = code.slice(0, lastIndex) + addition + '\r\n}\r\n';

fs.writeFileSync(filePath, code, 'utf8');
console.log('careerLeaderboardService.ts updated successfully.');
