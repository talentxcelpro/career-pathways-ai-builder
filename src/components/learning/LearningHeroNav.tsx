import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home,
  BookOpen,
  Sparkles,
  GitBranch,
  Bot,
  GraduationCap,
  Zap,
  Briefcase,
  Target,
  BarChart3,
  Users,
  Share2
} from 'lucide-react';

export const LearningHeroNav = () => {
  const navigationItems = [
    {
      title: 'Learning Hub',
      subtitle: 'Home',
      icon: Home,
      link: '/learning',
      badge: null
    },
    {
      title: 'All Courses',
      subtitle: null,
      icon: BookOpen,
      link: '/learning/courses',
      badge: null
    },
    {
      title: 'New',
      subtitle: null,
      icon: Sparkles,
      link: '/learning/courses?filter=new',
      badge: 'New'
    },
    {
      title: 'Learning Paths',
      subtitle: null,
      icon: GitBranch,
      link: '/learning/paths',
      badge: null
    },
    {
      title: 'AI',
      subtitle: null,
      icon: Bot,
      link: '/learning/ai-features',
      badge: 'AI'
    },
    {
      title: 'My Learning',
      subtitle: null,
      icon: GraduationCap,
      link: '/learning/my-courses',
      badge: null
    },
    {
      title: 'Quick Learn',
      subtitle: 'Fast',
      icon: Zap,
      link: '/learning/quick-learn',
      badge: 'Fast'
    },
    {
      title: 'Employment Bridge',
      subtitle: 'Career',
      icon: Briefcase,
      link: '/learning/employment-bridge',
      badge: null
    },
    {
      title: 'Skill Assessments',
      subtitle: 'New',
      icon: Target,
      link: '/learning/skill-assessment',
      badge: 'New'
    },
    {
      title: 'Analytics',
      subtitle: null,
      icon: BarChart3,
      link: '/learning/analytics',
      badge: null
    },
    {
      title: 'Community',
      subtitle: 'Social',
      icon: Users,
      link: '/learning/community',
      badge: 'Social'
    }
  ];

  return (
    <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            TALENTXCEL PLUS
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Learn without limits
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Start, switch, or advance your career with thousands of courses from world-class universities and companies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Zap className="h-5 w-5 mr-2" />
              Start Learning
            </Button>
            <Button size="lg" variant="outline">
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Courses
            </Button>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.link}
                className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-4 hover:bg-white hover:shadow-lg transition-all duration-200 border border-primary/10 hover:border-primary/20"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    )}
                  </div>
                  
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 rounded-xl ring-2 ring-primary/20 ring-offset-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};