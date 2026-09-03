import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTXCIntegration } from './useTXCIntegration';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileUpdateData {
  id?: string;
  profile_picture_url?: string;
  profile_photo_url?: string;
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
  work_experiences?: unknown[];
  username?: string;
  custom_url_slug?: string;
}

type ProfileUpdateError = {
  message?: string;
};

const PROFILE_UPDATE_TIMEOUT_MS = 30000;

const withTimeout = async <T,>(promise: PromiseLike<T>, message: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), PROFILE_UPDATE_TIMEOUT_MS);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export function useProfileUpdate() {
  const queryClient = useQueryClient();
  const { triggerProfileCompleted, triggerSkillAdded } = useTXCIntegration();
  const { refreshSession } = useAuth();

  // Wait for an active session, retrying briefly while a refresh is in flight.
  const resolveAuthenticatedUser = async () => {
    const tryGet = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user ?? null;
    };

    let user = await tryGet();
    if (user) return user;

    // Attempt explicit refresh, swallow errors (refresh may already be in flight)
    try { await refreshSession(); } catch (_) { /* noop */ }

    // Poll briefly (up to ~5s) for the session to settle
    for (let i = 0; i < 10; i++) {
      user = await tryGet();
      if (user) return user;
      await new Promise(r => setTimeout(r, 500));
    }

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

      if (result) {
        return result;
      }

      // If no existing profile, create one for new users
      const fallbackUsername = (data.full_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user') + '_' + user.id.slice(0, 6);
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: fallbackUsername,
          email: user.email || data.email || null,
          ...updateData
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Profile insert fallback error:', insertError);
        throw insertError;
      }

      return inserted;
    },
    onSuccess: async (data, variables) => {
      // Invalidate all profile-related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Trigger TXC mining for profile updates
      if (variables.skills) {
        const earned = await triggerSkillAdded();
        if (earned) queryClient.invalidateQueries({ queryKey: ['token-balance'] });
      }
      
      // Check if profile is becoming more complete and trigger completion bonus
      const completionFields = ['full_name', 'title', 'about', 'location', 'skills', 'current_company'];
      
      const completedFields = completionFields.filter(field => variables[field as keyof ProfileUpdateData]);
      
      if (completedFields.length >= 4) {
        const earned = await triggerProfileCompleted();
        if (earned) queryClient.invalidateQueries({ queryKey: ['token-balance'] });
      }
      
      toast.success('Profile updated successfully');
      return data;
    },
    onError: (error: unknown) => {
      console.error('Profile update error:', error);
      toast.error((error as ProfileUpdateError).message || 'Failed to update profile');
    }
  });

  const updateProfilePicture = useMutation({
    mutationFn: async (profilePictureUrl: string) => {
      const user = await resolveAuthenticatedUser();

      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .update({ 
            profile_picture_url: profilePictureUrl,
            profile_photo_url: profilePictureUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .maybeSingle(),
        'Profile update timed out. Please refresh and try again.'
      );

      if (error) throw error;
      if (data) return data;

      // If no row existed, insert for new users
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: `user_${user.id.slice(0, 8)}`,
          email: user.email || null,
          full_name: user.user_metadata?.full_name || null,
          profile_picture_url: profilePictureUrl,
          profile_photo_url: profilePictureUrl,
          updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile picture updated successfully');
    },
    onError: (error: unknown) => {
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