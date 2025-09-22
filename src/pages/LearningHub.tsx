import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { updateMetaTags } from "@/utils/metaTags";
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Target, 
  Award, 
  Flame, 
  Search, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  Briefcase,
  Code,
  BarChart3,
  Heart,
  Lightbulb,
  Globe,
  Smartphone,
  ArrowRight,
  Play,
  Calendar,
  CheckCircle,
  Zap,
  GraduationCap,
  Building,
  Palette,
  Brain,
  Camera,
  Wrench,
  Building2,
  Shield
} from 'lucide-react';
import { useCourses, useCourseCategories } from '@/hooks/useCourses';
import { AdvancedProgressTracker } from '@/components/learning/AdvancedProgressTracker';
import { SocialLearningHub } from '@/components/learning/SocialLearningHub';
import { MobileOptimizedLearning } from '@/components/learning/MobileOptimizedLearning';
import { EnterpriseAnalyticsDashboard } from '@/components/learning/EnterpriseAnalyticsDashboard';
import { AIRecommendationEngine } from '@/components/learning/AIRecommendationEngine';
import { CertificationMarketplace } from '@/components/learning/CertificationMarketplace';
import { CorporatePortal } from '@/components/learning/CorporatePortal';
import { CourseGrid } from '@/components/learning/CourseGrid';
import { ProfessionalCourseGrid } from '@/components/learning/ProfessionalCourseGrid';
import { AssessmentIntegration } from '@/components/learning/AssessmentIntegration';

const industryIcons = {
  'technology': Code,
  'business': Briefcase,
  'marketing': TrendingUp,
  'design': Palette,
  'healthcare': Heart,
  'education': GraduationCap,
  'engineering': Wrench,
  'hospitality': Building
};

const courseDurations = [
  { 
    id: 'short', 
    title: 'Quick Skills', 
    duration: '1-4 weeks', 
    icon: Zap, 
    description: 'Learn essential skills fast',
    courses: 60
  },
  { 
    id: 'medium', 
    title: 'Professional Courses', 
    duration: '1-3 months', 
    icon: Target, 
    description: 'In-depth professional development',
    courses: 80
  },
  { 
    id: 'long', 
    title: 'Expert Programs', 
    duration: '3-12 months', 
    icon: Award, 
    description: 'Comprehensive mastery programs',
    courses: 40
  }
];

const learningStats = [
  { label: 'Active Learners', value: '50,000+', icon: Users, color: 'text-primary' },
  { label: 'Courses Available', value: '300+', icon: BookOpen, color: 'text-brand-green' },
  { label: 'Success Rate', value: '94%', icon: CheckCircle, color: 'text-success' },
  { label: 'Countries', value: '180+', icon: Globe, color: 'text-info' }
];

export default function LearningHub() {
  const { displayName, streakDays } = useCurrentUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhase, setActivePhase] = useState<'phase1' | 'phase2'>('phase1');
  const { courses: featuredCourses, isLoading } = useCourses({ limit: 9 });
  const { data: categories } = useCourseCategories();
  
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel Learning Hub | Professional Skills Development',
      description: `Master industry-relevant skills with our comprehensive learning platform. Choose from 300+ courses across technology, business, healthcare, and more.`
    });
  }, []);

  const friendlyName = React.useMemo(() => {
    if (!displayName) return 'Future Leader';
    if (displayName.includes('@')) {
      const base = displayName.split('@')[0].replace(/[._-]+/g, ' ').trim();
      return base ? base.replace(/\b\w/g, c => c.toUpperCase()) : 'Future Leader';
    }
    return displayName;
  }, [displayName]);

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Flame className="h-5 w-5 text-accent" />
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                {streakDays}-day learning streak
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Welcome back,{' '}
              <span className="text-accent">
                {friendlyName}
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your career with 300+ industry-leading courses across multiple domains. 
              From quick skills to expert certifications - your learning journey starts here.
            </p>

            {/* Phase Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => setActivePhase('phase1')}
                variant={activePhase === 'phase1' ? 'secondary' : 'outline'}
                className={activePhase === 'phase1' ? 'bg-white text-primary' : 'border-white/30 text-white hover:bg-white/10'}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Core Features
              </Button>
              <Button 
                size="lg" 
                onClick={() => setActivePhase('phase2')}
                variant={activePhase === 'phase2' ? 'secondary' : 'outline'}
                className={activePhase === 'phase2' ? 'bg-white text-primary' : 'border-white/30 text-white hover:bg-white/10'}
              >
                <Brain className="mr-2 h-5 w-5" />
                Enterprise Suite
              </Button>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search courses, skills, or industries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white border-0 shadow-lg rounded-lg focus:ring-2 focus:ring-accent"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-secondary hover:bg-secondary/90 px-6 rounded-md">
                  Search
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/learning/courses">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Play className="h-5 w-5 mr-2" />
                  Start Learning Now
                </Button>
              </Link>
              <Link to="/learning/paths">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold backdrop-blur-sm">
                  <Target className="h-5 w-5 mr-2" />
                  Explore Learning Paths
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Based on Active Phase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8">
        {activePhase === 'phase1' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground text-sm mb-4">Advanced learning analytics and insights</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Social Learning</h3>
                <p className="text-muted-foreground text-sm mb-4">Connect and learn with peers</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Smartphone className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mobile Learning</h3>
                <p className="text-muted-foreground text-sm mb-4">Learn anywhere, anytime</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Achievements</h3>
                <p className="text-muted-foreground text-sm mb-4">Earn badges and certificates</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <BarChart3 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Enterprise Analytics</h3>
                <p className="text-muted-foreground text-sm mb-4">Comprehensive learning insights</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Brain className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
                <p className="text-muted-foreground text-sm mb-4">Personalized learning paths</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Shield className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                <p className="text-muted-foreground text-sm mb-4">Industry-recognized credentials</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-500/10 flex items-center justify-center group-hover:bg-slate-500/20 transition-colors">
                  <Building2 className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Corporate Portal</h3>
                <p className="text-muted-foreground text-sm mb-4">Enterprise team management</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Tabs */}
        <Tabs defaultValue={activePhase === 'phase1' ? 'progress' : 'analytics'} className="w-full">
          <TabsList className={`grid w-full ${activePhase === 'phase1' ? 'grid-cols-3' : 'grid-cols-4'} mb-8`}>
            {activePhase === 'phase1' ? (
              <>
                <TabsTrigger value="progress" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Engine
                </TabsTrigger>
                <TabsTrigger value="certifications" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </TabsTrigger>
                <TabsTrigger value="corporate" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Corporate
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {activePhase === 'phase1' ? (
            <>
              <TabsContent value="progress">
                <AdvancedProgressTracker />
              </TabsContent>
              <TabsContent value="social">
                <SocialLearningHub />
              </TabsContent>
              <TabsContent value="mobile">
                <MobileOptimizedLearning />
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="analytics">
                <EnterpriseAnalyticsDashboard />
              </TabsContent>
              <TabsContent value="ai">
                <AIRecommendationEngine />
              </TabsContent>
              <TabsContent value="certifications">
                <CertificationMarketplace />
              </TabsContent>
              <TabsContent value="corporate">
                <CorporatePortal />
              </TabsContent>
            </>
          )}
        </Tabs>
      </section>

      {/* Learning Stats */}
      <section className="bg-muted/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Learning Impact</h2>
            <p className="text-lg text-muted-foreground">Join thousands of learners transforming their careers</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {learningStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Featured Courses</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked courses from top instructors to accelerate your career growth.
          </p>
        </div>

        <CourseGrid limit={9} />
        <div className="text-center mt-12">
          <Link to="/learning/courses">
            <Button size="lg" variant="outline" className="px-8 py-4 rounded-lg">
              View All 500+ Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Assessment Integration Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AssessmentIntegration />
      </section>

      {/* Categories & Duration */}
      <section className="bg-muted/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Explore by Category</h2>
            <p className="text-lg text-muted-foreground">Find the perfect learning path for your career goals</p>
          </div>

          {/* Course Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
            {categories?.map((category) => {
              const IconComponent = industryIcons[category.name?.toLowerCase() as keyof typeof industryIcons] || Code;
              return (
                <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.course_count || 0} courses</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Duration-based Learning */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courseDurations.map((duration) => {
              const IconComponent = duration.icon;
              return (
                <Card key={duration.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{duration.title}</h3>
                    <p className="text-muted-foreground mb-3">{duration.description}</p>
                    <div className="text-2xl font-bold text-primary mb-3">{duration.courses} courses</div>
                    <div className="text-sm text-muted-foreground mb-4">{duration.duration}</div>
                    <Button variant="outline" className="w-full">
                      Explore {duration.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}