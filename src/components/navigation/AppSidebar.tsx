import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  Briefcase,
  Users,
  GraduationCap,
  Wrench,
  Building2,
  FileText,
  Compass,
  Award,
  Network,
  Shield,
  Settings,
  Bell
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';
import { Badge } from '@/components/ui/badge';
import { useUnreadNotificationCount } from '@/hooks/useEnhancedNotifications';

const navigationItems = [
  { title: 'Home', url: '/', icon: HomeIcon },
  { title: 'Network', url: '/network', icon: Users },
  { title: 'Jobs', url: '/jobs', icon: Briefcase },
  { title: 'Companies', url: '/companies', icon: Building2 },
  { title: 'Career Passport', url: '/passport', icon: Award },
  { title: 'Resume Builder', url: '/resume-builder', icon: FileText, adminOnly: true },
  { title: 'Career Tools', url: '/tools', icon: Wrench, adminOnly: true },
  { title: 'Learning', url: '/learning', icon: GraduationCap, adminOnly: true },
  { title: 'Colleges', url: '/colleges', icon: GraduationCap },
  { title: 'Career Map', url: '/career-map', icon: Compass, adminOnly: true },
];

const employerItems = [
  { title: 'Employer Dashboard', url: '/employer', icon: Building2 },
];

const adminItems = [
  { title: 'Admin Panel', url: '/admin', icon: Shield },
  { title: 'Employer Requests', url: '/admin/employer-requests', icon: Building2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();
  const { hasEmployerAccess } = useEmployerAccess();
  const { unreadCount } = useUnreadNotificationCount();
  
  const isCollapsed = state === 'collapsed';
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const getNavClassName = (path: string) =>
    isActive(path) 
      ? 'bg-primary text-primary-foreground' 
      : 'hover:bg-muted/50';

  if (!user) return null;

  // Filter navigation items based on admin access
  const visibleNavItems = navigationItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarContent className="gap-0">
        {/* Main Navigation */}
        <SidebarGroup className="px-0">
          {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link to={item.url} className={getNavClassName(item.url)}>
                            <item.icon className="h-4 w-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link to={item.url} className={getNavClassName(item.url)}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Notifications */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/notifications" className={getNavClassName('/notifications')}>
                          <div className="relative">
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
                              >
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Notifications</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link to="/notifications" className={getNavClassName('/notifications')}>
                      <div className="relative">
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
                          >
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </div>
                      <span>Notifications</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Employer Navigation */}
        {hasEmployerAccess && (
          <SidebarGroup className="px-0">
            {!isCollapsed && <SidebarGroupLabel>Employer</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {employerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={item.url} className={getNavClassName(item.url)}>
                              <item.icon className="h-4 w-4" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link to={item.url} className={getNavClassName(item.url)}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <SidebarGroup className="px-0">
            {!isCollapsed && <SidebarGroupLabel>Admin</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={item.url} className={getNavClassName(item.url)}>
                              <item.icon className="h-4 w-4" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link to={item.url} className={getNavClassName(item.url)}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <SidebarGroup className="px-0">
          {!isCollapsed && <SidebarGroupLabel>Account</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/profile/settings" className={getNavClassName('/profile/settings')}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Settings</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link to="/profile/settings" className={getNavClassName('/profile/settings')}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}