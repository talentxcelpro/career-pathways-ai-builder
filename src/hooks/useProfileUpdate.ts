import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileUpdateData {
  id?: string;
  profile_picture_url?: string;
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
}

export function useProfileUpdate() {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData = {
        id: user.id,
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('profiles')
        .upsert(updateData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      // Invalidate all profile-related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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