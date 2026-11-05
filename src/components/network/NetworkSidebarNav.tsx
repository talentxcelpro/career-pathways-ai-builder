import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  MessageSquare, 
  Sparkles, 
  Trophy, 
  Gift, 
  Users, 
  UserPlus, 
  TrendingUp, 
  Compass,
  ChevronRight
} from "lucide-react";

interface NetworkSidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  connectionCount?: number;
  articleCount?: number;
  pendingRequestsCount?: number;
}

export const NetworkSidebarNav: React.FC<NetworkSidebarNavProps> = ({
  activeTab,
  onTabChange,
  connectionCount = 0,
  articleCount = 35,
  pendingRequestsCount = 0,
}) => {
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'feed',
      label: 'Feed',
      icon: MessageSquare,
      iconColor: 'text-blue-600',
      description: 'Community stream & updates',
      badge: null
    },
    {
      id: 'smart-feed',
      label: 'Smart Feed',
      icon: Sparkles,
      iconColor: 'text-purple-500',
      description: 'AI ranked & curated posts',
      badge: null
    },
    {
      id: 'gamification',
      label: 'Gamification',
      icon: Trophy,
      iconColor: 'text-amber-500',
      description: 'Live Career RPG & Quests',
      badge: 'RPG',
      isLiveLink: true
    },
    {
      id: 'refer-and-earn',
      label: 'Refer & Earn',
      icon: Gift,
      iconColor: 'text-pink-500',
      description: 'Invite peers & earn TXC',
      badge: null
    },
    {
      id: 'connections',
      label: 'Connections',
      icon: Users,
      iconColor: 'text-blue-500',
      description: 'Real accepted connections',
      badge: `${connectionCount}`,
      hasPending: pendingRequestsCount > 0
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: Compass,
      iconColor: 'text-emerald-500',
      description: 'Career Hub & Articles',
      badge: `${articleCount} Articles`
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      iconColor: 'text-indigo-500',
      description: 'Reach & engagement telemetry',
      badge: null
    },
    {
      id: 'ai-connect',
      label: 'AI Connect',
      icon: Sparkles,
      iconColor: 'text-cyan-500',
      description: 'Smart profile matching',
      badge: null
    },
    {
      id: 'creator-studio',
      label: 'Creator Studio',
      icon: Sparkles,
      iconColor: 'text-amber-500',
      description: 'Creator pool & telemetry',
      isLiveNotification: true
    }
  ];

  return (
    <Card className="border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card rounded-2xl p-2 sm:p-2.5">
      <div className="flex items-center justify-between mb-2 px-1.5 pt-0.5">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
          Network Modules
        </h3>
        <Badge variant="outline" className="text-[9px] font-bold py-0 h-4 border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">
          9 Hubs
        </Badge>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isLiveLink) {
                  navigate('/gamification');
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all group cursor-pointer ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-2xs border border-blue-200/60 dark:border-blue-800/60' 
                  : 'hover:bg-slate-100/80 dark:hover:bg-muted/50 text-slate-700 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-105 ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 ' + item.iconColor
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold truncate">
                      {item.label}
                    </span>
                    {item.isLiveNotification && (
                      <span className="relative flex h-2 w-2" title="Active Creator Distribution">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                    {item.hasPending && (
                      <span className="relative flex h-2 w-2" title="Pending Connection Requests">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 truncate hidden sm:block font-medium">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                {item.badge && (
                  <Badge 
                    variant={isActive ? "default" : "secondary"} 
                    className={`text-[10px] font-bold px-1.5 py-0 h-4 ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className={`h-3 w-3 transition-transform ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 translate-x-0.5' 
                    : 'text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5'
                }`} />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
