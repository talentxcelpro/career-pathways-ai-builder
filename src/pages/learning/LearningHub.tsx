import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Award, 
  TrendingUp, 
  Users, 
  Brain,
  Briefcase,
  BarChart3,
  Clock,
  Star,
  ArrowRight,
  Play,
  Zap
} from 'lucide-react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { useLearningData } from '@/hooks/useLearningData';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { updateMetaTags } from '@/utils/metaTags';

const LearningHub = () => {
  const { courses, learningPaths, isLoading } = useLearningData();
  const { displayName, streakDays } = useCurrentUserProfile();

  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Hub | TalentXcel',
      description: 'Your comprehensive learning platform with courses, paths, and employment bridge features.'
    });
  }, []);

  const quickStats = [
    { label: 'Available Courses', value: courses?.length || 0, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Learning Paths', value: learningPaths?.length || 0, icon: Target, color: 'text-green-600' },
    { label: 'Your Streak', value: `${streakDays} days`, icon: Clock, color: 'text-orange-600' },
    { label: 'Skills Available', value: '150+', icon: Star, color: 'text-purple-600' },
  ];

  const mainFeatures = [
    {
      title: 'Browse All Courses',
      description: 'Explore our comprehensive course catalog with advanced filtering and search',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      href: '/learning/courses',
      badge: `${courses?.length || 0} courses`
    },
    {
      title: 'Learning Paths',
      description: 'Structured learning journeys for specific career goals and skills',
      icon: Target,
      color: 'bg-green-50 text-green-600',
      href: '/learning/paths',
      badge: `${learningPaths?.length || 0} paths`
    },
    {
      title: 'My Learning',
      description: 'Track your progress, continue courses, and view achievements',
      icon: Award,
      color: 'bg-purple-50 text-purple-600',
      href: '/learning/my-courses',
      badge: 'Your progress'
    },
    {
      title: 'Employment Bridge',
      description: 'Job-focused courses and market trends to boost your career prospects',
      icon: Briefcase,
      color: 'bg-orange-50 text-orange-600',
      href: '/learning/employment-bridge',
      badge: 'Career focused'
    },
    {
      title: 'Quick Learning',
      description: 'Bite-sized lessons, quizzes, and flashcards for learning on the go',
      icon: Zap,
      color: 'bg-yellow-50 text-yellow-600',
      href: '/learning/quick-learn',
      badge: 'Microlearning'
    },
    {
      title: 'Learning Analytics',
      description: 'Detailed insights into your learning progress and skill development',
      icon: BarChart3,
      color: 'bg-indigo-50 text-indigo-600',
      href: '/learning/analytics',
      badge: 'Data insights'
    }
  ];

  const popularCourses = courses?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Learning Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover courses, master new skills, and advance your career with our comprehensive learning platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <IconComponent className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Learning Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <Link to={feature.href}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-3 rounded-lg ${feature.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary">{feature.badge}</Badge>
                      </div>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <div className="flex items-center text-blue-600 font-medium">
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Popular Courses Preview */}
        {popularCourses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Popular Courses</h2>
              <Link to="/learning/courses">
                <Button variant="outline">
                  View All Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularCourses.map((course) => (
                <Card key={course.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{course.difficulty_level}</Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrolled_count}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration_hours}h
                      </div>
                      <Link to={`/learning/courses/${course.id}`}>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          View Course
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Choose your learning style and begin your journey towards mastering new skills and advancing your career.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/learning/courses">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <BookOpen className="h-5 w-5 mr-2" />
                Browse Courses
              </Button>
            </Link>
            <Link to="/learning/paths">
              <Button size="lg" variant="outline">
                <Target className="h-5 w-5 mr-2" />
                Explore Paths
              </Button>
            </Link>
            <Link to="/learning/employment-bridge">
              <Button size="lg" variant="outline">
                <Briefcase className="h-5 w-5 mr-2" />
                Career Focus
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningHub;