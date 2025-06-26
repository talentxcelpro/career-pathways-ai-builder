
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Users, TrendingUp, MessageCircle, UserPlus, Eye } from "lucide-react";
import { Link } from 'react-router-dom';

interface AISuggestionEngineProps {
  userId?: string;
}

export const AISuggestionEngine: React.FC<AISuggestionEngineProps> = ({
  userId
}) => {
  const [suggestions, setSuggestions] = useState({
    people: [] as any[],
    posts: [] as any[],
    groups: [] as any[],
    events: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSuggestions();
  }, [userId]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Simulate AI-powered suggestions - in real app, this would call AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuggestions({
        people: [
          {
            id: '1',
            full_name: 'Sarah Chen',
            title: 'Senior Product Manager at TechCorp',
            profile_picture_url: null,
            skills: ['Product Management', 'Strategy', 'AI/ML'],
            mutualConnections: 5,
            reason: 'Similar role and 5 mutual connections'
          },
          {
            id: '2',
            full_name: 'Alex Rodriguez',
            title: 'Software Engineering Lead',
            profile_picture_url: null,
            skills: ['React', 'Node.js', 'System Design'],
            mutualConnections: 3,
            reason: 'Works in your industry with complementary skills'
          }
        ],
        posts: [
          {
            id: '1',
            content: 'The future of remote work: insights from leading companies',
            author: 'Industry Expert',
            engagement: '234 likes, 45 comments',
            reason: 'Trending in your network'
          },
          {
            id: '2',
            content: 'How AI is transforming product development workflows',
            author: 'Product Leader',
            engagement: '156 likes, 32 comments',
            reason: 'Based on your interests in AI and Product Management'
          }
        ],
        groups: [
          {
            id: '1',
            name: 'Product Management Excellence',
            description: 'A community for product managers to share insights and best practices',
            member_count: 12500,
            category: 'Professional Development',
            reason: 'Matches your role and interests'
          },
          {
            id: '2',
            name: 'AI & Machine Learning Professionals',
            description: 'Discussing the latest in AI, ML, and data science',
            member_count: 8900,
            category: 'Technology',
            reason: 'Based on your activity and connections'
          }
        ],
        events: [
          {
            id: '1',
            title: 'Product Leadership Summit 2024',
            start_time: '2024-02-15T10:00:00Z',
            event_type: 'conference',
            attendees: 250,
            reason: 'Relevant to your career goals'
          },
          {
            id: '2',
            title: 'AI in Product Development Webinar',
            start_time: '2024-02-10T15:00:00Z',
            event_type: 'webinar',
            attendees: 120,
            reason: 'Combines your interests in AI and Product Management'
          }
        ]
      });
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
            {suggestions.people.map((person) => (
              <div key={person.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Avatar>
                  <AvatarImage src={person.profile_picture_url} />
                  <AvatarFallback>
                    {person.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <Link to={`/network/people/${person.id}`} className="font-medium hover:text-blue-600">
                      {person.full_name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{person.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {person.skills.slice(0, 3).map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Brain className="h-3 w-3 inline mr-1" />
                    {person.reason}
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="default">
                      <UserPlus className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
            {suggestions.posts.map((post) => (
              <div key={post.id} className="p-3 border rounded-lg">
                <p className="font-medium mb-2">{post.content}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>by {post.author}</span>
                  <span>{post.engagement}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <Brain className="h-3 w-3 inline mr-1" />
                  {post.reason}
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  <Eye className="h-3 w-3 mr-1" />
                  View Post
                </Button>
              </div>
            ))}
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
            {suggestions.groups.map((group) => (
              <div key={group.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link to={`/network/groups/${group.id}`} className="font-medium hover:text-blue-600">
                      {group.name}
                    </Link>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {group.category}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {group.member_count.toLocaleString()} members
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  <Brain className="h-3 w-3 inline mr-1" />
                  {group.reason}
                </p>
                <Button size="sm" variant="outline">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Join Group
                </Button>
              </div>
            ))}
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
            {suggestions.events.map((event) => (
              <div key={event.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link to={`/network/events/${event.id}`} className="font-medium hover:text-blue-600">
                      {event.title}
                    </Link>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {event.event_type}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {event.attendees} attendees
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {formatDateTime(event.start_time)}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  <Brain className="h-3 w-3 inline mr-1" />
                  {event.reason}
                </p>
                <Button size="sm" variant="outline">
                  View Event
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
