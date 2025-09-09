import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Award, 
  TrendingUp, 
  Briefcase,
  BarChart3,
  Zap,
  Users,
  Home
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

export const LearningNavigation: React.FC = () => {
  const location = useLocation();
  
  const navigationItems: NavigationItem[] = [
    {
      title: 'Learning Hub',
      href: '/learning',
      icon: Home,
      description: 'Main dashboard and overview',
      badge: 'Home'
    },
    {
      title: 'All Courses',
      href: '/learning/courses',
      icon: BookOpen,
      description: 'Browse course catalog',
      badge: 'Browse'
    },
    {
      title: 'My Learning',
      href: '/learning/my-courses',
      icon: Award,
      description: 'Your enrolled courses',
      badge: 'Progress'
    },
    {
      title: 'Learning Paths',
      href: '/learning/paths',
      icon: Target,
      description: 'Structured learning journeys',
      badge: 'Guided'
    },
    {
      title: 'Employment Bridge',
      href: '/learning/employment-bridge',
      icon: Briefcase,
      description: 'Job-focused learning',
      badge: 'Career'
    },
    {
      title: 'Quick Learning',
      href: '/learning/quick-learn',
      icon: Zap,
      description: 'Bite-sized content',
      badge: 'Quick'
    },
    {
      title: 'Analytics',
      href: '/learning/analytics',
      icon: BarChart3,
      description: 'Learning insights',
      badge: 'Data'
    },
    {
      title: 'Certificates',
      href: '/learning/certificates',
      icon: Award,
      description: 'Your achievements',
      badge: 'Awards'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 py-4 overflow-x-auto">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="font-medium">{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant={isActive ? "default" : "secondary"} 
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};