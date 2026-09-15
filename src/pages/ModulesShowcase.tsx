import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Briefcase,
  Users,
  PlayCircle,
  BookOpen,
  Trophy,
  Gift,
  QrCode,
  FileText,
  Building,
  Search,
  Bell,
  MapPin,
  TrendingUp,
  Camera,
  MessageSquare,
  Calendar,
  BarChart3,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Grid3x3,
  List,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface Module {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  route: string;
  category: 'core' | 'social' | 'learning' | 'tools' | 'rewards';
  features: string[];
  status: 'live' | 'beta' | 'coming-soon';
  popularity: number;
  isNew?: boolean;
  isPremium?: boolean;
  color: string;
  bgColor: string;
  estimatedTime?: string;
}

export const ModulesShowcase = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const modules: Module[] = [
    {
      id: 'jobs',
      name: 'Job Search',
      description: 'Find your dream job with AI-powered matching',
      longDescription: 'Advanced job search with personalized recommendations, salary insights, and one-click applications.',
      icon: <Briefcase className="w-6 h-6" />,
      route: '/jobs',
      category: 'core',
      features: ['AI Job Matching', 'Salary Insights', 'One-Click Apply', 'Company Reviews'],
      status: 'live',
      popularity: 95,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      estimatedTime: '5 min setup'
    },
    {
      id: 'network',
      name: 'Professional Network',
      description: 'Connect with industry professionals',
      longDescription: 'Build meaningful professional relationships with people in your industry and beyond.',
      icon: <Users className="w-6 h-6" />,
      route: '/network',
      category: 'social',
      features: ['Smart Connections', 'Industry Groups', 'Messaging', 'Networking Events'],
      status: 'live',
      popularity: 88,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      estimatedTime: '2 min setup'
    },
    {
      id: 'reels',
      name: 'Career Reels',
      description: 'Short-form career content and stories',
      longDescription: 'Discover career tips, success stories, and industry insights through engaging video content.',
      icon: <PlayCircle className="w-6 h-6" />,
      route: '/mobile/reels',
      category: 'social',
      features: ['Career Tips', 'Success Stories', 'Industry Updates', 'Video Creation'],
      status: 'live',
      popularity: 82,
      isNew: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      estimatedTime: 'Ready to use'
    },
    {
      id: 'learning',
      name: 'Learning Hub',
      description: 'Upskill with courses and certifications',
      longDescription: 'Access thousands of courses, earn certifications, and track your learning progress.',
      icon: <BookOpen className="w-6 h-6" />,
      route: '/learning',
      category: 'learning',
      features: ['500+ Courses', 'Certifications', 'Progress Tracking', 'AI Recommendations'],
      status: 'live',
      popularity: 91,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      estimatedTime: '10 min setup'
    },
    {
      id: 'gamification',
      name: 'Rewards & Achievements',
      description: 'Earn points, badges, and TXC tokens',
      longDescription: 'Gamified career progress with rewards for completing tasks, learning, and networking.',
      icon: <Trophy className="w-6 h-6" />,
      route: '/gamification',
      category: 'rewards',
      features: ['Points System', 'Achievement Badges', 'TXC Tokens', 'Leaderboards'],
      status: 'live',
      popularity: 76,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      estimatedTime: 'Instant'
    },
    {
      id: 'refer',
      name: 'Refer & Earn',
      description: 'Invite friends and earn rewards',
      longDescription: 'Earn cash rewards and bonuses by referring friends to join the platform.',
      icon: <Gift className="w-6 h-6" />,
      route: '/refer-and-earn',
      category: 'rewards',
      features: ['Cash Rewards', 'Bonus Points', 'Tracking Dashboard', 'Social Sharing'],
      status: 'live',
      popularity: 73,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      estimatedTime: '1 min setup'
    },
    {
      id: 'passport',
      name: 'Digital Passport',
      description: 'Your comprehensive career profile',
      longDescription: 'Showcase your skills, experience, and achievements in a beautiful digital format.',
      icon: <FileText className="w-6 h-6" />,
      route: '/mobile/passport',
      category: 'tools',
      features: ['Digital Resume', 'Skill Verification', 'Portfolio Showcase', 'QR Sharing'],
      status: 'live',
      popularity: 85,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      estimatedTime: '15 min setup'
    },
    {
      id: 'qr-scanner',
      name: 'QR Connect',
      description: 'Quick networking with QR codes',
      longDescription: 'Instantly connect with professionals by scanning QR codes at events and meetings.',
      icon: <QrCode className="w-6 h-6" />,
      route: '/mobile/qr-scanner',
      category: 'tools',
      features: ['QR Scanning', 'Instant Connect', 'Event Networking', 'Contact Exchange'],
      status: 'live',
      popularity: 68,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      estimatedTime: 'Ready to use'
    },
    {
      id: 'hubs',
      name: 'Community Hubs',
      description: 'Join interest-based professional groups',
      longDescription: 'Participate in specialized communities based on your interests and industry.',
      icon: <Building className="w-6 h-6" />,
      route: '/mobile/hubs',
      category: 'social',
      features: ['Industry Groups', 'Discussion Forums', 'Expert AMAs', 'Resource Sharing'],
      status: 'beta',
      popularity: 71,
      isNew: true,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      estimatedTime: '3 min setup'
    },
    {
      id: 'analytics',
      name: 'Career Analytics',
      description: 'Track your career progress with insights',
      longDescription: 'Detailed analytics on your job search, network growth, and career development.',
      icon: <BarChart3 className="w-6 h-6" />,
      route: '/analytics',
      category: 'tools',
      features: ['Progress Tracking', 'Performance Insights', 'Goal Setting', 'Reports'],
      status: 'coming-soon',
      popularity: 0,
      isPremium: true,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      estimatedTime: 'Coming soon'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Modules', count: modules.length },
    { id: 'core', name: 'Core Features', count: modules.filter(m => m.category === 'core').length },
    { id: 'social', name: 'Social & Networking', count: modules.filter(m => m.category === 'social').length },
    { id: 'learning', name: 'Learning & Growth', count: modules.filter(m => m.category === 'learning').length },
    { id: 'tools', name: 'Tools & Utilities', count: modules.filter(m => m.category === 'tools').length },
    { id: 'rewards', name: 'Rewards & Incentives', count: modules.filter(m => m.category === 'rewards').length }
  ];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Live</Badge>;
      case 'beta':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Beta</Badge>;
      case 'coming-soon':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  const handleModuleClick = (module: Module) => {
    if (module.status === 'coming-soon') return;
    navigate(module.route);
  };

  return (
    <>
      <Helmet>
        <title>Discover All Features | TalentXcel</title>
        <meta name="description" content="Explore all TalentXcel modules and features to accelerate your career growth. From job search to networking, learning, and rewards." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Grid3x3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover All Features
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive suite of career tools designed to accelerate your professional growth and success.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search modules, features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    {category.name}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {category.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Modules Grid/List */}
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredModules.map((module) => (
              <Card 
                key={module.id}
                className={`
                  cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105
                  ${module.status === 'coming-soon' ? 'opacity-60 cursor-not-allowed' : ''}
                  ${viewMode === 'list' ? 'flex flex-row' : ''}
                `}
                onClick={() => handleModuleClick(module)}
              >
                <CardHeader className={viewMode === 'list' ? 'flex-shrink-0 pb-2' : ''}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${module.bgColor}`}>
                      <div className={module.color}>
                        {module.icon}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {module.isNew && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          New
                        </Badge>
                      )}
                      {module.isPremium && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {getStatusBadge(module.status)}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {module.description}
                  </p>
                </CardHeader>

                <CardContent className={`space-y-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  {viewMode === 'grid' && (
                    <p className="text-sm text-gray-600">
                      {module.longDescription}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Features:</span>
                      <span className="text-gray-700">{module.features.length}</span>
                    </div>
                    
                    {viewMode === 'grid' && (
                      <ul className="space-y-1">
                        {module.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {module.features.length > 3 && (
                          <li className="text-sm text-gray-500">
                            +{module.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {module.status === 'live' && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Zap className="w-3 h-3 mr-1" />
                            {module.estimatedTime}
                          </div>
                        )}
                      </div>
                      
                      {module.status !== 'coming-soon' && (
                        <Button size="sm" className="text-xs">
                          {module.status === 'live' ? 'Launch' : 'Try Beta'}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};