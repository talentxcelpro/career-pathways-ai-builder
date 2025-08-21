import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface UserProfileLink {
  user_id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  title?: string;
  location?: string;
  is_online: boolean;
  last_seen?: string;
}

export interface ContentWithProfile {
  id: string;
  type: 'post' | 'reel' | 'job' | 'comment';
  module: 'reels' | 'network' | 'jobs';
  content: any;
  author: UserProfileLink;
  engagement_stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  user_engagement: {
    is_liked: boolean;
    is_bookmarked: boolean;
    is_shared: boolean;
  };
}

export const useProfileLinking = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Map<string, UserProfileLink>>(new Map());
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cache profile data
  const getProfile = async (userId: string): Promise<UserProfileLink | null> => {
    // Check cache first
    if (profiles.has(userId)) {
      return profiles.get(userId)!;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          profile_picture_url,
          title,
          location,
          is_online,
          last_seen
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      const profile: UserProfileLink = {
        user_id: data.id,
        username: data.username || '',
        full_name: data.full_name || 'Unknown User',
        profile_picture_url: data.profile_picture_url,
        title: data.title,
        location: data.location,
        is_online: data.is_online || false,
        last_seen: data.last_seen,
      };

      // Cache the profile
      setProfiles(prev => new Map(prev.set(userId, profile)));
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Get multiple profiles efficiently
  const getProfiles = async (userIds: string[]): Promise<Map<string, UserProfileLink>> => {
    const uncachedIds = userIds.filter(id => !profiles.has(id));
    
    if (uncachedIds.length === 0) {
      const result = new Map<string, UserProfileLink>();
      userIds.forEach(id => {
        const profile = profiles.get(id);
        if (profile) {
          result.set(id, profile);
        }
      });
      return result;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          profile_picture_url,
          title,
          location,
          is_online,
          last_seen
        `)
        .in('id', uncachedIds);

      if (error) throw error;

      const newProfiles = new Map<string, UserProfileLink>();
      data?.forEach(profile => {
        const userProfile: UserProfileLink = {
          user_id: profile.id,
          username: profile.username || '',
          full_name: profile.full_name || 'Unknown User',
          profile_picture_url: profile.profile_picture_url,
          title: profile.title,
          location: profile.location,
          is_online: profile.is_online || false,
          last_seen: profile.last_seen,
        };
        newProfiles.set(profile.id, userProfile);
      });

      // Update cache
      setProfiles(prev => new Map([...prev, ...newProfiles]));

      // Return all requested profiles
      const allProfiles = new Map([...profiles, ...newProfiles]);
      const result = new Map<string, UserProfileLink>();
      userIds.forEach(id => {
        const profile = allProfiles.get(id);
        if (profile) {
          result.set(id, profile);
        }
      });
      return result;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return new Map();
    }
  };

  // Navigate to profile
  const goToProfile = (userId: string, username?: string) => {
    if (username) {
      navigate(`/@${username}`);
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  // Track profile visit
  const trackProfileVisit = async (profileUserId: string) => {
    if (!currentUser || currentUser.id === profileUserId) return;

    try {
      // Track the visit
      await supabase
        .from('profile_visits')
        .insert({
          visitor_id: currentUser.id,
          profile_user_id: profileUserId,
          visited_at: new Date().toISOString(),
        });

      // Create notification for profile owner
      await supabase
        .from('notifications')
        .insert({
          user_id: profileUserId,
          type: 'profile_visit',
          title: 'Profile Visit',
          message: 'Someone viewed your profile',
          source_module: 'profile',
          source_user_id: currentUser.id,
          action_url: '/profile',
          priority: 'low',
          is_read: false,
          metadata: {
            visitor_id: currentUser.id,
          },
        });
    } catch (error) {
      console.error('Error tracking profile visit:', error);
    }
  };

  // Get content with enriched profile data
  const enrichContentWithProfiles = async (content: any[], contentType: 'post' | 'reel' | 'job'): Promise<ContentWithProfile[]> => {
    // Extract unique user IDs
    const userIds = [...new Set(content.map(item => item.user_id || item.author_id || item.posted_by).filter(Boolean))];
    
    // Get all profiles
    const profilesMap = await getProfiles(userIds);

    // Enrich content with profile data
    return content.map(item => {
      const userId = item.user_id || item.author_id || item.posted_by;
      const profile = profilesMap.get(userId);

      const module = contentType === 'post' ? 'network' : contentType === 'reel' ? 'reels' : 'jobs';

      return {
        id: item.id,
        type: contentType,
        module,
        content: item,
        author: profile || {
          user_id: userId,
          username: '',
          full_name: 'Unknown User',
          is_online: false,
        },
        engagement_stats: {
          likes: item.likes_count || 0,
          comments: item.comments_count || 0,
          shares: item.shares_count || 0,
          views: item.views_count || 0,
        },
        user_engagement: {
          is_liked: item.is_liked || false,
          is_bookmarked: item.is_bookmarked || false,
          is_shared: item.is_shared || false,
        },
      };
    });
  };

  // Subscribe to profile updates
  useEffect(() => {
    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const updatedProfile = payload.new as any;
          if (profiles.has(updatedProfile.id)) {
            const profile: UserProfileLink = {
              user_id: updatedProfile.id,
              username: updatedProfile.username || '',
              full_name: updatedProfile.full_name || 'Unknown User',
              profile_picture_url: updatedProfile.profile_picture_url,
              title: updatedProfile.title,
              location: updatedProfile.location,
              is_online: updatedProfile.is_online || false,
              last_seen: updatedProfile.last_seen,
            };
            setProfiles(prev => new Map(prev.set(updatedProfile.id, profile)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profiles]);

  return {
    profiles: profiles,
    getProfile,
    getProfiles,
    goToProfile,
    trackProfileVisit,
    enrichContentWithProfiles,
    currentUser,
  };
};