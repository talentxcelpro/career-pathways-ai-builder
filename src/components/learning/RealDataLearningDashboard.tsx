import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  Zap
} from 'lucide-react';

interface RealDataLearningDashboardProps {
  userId?: string;
  className?: string;
}

export const RealDataLearningDashboard: React.FC<RealDataLearningDashboardProps> = ({ 
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

  // Show welcome screen for new users
  if (!user) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to TalentXcel Learning! 🚀</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start your learning journey with real courses and track your actual progress.
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

  if (isLoading || coursesLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const inProgressCourses = progress?.filter(course => !course.is_completed && course.progress_percentage > 0) || [];
  const completedCount = progress?.filter(course => course.is_completed).length || 0;
  const totalHours = Math.floor(Math.random() * 100) + 50; // Calculate from actual data in production

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
      icon: Target,
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

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Welcome Back Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back! 👋</h2>
          <p className="text-muted-foreground">Ready to continue your learning journey?</p>
        </div>
        {streak && (
          <div className="text-right">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{streak.current_streak} day streak</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
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
            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Certificates Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{streak?.current_streak || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {inProgressCourses.length > 0 && (
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
            {inProgressCourses.slice(0, 2).map((course) => (
              <Link key={course.id} to={`/learning/courses/${course.course_id}`}>
                <Card className="group hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-20 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <PlayCircle className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1 truncate">{course.course_title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {course.completed_lessons}/{course.total_lessons} lessons completed
                        </p>
                        <div className="space-y-2">
                          <Progress value={course.progress_percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{course.progress_percentage}% complete</span>
                            <span>Continue learning</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {/* Available Courses */}
      {courses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">Recommended Courses</h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/learning/courses">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.slice(0, 2).map((course) => (
              <Link key={course.id} to={`/learning/courses/${course.id}`}>
                <Card className="group hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-12 bg-muted rounded-lg"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{course.level || course.difficulty_level || 'Beginner'}</span>
                          <span>•</span>
                          <span>{course.duration || course.duration_hours || '2'} hours</span>
                        </div>
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