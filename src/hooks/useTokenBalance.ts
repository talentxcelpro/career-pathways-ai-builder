import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export interface TokenBalance {
  available_balance: number;
  locked_balance: number;
  lifetime_earned: number;
  last_daily_bonus: string | null;
}

export const useTokenBalance = () => {
  const { user } = useAuth();

  const { data: balance, isLoading, error, refetch } = useQuery({
    queryKey: ['token-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        console.log('Fetching TXC balance for user:', user.id);
        
        // Get TXC balance from user_txc_balances table
        const { data: balanceData, error: balanceError } = await supabase
          .from('user_txc_balances')
          .select('balance, total_earned, total_spent, last_activity_at')
          .eq('user_id', user.id)
          .single();
        
        console.log('TXC balance response:', balanceData, balanceError);

        if (balanceError && balanceError.code !== 'PGRST116') {
          console.error('Error fetching TXC balance:', balanceError);
          return null;
        }

        // If no balance record exists, create one
        if (!balanceData) {
          const { data: newBalance, error: createError } = await supabase
            .from('user_txc_balances')
            .insert({
              user_id: user.id,
              balance: 500, // Welcome bonus
              total_earned: 500,
              total_spent: 0,
              last_activity_at: new Date().toISOString()
            })
            .select('balance, total_earned, total_spent, last_activity_at')
            .single();

          if (createError) {
            console.error('Error creating TXC balance:', createError);
            return null;
          }

          return {
            total: newBalance.balance,
            available: newBalance.balance,
            locked: 0,
            lifetime_earned: newBalance.total_earned
          };
        }

        return {
          total: balanceData.balance,
          available: balanceData.balance,
          locked: 0,
          lifetime_earned: balanceData.total_earned
        };
      } catch (error) {
        console.error('Error in TXC balance fetch:', error);
        return null;
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const refreshBalance = () => {
    refetch();
  };

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    totalBalance: balance ? balance.total : 0,
    availableBalance: balance?.available || 0,
    lockedBalance: balance?.locked || 0,
    lifetimeEarned: balance?.lifetime_earned || 0
  };
};