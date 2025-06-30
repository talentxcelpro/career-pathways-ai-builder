
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
  ChevronRight
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
    title: 'Employer Requests',
    url: '/admin/employer-requests',
    icon: Building2,
    description: 'Review employer applications',
    badge: '12'
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
    title: 'Admin Management',
    url: '/admin/admins',
    icon: Settings,
    description: 'Manage administrators'
  }
];

export const AdminSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

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
                            {item.badge && (
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
      </SidebarContent>
    </Sidebar>
  );
};
