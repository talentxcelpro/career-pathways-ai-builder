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
  type: 'referral_sent' | 'referral_completed' | 'reward_earned' | 'milestone_reached';
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

  // Fetch user's referral statistics
  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get referral counts
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('status, reward_amount, completed_at')
        .eq('referrer_id', user.id);

      if (refError) throw refError;

      const total = referrals?.length || 0;
      const successful = referrals?.filter(r => r.status === 'completed').length || 0;
      const pending = referrals?.filter(r => r.status === 'pending').length || 0;
      const totalRewards = referrals?.filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0;

      // Calculate streak (simplified - consecutive days with referrals)
      const completedReferrals = referrals?.filter(r => r.status === 'completed' && r.completed_at)
        .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()) || [];

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      if (completedReferrals.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const ref of completedReferrals) {
          const refDate = new Date(ref.completed_at!);
          refDate.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.floor((today.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff <= tempStreak + 1) {
            tempStreak++;
            if (daysDiff <= 1) currentStreak = tempStreak;
          } else {
            if (tempStreak > bestStreak) bestStreak = tempStreak;
            tempStreak = 1;
          }
        }
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      }

      setStats({
        totalReferrals: total,
        successfulReferrals: successful,
        pendingReferrals: pending,
        conversionRate: total > 0 ? (successful / total) * 100 : 0,
        totalRewards,
        currentStreak,
        bestStreak
      });

    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  // Fetch recent activities
  const fetchActivities = async () => {
    if (!user) return;

    try {
      // Get referral activities
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('id, status, reward_amount, created_at, completed_at, referral_code')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (refError) throw refError;

      const referralActivities: ReferralActivity[] = [];

      referrals?.forEach(ref => {
        // Referral sent activity
        referralActivities.push({
          id: `sent-${ref.id}`,
          type: 'referral_sent',
          description: `Shared referral code: ${ref.referral_code}`,
          timestamp: ref.created_at
        });

        // Referral completed activity
        if (ref.status === 'completed' && ref.completed_at) {
          referralActivities.push({
            id: `completed-${ref.id}`,
            type: 'referral_completed',
            description: 'Someone joined using your referral link!',
            timestamp: ref.completed_at,
            reward: ref.reward_amount
          });
        }
      });

      // Sort by timestamp
      referralActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(referralActivities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Fetch and calculate achievements
  const fetchAchievements = async () => {
    if (!user) return;

    try {
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

    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
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
    if (stats.totalReferrals > 0 || stats.successfulReferrals > 0) {
      fetchAchievements();
    }
  }, [stats]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const refreshData = () => fetchData();

  return {
    stats,
    activities,
    achievements,
    loading,
    refreshData
  };
};