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
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';
import { Badge } from '@/components/ui/badge';
import { useUnreadNotificationCount } from '@/hooks/useEnhancedNotifications';
import { cn } from '@/lib/utils';

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

export function DesktopNavigation() {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();
  const { hasEmployerAccess } = useEmployerAccess();
  const { unreadCount } = useUnreadNotificationCount();
  
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const getNavClassName = (path: string) =>
    cn(
      'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      isActive(path) 
        ? 'bg-primary text-primary-foreground' 
        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
    );

  if (!user) return null;

  // Filter navigation items based on admin access
  const visibleNavItems = navigationItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  return (
    <nav className="hidden lg:flex lg:flex-col lg:gap-1 lg:p-4 lg:w-60 lg:border-r lg:bg-background/95 lg:backdrop-blur-sm">
      {/* Main Navigation */}
      <div className="space-y-1">
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Navigation
        </div>
        {visibleNavItems.map((item) => (
          <Link key={item.title} to={item.url} className={getNavClassName(item.url)}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        ))}
        
        {/* Notifications */}
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
      </div>

      {/* Employer Navigation */}
      {hasEmployerAccess && (
        <div className="space-y-1 mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Employer
          </div>
          {employerItems.map((item) => (
            <Link key={item.title} to={item.url} className={getNavClassName(item.url)}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Admin Navigation */}
      {isAdmin && (
        <div className="space-y-1 mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin
          </div>
          {adminItems.map((item) => (
            <Link key={item.title} to={item.url} className={getNavClassName(item.url)}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Settings */}
      <div className="space-y-1 mt-6">
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Account
        </div>
        <Link to="/profile/settings" className={getNavClassName('/profile/settings')}>
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );
}