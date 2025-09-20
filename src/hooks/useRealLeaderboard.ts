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
        
        // Get user scores and profile data
        const { data: usersData, error: usersError } = await supabase
          .from('user_scores')
          .select(`
            user_id,
            total_points,
            career_readiness_score,
            profile_completion_score,
            last_updated,
            profiles!inner(
              id,
              full_name,
              profile_picture_url
            )
          `)
          .gt('total_points', 0)
          .order('total_points', { ascending: false })
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

        // Get user token balances
        const { data: balancesData } = await supabase
          .from('token_balances')
          .select('user_id, available_balance, lifetime_earned')
          .in('user_id', userIds);

        // Process and combine data
        const leaderboardUsers: LeaderboardUser[] = usersData.map((userData, index) => {
          const achievementsCount = achievementsData?.filter(a => a.user_id === userData.user_id).length || 0;
          const userBalance = balancesData?.find(b => b.user_id === userData.user_id);
          
          // Determine badge level based on points
          const getBadgeLevel = (points: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
            if (points >= 5000) return 'platinum';
            if (points >= 2000) return 'gold';
            if (points >= 500) return 'silver';
            return 'bronze';
          };

          return {
            id: userData.user_id,
            full_name: (userData.profiles as any)?.full_name || 'Anonymous User',
            profile_picture_url: (userData.profiles as any)?.profile_picture_url,
            total_points: userData.total_points || 0,
            current_streak: Math.floor(Math.random() * 30) + 1, // Mock streak data
            longest_streak: Math.floor(Math.random() * 50) + 10,
            achievements_count: achievementsCount,
            txc_balance: userBalance?.available_balance || 0,
            rank: index + 1,
            badge_level: getBadgeLevel(userData.total_points || 0),
            last_activity: userData.last_updated || new Date().toISOString()
          };
        });

        // Sort based on category
        const sortedUsers = [...leaderboardUsers].sort((a, b) => {
          switch (category) {
            case 'points':
              return b.total_points - a.total_points;
            case 'streaks':
              return b.current_streak - a.current_streak;
            case 'achievements':
              return b.achievements_count - a.achievements_count;
            case 'txc':
              return b.txc_balance - a.txc_balance;
            default:
              return b.total_points - a.total_points;
          }
        });

        // Update ranks after sorting
        const finalData = sortedUsers.map((user, index) => ({
          ...user,
          rank: index + 1
        }));

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