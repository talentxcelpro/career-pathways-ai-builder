
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type PaymentPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: string;
  features: string[];
  is_active: boolean;
  subscriber_count: number;
  created_at: string;
};

type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  plan_name: string;
  created_at: string;
  user_email: string;
};

export const usePricingPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const mockPlans: PaymentPlan[] = [
    {
      id: '1',
      name: 'Basic',
      price: 0,
      currency: 'USD',
      billing_cycle: 'monthly',
      features: ['Basic job search', 'Resume builder', 'Profile creation'],
      is_active: true,
      subscriber_count: 1250,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Pro',
      price: 29,
      currency: 'USD',
      billing_cycle: 'monthly',
      features: ['Everything in Basic', 'AI resume optimization', 'Interview prep', 'Priority support'],
      is_active: true,
      subscriber_count: 890,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 99,
      currency: 'USD',
      billing_cycle: 'monthly',
      features: ['Everything in Pro', 'Team management', 'Advanced analytics', 'Custom integrations'],
      is_active: true,
      subscriber_count: 156,
      created_at: new Date().toISOString()
    }
  ];

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      user_id: 'user1',
      amount: 29,
      currency: 'USD',
      status: 'completed',
      plan_name: 'Pro',
      created_at: new Date().toISOString(),
      user_email: 'user1@example.com'
    },
    {
      id: '2',
      user_id: 'user2',
      amount: 99,
      currency: 'USD',
      status: 'completed',
      plan_name: 'Enterprise',
      created_at: new Date().toISOString(),
      user_email: 'user2@example.com'
    },
    {
      id: '3',
      user_id: 'user3',
      amount: 29,
      currency: 'USD',
      status: 'failed',
      plan_name: 'Pro',
      created_at: new Date().toISOString(),
      user_email: 'user3@example.com'
    }
  ];

  const { data: paymentStats } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      const totalRevenue = mockTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        totalRevenue,
        totalSubscribers: mockPlans.reduce((sum, plan) => sum + plan.subscriber_count, 0),
        totalTransactions: mockTransactions.length,
        failedTransactions: mockTransactions.filter(t => t.status === 'failed').length
      };
    }
  });

  const { data: plans } = useQuery({
    queryKey: ['payment-plans'],
    queryFn: async (): Promise<PaymentPlan[]> => {
      return mockPlans;
    }
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', searchTerm, statusFilter],
    queryFn: async (): Promise<Transaction[]> => {
      let filteredTransactions = mockTransactions;

      if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.status === statusFilter);
      }

      return filteredTransactions;
    }
  });

  const updatePlan = useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: Partial<PaymentPlan> }) => {
      console.log(`Update plan ${planId}`, updates);
    },
    onSuccess: () => {
      toast.success('Plan updated successfully');
      queryClient.invalidateQueries({ queryKey: ['payment-plans'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update plan');
    }
  });

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStats,
    plans,
    transactions,
    isLoading,
    updatePlan: (planId: string, updates: Partial<PaymentPlan>) => updatePlan.mutate({ planId, updates })
  };
};
