import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Briefcase, 
  Building2, 
  Grid, 
  MessageSquare, 
  Bell, 
  Bookmark, 
  TrendingUp, 
  Sparkles, 
  Plus,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

export const ProfileSidebarNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useOptimizedAuth();

  const navItems = [
    { label: 'Home', icon: Home, path: '/network' },
    { label: 'My Network', icon: Users, path: '/network' },
    { label: 'Jobs', icon: Briefcase, path: '/jobs' },
    { label: 'Companies', icon: Building2, path: '/companies' },
    { label: 'Services', icon: Grid, path: '/marketplace' },
    { label: 'Messages', icon: MessageSquare, path: '/communication', badge: '1' },
    { label: 'Notifications', icon: Bell, path: '/notifications', badge: '3' },
    { label: 'Bookmarks', icon: Bookmark, path: '/saved-jobs' },
    { label: 'Analytics', icon: TrendingUp, path: '/profile/analytics' },
    { label: 'AI Connect', icon: Sparkles, path: '/network' },
  ];

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User Profile';
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.profile_picture_url;

  return (
    <aside className="w-60 shrink-0 hidden xl:flex flex-col justify-between py-4 px-3 bg-card border-r border-border/60 min-h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="space-y-1">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-purple-600 text-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <Button 
            onClick={() => navigate('/employer')} 
            className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md flex items-center justify-center gap-2 py-5"
          >
            <Plus className="h-4 w-4" />
            Post a Job
          </Button>
        </div>
      </div>

      {/* Bottom Profile Avatar Link */}
      <div className="pt-4 border-t border-border/60">
        <Link 
          to={user ? `/profile` : '/auth/login'} 
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={userAvatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {userDisplayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground truncate">{userDisplayName}</span>
            <span className="text-[11px] text-primary hover:underline font-semibold">View Profile</span>
          </div>
        </Link>
      </div>
    </aside>
  );
};
