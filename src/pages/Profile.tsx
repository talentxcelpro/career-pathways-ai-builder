
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProfileLayout from '@/components/profile/ProfileLayout';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Profile = () => {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!currentUser?.id
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate('/auth/login');
    }
  }, [currentUser, isLoading, navigate]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <ProfileLayout title="Profile" description="View and manage your professional profile">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Banner */}
        <ProfileCompletionBanner profile={profile} />
        
        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {profile?.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.full_name || 'Profile'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {profile?.full_name 
                    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : currentUser.email?.[0]?.toUpperCase() || 'U'
                  }
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.full_name || currentUser.email || 'Your Profile'}
                </h1>
                {profile?.title && (
                  <p className="text-lg text-gray-600">{profile.title}</p>
                )}
              </div>
            </div>
          </div>
          
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
            {profile?.email && (
              <div>
                <span className="font-medium">Email:</span> {profile.email}
              </div>
            )}
            {profile?.linkedin_url && (
              <div>
                <span className="font-medium">LinkedIn:</span> 
                <a 
                  href={profile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-1"
                >
                  View Profile
                </a>
              </div>
            )}
          </div>

          {!profile && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Complete your profile to get started</p>
              <button
                onClick={() => navigate('/profile/edit')}
                className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Set Up Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;
