import React, { useState } from 'react';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageCircle, Heart, Share2, Calendar, Trophy, Star, BookOpen, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityLearning = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Community Learning | TalentXcel Learning',
      description: 'Connect with peers, join study groups, and learn together in our vibrant community.'
    });
  }, []);

  // Mock community data
  const studyGroups = [
    {
      id: 1,
      name: 'React Developers Circle',
      description: 'Weekly React discussions, code reviews, and project collaborations',
      members: 234,
      category: 'Frontend',
      nextMeeting: '2024-01-20T15:00:00Z',
      isJoined: true,
      difficulty: 'Intermediate',
      topics: ['React', 'TypeScript', 'State Management']
    },
    {
      id: 2,
      name: 'Python Data Science Club',
      description: 'Learn data science together with Python, pandas, and machine learning',
      members: 189,
      category: 'Data Science',
      nextMeeting: '2024-01-22T18:30:00Z',
      isJoined: false,
      difficulty: 'Beginner',
      topics: ['Python', 'Pandas', 'Machine Learning']
    },
    {
      id: 3,
      name: 'DevOps & Cloud Masters',
      description: 'Exploring AWS, Docker, Kubernetes and modern deployment strategies',
      members: 156,
      category: 'DevOps',
      nextMeeting: '2024-01-25T17:00:00Z',
      isJoined: true,
      difficulty: 'Advanced',
      topics: ['AWS', 'Docker', 'Kubernetes']
    },
    {
      id: 4,
      name: 'Full Stack Builders',
      description: 'End-to-end development projects and mentorship for aspiring full-stack developers',
      members: 298,
      category: 'Full Stack',
      nextMeeting: '2024-01-21T16:00:00Z',
      isJoined: false,
      difficulty: 'Intermediate',
      topics: ['JavaScript', 'Node.js', 'React', 'Databases']
    }
  ];

  const discussions = [
    {
      id: 1,
      title: 'Best practices for React state management in 2024?',
      author: 'Sarah Chen',
      authorAvatar: '/placeholder-avatar.jpg',
      category: 'React',
      replies: 23,
      likes: 45,
      timeAgo: '2 hours ago',
      isAnswered: true,
      tags: ['React', 'State Management', 'Redux']
    },
    {
      id: 2,
      title: 'How to transition from frontend to full-stack development?',
      author: 'Mike Johnson',
      authorAvatar: '/placeholder-avatar.jpg',
      category: 'Career',
      replies: 18,
      likes: 32,
      timeAgo: '4 hours ago',
      isAnswered: false,
      tags: ['Career', 'Full Stack', 'Learning Path']
    },
    {
      id: 3,
      title: 'Data visualization with Python: Matplotlib vs Plotly vs Seaborn',
      author: 'Dr. Lisa Wang',
      authorAvatar: '/placeholder-avatar.jpg',
      category: 'Data Science',
      replies: 31,
      likes: 67,
      timeAgo: '6 hours ago',
      isAnswered: true,
      tags: ['Python', 'Data Viz', 'Libraries']
    },
    {
      id: 4,
      title: 'Docker containerization for Node.js applications - best practices',
      author: 'Alex Rodriguez',
      authorAvatar: '/placeholder-avatar.jpg',
      category: 'DevOps',
      replies: 15,
      likes: 28,
      timeAgo: '8 hours ago',
      isAnswered: false,
      tags: ['Docker', 'Node.js', 'DevOps']
    }
  ];

  const leaderboard = [
    {
      rank: 1,
      name: 'Emma Thompson',
      avatar: '/placeholder-avatar.jpg',
      points: 2840,
      contributions: 'Helped 125 learners',
      badge: 'Community Champion'
    },
    {
      rank: 2,
      name: 'David Kim',
      avatar: '/placeholder-avatar.jpg',
      points: 2650,
      contributions: 'Answered 89 questions',
      badge: 'Knowledge Sharer'
    },
    {
      rank: 3,
      name: 'Maria Garcia',
      avatar: '/placeholder-avatar.jpg',
      points: 2480,
      contributions: 'Led 12 study groups',
      badge: 'Group Leader'
    },
    {
      rank: 4,
      name: 'James Wilson',
      avatar: '/placeholder-avatar.jpg',
      points: 2320,
      contributions: 'Created 25 tutorials',
      badge: 'Content Creator'
    },
    {
      rank: 5,
      name: 'You',
      avatar: '/placeholder-avatar.jpg',
      points: 1850,
      contributions: 'Helped 32 learners',
      badge: 'Rising Star'
    }
  ];

  const events = [
    {
      id: 1,
      title: 'AI/ML Workshop: Building Your First Neural Network',
      date: '2024-01-25',
      time: '18:00',
      attendees: 124,
      type: 'Workshop',
      instructor: 'Dr. Sarah AI',
      duration: '2 hours'
    },
    {
      id: 2,
      title: 'Career Panel: From Bootcamp to Senior Developer',
      date: '2024-01-27',
      time: '15:00',
      attendees: 89,
      type: 'Panel',
      instructor: 'Industry Experts',
      duration: '90 minutes'
    },
    {
      id: 3,
      title: 'Coding Challenge: Algorithm Problem Solving',
      date: '2024-01-30',
      time: '19:00',
      attendees: 156,
      type: 'Competition',
      instructor: 'Community',
      duration: '3 hours'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-700 bg-green-100';
      case 'Intermediate': return 'text-blue-700 bg-blue-100';
      case 'Advanced': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Learning</h1>
            <p className="text-gray-600">
              Connect with peers, join study groups, and learn together
            </p>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">12,450</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-full">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Discussions</p>
                  <p className="text-2xl font-bold text-gray-900">2,840</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-50 rounded-full">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Groups</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-50 rounded-full">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Events This Week</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList>
            <TabsTrigger value="groups">Study Groups</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studyGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getDifficultyColor(group.difficulty)}>
                        {group.difficulty}
                      </Badge>
                      <Badge variant="outline">{group.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{group.members} members</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(group.nextMeeting).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {group.topics.map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        variant={group.isJoined ? "outline" : "default"}
                      >
                        {group.isJoined ? 'View Group' : 'Join Group'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discussions">
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={discussion.authorAvatar} />
                        <AvatarFallback>{discussion.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                              {discussion.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              by {discussion.author} • {discussion.timeAgo}
                            </p>
                          </div>
                          {discussion.isAnswered && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Answered
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {discussion.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span>{discussion.replies} replies</span>
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            <span>{discussion.likes} likes</span>
                          </div>
                          <button className="flex items-center hover:text-blue-600">
                            <Share2 className="h-4 w-4 mr-1" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{event.type}</Badge>
                      <div className="text-sm text-gray-600">
                        {event.date} at {event.time}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{event.attendees} attending</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{event.duration}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm">
                        <span className="font-medium">Instructor:</span> {event.instructor}
                      </p>

                      <Button className="w-full">
                        Register for Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Community Champions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((member) => (
                    <div
                      key={member.rank}
                      className={`flex items-center space-x-4 p-4 rounded-lg ${
                        member.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full border-2 border-gray-200">
                        <span className="text-sm font-bold">{member.rank}</span>
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{member.name}</span>
                          {member.rank <= 3 && (
                            <Trophy className={`h-4 w-4 ${
                              member.rank === 1 ? 'text-yellow-500' :
                              member.rank === 2 ? 'text-gray-400' :
                              'text-orange-400'
                            }`} />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{member.contributions}</span>
                          <Badge variant="secondary" className="text-xs">
                            {member.badge}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{member.points.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityLearning;