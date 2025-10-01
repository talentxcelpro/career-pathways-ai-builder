import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  X,
  HomeIcon,
  Briefcase,
  Users,
  GraduationCap,
  Wrench,
  FileText,
  Building2,
  Compass,
  LogOut,
  Settings,
  User
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { Coins } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { availableBalance, isLoading: balanceLoading } = useTokenBalance();

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

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const primaryNavItems = [
    { to: '/network', icon: HomeIcon, label: 'Network', description: 'Connect & share' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs', description: 'Find opportunities' },
    { to: '/passport', icon: Users, label: 'Career Passport', description: 'Track progress' },
    { to: '/companies', icon: Building2, label: 'Companies', description: 'Explore companies' },
  ];

  const toolsNavItems = [
    { to: '/resume', icon: FileText, label: 'TalentXcel Resume Builder', description: 'Create resume' },
    { to: '/tools', icon: Wrench, label: 'Career Tools', description: 'AI-powered career tools' },
    { to: '/learning', icon: GraduationCap, label: 'Learning', description: 'Skill development' },
    { to: '/career-map', icon: Compass, label: 'Career Map', description: 'Plan your path' },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-card border-r border-border z-50 md:hidden overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate max-w-32">
                  {user?.email}
                </p>
                {/* Token Balance */}
                <div className="flex items-center gap-1 mt-1">
                  <Coins className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {balanceLoading ? '...' : availableBalance.toLocaleString()} TXC
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-6">
            {/* Primary Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Main
              </h3>
              <div className="space-y-1">
                {primaryNavItems.map((item) => {
                  const isActive = isCurrentPath(item.to);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs opacity-70 truncate">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tools & Services */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Tools & Services
              </h3>
              <div className="space-y-1">
                {toolsNavItems.map((item) => {
                  const isActive = isCurrentPath(item.to);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs opacity-70 truncate">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              to="/profile/settings"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium text-sm">Settings</span>
            </Link>
            
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start space-x-3 px-3 py-2.5 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium text-sm">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};