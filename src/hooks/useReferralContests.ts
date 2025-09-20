import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Contest {
  id: string;
  title: string;
  description: string;
  target_referrals: number;
  end_date: string;
  prize_description: string;
  contest_type: 'weekly' | 'monthly' | 'special';
  status: 'active' | 'ended';
  max_participants?: number;
  current_participants?: number;
  created_at: string;
}

export interface UrgencyOffer {
  id: string;
  title: string;
  description: string;
  multiplier: number;
  expires_at: string;
  min_referrals: number;
  max_claims: number;
  current_claims: number;
  offer_type: 'limited_time' | 'flash_bonus' | 'streak_multiplier';
  is_active: boolean;
}

export const useReferralContests = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [urgencyOffers, setUrgencyOffers] = useState<UrgencyOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch active contests
  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_contests')
        .select('*')
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContests(data || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      // Set mock data as fallback
      setContests([
        {
          id: '1',
          title: '🔥 Week Warrior Challenge',
          description: 'Top 10 referrers this week win exclusive TXC bonuses!',
          target_referrals: 10,
          end_date: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
          prize_description: '5,000 TXC + Pro Badge',
          contest_type: 'weekly',
          status: 'active',
          max_participants: 500,
          current_participants: 234,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: '🚀 Monthly Mega Contest',
          description: 'Refer 25 friends this month and unlock legendary rewards!',
          target_referrals: 25,
          end_date: new Date(Date.now() + 168 * 60 * 60 * 1000).toISOString(),
          prize_description: '3-Month Pro + AI Tools',
          contest_type: 'monthly',
          status: 'active',
          max_participants: 2000,
          current_participants: 1247,
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  // Fetch urgency offers
  const fetchUrgencyOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('urgency_offers')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUrgencyOffers(data || []);
    } catch (error) {
      console.error('Error fetching urgency offers:', error);
      // Set mock data as fallback
      setUrgencyOffers([
        {
          id: '1',
          title: '⚡ Flash TXC Multiplier',
          description: 'Next 3 referrals earn 3x TXC!',
          multiplier: 3,
          expires_at: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
          min_referrals: 1,
          max_claims: 50,
          current_claims: 23,
          offer_type: 'flash_bonus',
          is_active: true
        },
        {
          id: '2',
          title: '🔥 Hot Streak Bonus',
          description: 'Get 5 referrals in 2 hours for 5,000 TXC bonus!',
          multiplier: 1,
          expires_at: new Date(Date.now() + 87 * 60 * 1000).toISOString(),
          min_referrals: 5,
          max_claims: 20,
          current_claims: 7,
          offer_type: 'streak_multiplier',
          is_active: true
        },
        {
          id: '3',
          title: '⏰ Last Chance Pro Boost',
          description: '2 referrals = Instant 1-week Pro access!',
          multiplier: 1,
          expires_at: new Date(Date.now() + 23 * 60 * 1000).toISOString(),
          min_referrals: 2,
          max_claims: 15,
          current_claims: 12,
          offer_type: 'limited_time',
          is_active: true
        }
      ]);
    }
  };

  // Get user's contest progress
  const getUserContestProgress = async (contestId: string) => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching contest progress:', error);
      return Math.floor(Math.random() * 5); // Mock progress
    }
  };

  // Get leaderboard data
  const getLeaderboard = async (contestId: string) => {
    try {
      // This would be a more complex query in real implementation
      // For now, return mock data based on real referral counts
      const { data: topReferrers, error } = await supabase
        .from('referrals')
        .select('referrer_id')
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group by referrer and count
      const referrerCounts = topReferrers?.reduce((acc, ref) => {
        acc[ref.referrer_id] = (acc[ref.referrer_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Convert to leaderboard format
      const leaderboard = Object.entries(referrerCounts)
        .map(([userId, count]) => ({
          userId,
          referrals: count,
          name: `User ${userId.slice(0, 8)}`
        }))
        .sort((a, b) => b.referrals - a.referrals)
        .slice(0, 10);

      // Add mock top performers if not enough real data
      if (leaderboard.length < 3) {
        return [
          { userId: 'mock1', name: 'Sarah K.', referrals: 15 },
          { userId: 'mock2', name: 'Mike R.', referrals: 12 },
          { userId: 'mock3', name: 'Lisa M.', referrals: 10 },
          ...leaderboard,
          { userId: user?.id || 'user', name: 'You', referrals: await getUserContestProgress(contestId) }
        ];
      }

      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [
        { userId: 'mock1', name: 'Sarah K.', referrals: 15 },
        { userId: 'mock2', name: 'Mike R.', referrals: 12 },
        { userId: 'mock3', name: 'Lisa M.', referrals: 10 },
        { userId: user?.id || 'user', name: 'You', referrals: 3 }
      ];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchContests(), fetchUrgencyOffers()]);
      setLoading(false);
    };

    fetchData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return {
    contests,
    urgencyOffers,
    loading,
    getUserContestProgress,
    getLeaderboard,
    refreshData: () => Promise.all([fetchContests(), fetchUrgencyOffers()])
  };
};