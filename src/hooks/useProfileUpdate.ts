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
  username?: string;
  custom_url_slug?: string;
}

export function useProfileUpdate() {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if profile exists to avoid upserting a row without required fields like username
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const baseData = {
        ...data,
        updated_at: new Date().toISOString()
      } as const;

      if (existingProfile) {
        // Existing profile: safe to update without touching required fields
        const { data: result, error } = await supabase
          .from('profiles')
          .update(baseData)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        // New profile: ensure username is set to satisfy NOT NULL + uniqueness
        let finalUsername = data.username;
        if (!finalUsername) {
          const sourceName = data.full_name || (user.user_metadata as any)?.full_name || user.email?.split('@')[0] || 'user';
          const { data: genUsername, error: genError } = await supabase.rpc('generate_username_from_name', { full_name: sourceName });
          if (genError) {
            console.warn('Username generation failed, falling back:', genError);
            finalUsername = `user${user.id.slice(0, 8)}`;
          } else {
            finalUsername = genUsername as unknown as string;
          }
        }

        const insertData = {
          id: user.id,
          username: finalUsername,
          ...baseData,
        };

        const { data: result, error } = await supabase
          .from('profiles')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        return result;
      }
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