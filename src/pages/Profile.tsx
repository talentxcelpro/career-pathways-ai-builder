
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bookmark, 
  Hash, 
  FileText,
  TrendingUp
} from 'lucide-react';
import { incrementProfileView } from '@/utils/profileHelpers';
import { ProfileBanner } from '@/components/profile/ProfileBanner';
import { CreatePost } from '@/components/posts/CreatePost';
import { PostCard } from '@/components/network/PostCard';
import { SavedItems } from '@/components/profile/SavedItems';
import { HashtagsManager } from '@/components/profile/HashtagsManager';
import { useState } from 'react';

const Profile = () => {
  const navigate = useNavigate();
  const [showShareDialog, setShowShareDialog] = useState(false);

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

  // Track profile view (for analytics)
  useEffect(() => {
    if (currentUser?.id && profile) {
      incrementProfileView(currentUser.id);
    }
  }, [currentUser?.id, profile]);

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

  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(
            full_name,
            title,
            profile_picture_url
          )
        `)
        .eq('author_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-8">
      {/* Profile Banner */}
      <ProfileBanner 
        profile={profile}
        isOwnProfile={true}
        stats={{
          connections: 500,
          profileViews: profile?.profile_views_count || 644,
          postsCount: userPosts?.length || 0
        }}
      />
      
      {/* Main Content Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved Items
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Hashtags
            </TabsTrigger>
          </TabsList>
          
          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Create Post & Posts Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post */}
                <CreatePost 
                  onPostCreate={(newPost) => {
                    // Refresh posts query
                    window.location.reload();
                  }}
                />
                
                {/* Posts Feed */}
                {postsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="animate-pulse space-y-4">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 bg-muted rounded-full" />
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-muted rounded w-1/3" />
                                <div className="h-3 bg-muted rounded w-1/4" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded" />
                              <div className="h-4 bg-muted rounded w-3/4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : userPosts && userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map((post: any) => (
                      <PostCard
                        key={post.id}
                        post={post}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-2">No posts yet</h3>
                      <p className="text-muted-foreground">
                        Share your first post to connect with your network!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Right Column - Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Your Activity</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Posts this month</span>
                        <Badge variant="secondary">{userPosts?.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Profile views</span>
                        <Badge variant="secondary">{profile?.profile_views_count || 644}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Connections</span>
                        <Badge variant="secondary">500+</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">Activity Overview</h3>
                  <p className="text-muted-foreground">
                    Your professional activity and engagement metrics will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Saved Items Tab */}
          <TabsContent value="saved">
            {currentUser?.id && <SavedItems userId={currentUser.id} />}
          </TabsContent>
          
          {/* Hashtags Tab */}
          <TabsContent value="hashtags">
            {currentUser?.id && <HashtagsManager userId={currentUser.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
