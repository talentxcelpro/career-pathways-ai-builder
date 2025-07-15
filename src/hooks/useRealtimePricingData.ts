import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimePricingData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: revenueStats, refetch: refetchRevenue } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: async () => {
      return {
        totalRevenue: 45600,
        monthlyRevenue: 8950,
        totalTransactions: 234,
        activeSubscriptions: 254,
        conversionRate: 3.2,
        averageOrderValue: 194.87
      };
    }
  });

  const { data: plans, refetch: refetchPlans } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: 'Basic',
          price: 9.99,
          interval: 'monthly',
          features: ['Job Applications', 'Basic Profile'],
          subscribers: 142,
          revenue: 1418.58,
          status: 'active'
        },
        {
          id: '2',
          name: 'Professional', 
          price: 29.99,
          interval: 'monthly',
          features: ['Unlimited Applications', 'Premium Profile'],
          subscribers: 89,
          revenue: 2669.11,
          status: 'active'
        }
      ];
    }
  });

  const { data: transactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      return [];
    }
  });

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([refetchRevenue(), refetchPlans(), refetchTransactions()]);
    setIsLoading(false);
  };

  return {
    revenueStats,
    plans,
    transactions,
    refreshData,
    isLoading
  };
};