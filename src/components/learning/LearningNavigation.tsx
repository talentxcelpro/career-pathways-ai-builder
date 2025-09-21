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
  Home,
  Lightbulb,
  Smartphone,
  UserCheck
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  category: 'core' | 'advanced' | 'tools';
}

export const LearningNavigation: React.FC = () => {
  const location = useLocation();
  
  const navigationItems: NavigationItem[] = [
    // Core Learning
    {
      title: 'Learning Hub',
      href: '/learning',
      icon: Home,
      description: 'Your learning dashboard',
      badge: 'Home',
      category: 'core'
    },
    {
      title: 'All Courses',
      href: '/learning/courses',
      icon: BookOpen,
      description: 'Browse our course catalog',
      badge: 'Explore',
      category: 'core'
    },
    {
      title: 'Learning Paths',
      href: '/learning/paths',
      icon: Target,
      description: 'Structured learning journeys',
      badge: 'Guided',
      category: 'core'
    },
    {
      title: 'My Learning',
      href: '/learning/my-courses',
      icon: Award,
      description: 'Your enrolled courses',
      badge: 'Progress',
      category: 'core'
    },
    {
      title: 'Quick Learn',
      href: '/learning/quick-learn',
      icon: Zap,
      description: 'Bite-sized content',
      badge: 'Fast',
      category: 'core'
    },
    
    // Advanced Features
    {
      title: 'Smart Recommendations',
      href: '/learning/recommendations',
      icon: Lightbulb,
      description: 'AI-powered suggestions',
      badge: 'AI',
      category: 'advanced'
    },
    {
      title: 'Interactive Content',
      href: '/learning/interactive',
      icon: Smartphone,
      description: 'Hands-on learning',
      badge: 'Interactive',
      category: 'advanced'
    },
    {
      title: 'Learning Community',
      href: '/learning/community-new',
      icon: Users,
      description: 'Connect with learners',
      badge: 'Social',
      category: 'advanced'
    },
    {
      title: 'Mobile Learning',
      href: '/learning/mobile',
      icon: Smartphone,
      description: 'Learn on-the-go',
      badge: 'Mobile',
      category: 'advanced'
    },
    
    // Tools & Analytics
    {
      title: 'Employment Bridge',
      href: '/learning/employment-bridge',
      icon: Briefcase,
      description: 'Job-focused learning',
      badge: 'Career',
      category: 'tools'
    },
    {
      title: 'Analytics',
      href: '/learning/analytics',
      icon: BarChart3,
      description: 'Learning insights',
      badge: 'Data',
      category: 'tools'
    },
    {
      title: 'Certificates',
      href: '/learning/certificates',
      icon: Award,
      description: 'Your achievements',
      badge: 'Awards',
      category: 'tools'
    }
  ];

  const coreItems = navigationItems.filter(item => item.category === 'core');
  const advancedItems = navigationItems.filter(item => item.category === 'advanced');
  const toolItems = navigationItems.filter(item => item.category === 'tools');

  const renderNavigationSection = (items: NavigationItem[], title: string, bgColor: string) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2 px-4">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
              <Link
                key={item.href}
                to={item.href}
                className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? `bg-primary text-white shadow-lg`
                    : 'bg-card hover:bg-muted/50 text-foreground hover:text-foreground shadow-sm border'
                }`}
              >
                <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{item.title}</span>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'} truncate`}>
                    {item.description}
                  </p>
                </div>
                {item.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className={`text-xs ${
                      isActive 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex-shrink-0 flex flex-col items-center space-y-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-card text-foreground hover:bg-muted/50 shadow-sm border'
                  }`}
                >
                  <IconComponent className={`h-6 w-6 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium text-center whitespace-nowrap">{item.title}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        isActive 
                          ? 'bg-white/20 text-white border-white/30' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Core Learning */}
            <div>
              {renderNavigationSection(coreItems, 'Core Learning', 'bg-gradient-to-r from-blue-500 to-cyan-500')}
            </div>

            {/* Advanced Features */}
            <div>
              {renderNavigationSection(advancedItems, 'Advanced Features', 'bg-gradient-to-r from-purple-500 to-pink-500')}
            </div>

            {/* Tools & Analytics */}
            <div>
              {renderNavigationSection(toolItems, 'Tools & Analytics', 'bg-gradient-to-r from-green-500 to-emerald-500')}
            </div>

          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-card rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-primary">1,200+</div>
              <div className="text-xs text-muted-foreground">Courses</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-brand-green">50K+</div>
              <div className="text-xs text-muted-foreground">Learners</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-success">94%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-warning">180+</div>
              <div className="text-xs text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};