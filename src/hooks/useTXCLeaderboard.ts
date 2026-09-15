import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  current_txc: number;
  lifetime_txc: number;
  job_title?: string;
  location?: string;
  profile_picture_url?: string;
  change?: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

export interface UserRankInfo {
  rank: number;
  totalUsers: number;
  percentile: number;
  currentTxc: number;
  lifetimeTxc: number;
}

export const useTXCLeaderboard = () => {
  const { user } = useAuth();

  // Fetch top 100 leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading, error: leaderboardError } = useQuery({
    queryKey: ['txc-leaderboard'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('txc_leaderboard')
          .select('*')
          .limit(100);

        if (error || !data) return [];
        return data.map((entry): LeaderboardEntry => ({
          rank: Number(entry.rank || 1),
          user_id: entry.user_id || '',
          full_name: entry.full_name || 'Anonymous',
          current_txc: Number(entry.current_txc || 0),
          lifetime_txc: Number(entry.lifetime_txc || 0),
          job_title: entry.job_title,
          location: entry.location,
          profile_picture_url: entry.profile_picture_url,
          isCurrentUser: entry.user_id === user?.id,
          change: 'same'
        }));
      } catch {
        return [];
      }
    },
    refetchInterval: 60000,
  });

  // Fetch current user's rank info
  const { data: userRankInfo, isLoading: rankLoading, error: rankError } = useQuery({
    queryKey: ['user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's rank
      const { data: userRank, error: userError } = await supabase
        .from('txc_leaderboard')
        .select('rank, current_txc, lifetime_txc')
        .eq('user_id', user.id)
        .single();

      if (userError) {
        console.error('User rank error:', userError);
        return null;
      }

      // Get total user count
      const { count: totalUsers, error: countError } = await supabase
        .from('txc_leaderboard')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Count error:', countError);
        return null;
      }

      const rank = Number(userRank?.rank || 0);
      const total = totalUsers || 1;
      
      // Calculate percentile (higher rank = lower percentile)
      const percentile = Math.round(((total - rank) / total) * 100);

      return {
        rank,
        totalUsers: total,
        percentile,
        currentTxc: Number(userRank?.current_txc || 0),
        lifetimeTxc: Number(userRank?.lifetime_txc || 0)
      } as UserRankInfo;
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
  });

  // Get top 5 for quick display
  const topFive = leaderboard?.slice(0, 5) || [];

  // Get user's position in top 100 or find nearby ranks
  const getUserContext = () => {
    if (!leaderboard || !user?.id) return [];

    const userEntry = leaderboard.find(entry => entry.user_id === user.id);
    
    if (userEntry) {
      // User is in top 100, show context around their position
      const userIndex = leaderboard.indexOf(userEntry);
      const start = Math.max(0, userIndex - 2);
      const end = Math.min(leaderboard.length, userIndex + 3);
      return leaderboard.slice(start, end);
    }

    // User not in top 100, show top 3 + user's position
    const top3 = leaderboard.slice(0, 3);
    if (userRankInfo) {
      const userAsEntry: LeaderboardEntry = {
        rank: userRankInfo.rank,
        user_id: user.id,
        full_name: 'You',
        current_txc: userRankInfo.currentTxc,
        lifetime_txc: userRankInfo.lifetimeTxc,
        isCurrentUser: true,
        change: 'same'
      };
      return [...top3, userAsEntry];
    }

    return top3;
  };

  return {
    leaderboard: leaderboard || [],
    topFive,
    userContext: getUserContext(),
    userRankInfo,
    isLoading: leaderboardLoading || rankLoading,
    error: leaderboardError || rankError,
  };
};