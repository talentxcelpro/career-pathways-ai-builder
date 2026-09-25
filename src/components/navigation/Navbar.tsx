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
  Sparkles,
  LayoutDashboard,
  Users,
  Briefcase,
  PlayCircle,
  Globe,
  MessageSquare,
  Zap,
  Layers,
  Award,
  BookOpen,
  Compass
} from "lucide-react";
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { toast } from 'sonner';

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

  const userRole = (user?.user_metadata as any)?.role || (user?.user_metadata as any)?.user_type || profile?.role;
  const [activeWorkspace, setActiveWorkspace] = useState<'employer' | 'candidate'>(() => {
    const saved = localStorage.getItem('txc_active_workspace');
    if (saved === 'employer' || saved === 'candidate') return saved;
    return userRole === 'employer' ? 'employer' : 'candidate';
  });

  const switchWorkspace = (mode: 'employer' | 'candidate') => {
    setActiveWorkspace(mode);
    localStorage.setItem('txc_active_workspace', mode);
    if (mode === 'employer') {
      navigate('/dashboard?view=role');
    } else {
      navigate('/passport');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Social-First Primary Navigation Items
  const socialNavItems = [
    { to: "/network",      label: "Network",      icon: Users },
    { to: "/jobs",         label: "Jobs",         icon: Briefcase },
    { to: "/talent",       label: "Talent",       icon: Sparkles },
    { to: "/reels",        label: "Reels",        icon: PlayCircle },
    { to: "/communities",  label: "Communities",  icon: Globe },
    { to: "/messages",     label: "Messages",     icon: MessageSquare },
  ];

  // Secondary Tools / Utilities
  const secondaryTools = [
    { to: "/passport",   label: "Career Passport",  desc: "Universal profile & TalentScore", icon: User },
    { to: "/resume",     label: "Resume Builder",   desc: "ATS-ready executive resumes",     icon: BookOpen },
    { to: "/companies",  label: "Companies",        desc: "Explore verified employer pages", icon: Building2 },
    { to: "/colleges",   label: "10,250+ Colleges", desc: "NIRF rankings & placement stats", icon: Compass },
    { to: "/rankings",   label: "Salary & Rankings", desc: "Compensation benchmarks",        icon: Award },
    { to: "/career-map", label: "Career Map",       desc: "Skill progression trajectories",  icon: Layers },
    { to: "/learning",   label: "Learning & Skills", desc: "High-income credentials",        icon: Zap },
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/network') {
      return location.pathname === '/network' || location.pathname.startsWith('/network/');
    }
    if (path === '/jobs') {
      return location.pathname === '/jobs' || location.pathname.startsWith('/jobs/');
    }
    if (path === '/talent') {
      return location.pathname === '/talent' || location.pathname === '/network/people';
    }
    if (path === '/reels') {
      return location.pathname === '/reels' || location.pathname === '/mobile/reels';
    }
    if (path === '/communities') {
      return location.pathname === '/communities' || location.pathname === '/network/communities';
    }
    if (path === '/messages') {
      return location.pathname === '/messages' || location.pathname.startsWith('/network/messages');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const { isAdmin } = useAdminAccess();

  // Hide navbar on mobile when user is authenticated (mobile bottom nav wrapper handles mobile navigation)
  if (isMobile && user) {
    return null;
  }

  // Hide navbar on standalone canvas editors that have their own custom header
  const isFullScreenEditor = location.pathname.startsWith('/resume/editor/') || location.pathname.startsWith('/resume/wizard');
  if (isFullScreenEditor) {
    return null;
  }

  return (
    <nav className="bg-[#0b0f19] text-white shadow-md border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* Executive Brand Identity */}
          <div className="flex items-center shrink-0 mr-3 sm:mr-6">
            <Link to="/" className="flex items-center shrink-0">
              <TalentXcelLogo iconSize={26} textSize="text-base sm:text-lg" theme="dark" />
            </Link>
          </div>

          {user ? (
            <>
              {/* Social-First Navigation Bar */}
              <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
                {socialNavItems.map((item) => {
                  const isActive = isCurrentPath(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-sm font-bold' 
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Secondary Tools Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">
                      <span>Explore</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-white p-1.5 shadow-2xl" align="start">
                    <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Career Tools & Resources
                    </div>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    {secondaryTools.map(tool => {
                      const ToolIcon = tool.icon;
                      return (
                        <DropdownMenuItem
                          key={tool.label}
                          onClick={() => navigate(tool.to)}
                          className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
                        >
                          <ToolIcon className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-200 leading-tight">{tool.label}</p>
                            <p className="text-[11px] text-slate-400">{tool.desc}</p>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Top Right: Workspace Mode + Notifications + User Avatar */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                
                {/* Dynamic Role / Workspace Switcher Pill */}
                {activeWorkspace === 'employer' ? (
                  <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-blue-500/40 rounded-xl p-0.5 pl-2 shadow-xs">
                    <Link
                      to="/dashboard?view=role"
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
                    >
                      <Building2 className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                      <span>Recruiter OS</span>
                      <span className="text-[9px] uppercase font-black bg-blue-600 text-white px-1.5 py-0.2 rounded">PRO</span>
                    </Link>
                    <button
                      onClick={() => switchWorkspace('candidate')}
                      className="text-[11px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Switch to Candidate mode"
                    >
                      Switch to Career
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-0.5 pl-2 shadow-xs">
                    <Link
                      to="/passport"
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <User className="h-3.5 w-3.5 text-emerald-400" />
                      <span>My Career</span>
                    </Link>
                    <button
                      onClick={() => switchWorkspace('employer')}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-200 px-1.5 py-0.5 rounded-lg bg-blue-950/60 border border-blue-800/50 hover:bg-blue-900/60 transition-colors"
                      title="Open Recruiter OS"
                    >
                      <Building2 className="h-3 w-3" />
                      <span>Recruiter OS</span>
                    </button>
                  </div>
                )}

                {/* Direct Messages Icon Link */}
                <Link
                  to="/messages"
                  className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative"
                  title="Messages"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>

                {/* Notification Bell */}
                <div className="relative text-slate-300 hover:text-white">
                  <NotificationBell />
                </div>

                {/* User Dropdown Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 border border-slate-700 hover:border-slate-500">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.profile_picture_url && !profile.profile_picture_url.includes('chatr.chat') ? profile.profile_picture_url : undefined} />
                        <AvatarFallback className="bg-slate-800 text-white font-extrabold text-xs">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-60 bg-slate-900 border-slate-800 text-white shadow-2xl p-1" align="end">
                    <div className="flex items-center justify-start space-x-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-bold text-sm text-white">{profile?.full_name || 'User'}</p>
                        <p className="w-[200px] truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenuSeparator className="bg-slate-800" />

                    {/* Mode Switcher inside Menu */}
                    <DropdownMenuItem 
                      onClick={() => switchWorkspace(activeWorkspace === 'employer' ? 'candidate' : 'employer')}
                      className="text-xs font-bold hover:bg-slate-800 focus:bg-slate-800 text-blue-400 cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-400" />
                        <span>{activeWorkspace === 'employer' ? 'Switch to My Career' : 'Switch to Recruiter OS'}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-blue-300 border-blue-800 py-0">
                        {activeWorkspace === 'employer' ? 'Recruiter' : 'Candidate'}
                      </Badge>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-800" />

                    <DropdownMenuItem 
                      onClick={() => navigate('/passport')}
                      className="text-xs font-bold hover:bg-slate-800 focus:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4 text-emerald-400" />
                      <span>Career Passport & TalentScore</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => navigate(activeWorkspace === 'employer' ? '/dashboard?view=role' : '/dashboard')}
                      className="text-xs font-bold hover:bg-slate-800 focus:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4 text-sky-400" />
                      <span>{activeWorkspace === 'employer' ? 'Recruiter OS Dashboard' : 'Dashboard'}</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile/edit')}
                      className="text-xs font-bold hover:bg-slate-800 focus:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4 text-purple-400" />
                      <span>Profile & Settings</span>
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
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Public Social Navigation Links */}
              <div className="hidden lg:flex items-center gap-1 mr-2">
                {socialNavItems.slice(0, 5).map(item => {
                  const Icon = item.icon;
                  const isActive = isCurrentPath(item.to);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                        ${isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                    >
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Clear Recruiter Entry Door */}
              <Link
                to="/recruiters"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-500/30 transition-all border border-blue-400/30"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                <span>Hire Talent (Recruiter OS) →</span>
              </Link>
              
              <Button 
                onClick={() => navigate('/auth/login')}
                variant="ghost" 
                size="sm"
                className="text-slate-300 hover:text-white text-xs font-bold px-2.5"
              >
                Log In
              </Button>

              <Button 
                onClick={() => navigate('/auth/register')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl px-3 shadow"
              >
                Join Network
              </Button>
            </div>
          )}

          {/* Mobile Menu Button - Visible to unauthenticated or mobile guests */}
          <div className="md:hidden flex items-center ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0b0f19] px-4 pt-2 pb-4 space-y-1">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Professional Network
          </p>
          {socialNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Icon className="h-4 w-4 text-blue-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <p className="px-2 pt-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-800/80">
            Explore Tools
          </p>
          {secondaryTools.slice(0, 4).map((tool) => (
            <Link
              key={tool.label}
              to={tool.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {tool.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
            <Link
              to="/recruiters"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Hire Talent (Recruiter OS) →
            </Link>
            {!user && (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/auth/login'); }}
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-xs font-bold border-slate-700 text-slate-200"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/auth/register'); }}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                >
                  Join Network
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

