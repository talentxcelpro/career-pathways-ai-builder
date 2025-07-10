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
        .single();
      
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
      if (!currentUser) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('company_follows')
        .insert({
          company_id: companyId,
          user_id: currentUser.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-follow', companyId] });
      queryClient.invalidateQueries({ queryKey: ['company-followers-count', companyId] });
      queryClient.invalidateQueries({ queryKey: ['user-followed-companies'] });
      toast.success('Company followed successfully');
    },
    onError: (error) => {
      toast.error('Failed to follow company');
      console.error('Follow error:', error);
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('company_follows')
        .delete()
        .eq('company_id', companyId)
        .eq('user_id', currentUser.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-follow', companyId] });
      queryClient.invalidateQueries({ queryKey: ['company-followers-count', companyId] });
      queryClient.invalidateQueries({ queryKey: ['user-followed-companies'] });
      toast.success('Company unfollowed');
    },
    onError: (error) => {
      toast.error('Failed to unfollow company');
      console.error('Unfollow error:', error);
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