
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useEmployerAccess = () => {
  const { user } = useAuth();

  const { data: accessData, isLoading, refetch } = useQuery({
    queryKey: ['employer-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Check profile status first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_employer, employer_status')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Also check if user has active team membership (alternative path to employer access)
      const { data: teamMembership } = await supabase
        .from('company_team_members')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      return {
        profile,
        hasTeamMembership: !!teamMembership
      };
    },
    enabled: !!user?.id,
    staleTime: 0, // Always refetch to get latest status
    gcTime: 0, // Don't cache
  });

  const profile = accessData?.profile;
  const hasTeamMembership = accessData?.hasTeamMembership || false;
  
  const isEmployer = profile?.is_employer === true;
  const isApproved = profile?.employer_status === 'approved';
  
  // User has employer access if they're approved OR have active team membership
  const hasEmployerAccess = (isEmployer && isApproved) || hasTeamMembership;

  return {
    isEmployer,
    isApproved,
    hasEmployerAccess,
    employerStatus: profile?.employer_status,
    isLoading,
    refetch
  };
};
