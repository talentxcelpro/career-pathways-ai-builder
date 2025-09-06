import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, User, Building2, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export function UnifiedHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { hasEmployerAccess } = useEmployerAccess();
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

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getEmployerButtonText = () => {
    if (!user) return 'Sign In';
    if (hasEmployerAccess) return 'Employer Dashboard';
    return 'Request Access';
  };

  const getEmployerButtonAction = () => {
    if (!user) return () => navigate('/auth/register');
    if (hasEmployerAccess) return () => navigate('/employer');
    return () => navigate('/employer/request-access');
  };

  if (!user) {
    return (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
              alt="TalentXcel" 
              className="h-8 w-8 rounded-sm"
            />
            <span className="text-lg font-bold">TalentXcel</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={getEmployerButtonAction()}
          >
            {getEmployerButtonText()}
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex items-center gap-2 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
            alt="TalentXcel" 
            className="h-8 w-8 rounded-sm"
          />
          <span className="text-lg font-bold">TalentXcel</span>
        </Link>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        {/* Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/search')}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
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
      </div>
    </header>
  );
}