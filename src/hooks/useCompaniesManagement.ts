
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCompaniesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['admin-companies', searchTerm, verificationFilter, industryFilter],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select(`
          *,
          company_profiles (
            jobs_posted_count,
            total_applications_received,
            active_jobs_count
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (verificationFilter !== 'all') {
        query = query.eq('is_verified', verificationFilter === 'verified');
      }

      if (industryFilter !== 'all') {
        query = query.eq('industry', industryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: companyStats } = useQuery({
    queryKey: ['company-stats'],
    queryFn: async () => {
      const [
        { count: totalCompanies },
        { count: verifiedCompanies },
        { count: activeCompanies },
        { data: industries }
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('companies').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('companies').select('industry').not('industry', 'is', null)
      ]);

      const uniqueIndustries = [...new Set(industries?.map(c => c.industry).filter(Boolean))];

      return {
        totalCompanies: totalCompanies || 0,
        verifiedCompanies: verifiedCompanies || 0,
        activeCompanies: activeCompanies || 0,
        industries: uniqueIndustries
      };
    }
  });

  const toggleVerification = useMutation({
    mutationFn: async ({ companyId, isVerified }: { companyId: string; isVerified: boolean }) => {
      const { error } = await supabase
        .from('companies')
        .update({ is_verified: isVerified })
        .eq('id', companyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Company verification status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update verification status');
    }
  });

  const handleToggleVerification = (companyId: string, isVerified: boolean) => {
    toggleVerification.mutate({ companyId, isVerified });
  };

  return {
    searchTerm,
    setSearchTerm,
    verificationFilter,
    setVerificationFilter,
    industryFilter,
    setIndustryFilter,
    companies,
    isLoading,
    companyStats,
    handleToggleVerification
  };
};
