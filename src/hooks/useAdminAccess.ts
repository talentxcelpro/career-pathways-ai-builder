
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAccess = () => {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-access'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check using the new role system
      const { data, error } = await supabase
        .rpc('is_app_admin', { _user_id: user.id });

      if (error) {
        console.error('Error checking admin access:', error);
        return false;
      }

      return data || false;
    }
  });

  return {
    isAdmin: isAdmin || false,
    isLoading
  };
};
