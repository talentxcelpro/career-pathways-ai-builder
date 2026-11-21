import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  conversionRate: number;
  totalRewards: number;
  currentStreak: number;
  bestStreak: number;
}

export interface ReferralActivity {
  id: string;
  type: 'referral_sent' | 'referral_completed' | 'reward_earned';
  description: string;
  timestamp: string;
  reward?: number;
  metadata?: any;
}

export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward: string;
  unlockedAt?: string;
}

export const useReferralData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    conversionRate: 0,
    totalRewards: 0,
    currentStreak: 0,
    bestStreak: 0
  });
  const [activities, setActivities] = useState<ReferralActivity[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's referral statistics with direct user_referrals query
  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      const { data: userRef, error: refError } = await supabase
        .from('user_referrals')
        .select('id, referral_code, total_referrals, successful_referrals, pending_rewards, total_rewards_earned')
        .eq('referrer_id', user.id)
        .maybeSingle();

      if (refError) {
        console.warn('Notice in fetchStats:', refError);
        return;
      }

      const total = userRef?.total_referrals || 0;
      const successful = userRef?.successful_referrals || 0;
      const pending = Math.max(0, total - successful);
      const totalRewards = userRef?.total_rewards_earned || (successful * 1000);

      setStats({
        totalReferrals: total,
        successfulReferrals: successful,
        pendingReferrals: pending,
        conversionRate: total > 0 ? (successful / total) * 100 : 0,
        totalRewards,
        currentStreak: total > 0 ? 1 : 0,
        bestStreak: total > 0 ? 1 : 0
      });
    } catch (error) {
      console.warn('Notice in fetchStats (graceful fallback):', error);
    }
  };

  // Fetch recent activities
  const fetchActivities = async () => {
    if (!user?.id) return;

    try {
      const { data: uRefs } = await supabase
        .from('user_referrals')
        .select('id, created_at, referral_code, successful_referrals')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const referralActivities: ReferralActivity[] = [];

      if (uRefs && uRefs.length > 0) {
        uRefs.forEach(ref => {
          referralActivities.push({
            id: `join-${ref.id}`,
            type: 'referral_completed',
            description: 'Peer accepted your invitation and joined TalentXcel!',
            timestamp: ref.created_at,
            reward: 1000
          });
        });
      }

      setActivities(referralActivities);
    } catch (error) {
      console.warn('Notice in fetchActivities (graceful fallback):', error);
    }
  };

  // Fetch and calculate achievements
  const fetchAchievements = () => {
    if (!user) return;

    const baseAchievements: UserAchievement[] = [
      {
        id: 'first-referral',
        title: 'First Steps',
        description: 'Complete your first referral',
        icon: '🎯',
        rarity: 'common',
        progress: Math.min(stats.successfulReferrals, 1),
        maxProgress: 1,
        unlocked: stats.successfulReferrals >= 1,
        reward: '500 TXC'
      },
      {
        id: 'social-butterfly',
        title: 'Social Butterfly',
        description: 'Get 5 successful referrals',
        icon: '🦋',
        rarity: 'rare',
        progress: Math.min(stats.successfulReferrals, 5),
        maxProgress: 5,
        unlocked: stats.successfulReferrals >= 5,
        reward: '1,500 TXC'
      },
      {
        id: 'streak-master',
        title: 'Streak Master',
        description: 'Maintain a 7-day referral streak',
        icon: '⚡',
        rarity: 'epic',
        progress: Math.min(stats.currentStreak, 7),
        maxProgress: 7,
        unlocked: stats.currentStreak >= 7,
        reward: '5,000 TXC + Special Badge'
      },
      {
        id: 'network-legend',
        title: 'Network Legend',
        description: 'Get 25 successful referrals',
        icon: '👑',
        rarity: 'legendary',
        progress: Math.min(stats.successfulReferrals, 25),
        maxProgress: 25,
        unlocked: stats.successfulReferrals >= 25,
        reward: '3-Month Pro + Exclusive Tools'
      },
      {
        id: 'conversion-king',
        title: 'Conversion King',
        description: 'Achieve 80% conversion rate with 10+ referrals',
        icon: '🏆',
        rarity: 'epic',
        progress: stats.totalReferrals >= 10 && stats.conversionRate >= 80 ? 1 : 0,
        maxProgress: 1,
        unlocked: stats.totalReferrals >= 10 && stats.conversionRate >= 80,
        reward: '10,000 TXC + Conversion Badge'
      }
    ];

    setAchievements(baseAchievements);
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    await fetchStats();
    await fetchActivities();
    setLoading(false);
  };

  // Update achievements when stats change
  useEffect(() => {
    fetchAchievements();
  }, [stats]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Realtime subscription on referrals, user_referrals, and txc_transactions
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('referrals-multi-realtime-' + user.id)
      // Dropped referrals CDC listener removed
      // user_referrals not in publication
      .on('postgres_changes', { event: '*', schema: 'public', table: 'txc_transactions', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const refreshData = () => fetchData();

  return {
    stats,
    activities,
    achievements,
    loading,
    refreshData
  };
};
