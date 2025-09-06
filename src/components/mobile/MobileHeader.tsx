import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Search,
  Bell,
  MessageSquare,
  Settings
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MobileSidebar } from './MobileSidebar';
import { cn } from '@/lib/utils';
import talentxcelLogo from '@/assets/talentxcel-logo.png';

export const MobileHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get profile data
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
    enabled: !!user?.id
  });

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

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/network') return 'Network';
    if (path === '/jobs') return 'Jobs';
    if (path === '/passport') return 'Career Passport';
    if (path.startsWith('/network/notifications')) return 'Activity';
    if (path === '/profile') return 'Profile';
    return 'TalentXcel';
  };

  return (
    <>
      <header className="bg-background/98 backdrop-blur-xl border-b border-border/20 sticky top-0 z-50 md:hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 h-16 safe-area-padding-top">
          {/* Left - Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:scale-110 transition-all duration-300 hover:bg-gradient-brand-soft rounded-xl"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Center - TalentXcel Logo */}
          <div className="flex-1 flex justify-center animate-scale-in">
            <img 
              src="/lovable-uploads/92d46ee5-0b5a-4272-905d-72a40b1c8bdc.png" 
              alt="TalentXcel" 
              className="h-8 w-auto transition-transform duration-300 hover:scale-105"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/lovable-uploads/1a30569a-4f31-4bd4-abe8-79d630d989f9.png'; }}
            />
          </div>

          {/* Professional Action Bar */}
          <div className="flex items-center gap-1 animate-slide-in-right">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2.5 hover:scale-110 transition-all duration-300 hover:bg-primary/10 rounded-xl touch-target"
              onClick={() => navigate('/mobile/search')}
            >
              <Search className="h-5 w-5 text-foreground" />
            </Button>

            {/* Notifications with Professional Badge */}
            <Link to="/network/notifications">
              <Button variant="ghost" size="sm" className="p-2.5 relative hover:scale-110 transition-all duration-300 hover:bg-primary/10 rounded-xl touch-target">
                <Bell className="h-5 w-5 text-foreground" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-brand-green to-brand-green/80 text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg animate-bounce-in">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </Button>
            </Link>

            {/* Enterprise Profile Button */}
            <Link to="/profile" className="hover:scale-110 transition-all duration-300 ml-1">
              <div className="relative">
                <UserAvatar
                  src={profile?.profile_picture_url}
                  userName={profile?.full_name}
                  size="sm"
                  className="ring-2 ring-primary/30 hover:ring-primary/60 transition-all duration-300 shadow-md"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-green rounded-full border-2 border-background" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  );
};