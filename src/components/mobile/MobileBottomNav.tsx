import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  Briefcase, 
  Users, 
  User, 
  Play,
  MessageCircle
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
    { to: '/network', icon: HomeIcon, label: 'Home' },
    { to: '/mobile/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/mobile/reels', icon: Play, label: 'Reels' },
    { to: '/mobile/network', icon: MessageCircle, label: 'TalentXcel', badge: unreadMessages > 0 },
    { to: '/mobile/profile', icon: User, label: 'Profile' },
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/network' && (location.pathname === '/' || location.pathname === '/network')) return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-50 md:hidden shadow-lg">
      <div className="safe-area-padding-bottom" />
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const isActive = isCurrentPath(item.to);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center px-2 py-1 rounded-2xl transition-all duration-300 relative min-w-0 flex-1",
                isActive 
                  ? "text-primary scale-110" 
                  : "text-gray-600 hover:text-primary hover:scale-105"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg" 
                    : "hover:bg-gray-50"
                )}>
                  <Icon className={cn(
                    "transition-all duration-300",
                    isActive ? "h-6 w-6" : "h-5 w-5"
                  )} />
                </div>
                {item.badge && (item.to === '/mobile/network' ? unreadMessages > 0 : false) && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] min-w-[20px] flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-white rounded-full shadow-lg animate-pulse">
                    {(item.to === '/mobile/network' ? unreadMessages : 0) > 99 ? '99+' : (item.to === '/mobile/network' ? unreadMessages : 0)}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium truncate w-full text-center mt-1 transition-all duration-300",
                isActive ? "font-semibold" : ""
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