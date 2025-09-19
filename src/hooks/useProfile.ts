import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  title: string | null;
  about: string | null;
  profile_picture_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  location: string | null;
  phone: string | null;
  user_type: string;
  subscription_tier: string;
  is_online: boolean;
  last_seen: string;
  profile_views_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  headline: string | null;
  website: string | null;
  github_url: string | null;
  talentxcel_id: string | null;
  cover_image_url: string | null;
  portfolio_url: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });

  const updateProfile = (updates: Partial<Profile>) => {
    updateProfileMutation.mutate(updates);
  };

  const getUserRole = () => {
    return profile?.user_type || 'job_seeker';
  };

  const isAdmin = () => {
    return profile?.user_type === 'admin' || profile?.user_type === 'super_admin';
  };

  const isEmployer = () => {
    return profile?.user_type === 'employer' || isAdmin();
  };

  const isPremium = () => {
    return profile?.subscription_tier !== 'free';
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    isUpdating: updateProfileMutation.isPending,
    getUserRole,
    isAdmin,
    isEmployer,
    isPremium,
  };
}