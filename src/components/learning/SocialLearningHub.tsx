import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  BookOpen, 
  Trophy,
  Clock,
  TrendingUp,
  UserPlus,
  Send,
  Search,
  Filter,
  Globe,
  Lock,
  Video,
  Calendar,
  Star,
  ThumbsUp,
  MessageSquare,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  isPrivate: boolean;
  course: string;
  category: string;
  nextSession: string;
  avatar: string;
  tags: string[];
}

interface LearningPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: number;
  };
  content: string;
  course: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  tags: string[];
  type: 'achievement' | 'question' | 'tip' | 'resource';
}

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  rating: number;
  sessionsCompleted: number;
  availability: 'available' | 'busy' | 'offline';
  bio: string;
  hourlyRate?: number;
}

interface LiveSession {
  id: string;
  title: string;
  instructor: string;
  course: string;
  startTime: string;
  duration: number;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
}

export const SocialLearningHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const [studyGroups] = useState<StudyGroup[]>([
    {
      id: '1',
      name: 'React Developers United',
      description: 'Learn React together, share projects, and help each other grow',
      members: 124,
      maxMembers: 200,
      isPrivate: false,
      course: 'Advanced React Patterns',
      category: 'Web Development',
      nextSession: '2024-01-20T15:00:00Z',
      avatar: '/api/placeholder/40/40',
      tags: ['React', 'JavaScript', 'Frontend']
    },
    {
      id: '2',
      name: 'TypeScript Masters',
      description: 'Master TypeScript with fellow developers',
      members: 89,
      maxMembers: 150,
      isPrivate: true,
      course: 'TypeScript Complete Guide',
      category: 'Programming',
      nextSession: '2024-01-21T18:00:00Z',
      avatar: '/api/placeholder/40/40',
      tags: ['TypeScript', 'JavaScript', 'Types']
    }
  ]);

  const [learningPosts] = useState<LearningPost[]>([
    {
      id: '1',
      author: { name: 'Sarah Chen', avatar: '/api/placeholder/40/40', level: 4 },
      content: 'Just completed the React Hooks module! The useCallback optimization chapter was mind-blowing. Anyone else struggling with when to use it vs useMemo?',
      course: 'Advanced React Patterns',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      tags: ['React', 'Hooks', 'Performance'],
      type: 'achievement'
    },
    {
      id: '2',
      author: { name: 'Mike Johnson', avatar: '/api/placeholder/40/40', level: 3 },
      content: 'Pro tip: Use React DevTools Profiler to identify performance bottlenecks before optimizing with useMemo/useCallback. It saves so much time!',
      course: 'React Performance',
      timestamp: '4 hours ago',
      likes: 45,
      comments: 12,
      shares: 18,
      isLiked: true,
      tags: ['React', 'DevTools', 'Performance'],
      type: 'tip'
    }
  ]);

  const [mentors] = useState<Mentor[]>([
    {
      id: '1',
      name: 'Dr. Alex Kumar',
      avatar: '/api/placeholder/40/40',
      expertise: ['React', 'Node.js', 'System Design'],
      rating: 4.9,
      sessionsCompleted: 340,
      availability: 'available',
      bio: 'Senior Software Engineer at Google with 8+ years experience',
      hourlyRate: 50
    },
    {
      id: '2',
      name: 'Lisa Wang',
      avatar: '/api/placeholder/40/40',
      expertise: ['UI/UX Design', 'Figma', 'Design Systems'],
      rating: 4.8,
      sessionsCompleted: 256,
      availability: 'busy',
      bio: 'Lead Designer at Spotify, specializing in mobile experiences'
    }
  ]);

  const [liveSessions] = useState<LiveSession[]>([
    {
      id: '1',
      title: 'Building Scalable React Applications',
      instructor: 'John Doe',
      course: 'Advanced React',
      startTime: '2024-01-20T16:00:00Z',
      duration: 120,
      participants: 85,
      maxParticipants: 100,
      isLive: true
    }
  ]);

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;
    // Handle post submission
    setNewPost('');
  };

  const getPostTypeIcon = (type: LearningPost['type']) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'question': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'tip': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'resource': return <BookOpen className="h-4 w-4 text-purple-500" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getAvailabilityColor = (availability: Mentor['availability']) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Social Learning Hub</h1>
        <p className="text-lg text-muted-foreground">
          Connect, learn, and grow with fellow learners worldwide
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Mentors
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Live Sessions
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Learning Feed */}
        <TabsContent value="feed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Learning Journey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Share an achievement, ask a question, or give a tip..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="outline">Achievement</Badge>
                  <Badge variant="outline">Question</Badge>
                  <Badge variant="outline">Tip</Badge>
                  <Badge variant="outline">Resource</Badge>
                </div>
                <Button onClick={handlePostSubmit} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {learningPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.author.name}</span>
                        <Badge variant="secondary">Level {post.author.level}</Badge>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                        {getPostTypeIcon(post.type)}
                      </div>
                      
                      <p className="text-foreground leading-relaxed">{post.content}</p>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {post.course}
                        </Badge>
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-6 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn("flex items-center gap-2", post.isLiked && "text-red-500")}
                        >
                          <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          <Share2 className="h-4 w-4" />
                          {post.shares}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Study Groups */}
        <TabsContent value="groups" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search study groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create Group
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar>
                      <AvatarImage src={group.avatar} />
                      <AvatarFallback>{group.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{group.name}</h3>
                        {group.isPrivate ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.members}/{group.maxMembers}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {new Date(group.nextSession).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {group.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button className="w-full">
                      {group.isPrivate ? 'Request to Join' : 'Join Group'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mentors */}
        <TabsContent value="mentors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mentor.avatar} />
                        <AvatarFallback>{mentor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                        getAvailabilityColor(mentor.availability)
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{mentor.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{mentor.bio}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{mentor.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({mentor.sessionsCompleted} sessions)
                        </span>
                      </div>
                      {mentor.hourlyRate && (
                        <p className="text-sm font-medium text-primary">
                          ${mentor.hourlyRate}/hour
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" disabled={mentor.availability === 'offline'}>
                        Book Session
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Sessions */}
        <TabsContent value="live" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{session.title}</h3>
                        {session.isLive && (
                          <Badge variant="destructive" className="animate-pulse">
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        by {session.instructor}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Course: {session.course}
                      </p>
                    </div>
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {session.participants}/{session.maxParticipants}
                      </span>
                    </div>
                    
                    <Button className="w-full" disabled={session.participants >= session.maxParticipants}>
                      {session.isLive ? 'Join Live Session' : 'Join Session'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Learners This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      rank === 1 && "bg-yellow-500 text-white",
                      rank === 2 && "bg-gray-400 text-white", 
                      rank === 3 && "bg-orange-600 text-white",
                      rank > 3 && "bg-muted text-muted-foreground"
                    )}>
                      {rank}
                    </div>
                    <Avatar>
                      <AvatarImage src={`/api/placeholder/40/40`} />
                      <AvatarFallback>U{rank}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">User {rank}</p>
                      <p className="text-sm text-muted-foreground">{150 - rank * 10} XP this week</p>
                    </div>
                    <Badge variant="outline">{5 - rank + 1} courses</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};