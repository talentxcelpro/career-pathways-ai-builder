
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Users, TrendingUp, MessageCircle, UserPlus, Eye, Loader2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AISuggestionEngineProps {
  userId?: string;
}

export const AISuggestionEngine: React.FC<AISuggestionEngineProps> = ({
  userId
}) => {
  const [sendingConnection, setSendingConnection] = useState<string | null>(null);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-ai-suggestions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Get people suggestions (similar to ConnectionSuggestions)
  const { data: peopleSuggestions, isLoading: loadingPeople } = useQuery({
    queryKey: ['people-suggestions', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      // Get existing connections to exclude
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('recipient_id, requester_id')
        .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .in('status', ['accepted', 'pending']);

      const connectedUserIds = new Set([
        ...(existingConnections?.map(c => c.recipient_id) || []),
        ...(existingConnections?.map(c => c.requester_id) || [])
      ]);

      // Get profiles excluding current user and existing connections
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, current_company, skills')
        .neq('id', currentUser.id)
        .not('full_name', 'is', null)
        .limit(10);

      if (error) throw error;

      // Filter out existing connections
      const filteredProfiles = profiles
        .filter(profile => !connectedUserIds.has(profile.id))
        .slice(0, 6);

      return filteredProfiles;
    },
    enabled: !!currentUser
  });

  // Get trending posts
  const { data: postSuggestions, isLoading: loadingPosts } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('id, content, headline, likes_count, comments_count, author_id')
        .eq('status', 'published')
        .order('likes_count', { ascending: false })
        .limit(4);

      if (error) throw error;

      // Get author profiles separately
      if (posts && posts.length > 0) {
        const authorIds = posts.map(post => post.author_id);
        const { data: authors } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url')
          .in('id', authorIds);

        // Map authors to posts
        return posts.map(post => ({
          ...post,
          author: authors?.find(author => author.id === post.author_id) || null
        })) as Array<typeof posts[0] & { author: { id: string; full_name: string; profile_picture_url: string | null } | null }>;
      }

      return posts || [];
    }
  });

  // Get group suggestions (communities)
  const { data: groupSuggestions, isLoading: loadingGroups } = useQuery({
    queryKey: ['group-suggestions'],
    queryFn: async () => {
      const { data: communities, error } = await supabase
        .from('goal_communities')
        .select('id, name, description, member_count, goal_type, is_active')
        .eq('is_active', true)
        .order('member_count', { ascending: false })
        .limit(4);

      if (error) throw error;
      return communities || [];
    }
  });

  // Get event suggestions
  const { data: eventSuggestions, isLoading: loadingEvents } = useQuery({
    queryKey: ['event-suggestions'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(4);

      if (error) throw error;
      return events || [];
    }
  });

  const sendConnectionRequest = async (userId: string) => {
    if (!currentUser) return;

    setSendingConnection(userId);
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser.id,
          recipient_id: userId,
          status: 'pending',
          message: 'Hi! I would love to connect with you.'
        });

      if (error) throw error;
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error('Failed to send connection request');
    } finally {
      setSendingConnection(null);
    }
  };

  const formatDisplayName = (profile: any) => {
    return profile?.full_name || 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLoading = loadingPeople || loadingPosts || loadingGroups || loadingEvents;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to see suggestions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Brain className="h-6 w-6 mr-2 text-purple-600" />
            AI-Powered Suggestions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Personalized recommendations based on your activity, connections, and interests
          </p>
        </CardHeader>
      </Card>

      {/* People Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            People You Should Connect With
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {peopleSuggestions && peopleSuggestions.length > 0 ? (
              peopleSuggestions.map((person) => (
                <div key={person.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarImage src={person.profile_picture_url} />
                    <AvatarFallback className="bg-muted">
                      {generateInitials(person)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <Link to={`/user/${person.id}`} className="font-medium hover:text-primary transition-colors">
                        {formatDisplayName(person)}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {person.title || person.current_company || 'Professional'}
                      </p>
                    </div>
                    {person.skills && person.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {person.skills.slice(0, 3).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      <Brain className="h-3 w-3 inline mr-1" />
                      Suggested based on your profile and network
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => sendConnectionRequest(person.id)}
                        disabled={sendingConnection === person.id}
                      >
                        {sendingConnection === person.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <UserPlus className="h-3 w-3 mr-1" />
                        )}
                        Connect
                      </Button>
                      <Link to={`/user/${person.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No connection suggestions available at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Trending Posts You Might Like
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {postSuggestions && postSuggestions.length > 0 ? (
              postSuggestions.map((post: any) => (
                <div key={post.id} className="p-3 border rounded-lg">
                  <p className="font-medium mb-2 line-clamp-2">{post.content || post.headline}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>by {post.author?.full_name || 'Unknown Author'}</span>
                    <span>{post.likes_count || 0} likes, {post.comments_count || 0} comments</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <Brain className="h-3 w-3 inline mr-1" />
                    Trending in your network
                  </p>
                  <Link to={`/network/posts/${post.id}`}>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Eye className="h-3 w-3 mr-1" />
                      View Post
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trending posts available at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Group Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-orange-600" />
            Groups You Might Enjoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupSuggestions && groupSuggestions.length > 0 ? (
              groupSuggestions.map((group) => (
                <div key={group.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link to={`/goals/${group.id}`} className="font-medium hover:text-primary transition-colors">
                        {group.name}
                      </Link>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {group.goal_type || 'Community'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {(group.member_count || 0).toLocaleString()} members
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{group.description}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    <Brain className="h-3 w-3 inline mr-1" />
                    Recommended based on your interests
                  </p>
                  <Link to={`/goals/${group.id}`}>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-3 w-3 mr-1" />
                      View Community
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No community suggestions available at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-red-600" />
            Upcoming Events for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventSuggestions && eventSuggestions.length > 0 ? (
              eventSuggestions.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link to={`/events/${event.id}`} className="font-medium hover:text-primary transition-colors">
                        {event.title}
                      </Link>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {event.event_type || 'Event'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {event.max_attendees ? `${event.max_attendees} max` : 'Open'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDateTime(event.start_time)}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    <Brain className="h-3 w-3 inline mr-1" />
                    Upcoming event you might be interested in
                  </p>
                  <Link to={`/events/${event.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View Event
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events available at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
