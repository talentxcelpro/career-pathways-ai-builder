import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, Award, MessageCircle, UserPlus, Filter } from "lucide-react";
import { useNetworking } from "@/hooks/useNetworking";
import { useAuth } from "@/contexts/AuthContext";

const ProfessionalNetworking = () => {
  const { user } = useAuth();
  const { networkMatches, acceptMatch, isLoading, isProcessing } = useNetworking();
  const [activeTab, setActiveTab] = useState('matches');

  // Mock data for smart matches since the table might not exist yet
  const mockMatches = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Senior Product Manager',
      company: 'Tech Corp',
      matchScore: 92,
      commonSkills: ['Product Strategy', 'Agile', 'Data Analysis'],
      location: 'San Francisco, CA',
      avatar: '/placeholder-avatar.png',
      matchReasons: ['Similar role', 'Shared connections', 'Common interests']
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Engineering Lead',
      company: 'InnovateLabs',
      matchScore: 88,
      commonSkills: ['Leadership', 'Full Stack Development', 'System Design'],
      location: 'Seattle, WA',
      avatar: '/placeholder-avatar.png',
      matchReasons: ['Industry overlap', 'Career trajectory', 'Skills alignment']
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      title: 'UX Design Director',
      company: 'Design Studio',
      matchScore: 85,
      commonSkills: ['User Research', 'Design Systems', 'Prototyping'],
      location: 'Austin, TX',
      avatar: '/placeholder-avatar.png',
      matchReasons: ['Creative background', 'Leadership experience', 'Growth mindset']
    }
  ];

  const mockConnections = [
    {
      id: '1',
      name: 'David Kim',
      title: 'Data Scientist',
      company: 'Analytics Pro',
      connectionDate: '2024-01-15',
      avatar: '/placeholder-avatar.png',
      status: 'active'
    },
    {
      id: '2',
      name: 'Lisa Zhang',
      title: 'Marketing Director',
      company: 'Growth Co',
      connectionDate: '2024-02-20',
      avatar: '/placeholder-avatar.png',
      status: 'active'
    }
  ];

  const handleAcceptMatch = async (matchId: string) => {
    try {
      await acceptMatch(matchId);
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Networking Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connections</p>
                <p className="text-2xl font-bold">127</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold">342</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Score</p>
                <p className="text-2xl font-bold">8.7</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversations</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Networking Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="matches">Smart Matches</TabsTrigger>
            <TabsTrigger value="connections">My Network</TabsTrigger>
            <TabsTrigger value="suggestions">Grow Network</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <TabsContent value="matches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockMatches.map((match) => (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={match.avatar} />
                        <AvatarFallback>{match.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{match.name}</h3>
                        <p className="text-sm text-muted-foreground">{match.title}</p>
                        <p className="text-xs text-muted-foreground">{match.company}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {match.matchScore}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Match Strength</span>
                      <span className="text-sm text-muted-foreground">{match.matchScore}%</span>
                    </div>
                    <Progress value={match.matchScore} className="h-2" />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Common Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {match.commonSkills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Why you match</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {match.matchReasons.slice(0, 2).map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAcceptMatch(match.id)}
                      disabled={isProcessing}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockConnections.map((connection) => (
              <Card key={connection.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={connection.avatar} />
                      <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground">{connection.title}</p>
                      <p className="text-xs text-muted-foreground">{connection.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Connected on {new Date(connection.connectionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline">
                      Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="text-center py-8">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Grow Your Network</h3>
            <p className="text-muted-foreground mb-4">
              Discover new connections based on your interests and career goals
            </p>
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              Get Recommendations
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalNetworking;