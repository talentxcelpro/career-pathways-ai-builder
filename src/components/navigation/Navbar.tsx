import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Building2,
  Shield,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isMobile } = useMobileDetection();

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const mainNavItems = [
    { to: "/jobs", label: "Jobs" },
    { to: "/employer", label: "Employer" },
    { to: "/companies", label: "Companies" },
    { to: "/resume", label: "Resume Builder" },
    { to: "/tools", label: "Career Tools" },
    { to: "/services", label: "Services" },
    { to: "/learning", label: "Learning" },
    { to: "/colleges", label: "Colleges" },
    { to: "/career-map", label: "Career Map" },
    { to: "/passport", label: "Career Passport" },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const { isAdmin } = useAdminAccess();

  // Hide navbar on mobile when user is authenticated (use mobile header instead)
  if (isMobile && user) {
    return null;
  }

  // Hide navbar on Resume Builder — it has its own integrated header
  if (location.pathname.startsWith('/resume')) {
    return null;
  }

  return (
    <nav className="bg-[#0b0f19] text-white shadow-md border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* Executive Brand Identity */}
          <div className="flex items-center shrink-0 mr-4 sm:mr-6">
            <Link to="/" className="flex items-center shrink-0">
              <TalentXcelLogo iconSize={26} textSize="text-base sm:text-lg" theme="dark" />
            </Link>
          </div>

          {user ? (
            <>
              {/* Pitch-Dark Executive Navigation Bar matching mockup */}
              <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
                {mainNavItems.map((item) => {
                  const isActive = isCurrentPath(item.to);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                        ${isActive 
                          ? 'bg-blue-600/90 text-white shadow-sm font-bold' 
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Top Right Actions */}
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <div className="relative text-slate-300 hover:text-white">
                  <NotificationBell />
                </div>

                {/* User Dropdown Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 border border-slate-700 hover:border-slate-500">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.profile_picture_url || undefined} />
                        <AvatarFallback className="bg-slate-800 text-white font-extrabold text-xs">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-white shadow-2xl" align="end">
                    <div className="flex items-center justify-start space-x-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-bold text-sm text-white">{profile?.full_name || 'User'}</p>
                        <p className="w-[200px] truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/passport')}
                      className="text-xs font-bold hover:bg-slate-800 focus:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4 text-blue-400" />
                      <span>Career Passport</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile/edit')}
                      className="text-xs font-bold hover:bg-slate-800 focus:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4 text-purple-400" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem 
                        onClick={() => navigate('/admin')}
                        className="text-xs font-bold hover:bg-slate-800 focus:bg-slate-800 text-amber-300 cursor-pointer"
                      >
                        <Shield className="mr-2 h-4 w-4 text-amber-400" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-xs font-bold hover:bg-slate-800 focus:bg-slate-800 text-red-400 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4 text-red-400" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-1 text-slate-300 hover:text-white"
                  >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => navigate('/auth/login')}
                variant="ghost" 
                size="sm"
                className="text-slate-300 hover:text-white text-xs font-bold"
              >
                Log In
              </Button>
              <Button 
                onClick={() => navigate('/auth/register')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                Sign Up
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden border-t border-slate-800 bg-[#0b0f19] px-4 pt-2 pb-4 space-y-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
