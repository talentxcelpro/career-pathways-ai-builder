import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Award,
  PlayCircle,
  ChevronRight,
  Calendar,
  Users,
  Star,
  Zap
} from 'lucide-react';

// Mock data - in real app, this would come from user context/API
const mockUserData = {
  isNewUser: false,
  currentCourses: [
    {
      id: 1,
      title: 'Advanced React Development',
      progress: 68,
      nextLesson: 'State Management with Redux',
      timeLeft: '2h 15m',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'UI/UX Design Fundamentals',
      progress: 34,
      nextLesson: 'Color Theory and Psychology',
      timeLeft: '4h 30m',
      thumbnail: '/api/placeholder/300/200'
    }
  ],
  completedCourses: 12,
  totalHours: 156,
  certificates: 5,
  streak: 7,
  nextGoal: 'Complete React course by Friday'
};

const quickActions = [
  {
    title: 'Skill Assessment',
    description: 'Discover your skill gaps',
    icon: Target,
    href: '/learning/skill-assessment',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Learning Paths',
    description: 'Structured learning journeys',
    icon: TrendingUp,
    href: '/learning/paths',
    color: 'bg-green-50 text-green-600'
  },
  {
    title: 'Quick Learn',
    description: '5-minute learning sessions',
    icon: Zap,
    href: '/learning/quick-learn',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    title: 'Community',
    description: 'Learn with others',
    icon: Users,
    href: '/learning/community',
    color: 'bg-orange-50 text-orange-600'
  }
];

const recommendations = [
  {
    title: 'JavaScript Mastery',
    category: 'Programming',
    rating: 4.8,
    students: '50K+',
    duration: '12 hours',
    reason: 'Based on your React progress'
  },
  {
    title: 'Design Systems',
    category: 'Design',
    rating: 4.9,
    students: '25K+',
    duration: '8 hours',
    reason: 'Complements your UI/UX course'
  }
];

interface PersonalizedDashboardProps {
  className?: string;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ className }) => {
  const { isNewUser, currentCourses, completedCourses, totalHours, certificates, streak, nextGoal } = mockUserData;

  if (isNewUser) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to TalentXcel Learning! 🚀</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start your learning journey with a quick skill assessment to get personalized course recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/learning/skill-assessment">
                  <Target className="h-5 w-5 mr-2" />
                  Take Skill Assessment
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/learning/courses">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse All Courses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Welcome Back Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back! 👋</h2>
          <p className="text-muted-foreground">Ready to continue your learning journey?</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{streak} day streak</span>
          </div>
          <p className="text-sm font-medium text-foreground">{nextGoal}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{completedCourses}</p>
            <p className="text-xs text-muted-foreground">Courses Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
            <p className="text-xs text-muted-foreground">Total Learning Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{certificates}</p>
            <p className="text-xs text-muted-foreground">Certificates Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">Continue Learning</h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/learning/my-courses">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <div className="w-20 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <PlayCircle className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1 truncate">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">Next: {course.nextLesson}</p>
                    <div className="space-y-2">
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{course.progress}% complete</span>
                        <span>{course.timeLeft} left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-foreground mb-1 text-sm">{action.title}</h4>
                <p className="text-xs text-muted-foreground">{action.description}</p>
                <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
                  <Link to={action.href}>Go</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Recommended for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((course, index) => (
            <Card key={index} className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{course.title}</h4>
                      <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                      <span>{course.students} students</span>
                      <span>{course.duration}</span>
                    </div>
                    <p className="text-xs text-primary">{course.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};