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
      title: 'Skill Assessments',
      href: '/assessments',
      icon: Target,
      description: 'Test your skills',
      badge: 'New',
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
        className={`group flex items-center space-x-3.5 px-4 py-3 rounded-2xl transition-all duration-200 ${
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
            : 'bg-card/70 hover:bg-card text-foreground border border-border/70 hover:border-border shadow-sm'
        }`}
      >
        <div className={`p-2.5 rounded-xl ${
          isActive 
            ? 'bg-white/20 text-white' 
            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20'
        }`}>
          <IconComponent className="h-4 w-4 shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-extrabold text-xs block">{item.title}</span>
          <p className={`text-[11px] ${
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
            className={`text-[10px] font-bold py-0.5 px-2 ${
              isActive 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
            }`}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  });

  return (
    <div className="bg-background/90 backdrop-blur-md border-b border-border/80 shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex space-x-2.5 overflow-x-auto scrollbar-none pb-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex-shrink-0 flex flex-col items-center space-y-1.5 px-3.5 py-2.5 rounded-2xl transition-all min-w-[76px] ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                      : 'bg-card text-foreground border border-border/70 shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-center whitespace-nowrap">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Simplified Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Core Learning */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-blue-500" /> Core Learning
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {coreItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </div>

            {/* Career Tools */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-purple-500" /> Career Tools
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {toolItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Quick Platform Metrics Row */}
        <div className="mt-6 pt-4 border-t border-border/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-3 border border-border/70 shadow-sm">
              <div className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">300+</div>
              <div className="text-[11px] text-muted-foreground font-semibold">Verified Courses</div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-3 border border-border/70 shadow-sm">
              <div className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400">50K+</div>
              <div className="text-[11px] text-muted-foreground font-semibold">Active Learners</div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-3 border border-border/70 shadow-sm">
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">94%</div>
              <div className="text-[11px] text-muted-foreground font-semibold">Completion Rate</div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-3 border border-border/70 shadow-sm">
              <div className="text-base sm:text-lg font-black text-amber-500">180+</div>
              <div className="text-[11px] text-muted-foreground font-semibold">Countries Reached</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});