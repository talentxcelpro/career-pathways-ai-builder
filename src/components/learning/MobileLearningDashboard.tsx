import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useLearningData } from '@/hooks/useLearningData';
import { supabase } from '@/integrations/supabase/client';
import {
  BookOpen,
  Clock,
  Target,
  Award,
  PlayCircle,
  ChevronRight,
  Calendar,
  Users,
  Zap,
  Brain,
  TrendingUp,
  Briefcase
} from 'lucide-react';

interface MobileLearningDashboardProps {
  userId?: string;
  className?: string;
}

export const MobileLearningDashboard: React.FC<MobileLearningDashboardProps> = ({ 
  userId, 
  className 
}) => {
  const [user, setUser] = React.useState<any>(null);
  const { progress, streak, isLoading } = useLearningProgress();
  const { courses, isLoading: coursesLoading } = useLearningData();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const inProgressCourses = progress?.filter(course => !course.is_completed && course.progress_percentage > 0) || [];
  const completedCount = progress?.filter(course => course.is_completed).length || 0;
  const totalHours = Math.floor(Math.random() * 100) + 50;

  const quickActions = [
    {
      title: 'Skill Assessment',
      icon: Brain,
      href: '/learning/skill-assessment',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      badge: 'New'
    },
    {
      title: 'Learning Paths',
      icon: TrendingUp,
      href: '/learning/paths',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      badge: 'AI'
    },
    {
      title: 'Quick Learn',
      icon: Zap,
      href: '/learning/quick-learn',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      badge: 'Fast'
    },
    {
      title: 'Career Tools',
      icon: Briefcase,
      href: '/learning/employment-bridge',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      badge: 'Jobs'
    }
  ];

  if (!user) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-3">Welcome to TalentXcel! 🚀</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Start your learning journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="sm" className="flex-1">
                <Link to="/learning/skill-assessment">
                  <Target className="h-4 w-4 mr-2" />
                  Take Assessment
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to="/learning/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || coursesLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-2/3 mb-3"></div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Welcome back! 👋</h1>
        <p className="text-sm text-muted-foreground">Ready to continue learning?</p>
      </div>

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <CardContent className="p-4">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xl font-bold text-foreground">{totalHours}h</p>
            <p className="text-xs text-muted-foreground">Learning Time</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Certificates</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xl font-bold text-foreground">{streak?.current_streak || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="group hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{action.title}</h3>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Continue Learning */}
      {inProgressCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Continue Learning</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/learning/my-courses">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {inProgressCourses.slice(0, 2).map((course) => (
              <Link key={course.id} to={`/learning/courses/${course.course_id}`}>
                <Card className="group hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <div className="w-12 h-10 bg-muted rounded flex items-center justify-center">
                        <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{course.course_title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {course.completed_lessons}/{course.total_lessons} lessons
                        </p>
                        <Progress value={course.progress_percentage} className="h-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Courses */}
      {courses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Recommended</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/learning/courses">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {courses.slice(0, 3).map((course) => (
              <Link key={course.id} to={`/learning/courses/${course.id}`}>
                <Card className="group hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-10 bg-muted rounded"></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground mb-1">{course.title}</h3>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                          <span>{course.level || course.difficulty_level || 'Beginner'}</span>
                          <span>•</span>
                          <span>{course.duration || course.duration_hours || '2'}h</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {course.is_free ? 'Free' : 'Premium'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};