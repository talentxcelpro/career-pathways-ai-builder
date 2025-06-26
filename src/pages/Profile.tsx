
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProfileLayout from '@/components/profile/ProfileLayout';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';

const Profile = () => {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!currentUser?.id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Banner */}
        <ProfileCompletionBanner profile={profile} />
        
        {/* Existing profile content would go here */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {profile?.full_name || 'Your Profile'}
          </h1>
          
          {profile?.title && (
            <p className="text-lg text-gray-600 mb-4">{profile.title}</p>
          )}
          
          {profile?.about && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.about}</p>
            </div>
          )}
          
          {profile?.skills && profile.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {profile?.location && (
              <div>
                <span className="font-medium">Location:</span> {profile.location}
              </div>
            )}
            {profile?.current_company && (
              <div>
                <span className="font-medium">Company:</span> {profile.current_company}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;
