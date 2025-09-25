import React from 'react';
import { Link } from 'react-router-dom';
import { updateMetaTags } from "@/utils/metaTags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LearningHeroNav } from '@/components/learning/LearningHeroNav';
import { 
  BookOpen, 
  Play, 
  Search,
  Users,
  Award,
  TrendingUp,
  Brain,
  Code,
  Briefcase,
  Palette,
  BarChart3,
  Clock,
  Target,
  Star,
  Building2,
  Globe,
  GraduationCap,
  Zap,
  Trophy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function LearningHub() {
  const [user, setUser] = React.useState<any>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  React.useEffect(() => {
    updateMetaTags({
      title: "TalentXcel Learning Hub | Professional Skills Development",
      description: "Start, switch, or advance your career with thousands of courses from world-class universities and companies."
    });
  }, []);

  const trendingSearches = [
    'Python Programming',
    'Machine Learning', 
    'Digital Marketing',
    'UI/UX Design',
    'Data Science',
    'Project Management'
  ];

  const categories = [
    { name: 'Technology', icon: Code, color: 'bg-blue-500' },
    { name: 'Business', icon: Briefcase, color: 'bg-green-500' },
    { name: 'Design', icon: Palette, color: 'bg-purple-500' },
    { name: 'Data Science', icon: BarChart3, color: 'bg-orange-500' }
  ];

  const features = [
    {
      title: 'Learning Paths',
      description: 'Structured learning journeys',
      badge: 'Popular',
      icon: Target,
      link: '/learning/paths'
    },
    {
      title: 'Community Learning',
      description: 'Learn with peers and mentors',
      badge: 'Social',
      icon: Users,
      link: '/learning/community'
    },
    {
      title: 'Career Analytics',
      description: 'Data-driven career insights',
      badge: 'Analytics',
      icon: BarChart3,
      link: '/learning/analytics'
    },
    {
      title: 'Employment Bridge',
      description: 'Connect learning to job opportunities',
      badge: 'Jobs',
      icon: Building2,
      link: '/learning/employment-bridge'
    },
    {
      title: 'Quick Learning',
      description: 'Bite-sized learning modules',
      badge: 'Fast',
      icon: Zap,
      link: '/learning/quick-learn'
    },
    {
      title: 'Certificates',
      description: 'Earn recognized credentials',
      badge: 'Certified',
      icon: Award,
      link: '/learning/certificates'
    }
  ];

  const solutions = [
    {
      title: 'For Individuals',
      description: 'Personal skill development',
      icon: Users,
      link: '/learning/individuals'
    },
    {
      title: 'For Businesses',
      description: 'Corporate training programs',
      icon: Building2,
      link: '/learning/businesses'
    },
    {
      title: 'For Universities',
      description: 'Academic partnerships',
      icon: GraduationCap,
      link: '/learning/universities'
    },
    {
      title: 'For Governments',
      description: 'Public sector training',
      icon: Globe,
      link: '/learning/governments'
    }
  ];

  const stats = [
    { value: '300+', label: 'COURSES', color: 'text-blue-600' },
    { value: '50K+', label: 'LEARNERS', color: 'text-purple-600' },
    { value: '94%', label: 'SUCCESS RATE', color: 'text-green-600' },
    { value: '180+', label: 'COUNTRIES', color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-primary">TalentXcel</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="bg-primary text-white hover:bg-primary/90">
              Explore
            </Button>
            <Input
              placeholder="What do you want to learn?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-96 hidden md:block"
            />
            <Button>
              <Search className="h-4 w-4" />
            </Button>
            <Link to="/learning/my-courses">
              <Button variant="ghost">My Learning</Button>
            </Link>
            <Link to="/learning/certificates">
              <Button variant="ghost">Certificates</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Navigation Section */}
      <LearningHeroNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Your Learning Journey */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Your Learning Journey</h2>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">4.8/5</span>
              <span className="text-gray-600">4.8</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Expert-Led Courses</h3>
                    <Badge className="bg-primary/10 text-primary border-primary/20">●</Badge>
                  </div>
                </div>
                <p className="text-gray-600">Learn from top instructors at leading universities</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Career Certificates</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Certificate Ready</Badge>
                  </div>
                </div>
                <p className="text-gray-600">Earn industry-recognized credentials</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Skill Assessment</h3>
                  </div>
                </div>
                <p className="text-gray-600">Track your progress with detailed analytics</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What do you want to learn today? */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-8">What do you want to learn today?</h2>
          
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for courses, skills, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-4 text-lg border-2 rounded-full"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full">
                Search
              </Button>
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">Trending searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {trendingSearches.map((search) => (
                <Badge key={search} className="bg-primary text-white px-4 py-2 cursor-pointer hover:bg-primary/90">
                  {search}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button variant="outline" className="p-4 h-auto">
              <Star className="h-4 w-4 mr-2" />
              Free Courses
            </Button>
            <Button variant="outline" className="p-4 h-auto">
              <Clock className="h-4 w-4 mr-2" />
              Under 2 Hours
            </Button>
            <Button variant="outline" className="p-4 h-auto">
              <TrendingUp className="h-4 w-4 mr-2" />
              Most Popular
            </Button>
            <Button variant="outline" className="p-4 h-auto">
              <Badge className="h-4 w-4 mr-2" />
              New Releases
            </Button>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <Button variant="outline" asChild>
              <Link to="/learning/courses">View All Courses</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.name} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold">{category.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Discover Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Discover Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} to={feature.link}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{feature.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {feature.badge}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Solutions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Learning Solutions</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <Link key={solution.title} to={solution.link}>
                  <Card className="text-center cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{solution.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{solution.description}</p>
                      <Button variant="outline" size="sm">Learn More</Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}