
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useEmployerAccess = () => {
  const { user } = useAuth();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['employer-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_employer, employer_status')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 0, // Always refetch to get latest status
    gcTime: 0 // Don't cache
  });

  const isEmployer = profile?.is_employer === true;
  const isApproved = profile?.employer_status === 'approved';
  const hasEmployerAccess = isEmployer && isApproved;

  return {
    isEmployer,
    isApproved,
    hasEmployerAccess,
    employerStatus: profile?.employer_status,
    isLoading,
    refetch
  };
};
