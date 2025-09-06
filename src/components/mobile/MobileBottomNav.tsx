import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Play,
  Briefcase,
  CreditCard,
  Bell
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

  // Get unread messages count
  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ['unread-messages-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      
      return count || 0;
    },
    enabled: !!user?.id
  });

  const navItems: NavItem[] = [
    { to: '/mobile/network', icon: Home, label: 'Network' },
    { to: '/mobile/reels', icon: Play, label: 'JobTok' },
    { to: '/mobile/jobs', icon: Briefcase, label: 'Jobs & Passport' },
    { to: '/mobile/nessport', icon: CreditCard, label: 'Nessport' },
    { to: '/mobile/notifications', icon: Bell, label: 'Notifications', badge: unreadMessages > 0 },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="safe-area-padding-bottom" />
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item, index) => {
          const isActive = isCurrentPath(item.to);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 transition-all duration-200 relative min-w-0 flex-1",
                isActive 
                  ? "text-blue-600" 
                  : "text-gray-600"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "transition-all duration-200",
                  isActive ? "h-6 w-6 text-blue-600" : "h-6 w-6 text-gray-600"
                )} />
                {item.badge && item.to === '/mobile/notifications' && unreadMessages > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white border border-white rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  </div>
                )}
              </div>
              <span className={cn(
                "text-[11px] font-medium truncate w-full text-center mt-1",
                isActive ? "text-blue-600" : "text-gray-600"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};