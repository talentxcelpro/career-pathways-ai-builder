import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { updateMetaTags } from "@/utils/metaTags";
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Wrench
} from 'lucide-react';
import { useCourses, useCourseCategories } from '@/hooks/useCourses';
import { CourseGrid } from '@/components/learning/CourseGrid';

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

      {/* Learning Hub Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Pipeline Dashboard */}
          <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Pipeline Dashboard</h3>
              <p className="text-muted-foreground text-sm mb-4">Track your learning progress and job pipeline</p>
              <Link to="/learning/pipeline">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6">
                  Access
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Smart Learning */}
          <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <Brain className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Learning</h3>
              <p className="text-muted-foreground text-sm mb-4">AI-powered personalized learning paths</p>
              <Link to="/learning/system">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6">
                  Explore
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Company Portal */}
          <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Company Portal</h3>
              <p className="text-muted-foreground text-sm mb-4">Access corporate learning resources</p>
              <Link to="/learning/company-portal">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6">
                  Enter
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Advanced Analytics */}
          <Card className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-700/10 flex items-center justify-center group-hover:bg-blue-700/20 transition-colors">
                <TrendingUp className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground text-sm mb-4">Deep insights into your learning performance</p>
              <Link to="/learning/analytics">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6">
                  View Data
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Course Duration Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Learning Pace</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you need quick skills or comprehensive expertise, we have the perfect learning duration for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courseDurations.map((duration) => {
            const IconComponent = duration.icon;
            return (
              <Card key={duration.id} className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{duration.title}</CardTitle>
                  <p className="text-muted-foreground">{duration.duration}</p>
                  <Badge variant="secondary" className="mt-2">
                    {duration.courses} courses
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">{duration.description}</p>
                  <Link to={`/learning/courses?duration=${duration.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-md">
                      Explore Courses
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Industry Categories */}
      <section className="bg-muted/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Explore by Industry</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dive deep into your field with specialized courses designed by industry experts.
            </p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((category) => {
              const categoryKey = category.name.toLowerCase().replace(/\s+/g, '');
              const IconComponent = industryIcons[categoryKey as keyof typeof industryIcons] || Code;
              
              return (
                <Card key={category.id} className="group overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="h-20 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden flex items-center justify-center group-hover:from-primary/10 group-hover:to-primary/20 transition-colors">
                    <IconComponent className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary/20 text-primary border-0 text-xs">
                        {category.course_count || 0}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-foreground mb-2">{category.name}</h3>
                    <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                      {category.description}
                    </p>
                    <Link to={`/learning/courses?category=${category.name}`}>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                        Explore
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
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
              View All 300+ Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Advanced Learning Features</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Leverage cutting-edge technology to accelerate your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Smart Recommendations', href: '/learning/recommendations', icon: Brain, description: 'AI-powered course suggestions' },
              { title: 'Interactive Learning', href: '/learning/interactive', icon: Smartphone, description: 'Hands-on practice environments' },
              { title: 'Learning Community', href: '/learning/community-new', icon: Users, description: 'Connect with fellow learners' },
              { title: 'Mobile Learning', href: '/learning/mobile', icon: Smartphone, description: 'Learn on-the-go' }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <IconComponent className="h-8 w-8 mx-auto mb-4 text-accent" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/80 mb-4">{feature.description}</p>
                    <Link to={feature.href}>
                      <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                        Explore
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats & Social Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Join Thousands of Successful Learners</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {learningStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join thousands of professionals who have advanced their careers with TalentXcel. 
            Start your journey today with our comprehensive learning platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/learning/courses">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-lg text-lg font-semibold">
                <Play className="h-5 w-5 mr-2" />
                Start Learning for Free
              </Button>
            </Link>
            <Link to="/learning/paths">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold">
                <Calendar className="h-5 w-5 mr-2" />
                View Learning Paths
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}