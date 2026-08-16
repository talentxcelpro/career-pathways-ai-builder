import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ShieldCheck,
  Users, 
  Briefcase, 
  Target,
  MessageSquare, 
  Globe,
  Grid, 
  GraduationCap,
  Map,
  Building2, 
  TrendingUp, 
  Bot,
  Award,
  Share2,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

export const ProfileSidebarNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useOptimizedAuth();

  const navItems = [
    { label: 'Home', icon: Home, path: '/network' },
    { label: 'Passport', icon: ShieldCheck, path: '/passport', badge: 'New', badgeColor: 'bg-blue-600' },
    { label: 'Network', icon: Users, path: '/network' },
    { label: 'Jobs', icon: Briefcase, path: '/jobs' },
    { label: 'Opportunities', icon: Target, path: '/jobs' },
    { label: 'Messages', icon: MessageSquare, path: '/communication', badge: '3', badgeColor: 'bg-purple-600' },
    { label: 'Communities', icon: Globe, path: '/network' },
    { label: 'Services', icon: Grid, path: '/marketplace' },
    { label: 'Learning', icon: GraduationCap, path: '/learning' },
    { label: 'Career Map', icon: Map, path: '/career-map' },
    { label: 'Companies', icon: Building2, path: '/companies' },
    { label: 'Analytics', icon: TrendingUp, path: '/profile/analytics' },
    { label: 'AI Career Coach', icon: Bot, path: '/resume/build?workspace=ai-improve' },
    { label: 'Rewards', icon: Award, path: '/earn-txc' },
    { label: 'Refer & Earn', icon: Share2, path: '/referrals' },
  ];

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Arshid Hussain Wani';
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.profile_picture_url;

  return (
    <aside className="w-64 shrink-0 hidden xl:flex flex-col justify-between py-4 px-3 bg-card border-r border-border/60 min-h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
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
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full text-white shadow-sm ${item.badgeColor || 'bg-purple-600'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3">
          <Button 
            onClick={() => navigate('/employer')} 
            className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md flex items-center justify-center gap-2 py-4 text-xs"
          >
            <Plus className="h-4 w-4" />
            Post Opportunity
          </Button>
        </div>
      </div>

      {/* Bottom Profile Passport Status Card */}
      <div className="pt-4 mt-4 border-t border-border/60 space-y-3">
        <Link 
          to={user ? `/passport` : '/auth/login'} 
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={userAvatar || undefined} />
            <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">
              {userDisplayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground truncate">{userDisplayName}</span>
            <span className="text-[10px] text-primary font-semibold">View Career Passport</span>
          </div>
        </Link>

        {/* Profile Strength & Career Ready Box */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Career Ready
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
              <span>Profile Strength</span>
              <span className="text-foreground font-bold">95%</span>
            </div>
            <Progress value={95} className="h-1.5 bg-muted" />
          </div>

          <Button 
            onClick={() => navigate('/profile/edit')} 
            variant="ghost" 
            size="sm"
            className="w-full h-7 text-[11px] text-primary hover:text-primary font-bold justify-between p-0"
          >
            <span>Complete Your Passport</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
