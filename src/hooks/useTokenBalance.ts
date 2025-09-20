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
        console.log('Fetching token balance for user:', user.id);
        
        // First initialize user TXC if needed
        const initResult = await supabase.functions.invoke('initialize-user-txc');
        console.log('Initialization result:', initResult);

        // Then get the balance
        const { data, error } = await supabase.functions.invoke('get-token-balance', {
          body: { userId: user.id }
        });
        
        console.log('Token balance response:', data, error);

        if (error) {
          console.error('Error fetching token balance:', error);
          return null;
        }

        return data?.balance || null;
      } catch (error) {
        console.error('Error in token balance fetch:', error);
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