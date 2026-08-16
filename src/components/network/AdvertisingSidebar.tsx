import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Crown, Zap, Star, User, Briefcase, Search, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdvertisingSidebarProps {
  position?: 'left' | 'right';
  maxAds?: number;
}

export const AdvertisingSidebar: React.FC<AdvertisingSidebarProps> = () => {
  const navigate = useNavigate();

  // Fetch connection suggestions for People You May Know directly from Supabase profiles
  const { data: suggestions } = useQuery({
    queryKey: ['sidebar-connection-suggestions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, location, username, slug')
        .neq('id', user.id)
        .limit(3);
      return data || [];
    }
  });

  return (
    <div className="space-y-5">
      <div className="text-xs text-muted-foreground font-bold tracking-wider uppercase px-1">
        Sponsored
      </div>

      {/* 1. PRO SPONSORED CARD 1: BOOST YOUR CAREER WITH PRO */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-600 p-5 text-white shadow-xl overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-amber-300 hover:bg-amber-300 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
            Popular
          </Badge>
        </div>

        {/* 3D Gem Graphic Illustration */}
        <div className="relative w-full h-32 flex items-center justify-center my-2">
          <div className="w-20 h-24 bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-600 rounded-2xl rotate-45 shadow-2xl flex items-center justify-center border-2 border-white/40 transform group-hover:scale-105 transition-transform duration-300">
            <div className="transform -rotate-45 text-white font-black text-2xl tracking-tighter drop-shadow-md">
              💎
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-2 left-6 p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-amber-300 shadow-md">
            <Crown className="h-4 w-4" />
          </div>
          <div className="absolute top-1 right-8 p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-cyan-300 shadow-md">
            <Zap className="h-4 w-4" />
          </div>
          <div className="absolute bottom-2 left-8 p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-amber-200 shadow-md">
            <Star className="h-4 w-4" />
          </div>
          <div className="absolute bottom-2 right-6 p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-emerald-200 shadow-md">
            <User className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2 mt-4 text-left">
          <h3 className="font-extrabold text-base tracking-tight text-white leading-tight">
            Boost Your Career with Pro
          </h3>
          <p className="text-xs text-emerald-50 leading-relaxed font-medium">
            Unlock premium features, priority support, and exclusive networking opportunities.
          </p>

          <Button 
            onClick={() => navigate('/pro')}
            className="w-full mt-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 shadow-lg flex items-center justify-center gap-1.5 border-0"
          >
            Upgrade Now
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. PRO SPONSORED CARD 2: FIND YOUR DREAM JOB */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-5 text-white shadow-xl overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-emerald-400 hover:bg-emerald-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
            New
          </Badge>
        </div>

        {/* 3D Briefcase & Magnifying Glass Illustration */}
        <div className="relative w-full h-32 flex items-center justify-center my-2">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-700 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white/40 transform group-hover:scale-105 transition-transform duration-300">
            <Briefcase className="h-10 w-10 text-white drop-shadow-md" />
          </div>

          <div className="absolute bottom-1 right-12 p-3 rounded-full bg-amber-400 text-slate-950 shadow-xl border-2 border-white">
            <Search className="h-5 w-5 stroke-[3]" />
          </div>
        </div>

        <div className="space-y-2 mt-4 text-left">
          <h3 className="font-extrabold text-base tracking-tight text-white leading-tight">
            Find Your Dream Job
          </h3>
          <p className="text-xs text-purple-100 leading-relaxed font-medium">
            Browse thousands of job opportunities from top companies.
          </p>

          <Button 
            onClick={() => navigate('/jobs')}
            className="w-full mt-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-xs py-2.5 shadow-lg flex items-center justify-center gap-1.5"
          >
            Browse Jobs
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 3. PEOPLE YOU MAY KNOW CARD - UNIVERSAL CAREER PASSPORT LINKED */}
      <Card className="border border-slate-200/80 dark:border-border/60 shadow-sm bg-white dark:bg-card rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-extrabold text-foreground tracking-tight">People You May Know</h3>
          <Button variant="link" size="sm" onClick={() => navigate('/network/discover')} className="text-xs font-bold text-primary p-0 h-auto">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((person) => (
              <div key={person.id} className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors">
                <div 
                  onClick={() => navigate(`/passport/public/${person.username || person.slug || person.id}`)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                >
                  <Avatar className="w-9 h-9 border border-slate-200 dark:border-border">
                    <AvatarImage src={person.profile_picture_url || undefined} />
                    <AvatarFallback className="font-bold text-xs bg-slate-900 text-white">
                      {person.full_name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-foreground truncate">{person.full_name}</p>
                      <CheckCircle2 className="h-3 w-3 text-blue-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{person.title || "Professional"}</p>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  onClick={() => navigate(`/passport/public/${person.username || person.slug || person.id}`)}
                  className="rounded-xl text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 h-7 shadow-sm"
                >
                  Connect
                </Button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer" onClick={() => navigate('/network/discover')}>
                <Avatar className="w-9 h-9 border border-slate-200 dark:border-border">
                  <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200" alt="Priya Sharma" />
                  <AvatarFallback className="font-bold text-xs bg-slate-900 text-white">PS</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-foreground truncate">Priya Sharma</p>
                    <CheckCircle2 className="h-3 w-3 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">HR Manager at TechCorp</p>
                </div>
              </div>

              <Button 
                size="sm" 
                onClick={() => navigate('/network/discover')}
                className="rounded-xl text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 h-7 shadow-sm"
              >
                Connect
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};