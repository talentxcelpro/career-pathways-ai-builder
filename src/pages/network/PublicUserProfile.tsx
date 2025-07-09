
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UserProfile from './UserProfile';

const PublicUserProfile = () => {
  const { id } = useParams<{ id: string }>();

  // First, try to determine if the ID is a UUID or a custom profile URL
  const { data: profileId, isLoading: isLoadingProfileId } = useQuery({
    queryKey: ['resolve-profile-id', id],
    queryFn: async () => {
      if (!id) return null;

      // Check if it's already a UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id)) {
        return id;
      }

      // Try to find by custom profile URL first
      let { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('custom_profile_url', id)
        .eq('profile_visibility', 'public')
        .maybeSingle();

      if (error) {
        console.error('Error resolving profile by custom URL:', error);
      }

      // If found by custom URL, return it
      if (data?.id) {
        return data.id;
      }

      // If not found by custom URL, try to find by generated URL from full_name
      // Convert URL format back to name format (replace hyphens with spaces)
      const nameFromUrl = id.replace(/-/g, ' ');
      
      const { data: nameData, error: nameError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('profile_visibility', 'public')
        .ilike('full_name', nameFromUrl);

      if (nameError) {
        console.error('Error resolving profile by name:', nameError);
        return null;
      }

      // If we found profiles, check if any match the expected URL format
      if (nameData && nameData.length > 0) {
        for (const profile of nameData) {
          const generatedUrl = profile.full_name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          
          if (generatedUrl === id) {
            return profile.id;
          }
        }
      }

      return null;
    },
    enabled: !!id
  });

  if (isLoadingProfileId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-32"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-xl text-gray-600 mb-4">Profile Not Found</h2>
            <p className="text-gray-500">The profile you're looking for doesn't exist or is not publicly available.</p>
            <div className="mt-6">
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the UserProfile component with the resolved ID
  return <UserProfile profileIdOverride={profileId} isPublicView={true} />;
};

export default PublicUserProfile;
