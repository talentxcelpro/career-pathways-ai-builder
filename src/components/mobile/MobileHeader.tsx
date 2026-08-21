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
      <header className="bg-background/90 backdrop-blur-xl border-b border-border/30 sticky top-0 z-40 md:hidden shadow-apple">
        <div className="flex items-center justify-between px-4 py-2 h-12">
          {/* Left - Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:scale-105 transition-apple hover:bg-muted/50 rounded-lg"
          >
            <Menu className="icon-apple-sm" />
          </Button>

          {/* Center - Official TalentXcel Logo */}
          <div className="flex-1 flex justify-center items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white p-1 flex items-center justify-center shadow-xs shrink-0">
              <img 
                src="/talentxcel-official-logo.png" 
                alt="TalentXcel" 
                className="w-full h-full object-contain shrink-0"
              />
            </div>
            <div className="flex items-center text-sm font-black tracking-tight select-none">
              <span className="text-white font-black" style={{ color: '#FFFFFF' }}>Talent</span>
              <span className="text-sky-400 font-black ml-0.5" style={{ color: '#38BDF8' }}>Xcel</span>
            </div>
          </div>

          {/* Right - Compact Actions */}
          <div className="flex items-center space-x-1">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:scale-105 transition-apple hover:bg-muted/50 rounded-lg"
              onClick={() => navigate('/mobile/search')}
            >
              <Search className="icon-apple-sm" />
            </Button>

            {/* Messages */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:scale-105 transition-apple hover:bg-muted/50 rounded-lg"
              onClick={() => navigate('/network/messages')}
            >
              <MessageSquare className="icon-apple-sm" />
            </Button>

            {/* Notifications */}
            <Link to="/network/notifications">
              <Button variant="ghost" size="sm" className="p-2 relative hover:scale-105 transition-apple hover:bg-muted/50 rounded-lg">
                <Bell className="icon-apple-sm" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-3 w-3 p-0 text-[9px] min-w-[12px] flex items-center justify-center animate-pulse"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Profile */}
            <Link to="/profile" className="hover:scale-105 transition-apple">
              <UserAvatar
                src={profile?.profile_picture_url}
                userName={profile?.full_name}
                size="sm"
                className="ring-1 ring-border/30 hover:ring-primary/30 transition-apple"
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