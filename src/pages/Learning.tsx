
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { LearningLayout } from '@/components/learning/LearningLayout';
import { LearningTabs } from '@/components/learning/LearningTabs';
import { LearningProgress } from '@/components/learning/LearningProgress';
import { QuickEnrollCTA } from '@/components/learning/QuickEnrollCTA';
import { LearningEngineStatus } from '@/components/learning/LearningEngineStatus';
import { useRealDataService } from '@/hooks/useRealDataService';
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
      <Helmet>
        <title>AI Career Learning Hub | TalentXcel — Courses, Paths &amp; Skill Mastery</title>
        <meta name="description" content="Accelerate your career with AI-curated courses, structured learning paths and real-time skill intelligence. Thousands of verified industry programs on TalentXcel." />
        <meta name="keywords" content="career learning, ai courses, skill roadmap, software development, data science courses, certifications india, talentxcel learning" />
        <link rel="canonical" href="https://talentxcel.in/learning" />
        <meta property="og:title" content="AI Career Learning Hub | TalentXcel" />
        <meta property="og:description" content="Accelerate your career with AI-curated courses, structured learning paths and real-time skill intelligence." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talentxcel.in/learning" />
        <meta property="og:image" content="https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Career Learning Hub | TalentXcel" />
        <meta name="twitter:description" content="Master in-demand skills with AI-curated courses and structured career paths on TalentXcel." />
        <meta name="twitter:image" content="https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" />
      </Helmet>

      {/* Dynamic AI Learning Engine Hero */}
      <div className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-primary via-ai-violet-medium to-ai-violet-dark">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full animate-spin-slow"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-ai-violet/10 rounded-full animate-bounce-slow"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full animate-pulse-slow"></div>
        </div>
        
        {/* Floating AI Elements */}
        <div className="absolute top-8 right-12 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-float backdrop-blur-sm">
          <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
        </div>
        <div className="absolute bottom-12 left-8 w-12 h-12 bg-ai-violet/20 rounded-full flex items-center justify-center animate-float delay-1000 backdrop-blur-sm">
          <Zap className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-success/20 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-warning/20 rounded-full animate-pulse delay-500"></div>
        
        {/* Neural Network Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <pattern id="neural" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="white" opacity="0.3">
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
                </circle>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neural)" />
          </svg>
        </div>
        
        <div className="relative px-8 py-16 lg:px-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Dynamic Status Badge */}
            <div className="inline-flex items-center bg-white/20 backdrop-blur-apple apple-padding-sm apple-rounded-xl mb-6 animate-fade-in">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse mr-2"></div>
              <Sparkles className="card-icon-sm mr-2 animate-spin-slow" />
              <span className="text-body-small font-medium">AI Learning Engine • Live</span>
              <div className="ml-2 px-2 py-1 bg-success/20 rounded-full">
                <span className="text-xs">Online</span>
              </div>
            </div>
            
            {/* Animated Title */}
            <h1 className="text-display font-heading leading-tight mb-6 animate-fade-in">
              <span className="block">Master Skills That</span>
              <span className="block bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent animate-shimmer bg-300% font-bold">
                Shape the Future
              </span>
            </h1>
            
            {/* Typing Animation Subtitle */}
            <p className="text-body-large opacity-90 mb-8 max-w-2xl mx-auto animate-fade-in delay-300">
              Join <span className="font-bold text-cyan-300">50,000+</span> professionals advancing their careers with our 
              <span className="font-semibold text-ai-violet-light"> AI-powered learning engine</span> and expert-crafted courses.
            </p>
            
            {/* Real-time Learning Stats */}
            <div className="flex items-center justify-center gap-6 mb-8 text-sm animate-fade-in delay-500">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>1,247 learning now</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Users className="w-4 h-4" />
                <span>94% success rate</span>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-700">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 apple-rounded-xl apple-padding-lg text-body font-semibold shadow-elegant group hover:scale-105 transition-all duration-300"
              >
                <BookOpen className="icon-md mr-2 group-hover:scale-110 transition-transform" />
                Start Learning Journey
                <div className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 apple-rounded-xl apple-padding-lg group hover:scale-105 transition-all duration-300"
              >
                <Target className="icon-md mr-2 group-hover:rotate-90 transition-transform duration-300" />
                AI Learning Paths
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Learning Engine Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 shadow-card hover:shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-subheading font-medium group-hover:text-primary transition-colors">Active Courses</CardTitle>
            <div className="apple-padding-sm bg-primary/10 apple-rounded-md group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
              <BookOpen className="card-icon-md text-primary animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-headline font-bold text-foreground group-hover:text-primary transition-colors">
              {getAllCourses.data?.length || 0}
              <span className="text-body-small ml-2 text-muted-foreground">courses</span>
            </div>
            <p className="text-caption text-muted-foreground mb-3">Ready to start learning</p>
            <div className="flex items-center justify-between">
              <Badge className="text-caption bg-success/10 text-success border-success/20 animate-pulse">
                <Zap className="card-icon-sm mr-1" />
                Live Engine
              </Badge>
              <div className="text-xs text-muted-foreground">+12 today</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-card to-card/50 border-ai-violet/20 hover:border-ai-violet/40 shadow-card hover:shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-ai-violet/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-subheading font-medium group-hover:text-ai-violet-dark transition-colors">AI Learning Paths</CardTitle>
            <div className="apple-padding-sm bg-ai-violet/10 apple-rounded-md group-hover:bg-ai-violet/20 transition-colors group-hover:scale-110 duration-300">
              <TrendingUp className="card-icon-md text-ai-violet-dark animate-bounce-slow" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-headline font-bold text-foreground group-hover:text-ai-violet-dark transition-colors">
              {getAllLearningPaths.data?.length || 0}
              <span className="text-body-small ml-2 text-muted-foreground">paths</span>
            </div>
            <p className="text-caption text-muted-foreground mb-3">AI-curated career journeys</p>
            <div className="flex items-center justify-between">
              <Badge className="text-caption bg-ai-violet/10 text-ai-violet-dark border-ai-violet/20">
                <Sparkles className="card-icon-sm mr-1 animate-spin-slow" />
                AI-Powered
              </Badge>
              <div className="text-xs text-muted-foreground">94% match rate</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-card to-card/50 border-success/20 hover:border-success/40 shadow-card hover:shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-subheading font-medium group-hover:text-success transition-colors">Learning Community</CardTitle>
            <div className="apple-padding-sm bg-success/10 apple-rounded-md group-hover:bg-success/20 transition-colors group-hover:scale-110 duration-300">
              <Users className="card-icon-md text-success animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-headline font-bold text-foreground group-hover:text-success transition-colors">
              50,000+
              <span className="text-body-small ml-2 text-muted-foreground">learners</span>
            </div>
            <p className="text-caption text-muted-foreground mb-3">Active global community</p>
            <div className="flex items-center justify-between">
              <Badge className="text-caption bg-success/10 text-success border-success/20">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse mr-1"></div>
                1,247 online
              </Badge>
              <div className="text-xs text-muted-foreground">+15% this month</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Engine Status */}
      <div className="mb-8">
        <LearningEngineStatus />
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

      {/* Learning Path Categories */}
      <div className="mb-12 space-y-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-title font-heading text-foreground mb-3">Choose Your Learning Journey</h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Tailored learning paths designed for different career stages and goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {/* Individual Learners */}
          <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-card via-primary/5 to-card shadow-card hover:shadow-glow border-primary/20 hover:border-primary/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-primary/10 rounded-full animate-pulse"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/15 rounded-xl group-hover:bg-primary/25 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20">Individual</Badge>
              </div>
              <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                Personal Growth
              </CardTitle>
              <p className="text-muted-foreground">
                Build skills at your own pace with AI-guided learning paths
              </p>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Skill Assessment', 'Career Roadmap', 'Progress Tracking'].map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    {feature}
                  </Badge>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Available Paths</span>
                  <span className="font-semibold text-primary">12+</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 w-3/4 animate-pulse"></div>
                </div>
              </div>
              
              <Link to="/learning/paths" className="block">
                <Button className="w-full group-hover:bg-primary/90">
                  Explore Individual Paths
                  <Sparkles className="w-4 h-4 ml-2 group-hover:animate-spin" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Job Seekers */}
          <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-card via-success/5 to-card shadow-card hover:shadow-glow border-success/20 hover:border-success/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-success/10 rounded-full animate-bounce-slow"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-success/15 rounded-xl group-hover:bg-success/25 transition-colors">
                  <Target className="w-6 h-6 text-success group-hover:scale-110 transition-transform" />
                </div>
                <Badge className="bg-success/10 text-success border-success/20">Job Seeker</Badge>
              </div>
              <CardTitle className="text-xl text-foreground group-hover:text-success transition-colors">
                Employment Bridge
              </CardTitle>
              <p className="text-muted-foreground">
                Job-focused training with direct employer connections
              </p>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Job Matching', 'Interview Prep', 'Industry Insights'].map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    {feature}
                  </Badge>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold text-success">94%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success rounded-full h-2 w-5/6 animate-pulse"></div>
                </div>
              </div>
              
              <Link to="/learning/employment-bridge" className="block">
                <Button className="w-full bg-success hover:bg-success/90 text-white">
                  Start Job Search
                  <TrendingUp className="w-4 h-4 ml-2 group-hover:animate-bounce" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Companies */}
          <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-card via-ai-violet/5 to-card shadow-card hover:shadow-glow border-ai-violet/20 hover:border-ai-violet/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ai-violet/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-ai-violet/10 rounded-full animate-spin-slow"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-ai-violet/15 rounded-xl group-hover:bg-ai-violet/25 transition-colors">
                  <Users className="w-6 h-6 text-ai-violet-dark group-hover:scale-110 transition-transform" />
                </div>
                <Badge className="bg-ai-violet/10 text-ai-violet-dark border-ai-violet/20">Enterprise</Badge>
              </div>
              <CardTitle className="text-xl text-foreground group-hover:text-ai-violet-dark transition-colors">
                Corporate Training
              </CardTitle>
              <p className="text-muted-foreground">
                Scalable workforce development and skill advancement
              </p>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Team Training', 'Analytics', 'Custom Content'].map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    {feature}
                  </Badge>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Companies Served</span>
                  <span className="font-semibold text-ai-violet-dark">500+</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-ai-violet-medium rounded-full h-2 w-4/5 animate-pulse"></div>
                </div>
              </div>
              
              <Link to="/learning/company-portal" className="block">
                <Button className="w-full bg-ai-violet-medium hover:bg-ai-violet-dark text-white">
                  Enterprise Solutions
                  <Zap className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

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

      {/* AI Learning Engine Control Center */}
      <div className="mt-12 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-apple apple-rounded-xl apple-padding-lg border border-glass-border shadow-elegant relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 via-ai-violet/10 to-success/10 animate-gradient-x"></div>
        </div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-caption font-medium text-muted-foreground uppercase tracking-wider">Learning Engine Active</span>
            </div>
            <h2 className="text-title font-heading text-foreground mb-2">Take Your Learning Further</h2>
            <p className="text-body text-muted-foreground">Explore specialized AI-powered tools and resources designed for your success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                to: "/learning/employment-bridge", 
                title: "Employment Bridge", 
                subtitle: "Job-focused learning", 
                icon: Target,
                gradient: "from-primary to-primary-light",
                stats: "2.3k jobs matched"
              },
              { 
                to: "/learning/skill-assessment", 
                title: "AI Skill Assessment", 
                subtitle: "Test your knowledge", 
                icon: Zap,
                gradient: "from-ai-violet-medium to-ai-violet-dark",
                stats: "Instant results"
              },
              { 
                to: "/learning/career-roadmap", 
                title: "Smart Roadmap", 
                subtitle: "Plan your journey", 
                icon: TrendingUp,
                gradient: "from-success to-green-500",
                stats: "94% success rate"
              },
              { 
                to: "/learning/community", 
                title: "Learning Hub", 
                subtitle: "Learn together", 
                icon: Users,
                gradient: "from-warning to-orange-500",
                stats: "1,247 active now"
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link key={index} to={item.to} className="block">
                  <Card className="group hover:scale-105 transition-all duration-500 border-0 shadow-card hover:shadow-elegant bg-gradient-to-br from-card to-card/70 relative overflow-hidden">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-ai-violet/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardContent className="apple-padding-md relative z-10">
                      <div className={`inline-flex apple-padding-sm apple-rounded-xl bg-gradient-to-r ${item.gradient} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="hero-icon text-white group-hover:animate-pulse" />
                      </div>
                      <h3 className="font-heading text-subheading text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-caption text-muted-foreground mb-2">{item.subtitle}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-caption bg-muted/30">
                          {item.stats}
                        </Badge>
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Quick Action Center */}
          <div className="mt-8 pt-6 border-t border-glass-border">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 group">
                <Sparkles className="w-4 h-4 mr-2 group-hover:animate-spin" />
                AI Recommendations
              </Button>
              <Button variant="outline" className="group">
                <TrendingUp className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Learning Analytics
              </Button>
              <Button variant="outline" className="group">
                <Users className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Join Study Groups
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};

export default Learning;
