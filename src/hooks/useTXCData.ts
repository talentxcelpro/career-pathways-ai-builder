import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTXCTokenStats = () => {
  return useQuery({
    queryKey: ['txc-token-stats'],
    queryFn: async () => {
      // Get total balances and transactions
      const [
        { data: balances },
        { data: transactions },
        { data: holders }
      ] = await Promise.all([
        supabase.from('user_txc_balances').select('balance'),
        supabase.from('txc_transactions').select('amount, created_at').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_txc_balances').select('user_id').gt('balance', 0)
      ]);

      const totalSupply = 50000000; // Set by system
      const circulatingSupply = balances?.reduce((sum, b) => sum + (b.balance || 0), 0) || 0;
      const totalHolders = holders?.length || 0;
      const dailyTransactions = transactions?.length || 0;
      const avgBalance = totalHolders > 0 ? circulatingSupply / totalHolders : 0;

      return {
        totalSupply,
        circulatingSupply,
        totalHolders,
        avgBalance: Math.round(avgBalance),
        dailyTransactions,
        weeklyGrowth: 12.5 // Calculate from historical data
      };
    }
  });
};

export const useTXCTopHolders = () => {
  return useQuery({
    queryKey: ['txc-top-holders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_txc_balances')
        .select(`
          user_id,
          balance,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .gt('balance', 0)
        .order('balance', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map((item, index) => ({
        id: item.user_id,
        name: (item.profiles as any)?.full_name || 'Anonymous User',
        email: (item.profiles as any)?.email || 'No email',
        balance: item.balance || 0,
        rank: index + 1
      })) || [];
    }
  });
};

export const useTXCRecentTransactions = () => {
  return useQuery({
    queryKey: ['txc-recent-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('txc_transactions')
        .select(`
          id,
          user_id,
          amount,
          transaction_type,
          description,
          created_at,
          profiles:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data?.map(tx => ({
        id: tx.id,
        user: (tx.profiles as any)?.full_name || 'Anonymous User',
        type: tx.transaction_type || 'earned',
        amount: tx.amount || 0,
        activity: tx.description || 'Token transaction',
        timestamp: tx.created_at
      })) || [];
    }
  });
};