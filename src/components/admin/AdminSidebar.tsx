
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
  Newspaper,
  Rocket,
  Search,
  Coins,
  Package,
  Database,
  Globe,
  Zap,
  Target,
  MessageSquare,
  Calendar,
  Filter,
  Code,
  Archive,
  Gift,
  Linkedin,
  DollarSign,
  Factory,
  ShoppingCart,
  Receipt
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

const coreAdminItems = [
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
    title: 'Admin Management',
    url: '/admin/admins',
    icon: Settings,
    description: 'Manage administrators'
  },
  {
    title: 'Security',
    url: '/admin/security',
    icon: Lock,
    description: 'Logs & security monitoring'
  }
];

const businessItems = [
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
    badge: 'dynamic'
  },
  {
    title: 'Employer Dashboard',
    url: '/employer',
    icon: Building2,
    description: 'Access employer features'
  },
  {
    title: 'Companies',
    url: '/admin/companies',
    icon: Building2,
    description: 'Company profiles & verification'
  },
  {
    title: 'Jobs Management',
    url: '/admin/jobs',
    icon: Briefcase,
    description: 'Manage job postings'
  },
  {
    title: 'Scraped Job CVs',
    url: '/admin/scraped-applications',
    icon: FileText,
    description: 'View scraped job applications and CVs'
  }
];

const txcTokenItems = [
  {
    title: 'TXC Token Management',
    url: '/admin/txc-tokens',
    icon: Coins,
    description: 'Token balances, transactions & mining'
  },
  {
    title: 'TXC Awards & Bonuses',
    url: '/admin/txc-awards',
    icon: Gift,
    description: 'Social bonuses, joining bonuses & rewards'
  },
  {
    title: 'TXC Analytics',
    url: '/admin/txc-analytics',
    icon: BarChart3,
    description: 'Token economics & usage analytics'
  },
  {
    title: 'TXC Store',
    url: '/admin/txc-store',
    icon: ShoppingCart,
    description: 'Feature marketplace & TXC purchases'
  },
  {
    title: 'TXC Spending History',
    url: '/admin/txc-spending',
    icon: Receipt,
    description: 'Purchase analytics & spending patterns'
  }
];

const linkedinToolsItems = [
  {
    title: 'LinkedIn Importer',
    url: '/admin/linkedin-importer',
    icon: Linkedin,
    description: 'LinkedIn profile import management'
  },
  {
    title: 'LinkedIn Bulk Upload',
    url: '/admin/linkedin-bulk-upload',
    icon: Linkedin,
    description: 'Bulk import LinkedIn profiles & data'
  },
  {
    title: 'LinkedIn Job Scraper',
    url: '/admin/linkedin-scraper',
    icon: Database,
    description: 'Automated job scraping from LinkedIn'
  },
  {
    title: 'LinkedIn Analytics',
    url: '/admin/linkedin-analytics',
    icon: TrendingUp,
    description: 'LinkedIn import analytics & insights'
  }
];

const enterpriseItems = [
  {
    title: 'Enterprise Overview',
    url: '/admin/enterprise-overview',
    icon: Factory,
    description: 'Complete enterprise management dashboard'
  },
  {
    title: 'Enterprise Solutions',
    url: '/admin/enterprise',
    icon: Factory,
    description: 'Enterprise AI solutions dashboard'
  },
  {
    title: 'Enterprise Analytics',
    url: '/admin/enterprise/analytics',
    icon: BarChart3,
    description: 'Enterprise performance metrics'
  },
  {
    title: 'Enterprise Clients',
    url: '/admin/enterprise/clients',
    icon: Building2,
    description: 'Manage enterprise client accounts'
  },
  {
    title: 'Enterprise Billing',
    url: '/admin/enterprise/billing',
    icon: DollarSign,
    description: 'Enterprise subscription & billing'
  }
];

const aiToolsItems = [
  {
    title: 'AI Management',
    url: '/admin/ai-management',
    icon: Brain,
    description: 'Monitor and manage AI features'
  },
  {
    title: 'AI/ML Training Center',
    url: '/admin/ai-ml-training',
    icon: Brain,
    description: 'Train and manage custom AI models'
  },
  {
    title: 'AI Agent Operations',
    url: '/admin/agent-operations',
    icon: Bot,
    description: 'Monitor & manage AI agents'
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
    title: 'AI Tools',
    url: '/admin/tools',
    icon: Wrench,
    description: 'AI tools & utilities'
  }
];

const contentManagementItems = [
  {
    title: 'Home Content',
    url: '/admin/home',
    icon: Home,
    description: 'Homepage management'
  },
  {
    title: 'News Management',
    url: '/admin/news-management',
    icon: Newspaper,
    description: 'Manage news articles & press releases'
  },
  {
    title: 'News Automation',
    url: '/admin/news-automation',
    icon: Newspaper,
    description: 'Test and manage news feed automation'
  },
  {
    title: 'Advanced Content Hub',
    url: '/admin/content-hub',
    icon: Star,
    description: 'AI-powered content creation'
  },
  {
    title: 'Email Automation',
    url: '/admin/email-automation',
    icon: Mail,
    description: 'Manage email templates & triggers'
  }
];

const platformFeaturesItems = [
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
    title: 'Comprehensive Courses',
    url: '/learning/comprehensive-courses',
    icon: GraduationCap,
    description: 'Browse all available courses'
  },
  {
    title: 'Create Course',
    url: '/admin/learning/create',
    icon: GraduationCap,
    description: 'Create new learning courses'
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
    title: 'Talent Database',
    url: '/admin/talent-database',
    icon: Upload,
    description: 'Comprehensive talent management'
  }
];

const marketingGrowthItems = [
  {
    title: 'Autonomous Growth OS',
    url: '/admin/autonomous-os',
    icon: Rocket,
    description: 'Autonomous distribution & growth operating system'
  },
  {
    title: 'SEO Enhancement',
    url: '/admin/seo-enhancement',
    icon: Search,
    description: 'Job SEO optimization & sitemap'
  },
  {
    title: 'SEO Suite',
    url: '/admin/seo-suite',
    icon: Search,
    description: 'Advanced SEO tools & analytics'
  },
  {
    title: 'Backlink System',
    url: '/admin/backlinks',
    icon: Network,
    description: 'Automated backlink management'
  },
  {
    title: 'Ad Campaign Manager',
    url: '/admin/ad-campaigns',
    icon: Target,
    description: 'Create and manage ad campaigns'
  },
  {
    title: 'Feature Flags',
    url: '/admin/feature-flags',
    icon: Filter,
    description: 'Control feature rollouts & A/B testing'
  }
];

const analyticsReportsItems = [
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
    title: 'TXC Pricing Plans',
    url: '/txc/pricing',
    icon: CreditCard,
    description: 'Manage TXC token packages & subscription tiers'
  }
];

const systemToolsItems = [
  {
    title: 'Edge Functions Monitor',
    url: '/admin/edge-functions-monitor',
    icon: Eye,
    description: 'Monitor & debug all edge functions'
  },
  {
    title: 'Career Platform',
    url: '/admin/career-platform',
    icon: Rocket,
    description: 'Complete AI career platform overview'
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
            Core Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreAdminItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Business Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
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
            TXC Token System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {txcTokenItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.title}</span>
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
            LinkedIn Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {linkedinToolsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.title}</span>
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
            Enterprise Solutions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {enterpriseItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.title}</span>
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
            AI & Automation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiToolsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.title}</span>
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
            Content Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentManagementItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.title}</span>
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
            Platform Features
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformFeaturesItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.title}</span>
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
            Marketing & Growth
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketingGrowthItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.title}</span>
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
            Analytics & Reports
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsReportsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.title}</span>
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
            System Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemToolsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.title}</span>
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
