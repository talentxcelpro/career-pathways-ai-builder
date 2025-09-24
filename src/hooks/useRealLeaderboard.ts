import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LeaderboardUser {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  achievements_count: number;
  txc_balance: number;
  rank: number;
  badge_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  last_activity: string;
}

export interface UserRanking {
  rank: number;
  total_users: number;
  percentile: number;
  points_to_next: number;
  next_rank_points: number;
}

export function useRealLeaderboard(category: string = 'points', timeFilter: string = 'all') {
  const { user } = useAuth();

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['real-leaderboard', category, timeFilter],
    queryFn: async () => {
      try {
        console.log('Fetching leaderboard data for category:', category);
        
        // Get TXC balances and profile data directly
        const { data: usersData, error: usersError } = await supabase
          .from('user_txc_balances')
          .select(`
            user_id,
            balance,
            total_earned,
            last_activity_at,
            profiles!inner(
              id,
              full_name,
              profile_picture_url
            )
          `)
          .gt('balance', 0)
          .order('balance', { ascending: false })
          .limit(50);

        if (usersError) {
          console.error('Error fetching users data:', usersError);
          throw usersError;
        }

        if (!usersData || usersData.length === 0) {
          console.log('No user scores found, returning empty array');
          return [];
        }

        // Get user achievements count
        const userIds = usersData.map(u => u.user_id);
        const { data: achievementsData } = await supabase
          .from('career_achievements')
          .select('user_id')
          .in('user_id', userIds);

        // TXC balances are already included in usersData

        // Get user streaks from real data
        const { data: streaksData } = await supabase
          .from('user_journey_tracking')
          .select(`
            user_id,
            created_at,
            event_type
          `)
          .in('user_id', userIds)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        // Calculate streaks from real activity data
        const calculateStreaks = (userId: string) => {
          const userStreaks = streaksData?.filter(s => s.user_id === userId) || [];
          if (userStreaks.length === 0) return { current: 0, longest: 0 };
          
          // Simple streak calculation based on daily activity
          const dailyActivity = userStreaks.reduce((acc, activity) => {
            const date = new Date(activity.created_at).toDateString();
            acc[date] = true;
            return acc;
          }, {} as Record<string, boolean>);
          
          const sortedDates = Object.keys(dailyActivity).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          
          let currentStreak = 0;
          let longestStreak = 0;
          let tempStreak = 0;
          
          for (let i = 0; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const previousDate = i > 0 ? new Date(sortedDates[i - 1]) : null;
            
            if (!previousDate || (previousDate.getTime() - currentDate.getTime()) === 24 * 60 * 60 * 1000) {
              tempStreak++;
              if (i === 0) currentStreak = tempStreak;
            } else {
              tempStreak = 1;
              if (i === 0) currentStreak = 1;
            }
            
            longestStreak = Math.max(longestStreak, tempStreak);
          }
          
          return { current: currentStreak, longest: longestStreak };
        };

        // Process and combine data
        const leaderboardUsers: LeaderboardUser[] = usersData.map((userData, index) => {
          const achievementsCount = achievementsData?.filter(a => a.user_id === userData.user_id).length || 0;
          const streaks = calculateStreaks(userData.user_id);
          
          // Determine badge level based on TXC balance
          const getBadgeLevel = (balance: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
            if (balance >= 10000) return 'platinum';
            if (balance >= 5000) return 'gold';
            if (balance >= 1000) return 'silver';
            return 'bronze';
          };

          return {
            id: userData.user_id,
            full_name: (userData.profiles as any)?.full_name || 'Anonymous User',
            profile_picture_url: (userData.profiles as any)?.profile_picture_url,
            total_points: userData.balance || 0, // Use TXC balance as points
            current_streak: streaks.current,
            longest_streak: streaks.longest,
            achievements_count: achievementsCount,
            txc_balance: userData.balance || 0,
            rank: index + 1,
            badge_level: getBadgeLevel(userData.balance || 0),
            last_activity: userData.last_activity_at || new Date().toISOString()
          };
        });

        // Sort based on category, but use existing rank for points
        let sortedUsers = [...leaderboardUsers];
        
        if (category === 'points' || category === 'txc') {
          // For points/TXC, we already have the correct ranking from database
          sortedUsers = sortedUsers.sort((a, b) => b.txc_balance - a.txc_balance);
        } else {
          // For other categories, sort and re-rank
          sortedUsers = sortedUsers.sort((a, b) => {
            switch (category) {
              case 'streaks':
                return b.current_streak - a.current_streak;
              case 'achievements':
                return b.achievements_count - a.achievements_count;
              case 'txc':
                return b.txc_balance - a.txc_balance;
              default:
                return b.txc_balance - a.txc_balance; // Default to TXC sorting
            }
          }).map((user, index) => ({
            ...user,
            rank: index + 1
          }));
        }

        const finalData = sortedUsers;

        console.log('Leaderboard data processed:', finalData.length, 'users');
        return finalData;
      } catch (error) {
        console.error('Error in leaderboard query:', error);
        throw error;
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // Get current user's ranking
  const { data: userRanking } = useQuery({
    queryKey: ['user-ranking', category, user?.id],
    queryFn: async () => {
      if (!user?.id || !leaderboardData) return null;

      const userInLeaderboard = leaderboardData.find(u => u.id === user.id);
      
      if (!userInLeaderboard) {
        // User not in top 50, need to calculate their actual rank
        const { data: userScore } = await supabase
          .from('user_scores')
          .select('total_points')
          .eq('user_id', user.id)
          .single();

        if (!userScore) return null;

        // Count users with higher scores
        const { count } = await supabase
          .from('user_scores')
          .select('*', { count: 'exact', head: true })
          .gt('total_points', userScore.total_points);

        const rank = (count || 0) + 1;
        
        // Get total user count
        const { count: totalCount } = await supabase
          .from('user_scores')
          .select('*', { count: 'exact', head: true })
          .gt('total_points', 0);

        const totalUsers = totalCount || 1;
        const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);

        return {
          rank,
          total_users: totalUsers,
          percentile,
          points_to_next: 100, // Default gap
          next_rank_points: userScore.total_points + 100
        } as UserRanking;
      }

      // User is in leaderboard
      const nextUser = leaderboardData[userInLeaderboard.rank - 2]; // Previous in array = higher rank
      const pointsToNext = nextUser ? nextUser.total_points - userInLeaderboard.total_points : 0;

      return {
        rank: userInLeaderboard.rank,
        total_users: leaderboardData.length,
        percentile: Math.round(((leaderboardData.length - userInLeaderboard.rank) / leaderboardData.length) * 100),
        points_to_next: Math.max(pointsToNext, 0),
        next_rank_points: nextUser?.total_points || userInLeaderboard.total_points
      } as UserRanking;
    },
    enabled: !!user?.id && !!leaderboardData
  });

  return {
    leaderboardData: leaderboardData || [],
    userRanking,
    isLoading,
    error,
    refetch,
    refreshLeaderboard: refetch
  };
}