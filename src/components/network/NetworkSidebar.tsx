import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Users, Bookmark, Calendar, Award, Plus } from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileStats } from '@/hooks/useProfileStats';

export const NetworkSidebar: React.FC = () => {
  const { user } = useAuth();
  const { displayName } = useCurrentUserProfile();
  const { data: profileStats } = useProfileStats(user?.id);

  const quickActions = [
    { icon: Users, label: 'Connections', value: profileStats?.connections || 0, href: '/network/connections' },
    { icon: Eye, label: 'Profile views', value: profileStats?.profileViews || 0, href: '/profile/analytics' },
    { icon: Bookmark, label: 'Saved posts', value: 12, href: '/network/saved' },
  ];

  const discoverItems = [
    { icon: Calendar, label: 'Events', href: '/network/events', hasNew: true },
    { icon: Award, label: 'Learning', href: '/learning', hasNew: false },
    { icon: Users, label: 'Groups', href: '/network/groups', hasNew: true },
  ];

  return (
    <div className="sticky top-20 space-y-4">
      {/* Profile Card */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardContent className="p-0">
          {/* Cover Image */}
          <div className="h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg"></div>
          
          {/* Profile Info */}
          <div className="px-4 pb-4">
            <div className="relative -mt-8 mb-4">
              <Avatar className="w-16 h-16 border-4 border-card">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-1 mb-4">
              <h3 className="font-semibold text-foreground text-sm">
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Building amazing things at TalentXcel
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-2 border-t border-border/60 pt-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center justify-between py-1 hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <action.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{action.label}</span>
                  </div>
                  <span className="text-xs font-medium text-primary">{action.value}</span>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground text-sm mb-3">Recent</h4>
          <div className="space-y-2">
            <Link 
              to="/network/groups/career-growth"
              className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              📈 Career Growth Tips
            </Link>
            <Link 
              to="/network/groups/tech-professionals"
              className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              💻 Tech Professionals
            </Link>
            <Link 
              to="/network/groups/startup-founders"
              className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              🚀 Startup Founders
            </Link>
          </div>
          
          <h4 className="font-medium text-foreground text-sm mb-3 mt-4">Groups</h4>
          <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
            <Plus className="h-3 w-3 mr-2" />
            Create a group
          </Button>
        </CardContent>
      </Card>

      {/* Discover */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground text-sm mb-3">Discover</h4>
          <div className="space-y-1">
            {discoverItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between py-2 hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-foreground">{item.label}</span>
                </div>
                {item.hasNew && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};