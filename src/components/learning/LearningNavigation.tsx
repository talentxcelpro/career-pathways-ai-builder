import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Smartphone
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  category: 'core' | 'tools';
}

export const LearningNavigation: React.FC = memo(() => {
  const location = useLocation();
  
  const navigationItems: NavigationItem[] = [
    // Core Learning (Most Used)
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
      description: 'Browse course catalog',
      badge: 'New',
      category: 'core'
    },
    {
      title: 'Learning Paths',
      href: '/learning/paths',
      icon: Target,
      description: 'Guided journeys',
      badge: 'AI',
      category: 'core'
    },
    {
      title: 'My Learning',
      href: '/learning/my-courses',
      icon: Award,
      description: 'Your progress',
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
    
    // Career Tools
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
      category: 'tools'
    },
    {
      title: 'Community',
      href: '/learning/community-new',
      icon: Users,
      description: 'Connect & learn',
      badge: 'Social',
      category: 'tools'
    }
  ];

  const coreItems = navigationItems.filter(item => item.category === 'core');
  const toolItems = navigationItems.filter(item => item.category === 'tools');

  const NavItem = memo(({ item }: { item: NavigationItem }) => {
    const IconComponent = item.icon;
    const isActive = location.pathname === item.href;
    
    return (
      <Link
        to={item.href}
        className={`group flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
          isActive
            ? 'bg-primary text-white shadow-elegant'
            : 'bg-card hover:bg-muted/50 text-foreground hover:text-foreground shadow-card border border-border/50'
        }`}
      >
        <div className={`p-2 rounded-xl ${
          isActive 
            ? 'bg-white/20' 
            : 'bg-primary/10 group-hover:bg-primary/15'
        }`}>
          <IconComponent className={`nav-icon ${
            isActive 
              ? 'text-white' 
              : 'text-primary group-hover:text-primary'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-body-small">{item.title}</span>
          <p className={`text-caption ${
            isActive 
              ? 'text-white/80' 
              : 'text-muted-foreground'
          } truncate`}>
            {item.description}
          </p>
        </div>
        {item.badge && (
          <Badge 
            variant={isActive ? "secondary" : "outline"} 
            className={`text-caption ${
              isActive 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-ai-violet/10 text-ai-violet-dark border-ai-violet/20'
            }`}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  });

  return (
    <div className="bg-gradient-glass backdrop-blur-apple border-b border-glass-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        
        {/* Mobile Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-4">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex-shrink-0 flex flex-col items-center space-y-2 px-4 py-3 rounded-2xl transition-all duration-300 min-w-[80px] ${
                    isActive
                      ? 'bg-primary text-white shadow-elegant'
                      : 'bg-card text-foreground hover:bg-muted/50 shadow-card border'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${
                    isActive ? 'bg-white/20' : 'bg-primary/10'
                  }`}>
                    <IconComponent className={`nav-icon-mobile ${
                      isActive ? 'text-white' : 'text-primary'
                    }`} />
                  </div>
                  <span className="text-caption font-medium text-center whitespace-nowrap">{item.title}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`text-caption ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-ai-violet/10 text-ai-violet-dark'
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

        {/* Desktop Simplified Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Core Learning */}
            <div>
              <h3 className="text-caption font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">
                Core Learning
              </h3>
              <div className="space-y-2">
                {coreItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </div>

            {/* Career Tools */}
            <div>
              <h3 className="text-caption font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">
                Career Tools
              </h3>
              <div className="space-y-2">
                {toolItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Quick Stats - Simplified */}
        <div className="mt-4 pt-4 border-t border-glass-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gradient-card backdrop-blur-apple apple-rounded-lg apple-padding-md shadow-card border border-glass-border">
              <div className="text-headline font-bold text-primary">300+</div>
              <div className="text-caption text-muted-foreground">Courses</div>
            </div>
            <div className="bg-gradient-card backdrop-blur-apple apple-rounded-lg apple-padding-md shadow-card border border-glass-border">
              <div className="text-headline font-bold text-ai-violet-dark">50K+</div>
              <div className="text-caption text-muted-foreground">Learners</div>
            </div>
            <div className="bg-gradient-card backdrop-blur-apple apple-rounded-lg apple-padding-md shadow-card border border-glass-border">
              <div className="text-headline font-bold text-success">94%</div>
              <div className="text-caption text-muted-foreground">Success Rate</div>
            </div>
            <div className="bg-gradient-card backdrop-blur-apple apple-rounded-lg apple-padding-md shadow-card border border-glass-border">
              <div className="text-headline font-bold text-warning">180+</div>
              <div className="text-caption text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});