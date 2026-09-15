import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Building2, 
  BarChart3,
  Shield,
  Search,
  Bot,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminNavigationPanel = () => {
  const adminSections = [
    {
      title: 'Learning Management',
      description: 'Manage courses & learning paths',
      icon: GraduationCap,
      href: '/admin/learning',
      color: 'text-blue-600'
    },
    {
      title: 'User Management',
      description: 'Manage platform users',
      icon: Users,
      href: '/admin/users',
      color: 'text-green-600'
    },
    {
      title: 'Jobs Management',
      description: 'Manage job postings',
      icon: Briefcase,
      href: '/admin/jobs',
      color: 'text-purple-600'
    },
    {
      title: 'Companies',
      description: 'Manage company profiles',
      icon: Building2,
      href: '/admin/companies',
      color: 'text-orange-600'
    },
    {
      title: 'Analytics',
      description: 'Platform analytics & reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-indigo-600'
    },
    {
      title: 'Security',
      description: 'Security monitoring',
      icon: Shield,
      href: '/admin/security',
      color: 'text-red-600'
    },
    {
      title: 'SEO Management',
      description: 'SEO tools & optimization',
      icon: Search,
      href: '/admin/seo',
      color: 'text-teal-600'
    },
    {
      title: 'AI Growth Organization',
      description: 'AI CEO & Specialist Agents Master Plane',
      icon: Bot,
      href: '/admin/ai-organization',
      color: 'text-purple-600'
    },
    {
      title: 'Growth Operations',
      description: 'Empirical revenue & pipeline yield',
      icon: TrendingUp,
      href: '/admin/growth-operations',
      color: 'text-emerald-600'
    },
    {
      title: 'AI/Bot Management',
      description: 'Manage AI agents & bots',
      icon: Bot,
      href: '/admin/bots',
      color: 'text-cyan-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Quick Admin Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.href}
                asChild
                variant="outline"
                className="justify-start h-auto p-3"
              >
                <Link to={section.href}>
                  <div className="flex items-start gap-3 w-full">
                    <Icon className={`h-4 w-4 mt-0.5 ${section.color}`} />
                    <div className="text-left">
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs text-muted-foreground">{section.description}</div>
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};