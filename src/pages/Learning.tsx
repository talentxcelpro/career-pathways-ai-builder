
import React, { useState, useMemo } from 'react';
import { LearningLayout } from '@/components/learning/LearningLayout';
import { LearningTabs } from '@/components/learning/LearningTabs';
import { LearningProgress } from '@/components/learning/LearningProgress';
import { QuickEnrollCTA } from '@/components/learning/QuickEnrollCTA';
import { useRealDataService } from '@/hooks/useRealDataService';
import { updateMetaTags } from '@/utils/metaTags';
import { BookOpen, TrendingUp, Users, Sparkles, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [userCourses, setUserCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  const {
    getAllCourses,
    getAllLearningPaths,
    getPopularCourses
  } = useRealDataService();

  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Platform | TalentXcel',
      description: 'Explore courses, learning paths, and track your progress on TalentXcel\'s comprehensive learning platform.'
    });
  }, []);

  // Optimized mock data with memoization
  const mockUserCourses = useMemo(() => [
    {
      id: '1',
      user_id: 'mock-user',
      course_id: 'course-1',
      progress_percentage: 65,
      enrolled_at: new Date().toISOString(),
      course: {
        id: 'course-1',
        title: 'JavaScript Fundamentals',
        description: 'Learn JavaScript from scratch with hands-on projects',
        duration_hours: 30,
        difficulty_level: 'beginner',
        skills_taught: ['JavaScript', 'Web Development'],
        thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500'
      }
    }
  ], []);

  React.useEffect(() => {
    setUserCourses(mockUserCourses);
    setEnrolledCourseIds(['course-1']);
  }, [mockUserCourses]);

  const handleEnrollCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to enroll in courses');
        return;
      }

      toast.success('Successfully enrolled in course!');
      setEnrolledCourseIds(prev => [...prev, courseId]);
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const isEnrolled = (courseId: string) => enrolledCourseIds.includes(courseId);
  const featuredCourse = getPopularCourses.data?.[0];

  return (
    <LearningLayout>
      {/* Apple-inspired Hero Section */}
      <div className="relative overflow-hidden rounded-3xl mb-8">
        <div className="absolute inset-0 bg-gradient-ai opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-ai-violet/30 to-primary/10"></div>
        
        {/* Floating elements */}
        <div className="absolute top-8 right-12 w-32 h-32 bg-ai-violet/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-12 left-8 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-float delay-1000"></div>
        
        <div className="relative px-8 py-16 lg:px-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-apple apple-padding-sm apple-rounded-xl mb-6">
              <Sparkles className="card-icon-sm mr-2" />
              <span className="text-body-small font-medium">AI-Powered Learning</span>
            </div>
            
            <h1 className="text-display font-heading leading-tight mb-6">
              Master Skills That
              <span className="block bg-gradient-to-r from-white via-ai-violet-50 to-white bg-clip-text text-transparent">
                Shape the Future
              </span>
            </h1>
            
            <p className="text-body-large opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals advancing their careers with our expert-crafted courses and AI-powered learning paths.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 apple-rounded-xl apple-padding-lg text-body font-semibold shadow-elegant group">
                <BookOpen className="icon-md mr-2 group-hover:scale-110 transition-transform" />
                Explore Courses
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 apple-rounded-xl apple-padding-lg">
                <Target className="icon-md mr-2" />
                View Learning Paths
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card variant="glass" className="group hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-subheading font-medium">Active Courses</CardTitle>
            <div className="apple-padding-sm bg-primary/10 apple-rounded-md">
              <BookOpen className="card-icon-md text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline font-bold text-foreground">{getAllCourses.data?.length || 0}</div>
            <p className="text-caption text-muted-foreground">Ready to start learning</p>
            <div className="flex items-center mt-2">
              <Badge variant="glow" className="text-caption">
                <Zap className="card-icon-sm mr-1" />
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="glass" className="group hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-subheading font-medium">Learning Paths</CardTitle>
            <div className="apple-padding-sm bg-ai-violet/10 apple-rounded-md">
              <TrendingUp className="card-icon-md text-ai-violet-dark" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline font-bold text-foreground">{getAllLearningPaths.data?.length || 0}</div>
            <p className="text-caption text-muted-foreground">Guided career journeys</p>
            <div className="flex items-center mt-2">
              <Badge className="text-caption bg-ai-violet/10 text-ai-violet-dark">
                <Sparkles className="card-icon-sm mr-1" />
                AI-Curated
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="glass" className="group hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-subheading font-medium">Community</CardTitle>
            <div className="apple-padding-sm bg-success/10 apple-rounded-md">
              <Users className="card-icon-md text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline font-bold text-foreground">10,000+</div>
            <p className="text-caption text-muted-foreground">Active learners</p>
            <div className="flex items-center mt-2">
              <Badge variant="success" className="text-caption">
                Growing
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      {userCourses.length > 0 && (
        <div className="mb-8">
          <LearningProgress userCourses={userCourses} />
        </div>
      )}

      {/* Featured Course CTA */}
      {featuredCourse && (
        <div className="mb-8">
          <QuickEnrollCTA
            featuredCourse={featuredCourse}
            onEnroll={handleEnrollCourse}
            isEnrolled={isEnrolled}
          />
        </div>
      )}

      {/* Learning Tabs */}
      <LearningTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredCourses={getAllCourses.data || []}
        coursesLoading={getAllCourses.isLoading}
        learningPaths={getAllLearningPaths.data || []}
        pathsLoading={getAllLearningPaths.isLoading}
        userCourses={userCourses}
        isEnrolled={isEnrolled}
        enrollInCourse={handleEnrollCourse}
      />

      {/* Modern Quick Actions */}
      <div className="mt-12 bg-gradient-glass backdrop-blur-apple apple-rounded-xl apple-padding-lg border border-glass-border">
        <div className="text-center mb-8">
          <h2 className="text-title font-heading text-foreground mb-2">Take Your Learning Further</h2>
          <p className="text-body text-muted-foreground">Explore specialized tools and resources designed for your success</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              to: "/learning/employment-bridge", 
              title: "Employment Bridge", 
              subtitle: "Job-focused learning", 
              icon: Target,
              gradient: "from-primary to-primary-light"
            },
            { 
              to: "/learning/skill-assessment", 
              title: "Skill Assessment", 
              subtitle: "Test your knowledge", 
              icon: Zap,
              gradient: "from-ai-violet-medium to-ai-violet-dark"
            },
            { 
              to: "/learning/career-roadmap", 
              title: "Career Roadmap", 
              subtitle: "Plan your journey", 
              icon: TrendingUp,
              gradient: "from-success to-green-500"
            },
            { 
              to: "/learning/community", 
              title: "Community", 
              subtitle: "Learn together", 
              icon: Users,
              gradient: "from-warning to-orange-500"
            }
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link key={index} to={item.to}>
                <Card className="group hover:scale-105 transition-all duration-300 border-0 shadow-card hover:shadow-elegant">
                  <CardContent className="apple-padding-md">
                    <div className={`inline-flex apple-padding-sm apple-rounded-xl bg-gradient-to-r ${item.gradient} mb-4`}>
                      <IconComponent className="hero-icon text-white" />
                    </div>
                    <h3 className="font-heading text-subheading text-foreground mb-1">{item.title}</h3>
                    <p className="text-caption text-muted-foreground">{item.subtitle}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </LearningLayout>
  );
};

export default Learning;
