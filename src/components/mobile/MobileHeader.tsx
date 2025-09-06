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
      <header className="bg-background/95 backdrop-blur-xl border-b border-border/30 sticky top-0 z-50 md:hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 h-16" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
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

          {/* Right - Actions */}
          <div className="flex items-center space-x-1 animate-slide-in-right">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:scale-110 transition-all duration-300 hover:bg-gradient-brand-soft rounded-xl"
              onClick={() => navigate('/mobile/search')}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Messages */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 relative hover:scale-110 transition-all duration-300 hover:bg-gradient-brand-soft rounded-xl"
              onClick={() => navigate('/network/messages')}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Link to="/network/notifications">
              <Button variant="ghost" size="sm" className="p-2 relative hover:scale-110 transition-all duration-300 hover:bg-gradient-brand-soft rounded-xl">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="glow"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] min-w-[16px] flex items-center justify-center animate-bounce-in"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Profile */}
            <Link to="/profile" className="hover:scale-110 transition-all duration-300">
              <UserAvatar
                src={profile?.profile_picture_url}
                userName={profile?.full_name}
                size="sm"
                className="ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300"
              />
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