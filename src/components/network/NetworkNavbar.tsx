import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Users, Briefcase, MessageSquare, Bell, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { NotificationBadge } from '@/components/ui/NotificationBadge';

export const NetworkNavbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { displayName } = useCurrentUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/network/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/network', count: 0 },
    { icon: Users, label: 'My Network', path: '/network/connections', count: 3 },
    { icon: Briefcase, label: 'Jobs', path: '/jobs', count: 0 },
    { icon: MessageSquare, label: 'Messaging', path: '/network/messages', count: 2 },
    { icon: Bell, label: 'Notifications', path: '/network/notifications', count: 5 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Search */}
          <div className="flex items-center space-x-4 flex-1">
            <Link to="/network" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">T</span>
              </div>
              <span className="font-semibold text-foreground hidden sm:block">TalentXcel</span>
            </Link>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 bg-muted/50 border-muted-foreground/20 focus:bg-card"
                />
              </div>
            </form>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1 mx-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center p-2 hover:bg-muted/50 rounded-lg transition-colors group"
              >
                <div className="relative">
                  <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  {item.count > 0 && (
                    <NotificationBadge 
                      count={item.count} 
                      className="absolute -top-1 -right-1 h-4 w-4 text-xs"
                    />
                  )}
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground mt-1">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <Link to="/profile" className="flex items-center space-x-2 hover:bg-muted/50 rounded-lg p-2 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-foreground">Me</div>
              </div>
            </Link>
            
            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};