import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCompanyFollow(companyId: string) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Check if user is following the company
  const { data: isFollowing = false, isLoading } = useQuery({
    queryKey: ['company-follow', companyId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return false;
      
      const { data, error } = await supabase
        .from('company_follows')
        .select('id')
        .eq('company_id', companyId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!currentUser && !!companyId,
  });

  // Get followers count
  const { data: followersCount = 0 } = useQuery({
    queryKey: ['company-followers-count', companyId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('company_follows')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        console.error('Follow attempt without user authentication');
        throw new Error('Must be logged in');
      }
      
      console.log('Attempting to follow company:', { companyId, userId: currentUser.id });
      
      const { data, error } = await supabase
        .from('company_follows')
        .insert({
          company_id: companyId,
          user_id: currentUser.id,
        })
        .select();
      
      if (error) {
        console.error('Supabase follow error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          companyId,
          userId: currentUser.id
        });
        throw error;
      }
      
      console.log('Follow successful:', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-follow', companyId] });
      queryClient.invalidateQueries({ queryKey: ['company-followers-count', companyId] });
      queryClient.invalidateQueries({ queryKey: ['user-followed-companies'] });
      toast.success('Company followed successfully');
    },
    onError: (error: any) => {
      console.error('Follow mutation error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error(`Failed to follow company: ${error.message}`);
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        console.error('Unfollow attempt without user authentication');
        throw new Error('Must be logged in');
      }
      
      console.log('Attempting to unfollow company:', { companyId, userId: currentUser.id });
      
      const { error } = await supabase
        .from('company_follows')
        .delete()
        .eq('company_id', companyId)
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error('Supabase unfollow error:', error);
        throw error;
      }
      
      console.log('Unfollow successful');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-follow', companyId] });
      queryClient.invalidateQueries({ queryKey: ['company-followers-count', companyId] });
      queryClient.invalidateQueries({ queryKey: ['user-followed-companies'] });
      toast.success('Company unfollowed');
    },
    onError: (error: any) => {
      console.error('Unfollow mutation error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error(`Failed to unfollow company: ${error.message}`);
    },
  });

  const toggleFollow = () => {
    if (!currentUser) {
      toast.error('Please login to follow companies');
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return {
    isFollowing,
    followersCount,
    isLoading,
    isUpdating: followMutation.isPending || unfollowMutation.isPending,
    toggleFollow,
    canFollow: !!currentUser,
  };
}

// Hook to get user's followed companies
export function useFollowedCompanies(userId?: string) {
  return useQuery({
    queryKey: ['user-followed-companies', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('company_follows')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry,
            location,
            description
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}