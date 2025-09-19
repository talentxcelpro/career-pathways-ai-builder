import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TXCBalance {
  balance: number;
}

interface TXCTransaction {
  amount: number;
  created_at: string;
}

interface TXCHolder {
  user_id: string;
}

interface TXCHolderWithProfile {
  user_id: string;
  balance: number;
  profiles: {
    full_name?: string;
    email?: string;
  } | null;
}

interface TXCTransactionWithProfile {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  profiles: {
    full_name?: string;
  } | null;
}

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
      const circulatingSupply = (balances as TXCBalance[])?.reduce((sum, b) => sum + (b.balance || 0), 0) || 0;
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

      return (data as TXCHolderWithProfile[])?.map((item, index) => {
        return {
          id: item.user_id,
          name: item.profiles?.full_name || 'Anonymous User',
          email: item.profiles?.email || 'No email',
          balance: item.balance || 0,
          rank: index + 1
        };
      }) || [];
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

      return (data as TXCTransactionWithProfile[])?.map(tx => {
        return {
          id: tx.id,
          user: tx.profiles?.full_name || 'Anonymous User',
          type: tx.transaction_type || 'earned',
          amount: tx.amount || 0,
          activity: tx.description || 'Token transaction',
          timestamp: tx.created_at
        };
      }) || [];
    }
  });
};