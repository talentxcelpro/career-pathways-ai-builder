import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LearningSearch } from './LearningSearch';
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
  Users
} from 'lucide-react';
import heroImage from '@/assets/learning-hero.jpg';

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
    <section className="bg-gradient-to-br from-primary/10 via-ai-violet-medium/10 to-primary/5 py-16 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <img
          src={heroImage}
          alt="Learning Hub Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-ai-violet-medium/30" />
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-ai-violet-medium/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ai-violet-medium/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-ai-violet-medium text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105">
            <Sparkles className="h-4 w-4 animate-glow-pulse" />
            TalentXcel Academy
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-heading font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-8 animate-fade-in-down">
            Learn without limits
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in delay-200">
            Start, switch, or advance your career with thousands of courses from world-class universities and companies.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center animate-fade-in-up delay-300">
            <div className="flex-1 max-w-md">
              <LearningSearch />
            </div>
            <Link to="/learning/my-courses">
              <Button size="xl" className="bg-gradient-to-r from-primary to-ai-violet-medium hover:from-primary/90 hover:to-ai-violet-medium/90 text-white font-semibold shadow-lg hover:shadow-glow transform hover:scale-105 transition-all duration-300 apple-rounded-lg">
                <GraduationCap className="h-5 w-5 mr-2" />
                My Learning
                <span className="ml-2">→</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 stagger-children">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const colors = [
              'from-primary to-ai-violet-medium',
              'from-ai-violet-medium to-primary',
              'from-orange-500 to-red-500',
              'from-green-500 to-primary',
              'from-ai-violet-dark to-primary',
              'from-primary to-green-500',
            ];
            const bgColor = colors[index % colors.length];
            
            return (
              <Link
                key={item.title}
                to={item.link}
                className="group relative bg-white/90 backdrop-blur-apple rounded-2xl p-6 hover:bg-white hover:shadow-float transition-all duration-500 border border-white/50 hover:border-primary/30 transform hover:scale-105 hover:-translate-y-2 apple-rounded-xl"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${bgColor} rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="h-8 w-8 text-white drop-shadow-sm" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-heading font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-sm text-muted-foreground font-medium">{item.subtitle}</p>
                    )}
                  </div>
                  
                  {item.badge && (
                    <Badge 
                      variant="premium" 
                      className="text-xs font-semibold bg-gradient-to-r from-primary/20 to-ai-violet-medium/20 text-primary border border-primary/30 hover:shadow-sm"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-ai-violet-medium/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/0 group-hover:ring-primary/20 ring-offset-4 ring-offset-background/50 transition-all duration-500 pointer-events-none" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};