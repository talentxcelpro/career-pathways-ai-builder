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
  HomeIcon, Briefcase, Users, GraduationCap, Wrench, User,
  Settings, LogOut, Bell, Menu, X, Building2, Compass,
  FileText, Network, Shield, ChevronDown, CheckCircle,
  Clock, Zap, Sparkles, Brain, Radio, Layers, Activity
} from "lucide-react";
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { UniversalSearch } from './UniversalSearch';
import { TalentXcelLogo } from '../brand/TalentXcelLogo';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isMobile } = useMobileDetection();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  const handleSignOut = async () => {
    try { await signOut(); } catch (error) { console.error('Error signing out:', error); }
  };

  const mainNavItems = [
    { to: "/career-os", label: "Dashboard", icon: HomeIcon },
    { to: "/talent-score", label: "Performance", icon: Activity },
    { to: "/talent-beacon", label: "Beacon Sync", icon: Radio },
    { to: "/intelligence-navigator", label: "Intelligence AI", icon: Brain },
    { to: "/jobs", label: "Precision Matches", icon: Briefcase },
    { to: "/resume", label: "Identity Hub", icon: Shield },
    { to: "/learning", label: "Capability Hub", icon: GraduationCap },
  ];

  const isCurrentPath = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const { isAdmin } = useAdminAccess();
  const { hasEmployerAccess } = useEmployerAccess();

  // Hide navbar on mobile when user is authenticated (use mobile header instead)
  if (isMobile && user) return null;

  return (
    <nav className="bg-white/60 backdrop-blur-3xl border-b border-slate-200/50 sticky top-0 z-[100] h-16 flex items-center">
      <div className="max-w-[1440px] w-full mx-auto px-6 flex items-center justify-between gap-8">
        {/* TalentXcel Brand */}
        <Link to={user ? "/career-os" : "/"} className="flex items-center gap-2 group shrink-0">
          <div className="h-9 w-9 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-apple-heavy tracking-tighter text-slate-950 hidden sm:block">TalentXcel</span>
        </Link>

        {/* Global Navigation */}
        {user ? (
          <>
            <div className="hidden lg:flex items-center gap-1">
              {mainNavItems.map((item) => {
                const isActive = isCurrentPath(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-[13px] font-apple-heavy transition-all flex items-center gap-2",
                      isActive 
                        ? 'bg-slate-950 text-white shadow-lg' 
                        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                    )}
                  >
                    {isActive && <Icon className="h-3.5 w-3.5" />}
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Universal Search */}
            <div className="flex-1 max-w-md hidden md:block">
              <UniversalSearch />
            </div>

            {/* User Controls */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 hover:border-slate-300 transition-all outline-none">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={profile?.profile_picture_url} />
                      <AvatarFallback className="bg-slate-100 text-slate-500 font-apple-heavy text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 rounded-[24px] p-2 bg-white/80 backdrop-blur-2xl border-slate-200/50 shadow-2xl" align="end">
                  <div className="p-4 flex items-center gap-3">
                     <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.profile_picture_url} />
                        <AvatarFallback className="bg-slate-950 text-white font-apple-heavy">{getInitials()}</AvatarFallback>
                     </Avatar>
                     <div className="overflow-hidden">
                        <p className="text-sm font-apple-heavy text-slate-950 truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-[10px] font-apple-bold text-slate-400 truncate uppercase tracking-widest">{user.email}</p>
                     </div>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl h-11 px-4 font-apple-bold text-slate-600 focus:bg-slate-50 focus:text-slate-950">
                    <User className="mr-3 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  {hasEmployerAccess && (
                    <DropdownMenuItem onClick={() => navigate('/employer')} className="rounded-xl h-11 px-4 font-apple-bold text-blue-600 focus:bg-blue-50 focus:text-blue-700">
                      <Building2 className="mr-3 h-4 w-4" /> Employer Hub
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/profile/settings')} className="rounded-xl h-11 px-4 font-apple-bold text-slate-600 focus:bg-slate-50 focus:text-slate-950">
                    <Settings className="mr-3 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl h-11 px-4 font-apple-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700">
                    <LogOut className="mr-3 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl h-9 w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1">
              {[
                { to: '/jobs', label: 'Precision Matches' },
                { to: '/intelligence-navigator', label: 'Intelligence AI' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-4 py-1.5 rounded-xl text-[13px] font-apple-heavy text-slate-500 hover:text-slate-950 hover:bg-slate-50 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <AuthDialog>
              <Button variant="ghost" className="rounded-xl h-10 px-6 font-apple-heavy text-slate-600">
                Sign In
              </Button>
            </AuthDialog>
            <AuthDialog>
              <Button className="rounded-xl h-10 px-6 font-apple-heavy bg-slate-950 text-white hover:scale-105 transition-all shadow-lg shadow-slate-950/20">
                Get Started
              </Button>
            </AuthDialog>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {user && isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 right-0 bg-white/90 backdrop-blur-2xl border-b border-slate-200/50 p-6 lg:hidden shadow-2xl"
          >
            <div className="grid grid-cols-1 gap-2">
              {mainNavItems.map((item) => {
                const isActive = isCurrentPath(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-4 h-14 px-6 rounded-2xl font-apple-heavy transition-all",
                      isActive 
                        ? 'bg-slate-950 text-white' 
                        : 'text-slate-500 hover:bg-slate-50'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
