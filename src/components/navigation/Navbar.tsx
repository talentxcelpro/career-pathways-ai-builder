
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
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
  MapPin
} from "lucide-react";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return null;
      return user;
    }
  });

  // Get profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      return profileData;
    },
    enabled: !!currentUser?.id
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Network', href: '/network', icon: Users },
    { name: 'Learning', href: '/learning', icon: GraduationCap },
    { name: 'Tools', href: '/tools', icon: Wrench },
    { name: 'Career Map', href: '/career-map', icon: MapPin },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/5a3d4a06-3cd5-45aa-b2bd-897e40811280.png" 
                alt="TalentXcel Logo" 
                className="h-8 w-auto"
              />
              <span className="font-bold text-lg text-gray-900 hidden sm:block">TalentXcel</span>
            </Link>
          </div>

          {currentUser ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = isCurrentPath(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-sm transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 hover:transform hover:scale-105'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-gray-100/80">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 text-white">3</Badge>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-blue-200 transition-all duration-300">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md border border-white/20" align="end" forceMount>
                    <div className="flex items-center justify-start space-x-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                        <p className="w-[200px] truncate text-xs text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile/settings" className="flex items-center text-sm">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-sm">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </>
          ) : (
            /* Guest Navigation */
            <div className="flex items-center space-x-3">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm" className="text-sm">Sign In</Button>
              </Link>
              <Link to="/auth/register">
                <Button size="sm" className="text-sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {currentUser && isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isCurrentPath(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
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
