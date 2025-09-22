import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Search,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Briefcase,
  Zap,
  Award,
  Globe,
  Brain,
  Building,
  GraduationCap,
  ChevronRight
} from 'lucide-react';

const primaryFeatures = [
  {
    title: 'Browse All Courses',
    description: 'Explore 7,000+ courses across all categories',
    icon: BookOpen,
    href: '/learning/courses',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    stats: '7,000+ courses'
  },
  {
    title: 'My Learning',
    description: 'Continue your learning journey and track progress',
    icon: Target,
    href: '/learning/my-courses',
    color: 'bg-green-50 text-green-600 border-green-200',
    stats: 'Personal dashboard'
  },
  {
    title: 'Skill Assessment',
    description: 'Test your skills and identify learning gaps',
    icon: Brain,
    href: '/learning/skill-assessment',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    stats: 'AI-powered'
  }
];

const discoveryFeatures = [
  {
    title: 'Learning Paths',
    description: 'Structured learning journeys',
    icon: TrendingUp,
    href: '/learning/paths',
    badge: 'Popular'
  },
  {
    title: 'Community Learning',
    description: 'Learn with peers and mentors',
    icon: Users,
    href: '/learning/community',
    badge: 'Social'
  },
  {
    title: 'Career Analytics',
    description: 'Data-driven career insights',
    icon: BarChart3,
    href: '/learning/career-analytics',
    badge: 'Analytics'
  },
  {
    title: 'Employment Bridge',
    description: 'Connect learning to job opportunities',
    icon: Briefcase,
    href: '/learning/employment-bridge',
    badge: 'Jobs'
  },
  {
    title: 'Quick Learning',
    description: 'Bite-sized learning modules',
    icon: Zap,
    href: '/learning/quick-learn',
    badge: 'Fast'
  },
  {
    title: 'Certificates',
    description: 'Earn recognized credentials',
    icon: Award,
    href: '/learning/certificates',
    badge: 'Certified'
  }
];

const audienceFeatures = [
  {
    title: 'For Individuals',
    description: 'Personal skill development',
    icon: Users,
    href: '/learning/individuals'
  },
  {
    title: 'For Businesses',
    description: 'Corporate training programs',
    icon: Building,
    href: '/learning/businesses'
  },
  {
    title: 'For Universities',
    description: 'Academic partnerships',
    icon: GraduationCap,
    href: '/learning/universities'
  },
  {
    title: 'For Governments',
    description: 'Public sector training',
    icon: Globe,
    href: '/learning/governments'
  }
];

export const SmartLearningNav: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Primary Actions */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Start Your Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryFeatures.map((feature) => (
            <Card key={feature.title} className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${feature.color}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{feature.stats}</span>
                      <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        <Link to={feature.href}>
                          Explore <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Discovery */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Discover Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discoveryFeatures.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-md transition-all duration-300 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={feature.href}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Audience-Specific */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Learning Solutions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {audienceFeatures.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-md transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{feature.description}</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={feature.href}>
                    Learn More
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};