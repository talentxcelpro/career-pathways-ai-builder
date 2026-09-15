import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const MobileHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return profileData;
    },
    enabled: !!user?.id,
  });

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
    enabled: !!user?.id,
  });

  return (
    <header
      className="sticky top-0 z-50 md:hidden"
      style={{
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex items-center justify-between px-3 h-[52px]">
        <Link to="/" className="flex items-center gap-2 press-effect">
          <img
            src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png"
            alt="TalentXcel"
            className="h-7 w-7 rounded-lg"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
          />
          <div className="leading-none">
            <span
              className="block font-bold text-gray-900"
              style={{ fontSize: 15, letterSpacing: '-0.02em' }}
            >
              TalentXcel
            </span>
            <span
              className="block font-semibold uppercase tracking-widest"
              style={{ fontSize: 8, color: 'hsl(212,100%,48%)', marginTop: 1 }}
            >
              Pro
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => navigate('/mobile/search')}
            className="press-effect flex items-center justify-center w-9 h-9 rounded-full"
            aria-label="Search"
          >
            <Search className="text-gray-600" style={{ width: 20, height: 20, strokeWidth: 1.75 }} />
          </button>

          <Link
            to="/network/notifications"
            className="press-effect relative flex items-center justify-center w-9 h-9 rounded-full"
            aria-label="Notifications"
          >
            <Bell className="text-gray-600" style={{ width: 20, height: 20, strokeWidth: 1.75 }} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 flex items-center justify-center rounded-full bg-red-500 text-white font-bold shadow animate-scale-in"
                style={{
                  minWidth: 15,
                  height: 15,
                  fontSize: 9,
                  paddingInline: 3,
                  lineHeight: '15px',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <Link to="/profile" className="press-effect ml-1" aria-label="Profile">
            <div
              className="rounded-full overflow-hidden"
              style={{
                width: 30,
                height: 30,
                boxShadow: '0 0 0 1.5px rgba(0,0,0,0.1)',
              }}
            >
              <UserAvatar
                src={profile?.profile_picture_url}
                userName={profile?.full_name}
                size="sm"
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
