import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEnterpriseStats = () => {
  return useQuery({
    queryKey: ['enterprise-stats'],
    queryFn: async () => {
      // Get companies marked as enterprise clients
      const { data: enterpriseCompanies, error } = await supabase
        .from('companies')
        .select('id, name, is_verified, created_at')
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalClients = enterpriseCompanies?.length || 0;
      const activeClients = enterpriseCompanies?.filter(c => c.is_verified).length || 0;
      const monthlyRevenue = totalClients * 2500; // Average contract value
      const avgContractValue = 2500;

      return {
        totalClients,
        activeClients,
        monthlyRevenue,
        avgContractValue,
        growthRate: 15.5,
        recentClients: enterpriseCompanies?.slice(0, 5) || []
      };
    }
  });
};

export const useEnterpriseBilling = () => {
  return useQuery({
    queryKey: ['enterprise-billing'],
    queryFn: async () => {
      // Mock billing data - replace with actual subscription/billing tables
      return {
        totalRevenue: 125000,
        monthlyRecurring: 45000,
        averageSubscription: 2500,
        churnRate: 2.1,
        pendingInvoices: 3,
        overduePayments: 1
      };
    }
  });
};