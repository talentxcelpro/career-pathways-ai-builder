
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProfileLayout from '@/components/profile/ProfileLayout';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { ProfileShareDialog } from '@/components/profile/ProfileShareDialog';
import { PortfolioManager } from '@/components/profile/PortfolioManager';
import { FollowedCompanies } from '@/components/profile/FollowedCompanies';
import { ProfileViewers } from '@/components/profile/ProfileViewers';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Eye, Download, ExternalLink } from 'lucide-react';
import { incrementProfileView } from '@/utils/profileHelpers';
import { useState } from 'react';
import ProBadge from '@/components/network/ProBadge';
import { useAuth } from '@/contexts/AuthContext';
import { SessionStatusIndicator } from '@/components/auth/SessionStatusIndicator';
import { ListenButton } from '@/components/voice/ListenButton';

const Profile = () => {
  const navigate = useNavigate();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user: currentUser, loading: authLoading } = useAuth();

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
    enabled: !authLoading && !!currentUser?.id
  });

  // Track profile view (for analytics)
  useEffect(() => {
    if (currentUser?.id && profile) {
      incrementProfileView(currentUser.id);
    }
  }, [currentUser?.id, profile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/auth/login');
    }
  }, [authLoading, currentUser, navigate]);

  if (authLoading || isLoading) {
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

  const profileUrl = profile?.custom_profile_url 
    ? `${window.location.origin}/profile/${profile.custom_profile_url}`
    : `${window.location.origin}/profile/${currentUser.id}`;

  const socialPlatforms = {
    linkedin: 'LinkedIn',
    github: 'GitHub', 
    twitter: 'Twitter',
    website: 'Website'
  };

  return (
    <ProfileLayout title="Profile" description="View and manage your professional profile">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Banner */}
        <ProfileCompletionBanner profile={profile} />
        
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profile?.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.full_name || 'Profile'}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {profile?.full_name 
                      ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : currentUser.email?.[0]?.toUpperCase() || 'U'
                    }
                  </div>
                )}
                {profile?.pro_status && (
                  <div className="absolute -bottom-1 -right-1">
                    <ProBadge 
                      plan={profile.pro_status === 'starter' ? 'Starter' : 
                            profile.pro_status === 'business' ? 'Business' : 
                            profile.pro_status === 'elite' ? 'Elite' : 'Starter'} 
                      size="sm" 
                    />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile?.full_name || currentUser.email || 'Your Profile'}
                  </h1>
                  {profile?.pro_status && (
                    <ProBadge 
                      plan={profile.pro_status === 'starter' ? 'Starter' : 
                            profile.pro_status === 'business' ? 'Business' : 
                            profile.pro_status === 'elite' ? 'Elite' : 'Starter'} 
                      size="md" 
                    />
                  )}
                </div>
                {profile?.title && (
                  <p className="text-xl text-gray-600">{profile.title}</p>
                )}
                {profile?.location && (
                  <p className="text-gray-500">{profile.location}</p>
                )}
                
                 {/* Profile Stats */}
                 <div className="flex items-center space-x-4 mt-2">
                   <ProfileViewers 
                     profileUserId={currentUser.id} 
                     viewsCount={profile?.profile_views_count || 0} 
                   />
                  <Badge variant="outline" className="capitalize">
                    {profile?.profile_visibility || 'public'} profile
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col items-end gap-2">
              <SessionStatusIndicator />
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                  Edit Profile
                </Button>
                <Button variant="outline" onClick={() => setShowShareDialog(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {profile?.resume_url && (
                  <Button variant="outline" asChild>
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Resume
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* About Section */}
          {profile?.about && (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                <ListenButton text={profile.about} source={`${profile?.full_name || 'Profile'} · About`} />
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.about}</p>
            </div>
          )}
          
          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Contact & Social Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {profile?.email && (
              <div>
                <span className="font-medium">Email:</span> {profile.email}
              </div>
            )}
            {profile?.phone && (
              <div>
                <span className="font-medium">Phone:</span> {profile.phone}
              </div>
            )}
            {profile?.current_company && (
              <div>
                <span className="font-medium">Company:</span> {profile.current_company}
              </div>
            )}
            {profile?.industry && (
              <div>
                <span className="font-medium">Industry:</span> {profile.industry}
              </div>
            )}
            {profile?.experience_years && (
              <div>
                <span className="font-medium">Experience:</span> {profile.experience_years} years
              </div>
            )}
            {profile?.website && (
              <div>
                <span className="font-medium">Website:</span>
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-1"
                >
                  {profile.website} <ExternalLink className="h-3 w-3 inline" />
                </a>
              </div>
            )}
          </div>

          {/* Social Links */}
          {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-2">Connect with me</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(profile.social_links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                  >
                    {socialPlatforms[platform as keyof typeof socialPlatforms] || platform}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Public Profile Link */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Public Profile</h3>
                <p className="text-sm text-gray-600">Share your profile with others</p>
              </div>
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {profileUrl}
                </code>
                <Button size="sm" variant="outline" onClick={() => setShowShareDialog(true)}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!profile && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Complete your profile to get started</p>
              <Button onClick={() => navigate('/profile/edit')}>
                Set Up Profile
              </Button>
            </div>
          )}
        </div>

        {/* Portfolio Section */}
        {currentUser?.id && (
          <PortfolioManager userId={currentUser.id} />
        )}

        {/* Followed Companies Section */}
        {currentUser?.id && (
          <div className="mb-6">
            <FollowedCompanies userId={currentUser.id} />
          </div>
        )}

        {/* Share Dialog */}
        <ProfileShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          profileUrl={profileUrl}
          userName={profile?.full_name || 'User'}
        />
      </div>
    </ProfileLayout>
  );
};

export default Profile;
