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
  HomeIcon,
  Briefcase,
  Users,
  GraduationCap,
  Wrench,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Building2,
  Compass,
  FileText,
  Network,
  Shield,
  ChevronDown,
  CheckCircle,
  Clock
} from "lucide-react";
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';
import { AuthDialog } from '@/components/auth/AuthDialog';
// import { useUnreadNotificationCount } from '@/hooks/useEnhancedNotifications';
import { NotificationBadge } from '@/components/ui/NotificationBadge';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useMobileDetection } from '@/hooks/useMobileDetection';



export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isMobile } = useMobileDetection();
  const dropdownRef = React.useRef(null);

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

  // Get unread notifications count using enhanced hook
  // const { unreadCount } = useUnreadNotificationCount();
  const unreadCount = 0; // Temporary static value

  // Check if user has company access
  const { data: hasCompanyAccess = false } = useQuery({
    queryKey: ['company-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('company_team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('role', ['owner', 'admin'])
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0;
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
  const { hasEmployerAccess, employerStatus } = useEmployerAccess();

  // Show all navigation items to all users
  const visibleNavItems = mainNavItems;

  const getEmployerButtonText = () => {
    if (!user) return 'Sign In';
    if (hasEmployerAccess) return 'Employer Dashboard';
    if (employerStatus === 'pending') return 'Access Pending';
    return 'Request Access';
  };

  const getEmployerButtonAction = () => {
    if (!user) return () => navigate('/auth/login');
    if (hasEmployerAccess) return () => navigate('/employer');
    if (employerStatus === 'pending') return () => navigate('/employer/request-access');
    return () => navigate('/employer/request-access');
  };

  // Hide navbar on mobile when user is authenticated (use mobile header instead)
  if (isMobile && user) {
    return null;
  }

  // Hide navbar on Resume Builder — it has its own integrated header + Navigation Hub
  if (location.pathname.startsWith('/resume')) {
    return null;
  }

  return (
    <nav className="bg-background/70 backdrop-blur-2xl backdrop-saturate-150 shadow-sm border-b border-border/20 sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12">
          {/* Apple-style compact logo */}
          <div className="flex items-center shrink-0 mr-4 sm:mr-6 lg:mr-8">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel" 
                className="h-6 w-6 rounded-sm shrink-0"
              />
              <span className="text-apple-body font-apple-bold text-foreground whitespace-nowrap">TalentXcel</span>
            </Link>
          </div>

          {user ? (
            <>
              {/* Apple-style compact navigation */}
              <div className="hidden md:flex items-center gap-0.5 lg:gap-1 overflow-x-auto no-scrollbar">
                {visibleNavItems.slice(0, 4).map((item) => {
                  const isActive = isCurrentPath(item.to);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`px-2 lg:px-2.5 py-1 rounded-lg text-apple-caption font-apple-medium transition-apple whitespace-nowrap
                        ${isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                
                
                {visibleNavItems.slice(4).map((item) => {
                  const isActive = isCurrentPath(item.to);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`px-2 lg:px-2.5 py-1 rounded-lg text-apple-caption font-apple-medium transition-apple whitespace-nowrap
                        ${isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">


                {/* Notifications */}
                <NotificationBell />

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start space-x-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{profile?.full_name || 'User'}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/profile');
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {hasCompanyAccess && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate('/company/dashboard');
                        }}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Company Dashboard</span>
                      </DropdownMenuItem>
                     )}
                     {hasEmployerAccess ? (
                       <DropdownMenuItem 
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           navigate('/pro/services');
                         }}
                       >
                         <Settings className="mr-2 h-4 w-4" />
                         <span>Set Up Services</span>
                       </DropdownMenuItem>
                     ) : (
                       <DropdownMenuItem 
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           navigate('/pro/subscription');
                         }}
                       >
                         <Settings className="mr-2 h-4 w-4" />
                         <span>Set Up Services</span>
                       </DropdownMenuItem>
                     )}
                     <DropdownMenuItem 
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         navigate('/profile/settings');
                       }}
                     >
                       <Settings className="mr-2 h-4 w-4" />
                       <span>Settings</span>
                     </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </>
          ) : (
            /* Guest Navigation */
            <div className="flex items-center">
              {location.pathname === '/auth/register' ? (
                <Button 
                  size="sm"
                  onClick={() => navigate('/auth/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 cursor-pointer shadow-sm"
                >
                  Sign In
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => navigate('/auth/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 cursor-pointer shadow-sm"
                >
                  Get Started Free
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {visibleNavItems.map((item) => {
                const isActive = isCurrentPath(item.to);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors
                      ${isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
