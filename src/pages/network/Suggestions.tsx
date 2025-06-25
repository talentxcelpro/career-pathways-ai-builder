
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, MessageCircle, Calendar, BookOpen, Building, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Suggestions = () => {
  const queryClient = useQueryClient();

  // Mock AI-powered suggestions for now
  const suggestedPeople = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Senior Product Manager',
      company: 'TechCorp',
      mutualConnections: 12,
      skills: ['Product Management', 'Strategy', 'Analytics'],
      reason: 'Similar role and mutual connections'
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      mutualConnections: 8,
      skills: ['React', 'Node.js', 'TypeScript'],
      reason: 'Shared skills and interests'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      title: 'UX Designer',
      company: 'DesignStudio',
      mutualConnections: 5,
      skills: ['UI/UX Design', 'Figma', 'User Research'],
      reason: 'Works in your industry'
    }
  ];

  const suggestedGroups = [
    {
      id: '1',
      name: 'Product Managers Network',
      members: 15420,
      category: 'Professional',
      description: 'Connect with product managers worldwide',
      reason: 'Based on your role'
    },
    {
      id: '2',
      name: 'React Developers Community',
      members: 8930,
      category: 'Technology',
      description: 'Share knowledge and best practices',
      reason: 'Matches your skills'
    },
    {
      id: '3',
      name: 'Career Growth Hub',
      members: 25600,
      category: 'Career',
      description: 'Tips and advice for career advancement',
      reason: 'Popular in your network'
    }
  ];

  const suggestedEvents = [
    {
      id: '1',
      title: 'React Conference 2024',
      date: '2024-03-15',
      type: 'Conference',
      attendees: 500,
      isVirtual: false,
      reason: 'Based on your interests'
    },
    {
      id: '2',
      title: 'Product Management Webinar',
      date: '2024-02-20',
      type: 'Webinar',
      attendees: 150,
      isVirtual: true,
      reason: 'Matches your role'
    },
    {
      id: '3',
      title: 'Tech Networking Mixer',
      date: '2024-02-28',
      type: 'Networking',
      attendees: 80,
      isVirtual: false,
      reason: 'Popular with your connections'
    }
  ];

  const connectMutation = useMutation({
    mutationFn: async (personId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: personId,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Connection request sent!');
    },
    onError: () => {
      toast.error('Failed to send connection request');
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Sparkles className="h-8 w-8 mr-3 text-blue-600" />
            AI Suggestions
          </h1>
          <p className="text-gray-600 mt-2">Personalized recommendations to grow your network</p>
        </div>

        {/* Suggestion Categories */}
        <Tabs defaultValue="people" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="people" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              People
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
          </TabsList>

          {/* People Suggestions */}
          <TabsContent value="people" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Recommended Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestedPeople.map((person) => (
                    <Card key={person.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <Avatar className="w-16 h-16 mx-auto">
                            <AvatarFallback>
                              {person.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h3 className="font-semibold text-lg">{person.name}</h3>
                            <p className="text-gray-600 text-sm">{person.title}</p>
                            <p className="text-gray-500 text-xs">{person.company}</p>
                          </div>

                          <div className="text-sm text-gray-600">
                            <div className="flex items-center justify-center mb-2">
                              <Users className="h-4 w-4 mr-1" />
                              {person.mutualConnections} mutual connections
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {person.reason}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap justify-center gap-1">
                            {person.skills.slice(0, 2).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {person.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{person.skills.length - 2}
                              </Badge>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => connectMutation.mutate(person.id)}
                              disabled={connectMutation.isPending}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Connect
                            </Button>
                            <Button size="sm" variant="outline">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Groups Suggestions */}
          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Recommended Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestedGroups.map((group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg mx-auto flex items-center justify-center">
                            <MessageCircle className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="text-center">
                            <h3 className="font-semibold text-lg">{group.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {group.category}
                            </Badge>
                          </div>

                          <p className="text-gray-600 text-sm text-center">
                            {group.description}
                          </p>

                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2 text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-1" />
                              {group.members.toLocaleString()} members
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {group.reason}
                            </Badge>
                          </div>

                          <Button className="w-full">
                            Join Group
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Suggestions */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recommended Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestedEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mx-auto flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="text-center">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {event.type}
                            </Badge>
                          </div>

                          <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                            <div className="flex items-center justify-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-1" />
                              {event.attendees} attending
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {event.isVirtual ? 'Virtual' : 'In-person'}
                            </Badge>
                          </div>

                          <div className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {event.reason}
                            </Badge>
                          </div>

                          <Button className="w-full">
                            RSVP
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Suggestions */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Recommended Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Content Suggestions Coming Soon</h3>
                  <p className="text-gray-600">
                    AI-powered content recommendations based on your interests and activity
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Suggestions;
