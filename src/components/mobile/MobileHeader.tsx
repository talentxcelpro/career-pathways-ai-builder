import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export const MobileHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
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
      <header className="bg-card border-b border-border sticky top-0 z-40 md:hidden">
        <div className="flex items-center justify-between px-4 py-2 h-14">
          {/* Left - Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Center - Page Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-5 w-5" />
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="p-2 relative">
              <MessageSquare className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Link to="/network/notifications">
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] min-w-[16px] flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Profile */}
            <Link to="/profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
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