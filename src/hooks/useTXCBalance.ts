import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTXCBalance = () => {
  const [txcBalance, setTxcBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTxcBalance(0);
      setIsLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        const { data, error } = await supabase
          .from('txc_user_balances')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching TXC balance:', error);
          setTxcBalance(0);
        } else {
          setTxcBalance(data?.balance || 0);
        }
      } catch (error) {
        console.error('Error fetching TXC balance:', error);
        setTxcBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Set up real-time subscription for balance updates
    const channel = supabase
      .channel(`user-txc-balances-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'txc_user_balances',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newBalance = payload.new?.balance;
          if (newBalance !== undefined) {
            setTxcBalance(newBalance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { txcBalance, isLoading, setTxcBalance };
};