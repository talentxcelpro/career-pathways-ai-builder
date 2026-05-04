import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTXCIntegration } from './useTXCIntegration';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileUpdateData {
  id?: string;
  profile_picture_url?: string;
  banner_url?: string;
  full_name?: string;
  title?: string;
  headline?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  about?: string;
  skills?: string[];
  industry?: string;
  current_company?: string;
  experience_years?: number;
  social_links?: Record<string, string>;
  profile_visibility?: 'public' | 'private' | 'connections_only';
  allow_profile_sharing?: boolean;
  custom_profile_url?: string;
  resume_url?: string;
  work_experiences?: Array<any>;
  username?: string;
  custom_url_slug?: string;
}

export function useProfileUpdate() {
  const queryClient = useQueryClient();
  const { triggerProfileCompleted, triggerSkillAdded } = useTXCIntegration();
  const { refreshSession } = useAuth();

  const resolveAuthenticatedUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user;

    await refreshSession();
    const { data: { session: refreshedSession } } = await supabase.auth.getSession();
    if (refreshedSession?.user) return refreshedSession.user;

    throw new Error('Your session could not be restored. Please sign in again.');
  };

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const user = await resolveAuthenticatedUser();

      // Always use UPDATE for existing profiles - much safer than upsert
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      // If no result, profile doesn't exist - this shouldn't happen for banner updates
      if (!result) {
        throw new Error('Profile not found - please refresh and try again');
      }

      return result;
    },
    onSuccess: async (data, variables) => {
      // Invalidate all profile-related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Trigger TXC mining for profile updates
      if (variables.skills) {
        await triggerSkillAdded();
      }
      
      // Check if profile is becoming more complete and trigger completion bonus
      const completionFields = ['full_name', 'title', 'about', 'location', 'skills', 'current_company'];
      
      // Try to earn TXC for profile completion
      try {
        const { useTXCMining } = await import('@/hooks/useTXCMining');
        const { useTokenBalance } = await import('@/hooks/useTokenBalance');
        const { earnTXC } = useTXCMining();
        const { refreshBalance } = useTokenBalance();
        
        const earned = await earnTXC('profile_completed');
        if (earned) {
          await refreshBalance();
          queryClient.invalidateQueries({ queryKey: ['token-balance'] });
        }
      } catch (error) {
        console.error('Error earning TXC for profile completion:', error);
      }
      const completedFields = completionFields.filter(field => variables[field as keyof ProfileUpdateData]);
      
      if (completedFields.length >= 4) {
        await triggerProfileCompleted();
      }
      
      toast.success('Profile updated successfully');
      return data;
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  });

  const updateProfilePicture = useMutation({
    mutationFn: async (profilePictureUrl: string) => {
      const user = await resolveAuthenticatedUser();

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_url: profilePictureUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile picture updated successfully');
    },
    onError: (error: any) => {
      console.error('Profile picture update error:', error);
      toast.error('Failed to update profile picture');
    }
  });

  return {
    updateProfile,
    updateProfilePicture,
    isUpdating: updateProfile.isPending || updateProfilePicture.isPending
  };
}