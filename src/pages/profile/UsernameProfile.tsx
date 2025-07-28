import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedSEO } from '@/hooks/useEnhancedSEO';
import UserProfile from '@/pages/network/UserProfile';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  title?: string;
  about?: string;
  profile_picture_url?: string;
  location?: string;
  website?: string;
}

const UsernameProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up SEO with dynamic data
  useEnhancedSEO({
    title: profile ? `${profile.full_name} (@${profile.username}) - TalentXcel` : 'Profile - TalentXcel',
    description: profile 
      ? `${profile.full_name}'s professional profile on TalentXcel. ${profile.title ? `${profile.title}. ` : ''}${profile.about ? profile.about.substring(0, 150) + '...' : 'Connect and explore their career journey.'}`
      : 'View professional profile on TalentXcel.',
    keywords: profile 
      ? [`${profile.full_name}`, profile.username, 'professional profile', 'TalentXcel', profile.title, profile.location].filter(Boolean)
      : ['professional profile', 'TalentXcel'],
    canonical: `https://talentxcel.in/profile/${username}`,
    // Remove openGraph configuration for now to fix the build error
    structuredData: profile ? JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.full_name,
      "alternateName": profile.username,
      "description": profile.about || profile.title,
      "url": `https://talentxcel.in/profile/${username}`,
      "image": profile.profile_picture_url,
      "jobTitle": profile.title,
      "workLocation": profile.location,
      "sameAs": profile.website ? [profile.website] : undefined
    }) : undefined,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Network', url: '/network' },
      { name: profile?.full_name || username, url: `/profile/${username}` }
    ]
  });

  useEffect(() => {
    const fetchProfileByUsername = async () => {
      if (!username) {
        setError('Username not provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            full_name,
            title,
            about,
            profile_picture_url,
            location,
            website
          `)
          .eq('username', username)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setError('Failed to load profile');
        } else if (!data) {
          setError('Profile not found');
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileByUsername();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return <Navigate to="/404" replace />;
  }

  // Use the existing UserProfile component but with username-based data
  return <UserProfile profileId={profile.id} isUsernameRoute={true} />;
};

export default UsernameProfile;