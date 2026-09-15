import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Briefcase,
  Users,
  BookOpen,
  Trophy,
  Gift,
  QrCode,
  Bell,
  Search,
  FileText,
  Building,
  Star,
  TrendingUp,
  Zap,
  ChevronRight,
  PlayCircle,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
  color: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export const MobileHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const modules: ModuleCard[] = [
    {
      id: 'jobs',
      title: 'Jobs',
      description: 'Find your dream job',
      icon: <Briefcase className="w-6 h-6" />,
      route: '/jobs',
      badge: '2.5k+',
      color: 'bg-blue-100 text-blue-600',
      isPopular: true
    },
    {
      id: 'network',
      title: 'Network',
      description: 'Connect with professionals',
      icon: <Users className="w-6 h-6" />,
      route: '/network',
      badge: '15k+',
      color: 'bg-green-100 text-green-600',
      isPopular: true
    },
    {
      id: 'reels',
      title: 'Reels',
      description: 'Career stories & tips',
      icon: <PlayCircle className="w-6 h-6" />,
      route: '/mobile/reels',
      badge: 'New',
      color: 'bg-purple-100 text-purple-600',
      isNew: true
    },
    {
      id: 'learning',
      title: 'Learning',
      description: 'Upskill & grow',
      icon: <BookOpen className="w-6 h-6" />,
      route: '/learning',
      badge: '500+',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'gamification',
      title: 'Rewards',
      description: 'Earn points & badges',
      icon: <Trophy className="w-6 h-6" />,
      route: '/gamification',
      badge: 'TXC',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'refer',
      title: 'Refer & Earn',
      description: 'Invite friends & earn',
      icon: <Gift className="w-6 h-6" />,
      route: '/refer-and-earn',
      badge: '$50',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 'passport',
      title: 'Passport',
      description: 'Digital career profile',
      icon: <FileText className="w-6 h-6" />,
      route: '/mobile/passport',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'qr',
      title: 'QR Scanner',
      description: 'Quick connections',
      icon: <QrCode className="w-6 h-6" />,
      route: '/mobile/qr-scanner',
      color: 'bg-teal-100 text-teal-600'
    },
    {
      id: 'hubs',
      title: 'Community Hubs',
      description: 'Interest-based groups',
      icon: <Building className="w-6 h-6" />,
      route: '/mobile/hubs',
      badge: 'Beta',
      color: 'bg-cyan-100 text-cyan-600',
      isNew: true
    }
  ];

  const quickActions = [
    { icon: <Search className="w-5 h-5" />, label: 'Search', route: '/mobile/search' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', route: '/mobile/notifications' },
    { icon: <MapPin className="w-5 h-5" />, label: 'Nearby', route: '/mobile/nearby' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Trending', route: '/trending' }
  ];

  const handleModuleClick = (route: string) => {
    navigate(route);
  };

  return (
    <MobileNavWrapper>
      <ScrollArea className="h-[calc(100vh-80px)] ios-scroll">
        <div className="px-4 py-6 space-y-6 pb-20 native-app-style safe-area-top">
          {/* Welcome Header */}
          <div className="native-card p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">
                  Welcome back! 👋
                </h1>
                <p className="text-sm text-gray-600">
                  Ready to advance your career?
                </p>
              </div>
              <Zap className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="native-card p-4 text-center touch-feedback"
                  onClick={() => handleModuleClick(action.route)}
                >
                  <div className="w-8 h-8 mx-auto mb-2 text-primary flex items-center justify-center">
                    {action.icon}
                  </div>
                  <p className="text-xs font-medium text-gray-700">{action.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Modules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Explore Modules</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/modules')}
                className="text-xs"
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {modules.map((module) => (
                <Card 
                  key={module.id}
                  className="native-card cursor-pointer touch-feedback hover:shadow-lg transition-all duration-200"
                  onClick={() => handleModuleClick(module.route)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${module.color}`}>
                        {module.icon}
                      </div>
                      <div className="flex flex-col gap-1">
                        {module.isNew && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700">
                            New
                          </Badge>
                        )}
                        {module.isPopular && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700">
                            <Star className="w-3 h-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{module.description}</p>
                    
                    <div className="flex items-center justify-between">
                      {module.badge && (
                        <Badge variant="outline" className="text-xs">
                          {module.badge}
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="native-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">24</div>
                <div className="text-xs text-gray-600">Connections</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">5</div>
                <div className="text-xs text-gray-600">Applications</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">180</div>
                <div className="text-xs text-gray-600">TXC Points</div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="native-card p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Pro Tip</h4>
                <p className="text-sm text-gray-600">
                  Complete your profile to unlock premium features and get better job matches!
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </MobileNavWrapper>
  );
};