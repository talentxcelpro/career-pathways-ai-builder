import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  Home,
  Users,
  User,
  Gauge
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TalentXcelLogo } from '../brand/TalentXcelLogo';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface NavItem {
  to: string;
  icon: React.ElementType<LucideProps>;
  label: string;
  badge?: number;
}

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useOptimizedAuth();
  const { triggerHaptic } = useHapticFeedback();

  const { data: highMatchCount = 0 } = useQuery({
    queryKey: ['high-score-matches-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('ai_job_matches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('match_score', 85);
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
  });

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
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const navItems: NavItem[] = [
    { to: '/career-os', icon: Home, label: 'Home' },
    { to: '/network', icon: Users, label: 'Ecosystem', badge: unreadMessages > 0 ? unreadMessages : undefined },
    { to: '/jobs', icon: Briefcase, label: 'Career Moves', badge: highMatchCount > 0 ? highMatchCount : undefined },
    { to: '/talent-score', icon: Gauge, label: 'Performance' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const isCurrentPath = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  if (!user) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'hsl(var(--background) / 0.94)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        borderTop: '0.5px solid hsl(var(--border) / 0.1)',
        boxShadow: '0 -0.5px 0 rgba(0,0,0,0.08), 0 -8px 32px rgba(0,0,0,0.05)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-stretch justify-around h-14 px-1">
        {navItems.map((item) => {
          const isActive = isCurrentPath(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => triggerHaptic('light')}
              className={cn(
                'relative flex flex-col items-center justify-center gap-[3px]',
                'flex-1 h-full select-none',
                'transition-transform duration-100 active:scale-90',
              )}
            >
              {/* Pill highlight behind active tab */}
              {isActive && (
                <span
                  className="absolute inset-x-2 top-[6px] bottom-[6px] rounded-lg transition-all duration-300"
                  style={{ background: 'rgba(0,122,255,0.10)' }}
                />
              )}

              {/* Icon with notification badge */}
              <div className="relative flex items-center justify-center w-6 h-6 z-10">
                <Icon
                  className="transition-colors duration-200"
                  strokeWidth={isActive ? 2.5 : 1.75}
                  style={{
                    width: 22,
                    height: 22,
                    color: isActive ? 'hsl(212,100%,48%)' : '#8E8E93',
                  }}
                />

                {/* Numbered notification badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="absolute -top-2 -right-2.5 flex items-center justify-center rounded-full bg-red-500 text-white font-bold shadow animate-scale-in"
                    style={{
                      minWidth: 16,
                      height: 16,
                      fontSize: 9,
                      paddingInline: 4,
                      lineHeight: '16px',
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="z-10 transition-all duration-200"
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: 0,
                  color: isActive ? 'hsl(212,100%,48%)' : '#8E8E93',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* TalentXcel Navigator FAB */}
      <Link
        to="/navigator"
        onClick={() => triggerHaptic('medium')}
        className="absolute bottom-full right-4 mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg press-effect"
        style={{
          width: 54,
          height: 54,
          boxShadow: '0 8px 24px rgba(0,122,255,0.3)',
        }}
      >
        <TalentXcelLogo className="h-7 w-7 text-white" />
      </Link>
    </nav>
  );
};
