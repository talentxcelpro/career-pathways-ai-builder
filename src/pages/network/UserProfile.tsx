
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Building, Mail, Phone, Globe, UserPlus, MessageCircle, Calendar, Users, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/network/PostCard";
import { useConversations } from "@/hooks/useConversations";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ProBadge from "@/components/network/ProBadge";

interface UserProfileProps {
  profileIdOverride?: string;
  isPublicView?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ profileIdOverride, isPublicView = false }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = profileIdOverride || paramId;
  const navigate = useNavigate();
  const { findOrCreateConversation } = useConversations();
  const { user: currentUser } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('User ID is required');

      // For public view, only fetch public profiles or if user is authenticated
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('id', id);

      // If this is a public view and user is not authenticated, only show public profiles
      if (isPublicView && !currentUser) {
        query = query.eq('profile_visibility', 'public');
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: userPosts } = useQuery({
    queryKey: ['user-posts', id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            full_name,
            title,
            profile_picture_url
          )
        `)
        .eq('author_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  const handleConnect = async () => {
    try {
      if (!currentUser) {
        toast.error('Please sign in to connect with people');
        navigate('/auth/login');
        return;
      }

      if (!id) return;

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser.id,
          recipient_id: id,
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error('Failed to send connection request');
      console.error('Connection error:', error);
    }
  };

  const handleMessage = async () => {
    try {
      if (!currentUser) {
        toast.error('Please sign in to send messages');
        navigate('/auth/login');
        return;
      }

      if (!id) return;

      const conversation = await findOrCreateConversation([id]);
      navigate(`/network/messages/${conversation.id}`);
    } catch (error) {
      toast.error('Failed to start conversation');
      console.error('Message error:', error);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${formatDisplayName(profile)}'s Profile`,
          url: profileUrl,
        });
      } catch (error) {
        // Fall back to copying to clipboard
        copyToClipboard(profileUrl);
      }
    } else {
      copyToClipboard(profileUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Profile link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    return names.length === 1 
      ? names[0].charAt(0).toUpperCase()
      : names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-32"></div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-xl text-gray-600 mb-4">Profile Not Found</h2>
            <p className="text-gray-500 mb-6">This user's profile may be private or doesn't exist.</p>
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === id;
  const showAuthenticatedActions = currentUser && !isOwnProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {currentUser ? (
            <Link to="/network/people" className="inline-flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to People
            </Link>
          ) : (
            <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </a>
          )}
          <div className="flex space-x-3">
            <Button onClick={handleShare} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {showAuthenticatedActions && (
              <>
                <Button onClick={handleConnect}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
                <Button variant="outline" onClick={handleMessage}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </>
            )}
            {!currentUser && (
              <Button onClick={() => navigate('/auth/login')} variant="outline">
                Sign In to Connect
              </Button>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-xl">
                    {generateInitials(profile)}
                  </AvatarFallback>
                </Avatar>
                {profile.pro_status && (
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

               <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {formatDisplayName(profile)}
                    {profile.title && (
                      <>
                        <span className="text-gray-400 mx-3">|</span>
                        <span className="text-xl font-normal text-gray-600">{profile.title}</span>
                      </>
                    )}
                  </h1>
                  {profile.pro_status && (
                    <ProBadge 
                      plan={profile.pro_status === 'starter' ? 'Starter' : 
                            profile.pro_status === 'business' ? 'Business' : 
                            profile.pro_status === 'elite' ? 'Elite' : 'Starter'} 
                      size="md" 
                    />
                  )}
                </div>
                {profile.headline && (
                  <p className="text-lg text-gray-600 mb-4">
                    {profile.headline}
                  </p>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {profile.location}
                    </div>
                  )}
                  {profile.current_company && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      {profile.current_company}
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {profile.email}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 8).map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {profile.skills.length > 8 && (
                      <Badge variant="outline">
                        +{profile.skills.length - 8} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            {profile.about && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{profile.about}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {userPosts && userPosts.length > 0 ? (
              userPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">This user hasn't shared any posts.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Industry</h4>
                    <p className="text-gray-600">{profile.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Experience</h4>
                    <p className="text-gray-600">{profile.experience_years ? `${profile.experience_years} years` : 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Open to Remote</h4>
                    <p className="text-gray-600">{profile.open_to_remote ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Timeline</h3>
                <p className="text-gray-600">Recent activity and interactions will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
