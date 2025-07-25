import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { uploadProfileAsset } from '@/utils/profileHelpers';

interface ProfileSyncStatus {
  isProcessing: boolean;
  completed: boolean;
  error: string | null;
}

export const useOAuthProfileSync = () => {
  const { user, session } = useAuth();
  const [syncStatus, setSyncStatus] = useState<ProfileSyncStatus>({
    isProcessing: false,
    completed: false,
    error: null
  });

  useEffect(() => {
    if (!user || !session) return;

    const syncOAuthProfile = async () => {
      try {
        setSyncStatus({ isProcessing: true, completed: false, error: null });

        // Check if this is an OAuth login with external profile picture
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_picture_url, oauth_provider, oauth_metadata, profile_photo_storage_url')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile) return;

        // If user has OAuth profile picture but no internal storage URL, process it
        if (profile.profile_picture_url && 
            !profile.profile_photo_storage_url && 
            profile.oauth_provider !== 'email' &&
            (profile.profile_picture_url.includes('googleusercontent.com') || 
             profile.profile_picture_url.includes('media.licdn.com'))) {
          
          await processOAuthProfilePhoto(user.id, profile.profile_picture_url);
        }

        setSyncStatus({ isProcessing: false, completed: true, error: null });
      } catch (error: any) {
        console.error('OAuth profile sync error:', error);
        setSyncStatus({ 
          isProcessing: false, 
          completed: false, 
          error: error.message 
        });
      }
    };

    // Only run once per session for OAuth users
    const metadata = user.user_metadata;
    if (metadata && Object.keys(metadata).length > 0) {
      syncOAuthProfile();
    }
  }, [user, session]);

  return syncStatus;
};

const processOAuthProfilePhoto = async (userId: string, externalUrl: string) => {
  try {
    // Download the external image
    const response = await fetch(externalUrl);
    if (!response.ok) throw new Error('Failed to fetch profile photo');
    
    const blob = await response.blob();
    const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });

    // Upload to our storage
    const internalUrl = await uploadProfileAsset(file, userId, 'avatar');
    
    // Update profile with internal URL
    await supabase
      .from('profiles')
      .update({ 
        profile_photo_storage_url: internalUrl,
        profile_picture_url: internalUrl 
      })
      .eq('id', userId);

    console.log('Profile photo processed successfully');
  } catch (error) {
    console.error('Error processing OAuth profile photo:', error);
    // Don't throw - this is not critical functionality
  }
};