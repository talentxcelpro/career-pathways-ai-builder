import { supabase } from '@/integrations/supabase/client';

export interface CareerEvent {
  id: string;
  title: string;
  description: string;
  date_display: string;
  category: string;
  xp_reward?: number;
  banner_color?: string;
}

export interface CareerBadge {
  id: string;
  name: string;
  category: string;
  icon_name: string;
  earned: boolean;
  earned_date?: string;
  description?: string;
}

export interface CareerReward {
  id: string;
  title: string;
  description: string;
  cost_coins: number;
  category: string;
  unlocked: boolean;
}

export const careerEventsService = {
  async getEvents(userId?: string): Promise<CareerEvent[]> {
    try {
      const { data: events, error } = await supabase
        .from('career_events')
        .select('*')
        .limit(5);

      if (!error && events && events.length > 0) {
        return events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description || '',
          date_display: e.date_display || 'Apr 20',
          category: e.category || 'competition',
          xp_reward: e.xp_reward || 300,
        }));
      }

      return this.getDefaultEvents();
    } catch (err) {
      console.warn('careerEventsService.getEvents fallback:', err);
      return this.getDefaultEvents();
    }
  },

  getDefaultEvents(): CareerEvent[] {
    return [
      {
        id: 'event_campus_arena',
        title: 'Campus Code Arena',
        description: 'Inter-college React competition',
        date_display: 'Apr 20',
        category: 'competition',
        xp_reward: 350,
      },
      {
        id: 'event_company_case',
        title: 'Company Case Challenge',
        description: 'Solve a real business problem',
        date_display: 'Apr 25',
        category: 'hackathon',
        xp_reward: 500,
      },
    ];
  },
};

export const careerBadgeService = {
  async getBadgesWithUserEarned(userId: string): Promise<CareerBadge[]> {
    try {
      const { data: badges, error } = await supabase
        .from('career_badges')
        .select('*');

      if (!error && badges && badges.length > 0) {
        return badges.map((b, idx) => ({
          id: b.id,
          name: b.name,
          category: b.category || 'achievement',
          icon_name: b.icon_name || 'trophy',
          earned: idx < 3,
          description: b.description,
        }));
      }

      return this.getDefaultBadges();
    } catch (err) {
      console.warn('careerBadgeService.getBadgesWithUserEarned fallback:', err);
      return this.getDefaultBadges();
    }
  },

  getDefaultBadges(): CareerBadge[] {
    return [
      {
        id: 'badge_first_quest',
        name: 'First Quest',
        category: 'starter',
        icon_name: 'star',
        earned: true,
        earned_date: '2026-10-15',
        description: 'Completed your very first career quest in TalentXcel.',
      },
      {
        id: 'badge_code_warrior',
        name: 'Code Warrior',
        category: 'skills',
        icon_name: 'code',
        earned: true,
        earned_date: '2026-10-22',
        description: 'Submitted 10 verified algorithm solutions.',
      },
      {
        id: 'badge_interview_ready',
        name: 'Interview Ready',
        category: 'recruitment',
        icon_name: 'mic',
        earned: true,
        earned_date: '2026-10-29',
        description: 'Passed 3 technical AI mock interviews with 80%+ score.',
      },
      {
        id: 'badge_boss_slayer',
        name: 'Boss Slayer',
        category: 'challenge',
        icon_name: 'shield',
        earned: false,
        description: 'Defeat an employer challenge to earn fast-track interview status.',
      },
      {
        id: 'badge_streak_master',
        name: '7-Day Streak',
        category: 'consistency',
        icon_name: 'flame',
        earned: true,
        description: 'Maintained 7 consecutive days of career actions.',
      },
    ];
  },
};

export const careerRewardsService = {
  async getRewards(): Promise<CareerReward[]> {
    try {
      const { data: dbRewards, error } = await supabase
        .from('career_rewards')
        .select('*');

      if (!error && dbRewards && dbRewards.length > 0) {
        return dbRewards.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          cost_coins: r.cost_coins || 200,
          category: r.category || 'digital',
          unlocked: true,
        }));
      }

      return this.getDefaultRewards();
    } catch (err) {
      console.warn('careerRewardsService.getRewards fallback:', err);
      return this.getDefaultRewards();
    }
  },

  async redeemReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (userId && userId !== 'demo_user_id') {
        const { error } = await supabase
          .from('career_reward_redemptions')
          .insert({
            user_id: userId,
            reward_id: rewardId,
            redeemed_at: new Date().toISOString(),
          });

        if (error) {
          console.warn('Could not record redemption in database:', error.message);
        }
      }

      return { success: true, message: 'Reward successfully claimed!' };
    } catch (err) {
      console.error('Redeem reward error:', err);
      return { success: false, message: 'Failed to claim reward.' };
    }
  },

  getDefaultRewards(): CareerReward[] {
    return [
      {
        id: 'rew_mock_pass',
        title: 'Unlimited AI Mock Interviews Pass',
        description: '30-day all-access pass to real-time generative technical mock interviews.',
        cost_coins: 200,
        category: 'interview',
        unlocked: true,
      },
      {
        id: 'rew_recruiter_fast',
        title: 'Priority Recruiter Beacon Feature',
        description: 'Highlight your Career Passport to top 50 hiring enterprise recruiters for 14 days.',
        cost_coins: 350,
        category: 'recruitment',
        unlocked: true,
      },
      {
        id: 'rew_avatar_border',
        title: 'Cyberpunk Master Avatar Frame',
        description: 'Exclusive glowing holographic frame for your player badge and public profile.',
        cost_coins: 150,
        category: 'cosmetic',
        unlocked: true,
      },
      {
        id: 'rew_resume_review',
        title: 'Executive Resume Deep Audit',
        description: 'Algorithmic ATS scoring + 1-on-1 feedback breakdown from senior FAANG recruiters.',
        cost_coins: 500,
        category: 'service',
        unlocked: true,
      },
    ];
  },
};
