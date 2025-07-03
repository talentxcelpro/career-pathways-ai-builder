import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePricingPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: paymentStats } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      // Simulate payment stats with real-time data
      const now = new Date();
      const randomRevenue = 125000 + Math.floor(Math.random() * 25000);
      const randomSubscribers = 2400 + Math.floor(Math.random() * 600);
      const randomTransactions = 1250 + Math.floor(Math.random() * 250);
      const randomFailed = 15 + Math.floor(Math.random() * 10);

      return {
        totalRevenue: randomRevenue,
        totalSubscribers: randomSubscribers,
        totalTransactions: randomTransactions,
        failedTransactions: randomFailed,
        monthlyGrowth: 12.5,
        lastUpdated: now.toISOString()
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds for real-time feel
  });

  const { data: plans } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      // Sample pricing plans with real data structure
      return [
        {
          id: '1',
          name: 'Basic',
          price: 0,
          billing_cycle: 'month',
          is_active: true,
          subscriber_count: 1200 + Math.floor(Math.random() * 300),
          features: ['5 Job Applications', 'Basic Resume Builder', 'Job Alerts', 'Email Support']
        },
        {
          id: '2',
          name: 'Pro',
          price: 29,
          billing_cycle: 'month',
          is_active: true,
          subscriber_count: 800 + Math.floor(Math.random() * 200),
          features: ['Unlimited Applications', 'Advanced Resume Builder', 'AI Job Matching', 'Priority Support', 'Analytics Dashboard']
        },
        {
          id: '3',
          name: 'Enterprise',
          price: 99,
          billing_cycle: 'month',
          is_active: true,
          subscriber_count: 150 + Math.floor(Math.random() * 50),
          features: ['All Pro Features', 'Team Management', 'Custom Integrations', 'Dedicated Support', 'Advanced Analytics', 'API Access']
        }
      ];
    }
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['payment-transactions', searchTerm, statusFilter],
    queryFn: async () => {
      // Sample transaction data with filtering
      const baseTransactions = [
        {
          id: '1',
          user_email: 'john.doe@email.com',
          plan_name: 'Pro',
          amount: 29,
          status: 'completed',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          user_email: 'jane.smith@email.com',
          plan_name: 'Enterprise',
          amount: 99,
          status: 'completed',
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '3',
          user_email: 'bob.wilson@email.com',
          plan_name: 'Pro',
          amount: 29,
          status: 'failed',
          created_at: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: '4',
          user_email: 'alice.brown@email.com',
          plan_name: 'Pro',
          amount: 29,
          status: 'pending',
          created_at: new Date(Date.now() - 345600000).toISOString()
        },
        {
          id: '5',
          user_email: 'charlie.davis@email.com',
          plan_name: 'Enterprise',
          amount: 99,
          status: 'completed',
          created_at: new Date(Date.now() - 432000000).toISOString()
        }
      ];

      let filtered = baseTransactions;

      if (searchTerm) {
        filtered = filtered.filter(transaction => 
          transaction.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(transaction => transaction.status === statusFilter);
      }

      return filtered;
    }
  });

  const createPlan = useMutation({
    mutationFn: async (planData: any) => {
      // Simulate plan creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: Date.now().toString(), ...planData };
    },
    onSuccess: () => {
      toast.success('Plan created successfully');
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create plan');
    }
  });

  const updatePlan = useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: any }) => {
      // Simulate plan update
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { planId, updates };
    },
    onSuccess: () => {
      toast.success('Plan updated successfully');
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update plan');
    }
  });

  const handleCreatePlan = (planData: any) => {
    createPlan.mutate(planData);
  };

  const handleUpdatePlan = (planId: string, updates: any) => {
    updatePlan.mutate({ planId, updates });
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStats,
    plans,
    transactions,
    isLoading,
    handleCreatePlan,
    handleUpdatePlan
  };
};