
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Building2, 
  Home, 
  Network, 
  Briefcase, 
  FileText, 
  Wrench, 
  GraduationCap, 
  Map, 
  CreditCard, 
  BarChart3, 
  Lock,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Mail,
  Brain,
  Crown,
  Bot,
  Upload,
  TrendingUp,
  Star,
  Eye,
  Newspaper
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminStats } from '@/hooks/useAdminStats';

const adminMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Shield,
    description: 'Overview and analytics'
  },
  {
    title: 'User Management',
    url: '/admin/users',
    icon: Users,
    description: 'Manage all users'
  },
  {
    title: 'Pro Users',
    url: '/admin/pro-users',
    icon: Crown,
    description: 'Manage Pro subscriptions & Elite users'
  },
  {
    title: 'Employer Requests',
    url: '/admin/employer-requests',
    icon: Building2,
    description: 'Review employer applications',
    badge: 'dynamic' // This will be updated dynamically
  },
  {
    title: 'Jobs Management',
    url: '/admin/jobs',
    icon: Briefcase,
    description: 'Manage job postings'
  },
  {
    title: 'Companies',
    url: '/admin/companies',
    icon: Building2,
    description: 'Company profiles & verification'
  },
  {
    title: 'Employer Dashboard',
    url: '/employer',
    icon: Building2,
    description: 'Access employer features'
  },
  {
    title: 'Network',
    url: '/admin/network',
    icon: Network,
    description: 'Social network moderation'
  },
  {
    title: 'Learning',
    url: '/admin/learning',
    icon: GraduationCap,
    description: 'Courses & learning paths'
  },
  {
    title: 'Colleges',
    url: '/admin/colleges',
    icon: GraduationCap,
    description: 'College management & verification'
  },
  {
    title: 'Career Map',
    url: '/admin/career-map',
    icon: Map,
    description: 'Career guidance system'
  },
  {
    title: 'Resume Management',
    url: '/admin/resumes',
    icon: FileText,
    description: 'Resume templates & tools'
  },
  {
    title: 'SEO Enhancement',
    url: '/admin/seo-enhancement',
    icon: Settings,
    description: 'Job SEO optimization & sitemap'
  },
  {
    title: 'Tools',
    url: '/admin/tools',
    icon: Wrench,
    description: 'AI tools & utilities'
  },
  {
    title: 'Home Content',
    url: '/admin/home',
    icon: Home,
    description: 'Homepage management'
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
    description: 'Reports & insights'
  },
  {
    title: 'Payments',
    url: '/admin/payments',
    icon: CreditCard,
    description: 'Pricing & billing'
  },
  {
    title: 'Security',
    url: '/admin/security',
    icon: Lock,
    description: 'Logs & security'
  },
  {
    title: 'Scraped Job CVs',
    url: '/admin/scraped-applications',
    icon: FileText,
    description: 'View scraped job applications and CVs'
  },
  {
    title: 'Talent Database',
    url: '/talent-database',
    icon: Upload,
    description: 'Comprehensive talent management system'
  },
  {
    title: 'Email Automation',
    url: '/admin/email-automation',
    icon: Mail,
    description: 'Manage email templates & triggers'
  },
  {
    title: 'AI/ML Training Center',
    url: '/admin/ai-ml-training',
    icon: Brain,
    description: 'Train and manage custom AI models for TalentXcel services'
  },
  {
    title: 'AI Management',
    url: '/admin/ai-management',
    icon: Brain,
    description: 'Monitor and manage AI features across the platform'
  },
  {
    title: 'Bot Management',
    url: '/admin/bots',
    icon: Bot,
    description: 'AI content generation bots'
  },
  {
    title: 'Bot Post Manager',
    url: '/admin/bot-posts',
    icon: Bot,
    description: 'Create and manage bot posts'
  },
  {
    title: 'Bot Identity Manager',
    url: '/admin/bot-identity',
    icon: Bot,
    description: 'Assign users to bots for posting'
  },
  {
    title: 'AI Agent Operations',
    url: '/admin/agent-operations',
    icon: Bot,
    description: 'AI Agent Operations Engine - Monitor & manage AI agents'
  },
  {
    title: 'Admin Management',
    url: '/admin/admins',
    icon: Settings,
    description: 'Manage administrators'
  },
  {
    title: 'Create Course',
    url: '/admin/learning/create',
    icon: GraduationCap,
    description: 'Create new learning courses'
  },
  {
    title: 'Create Pricing Plan',
    url: '/admin/pricing/create',
    icon: CreditCard,
    description: 'Create new subscription plans'
  },
  {
    title: 'Backlink System',
    url: '/admin/backlinks',
    icon: Network,
    description: 'Automated backlink management & monitoring'
  },
  {
    title: 'News Automation',
    url: '/admin/news-automation',
    icon: Newspaper,
    description: 'Test and manage news feed automation'
  }
];

const growthMenuItems = [
  {
    title: 'User Acquisition Hub',
    url: '/growth/acquisition',
    icon: Users,
    description: 'Advanced referral system and growth tools'
  },
  {
    title: 'Content Creation Studio',
    url: '/growth/content-studio',
    icon: Star,
    description: 'AI-powered content creation and scheduling'
  },
  {
    title: 'Enhanced Company Profiles',
    url: '/growth/company-profiles',
    icon: TrendingUp,
    description: 'Rich company pages with media and analytics'
  },
  {
    title: 'Advanced Analytics',
    url: '/growth/analytics',
    icon: BarChart3,
    description: 'Deep hiring insights and competitor analysis'
  }
];

export const AdminSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';
  const { data: adminStats } = useAdminStats();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-primary text-primary-foreground font-medium' 
        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
    }`;
  };

  return (
    <Sidebar collapsible="icon">
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        )}
        <SidebarTrigger className="h-8 w-8" />
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Platform Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.title}</span>
                            {item.badge && item.badge === 'dynamic' && item.url === '/admin/employer-requests' && (
                              <Badge variant="destructive" className="text-xs">
                                {adminStats?.pendingEmployerRequests || 0}
                              </Badge>
                            )}
                            {item.badge && item.badge !== 'dynamic' && (
                              <Badge variant="destructive" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Growth Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {growthMenuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
