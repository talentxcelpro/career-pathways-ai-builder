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
import { useUnreadNotificationCount } from '@/hooks/useEnhancedNotifications';
import { NotificationBadge } from '@/components/ui/NotificationBadge';
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
  const { unreadCount } = useUnreadNotificationCount();

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
    await signOut();
  };

  const mainNavItems = [
    { to: "/network", label: "Network" },
    { to: "/jobs", label: "Jobs" },
    { to: "/employer", label: "Employer" },
    { to: "/companies", label: "Companies" },
    { to: "/resume-builder", label: "Resume Builder" },
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

  // Hide specific modules from navbar for non-admins
  const hiddenForNonAdmin = [
    '/resume-builder',
    '/tools',
    '/learning',
    '/career-map',
  ];
  const visibleNavItems = isAdmin ? mainNavItems : mainNavItems.filter(item => !hiddenForNonAdmin.includes(item.to));

  const getEmployerButtonText = () => {
    if (!user) return 'Sign In';
    if (hasEmployerAccess) return 'Employer Dashboard';
    if (employerStatus === 'pending') return 'Access Pending';
    return 'Request Access';
  };

  const getEmployerButtonAction = () => {
    if (!user) return () => navigate('/auth/register');
    if (hasEmployerAccess) return () => navigate('/employer');
    if (employerStatus === 'pending') return () => navigate('/employer/request-access');
    return () => navigate('/employer/request-access');
  };

  // Hide navbar on mobile when user is authenticated (use mobile header instead)
  if (isMobile && user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50 mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel" 
                className="h-8 w-8 rounded-sm"
              />
            </Link>
          </div>

          {user ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {visibleNavItems.map((item) => {
                  const isActive = isCurrentPath(item.to);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* Admin Menu - Only show for admin */}
                {isAdmin && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsAdminOpen(!isAdminOpen)}
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {isAdminOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border">
                        <Link
                          to="/admin/employer-requests"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsAdminOpen(false)}
                        >
                          <Building2 className="h-4 w-4 inline mr-2" />
                          Employer Requests
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">

                {/* Notifications */}
                <Link to="/network/notifications">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <NotificationBadge count={unreadCount} />
                  </Button>
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
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
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {hasCompanyAccess && (
                      <DropdownMenuItem asChild>
                        <Link to="/company/dashboard" className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>Company Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                     )}
                     {hasEmployerAccess ? (
                       <DropdownMenuItem asChild>
                         <Link to="/pro/services" className="flex items-center">
                           <Settings className="mr-2 h-4 w-4" />
                           <span>Set Up Services</span>
                         </Link>
                       </DropdownMenuItem>
                     ) : (
                       <DropdownMenuItem asChild>
                         <Link to="/pro/subscription" className="flex items-center">
                           <Settings className="mr-2 h-4 w-4" />
                           <span>Set Up Services</span>
                         </Link>
                       </DropdownMenuItem>
                     )}
                     <DropdownMenuItem asChild>
                       <Link to="/profile/settings" className="flex items-center">
                         <Settings className="mr-2 h-4 w-4" />
                         <span>Settings</span>
                       </Link>
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
            <div className="flex items-center space-x-4">
              <Link
                to="/companies"
                className="hidden md:inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <span>Companies</span>
              </Link>
              <Link
                to="/services"
                className="hidden md:inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <span>Services</span>
              </Link>
              <Button 
                variant="ghost" 
                onClick={getEmployerButtonAction()}
                className={`
                  ${employerStatus === 'pending' ? 'text-yellow-600 hover:text-yellow-700' : ''}
                  ${hasEmployerAccess ? 'text-green-600 hover:text-green-700' : ''}
                `}
              >
                {getEmployerButtonText()}
              </Button>
              <AuthDialog 
                buttonText="Sign In" 
                variant="ghost" 
              />
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
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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

      {/* Mobile Admin Menu */}
      {isAdmin && (
        <div className="border-t border-gray-200 pt-4 pb-3 md:hidden">
          <div className="px-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Admin</p>
            <Link
              to="/admin/employer-requests"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Building2 className="h-4 w-4 inline mr-2" />
              Employer Requests
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
