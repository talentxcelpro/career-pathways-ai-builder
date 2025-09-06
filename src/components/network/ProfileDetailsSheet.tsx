import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, Building, Mail, Phone, Globe, UserPlus, MessageCircle, 
  Share2, Award, Calendar, Users, Briefcase, ExternalLink, Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProfileStats } from "@/hooks/useProfileStats";
import { useProfileViews } from "@/hooks/useProfileViews";
import { cn } from "@/lib/utils";

interface ProfileDetailsSheetProps {
  profileId: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export const ProfileDetailsSheet: React.FC<ProfileDetailsSheetProps> = ({ 
  profileId, 
  trigger,
  children 
}) => {
  const { user: currentUser } = useAuth();
  const { findOrCreateConversation } = useConversations();
  const navigate = useNavigate();
  const { trackProfileView } = useProfileViews();

  // Track profile view when opened
  React.useEffect(() => {
    if (profileId) {
      trackProfileView(profileId);
    }
  }, [profileId, trackProfileView]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-details', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          work_experiences,
          education,
          skills,
          certifications,
          social_links
        `)
        .eq('id', profileId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  const { data: profileStats } = useProfileStats(profileId);

  const { data: recentPosts } = useQuery({
    queryKey: ['profile-recent-posts', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          likes_count,
          comments_count,
          media_urls
        `)
        .eq('user_id', profileId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId
  });

  const handleConnect = async () => {
    try {
      if (!currentUser) {
        toast.error('Please sign in to connect');
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser.id,
          recipient_id: profileId,
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
        return;
      }

      const conversation = await findOrCreateConversation([profileId]);
      navigate(`/network/messages/${conversation.id}`);
    } catch (error) {
      toast.error('Failed to start conversation');
      console.error('Message error:', error);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.full_name || 'Professional'}'s Profile`,
          url: profileUrl,
        });
      } catch (error) {
        copyToClipboard(profileUrl);
      }
    } else {
      copyToClipboard(profileUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Profile link copied!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const formatDisplayName = (profile: any) => {
    return profile?.full_name?.trim() || 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const name = formatDisplayName(profile);
    if (name === 'Professional User') return 'PU';
    
    const names = name.split(' ');
    return names.length === 1 
      ? names[0].charAt(0).toUpperCase()
      : names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {trigger || children}
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-16 bg-muted rounded-full w-16"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!profile) return null;

  const isOwnProfile = currentUser?.id === profileId;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader className="space-y-4">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                    {generateInitials(profile)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl font-bold text-left">
                    {formatDisplayName(profile)}
                  </SheetTitle>
                  {profile.title && (
                    <SheetDescription className="text-sm font-medium text-muted-foreground text-left">
                      {profile.title}
                    </SheetDescription>
                  )}
                  {profile.current_company && (
                    <p className="text-sm text-muted-foreground mt-1">
                      at {profile.current_company}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex space-x-4 text-center">
                <div className="flex-1">
                  <div className="text-lg font-bold text-primary">{profileStats?.connections || 0}</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-primary">{profileStats?.profileViews || 0}</div>
                  <div className="text-xs text-muted-foreground">Profile Views</div>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-primary">{recentPosts?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Recent Posts</div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && currentUser && (
                <div className="flex space-x-2">
                  <Button onClick={handleConnect} className="flex-1" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                  <Button onClick={handleMessage} variant="outline" className="flex-1" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button onClick={handleShare} variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </SheetHeader>

            <Separator />

            {/* Profile Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4 mt-4">
                {/* About Section */}
                {profile.about && (
                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {profile.about}
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    {profile.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.slice(0, 12).map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 12 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.length - 12} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="experience" className="space-y-4 mt-4">
                {/* Work Experience */}
                {profile.work_experiences && profile.work_experiences.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Work Experience</h4>
                    <div className="space-y-3">
                      {profile.work_experiences.slice(0, 3).map((exp: any, index: number) => (
                        <div key={index} className="flex space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{exp.title}</div>
                            <div className="text-sm text-muted-foreground">{exp.company}</div>
                            {exp.duration && (
                              <div className="text-xs text-muted-foreground">{exp.duration}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {profile.education && profile.education.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Education</h4>
                    <div className="space-y-3">
                      {profile.education.slice(0, 2).map((edu: any, index: number) => (
                        <div key={index} className="flex space-x-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4 text-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{edu.degree}</div>
                            <div className="text-sm text-muted-foreground">{edu.institution}</div>
                            {edu.year && (
                              <div className="text-xs text-muted-foreground">{edu.year}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-4">
                {/* Recent Posts */}
                {recentPosts && recentPosts.length > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-3">Recent Posts</h4>
                    <div className="space-y-3">
                      {recentPosts.map((post: any) => (
                        <div key={post.id} className="p-3 border border-border rounded-lg">
                          <p className="text-sm line-clamp-3 mb-2">{post.content}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                {post.likes_count || 0}
                              </span>
                              <span>{post.comments_count || 0} comments</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground text-sm">No recent activity</div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Full Profile Link */}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate(`/profile/${profileId}`)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Profile
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};