import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { updateMetaTags } from "@/utils/metaTags";
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
  Shield,
  User,
  School
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

const audienceTypes = [
  {
    id: 'individuals',
    title: 'For Individuals',
    description: 'Build skills to advance your career',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: ['Personal career growth', 'Flexible learning schedule', 'Industry certifications']
  },
  {
    id: 'businesses',
    title: 'For Businesses',
    description: 'Upskill your workforce effectively',
    icon: Building,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    features: ['Team learning analytics', 'Custom learning paths', 'Enterprise dashboard']
  },
  {
    id: 'universities',
    title: 'For Universities',
    description: 'Enhance academic programs',
    icon: School,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: ['Academic integration', 'Student progress tracking', 'Curriculum enhancement']
  },
  {
    id: 'governments',
    title: 'For Governments',
    description: 'Develop public sector skills',
    icon: Shield,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: ['Public policy training', 'Compliance courses', 'Leadership development']
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
  const [selectedAudience, setSelectedAudience] = useState<string>('individuals');
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
      {/* Audience Navigation - Coursera Style */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8">
              {audienceTypes.map((audience) => (
                <button
                  key={audience.id}
                  onClick={() => setSelectedAudience(audience.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedAudience === audience.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {audience.title}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/learning/search">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Explore
                </Button>
              </Link>
              <Link to="/learning/certificates">
                <Button variant="outline" size="sm">
                  Online Degrees
                </Button>
              </Link>
              <Button size="sm" className="bg-primary text-white">
                Join for Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section - Clean Coursera Style */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <Badge variant="secondary" className="mb-4">
                  {audienceTypes.find(a => a.id === selectedAudience)?.title}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Build skills with courses, certificates, and degrees online from world-class universities and companies
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Learn at your own pace from top universities like Yale, Michigan, Stanford, and leading companies like Google and IBM.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="What do you want to learn?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-32 py-4 text-base bg-white border-2 border-border shadow-sm rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/learning/courses">
                  <Button size="lg" className="px-8 py-3 text-base">
                    Start Learning Today
                  </Button>
                </Link>
                <Link to="/learning/paths">
                  <Button size="lg" variant="outline" className="px-8 py-3 text-base">
                    Explore Programs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {learningStats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                        <IconComponent className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                        <div className="text-xl font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  Trusted by learners worldwide
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience-Specific Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {audienceTypes.find(a => a.id === selectedAudience)?.description}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the right learning solution for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {audienceTypes.find(a => a.id === selectedAudience)?.features.map((feature, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-sm bg-muted/20">
                <CardContent className="p-0">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Courses</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular courses from top instructors and industry experts.
            </p>
          </div>

          <CourseGrid limit={6} />
          
          <div className="text-center mt-8">
            <Link to="/learning/courses">
              <Button variant="outline" size="lg" className="px-8">
                View All Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Learn from Top Universities Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Learn from 300+ top universities and companies
            </h2>
            <p className="text-lg text-muted-foreground">
              Access world-class education from leading institutions and industry leaders
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
            {/* University/Company logos would go here */}
            <div className="text-2xl font-bold text-muted-foreground">Stanford</div>
            <div className="text-2xl font-bold text-muted-foreground">Yale</div>
            <div className="text-2xl font-bold text-muted-foreground">Google</div>
            <div className="text-2xl font-bold text-muted-foreground">IBM</div>
            <div className="text-2xl font-bold text-muted-foreground">Microsoft</div>
            <div className="text-2xl font-bold text-muted-foreground">Meta</div>
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