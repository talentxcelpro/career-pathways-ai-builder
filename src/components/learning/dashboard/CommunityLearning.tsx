import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CourseCard } from './CourseCard';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Video, 
  ArrowRight, 
  Trophy,
  Clock,
  Star,
  Zap
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name?: string;
  instructor_bio?: string;
  duration_hours?: number;
  rating?: number;
  enrolled_count?: number;
  skills_taught?: string[];
  price?: number;
  currency?: string;
  thumbnail_url?: string;
  video_preview_url?: string;
  difficulty_level?: string;
  category?: string;
}

interface CommunityLearningProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  onWishlist: (courseId: string) => void;
  enrolledCourses: string[];
  wishlist: string[];
}

export const CommunityLearning: React.FC<CommunityLearningProps> = ({
  courses,
  onEnroll,
  onWishlist,
  enrolledCourses,
  wishlist
}) => {
  const activeDiscussions = [
    {
      id: 1,
      title: "Best practices for React hooks",
      course: "Advanced React Development",
      replies: 23,
      participants: 8,
      lastActivity: "2 hours ago",
      isPopular: true
    },
    {
      id: 2,
      title: "Machine Learning project ideas",
      course: "Data Science Fundamentals",
      replies: 15,
      participants: 12,
      lastActivity: "4 hours ago",
      isPopular: false
    },
    {
      id: 3,
      title: "UI/UX design principles discussion",
      course: "Design Thinking Workshop",
      replies: 31,
      participants: 15,
      lastActivity: "1 hour ago",
      isPopular: true
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Live Q&A: Python for Beginners",
      instructor: "Dr. Sarah Johnson",
      date: "Today, 3:00 PM",
      participants: 45,
      type: "live"
    },
    {
      id: 2,
      title: "Group Study: React Project Review",
      instructor: "Community Led",
      date: "Tomorrow, 2:00 PM",
      participants: 12,
      type: "group"
    },
    {
      id: 3,
      title: "Career Talk: Tech Industry Insights",
      instructor: "Mark Thompson",
      date: "Friday, 5:00 PM",
      participants: 78,
      type: "webinar"
    }
  ];

  const studyGroups = [
    {
      id: 1,
      name: "JavaScript Mastery",
      members: 156,
      activity: "Very Active",
      nextSession: "Today 7 PM",
      level: "Intermediate"
    },
    {
      id: 2,
      name: "Data Science Beginners",
      members: 203,
      activity: "Active",
      nextSession: "Tomorrow 6 PM",
      level: "Beginner"
    },
    {
      id: 3,
      name: "AI/ML Research Group",
      members: 89,
      activity: "Moderate",
      nextSession: "Saturday 4 PM",
      level: "Advanced"
    }
  ];

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'live': return Video;
      case 'group': return Users;
      case 'webinar': return Calendar;
      default: return MessageSquare;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'live': return 'bg-red-100 text-red-700';
      case 'group': return 'bg-blue-100 text-blue-700';
      case 'webinar': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Community Learning</h2>
            <p className="text-muted-foreground">Learn with peers, join discussions, and attend live sessions</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm">
          Join Community
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">2,847</div>
            <div className="text-sm text-muted-foreground">Active Learners</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm text-muted-foreground">Active Discussions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Video className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">23</div>
            <div className="text-sm text-muted-foreground">Live Sessions Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">89</div>
            <div className="text-sm text-muted-foreground">Study Groups</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Discussions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Active Discussions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeDiscussions.map((discussion) => (
              <div key={discussion.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-2 mb-2">
                  <h4 className="font-medium text-sm flex-1">{discussion.title}</h4>
                  {discussion.isPopular && (
                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{discussion.course}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>{discussion.replies} replies</span>
                    <span>{discussion.participants} participants</span>
                  </div>
                  <span>{discussion.lastActivity}</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm">
              View All Discussions
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => {
              const Icon = getEventTypeIcon(event.type);
              return (
                <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEventTypeColor(event.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{event.instructor}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{event.date}</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{event.participants}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <Button variant="outline" className="w-full" size="sm">
              View All Events
            </Button>
          </CardContent>
        </Card>

        {/* Study Groups */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Study Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {studyGroups.map((group) => (
              <div key={group.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{group.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {group.level}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>{group.members} members</span>
                    <span className="text-green-600">{group.activity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Next: {group.nextSession}</span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm">
              Browse All Groups
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Popular Community Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            Popular Community Courses
            <Badge className="ml-2 bg-emerald-100 text-emerald-700">
              High Engagement
            </Badge>
          </h3>
          <Button variant="outline" size="sm">
            View All Popular Courses
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 6).map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={onEnroll}
              onWishlist={onWishlist}
              isEnrolled={enrolledCourses.includes(course.id)}
              isWishlisted={wishlist.includes(course.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};