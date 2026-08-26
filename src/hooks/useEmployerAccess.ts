import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ROOT_ADMIN_EMAILS = [
  'talentxcelpro@gmail.com',
  'talentxcelservices@gmail.com',
  'chatr4661@gmail.com',
  'arsh.wani@gmail.com',
  'arshid.wani@icloud.com',
  'sanobar.jahan1980@gmail.com'
];

export const useEmployerAccess = () => {
  const { user } = useAuth();

  const { data: accessData, isLoading, refetch } = useQuery({
    queryKey: ['employer-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // 1. Root super admin bypass
      const userEmail = (user.email || '').toLowerCase().trim();
      const userPhone = (user.phone || '').trim();
      const isRootAdmin = ROOT_ADMIN_EMAILS.includes(userEmail) || userPhone.includes('9910678611') || userPhone.includes('9717845477');

      if (isRootAdmin) {
        return {
          isEmployer: true,
          isApproved: true,
          hasEmployerAccess: true,
          employerStatus: 'approved',
          hasTeamMembership: true
        };
      }
      
      // 2. Check profile status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_employer, employer_status, user_type')
        .eq('id', user.id)
        .maybeSingle();
      
      // 3. Check team membership
      const { data: teamMembership } = await supabase
        .from('company_team_members')
        .select('role, is_active, company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      // 4. Check if they have an approved employer application/request
      const { data: approvedReq } = await supabase
        .from('employer_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();
      
      const isEmployer = profile?.is_employer === true || profile?.user_type === 'employer' || !!approvedReq;
      const isApproved = profile?.employer_status === 'approved' || !!approvedReq || isEmployer;
      const hasTeam = teamMembership && teamMembership.length > 0;
      const hasAccess = isApproved || hasTeam || isEmployer;

      return {
        profile,
        isEmployer,
        isApproved,
        hasEmployerAccess: hasAccess,
        employerStatus: isApproved ? 'approved' : (profile?.employer_status || 'pending'),
        hasTeamMembership: hasTeam
      };
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  return {
    isEmployer: accessData?.isEmployer ?? false,
    isApproved: accessData?.isApproved ?? false,
    hasEmployerAccess: accessData?.hasEmployerAccess ?? (user ? ROOT_ADMIN_EMAILS.includes((user.email || '').toLowerCase()) : false),
    employerStatus: accessData?.employerStatus || 'approved',
    isLoading,
    refetch
  };
};
