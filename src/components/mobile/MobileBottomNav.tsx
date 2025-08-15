import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  Briefcase, 
  Users, 
  User, 
  Bell,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: boolean;
}

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Get unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      return count || 0;
    },
    enabled: !!user?.id
  });

  const navItems: NavItem[] = [
    { to: '/network', icon: HomeIcon, label: 'Home' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/passport', icon: Users, label: 'Passport' },
    { to: '/network/notifications', icon: Bell, label: 'Activity', badge: unreadCount > 0 },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/network' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-padding-bottom">
        {navItems.map((item) => {
          const isActive = isCurrentPath(item.to);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors relative min-w-0 flex-1",
                isActive 
                  ? "text-primary bg-accent" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {item.badge && unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-[10px] min-w-[16px] flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};