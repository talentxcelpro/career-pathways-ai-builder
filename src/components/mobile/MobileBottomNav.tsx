import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  Play,
  MessageCircle,
  CreditCard,
  Trophy,
  Users,
  Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ModulesLauncher } from './ModulesLauncher';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: boolean;
}

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useOptimizedAuth();
  const [showModulesLauncher, setShowModulesLauncher] = useState(false);

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
    { to: '/network', icon: MessageCircle, label: 'Network', badge: unreadMessages > 0 },
    { to: '/mobile/reels', icon: Play, label: 'Reels' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/gamification', icon: Trophy, label: 'Rewards' },
    { to: '/refer-and-earn', icon: Users, label: 'Refer' },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Show bottom nav on network route even without user, or when user is authenticated
  const isNetworkRoute = location.pathname === '/network';
  if (!user && !isNetworkRoute) return null;

  console.log('=== MobileBottomNav Debug ===');
  console.log('- Current path:', location.pathname);
  console.log('- User exists:', !!user);
  console.log('- Nav items count:', navItems.length);
  console.log('- showModulesLauncher:', showModulesLauncher);
  console.log('- Should render nav:', true);
  console.log('================');

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-card/95 backdrop-blur-apple border-t border-border/50 z-50 md:hidden shadow-elegant animate-slide-up">
        <div className="safe-area-padding-bottom" />
        <div className="flex items-center justify-start flex-nowrap px-2 py-2 overflow-x-auto scrollbar-hide gap-1" style={{ width: 'max-content', minWidth: '100%' }}>
          {/* Main Nav Items */}
          {navItems.map((item, index) => {
            const isActive = isCurrentPath(item.to);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all duration-500 relative group min-w-[52px]",
                  "animate-fade-in",
                  isActive 
                    ? "text-primary scale-105 transform" 
                    : "text-muted-foreground hover:text-primary hover:scale-105 transform"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-500 transform",
                    isActive 
                      ? "bg-gradient-brand shadow-brand animate-glow-pulse" 
                      : "hover:bg-gradient-brand-soft group-hover:shadow-card"
                  )}>
                    <Icon className={cn(
                      "transition-all duration-500 transform",
                      isActive ? "h-4 w-4 text-white animate-bounce-in" : "h-4 w-4 group-hover:scale-110"
                    )} />
                  </div>
                  {item.badge && (item.to === '/network' ? unreadMessages > 0 : false) && (
                    <div className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 text-white border border-white rounded-full shadow-lg animate-bounce-in flex items-center justify-center">
                      <span className="text-[8px] font-bold">
                        {(item.to === '/network' ? unreadMessages : 0) > 9 ? '9+' : (item.to === '/network' ? unreadMessages : 0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-[8px] font-medium truncate w-full text-center mt-1 transition-all duration-500",
                  isActive ? "font-bold text-primary" : "group-hover:font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* MORE BUTTON - 6TH BUTTON - DEBUG VERSION */}
          <div 
            onClick={() => {
              console.log('🚀 MORE BUTTON CLICKED!');
              setShowModulesLauncher(true);
            }}
            className="flex-shrink-0 flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all duration-500 relative group min-w-[52px] bg-red-500 text-white border-2 border-yellow-400"
            style={{ animationDelay: `${navItems.length * 0.1}s` }}
          >
            <div className="relative">
              <div className="p-2 rounded-xl transition-all duration-500 transform">
                <Grid3X3 className="h-4 w-4" />
              </div>
            </div>
            <span className="text-[8px] font-bold text-center mt-1">
              MORE
            </span>
          </div>
        </div>
      </nav>

      {/* Modules Launcher Modal */}
      <ModulesLauncher 
        isOpen={showModulesLauncher}
        onClose={() => setShowModulesLauncher(false)}
      />
    </>
  );
};