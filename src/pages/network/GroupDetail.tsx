
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, MessageCircle, Calendar, Settings, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('discussions');

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      if (!id) throw new Error('Group ID is required');

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: members } = useQuery({
    queryKey: ['group-members', id],
    queryFn: async () => {
      if (!id) return [];
      const { data: memberships, error } = await supabase
        .from('group_memberships')
        .select('user_id, role, joined_at')
        .eq('group_id', id);

      if (error || !memberships || memberships.length === 0) return [];

      const userIds = memberships.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      return memberships.map(m => {
        const p = profileMap.get(m.user_id);
        return {
          id: m.user_id,
          name: p?.full_name || 'Community Member',
          title: p?.title || (m.role === 'admin' ? 'Community Admin' : 'Member'),
          avatar: p?.profile_picture_url || null,
          role: m.role
        };
      });
    },
    enabled: !!id
  });

  const { data: discussions } = useQuery({
    queryKey: ['group-discussions', id],
    queryFn: async () => {
      if (!id) return [];
      const { data: posts, error } = await supabase
        .from('group_posts')
        .select('id, content, created_at, author_id')
        .eq('group_id', id)
        .order('created_at', { ascending: false });

      if (error || !posts || posts.length === 0) return [];

      const authorIds = Array.from(new Set(posts.map(p => p.author_id).filter(Boolean)));
      let authorMap = new Map();
      if (authorIds.length > 0) {
        const { data: authors } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url')
          .in('id', authorIds);
        authorMap = new Map((authors || []).map(a => [a.id, a]));
      }

      return posts.map(p => {
        const author = authorMap.get(p.author_id);
        return {
          id: p.id,
          title: p.content.slice(0, 60) + (p.content.length > 60 ? '...' : ''),
          content: p.content,
          author: author?.full_name || 'Group Member',
          author_avatar: author?.profile_picture_url || null,
          created_at: p.created_at,
          replies_count: 0
        };
      });
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/network/groups" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Link>
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Group not found</h3>
              <p className="text-gray-600">This group may have been deleted or is private.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/network/groups" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Link>
          <div className="flex space-x-2">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Group Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                {group.category && (
                  <Badge variant="secondary" className="mt-2">
                    {group.category}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600">{group.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {group.member_count || 0} members
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Active discussions
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Upcoming events
                </div>
              </div>
              
              <Button>Join Group</Button>
            </div>
          </CardContent>
        </Card>

        {/* Group Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discussions?.map((discussion: any) => (
                    <div key={discussion.id} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{discussion.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {discussion.author}</span>
                        <span>{discussion.replies_count} replies</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Members ({members?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members?.map((member: any) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{member.name}</p>
                        <p className="text-sm text-gray-500 truncate">{member.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                  <p className="text-gray-600">Check back later for group events and meetups.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupDetail;
