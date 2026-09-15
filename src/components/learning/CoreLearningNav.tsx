import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Target,
  Brain,
  TrendingUp,
  Zap,
  Briefcase,
  BarChart3,
  Users,
  Award,
  Home,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const coreFeatures = [
  {
    id: 'learning-hub',
    title: 'Learning Hub',
    description: 'Your learning dashboard',
    icon: Home,
    href: '/learning',
    badge: '',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    iconColor: 'text-blue-600'
  },
  {
    id: 'all-courses',
    title: 'All Courses',
    description: 'Browse course catalog',
    icon: BookOpen,
    href: '/learning/courses',
    badge: 'New',
    color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700',
    iconColor: 'text-green-600'
  },
  {
    id: 'learning-paths',
    title: 'Learning Paths',
    description: 'Guided journeys',
    icon: Target,
    href: '/learning/paths',
    badge: 'AI',
    color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    iconColor: 'text-purple-600'
  },
  {
    id: 'my-learning',
    title: 'My Learning',
    description: 'Your progress',
    icon: TrendingUp,
    href: '/learning/my-courses',
    badge: '',
    color: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700',
    iconColor: 'text-orange-600'
  },
  {
    id: 'quick-learn',
    title: 'Quick Learn',
    description: 'Bite-sized content',
    icon: Zap,
    href: '/learning/quick-learn',
    badge: 'Fast',
    color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700',
    iconColor: 'text-yellow-600'
  },
  {
    id: 'career-tools',
    title: 'Career Tools',
    description: 'Employment Bridge',
    icon: Briefcase,
    href: '/learning/employment-bridge',
    badge: 'Career',
    color: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700',
    iconColor: 'text-indigo-600'
  },
  {
    id: 'skill-assessments',
    title: 'Skill Assessments',
    description: 'Test your skills',
    icon: Brain,
    href: '/learning/skill-assessment',
    badge: 'New',
    color: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 text-pink-700',
    iconColor: 'text-pink-600'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Learning insights',
    icon: BarChart3,
    href: '/learning/analytics',
    badge: '',
    color: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 text-teal-700',
    iconColor: 'text-teal-600'
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Connect & learn',
    icon: Users,
    href: '/learning/community',
    badge: '',
    color: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 text-rose-700',
    iconColor: 'text-rose-600'
  }
];

export const CoreLearningNav: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Core Learning Hub</h1>
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your complete learning ecosystem with AI-powered recommendations, career tools, and community features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coreFeatures.map((feature) => (
          <Link key={feature.id} to={feature.href}>
            <Card 
              className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${feature.color} hover:scale-105`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                      <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm opacity-80">{feature.description}</p>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between group-hover:bg-white/50 transition-colors"
                  >
                    <span>Explore</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center pt-8">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Award className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-bold text-foreground">Ready to Transform Your Career?</h3>
              <p className="text-muted-foreground">
                Join thousands of learners advancing their skills with our comprehensive learning platform
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="px-8">
                  <Link to="/learning/skill-assessment">
                    Start Skill Assessment
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link to="/learning/courses">
                    Browse All Courses
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};