
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCompanyFollow = () => {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async ({ companyId, isFollowing }: { companyId: string; isFollowing: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to follow companies');
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('company_follows')
          .delete()
          .eq('company_id', companyId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('company_follows')
          .insert({
            company_id: companyId,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { isFollowing }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['followed-companies'] });
      toast.success(isFollowing ? 'Unfollowed company' : 'Following company');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update follow status');
    }
  });

  return {
    followCompany: followMutation.mutate,
    isFollowing: followMutation.isPending
  };
};
