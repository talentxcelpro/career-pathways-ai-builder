import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Crown, Zap, Star, User, Briefcase, Search, CheckCircle2, RotateCw, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdvertisingSidebarProps {
  position?: 'left' | 'right';
  maxAds?: number;
}

export const AdvertisingSidebar: React.FC<AdvertisingSidebarProps> = () => {
  const navigate = useNavigate();
  const { sendConnectionRequest } = useConnectionRequests();
  const [cycleIndex, setCycleIndex] = useState(0);
  const [pendingMap, setPendingMap] = useState<Record<string, 'pending' | 'sent'>>({});

  // Dynamic connection suggestions from Supabase profiles pool
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['sidebar-connection-suggestions', cycleIndex],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const excludedIds: string[] = [];

      if (user) {
        excludedIds.push(user.id);
        try {
          const { data: conns } = await supabase
            .from('connections')
            .select('requester_id, recipient_id')
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
          if (conns && conns.length > 0) {
            conns.forEach(c => {
              if (c.requester_id) excludedIds.push(c.requester_id);
              if (c.recipient_id) excludedIds.push(c.recipient_id);
            });
          }
        } catch (_) {}
      }

      // Fetch a pool of verified profiles with actual names
      let query = supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, location, username, slug, headline')
        .not('full_name', 'is', null)
        .neq('full_name', '');

      if (user && excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.slice(0, 40).join(',')})`);
      }

      const { data, error } = await query.limit(45);
      if (error || !data) return [];

      const validProfiles = data.filter(p => p.full_name && p.full_name.trim().length > 1);

      // Seeded shuffle/cycle across the candidate pool so it changes dynamically
      const shuffled = [...validProfiles].sort((a, b) => {
        const hashA = (a.id.charCodeAt(0) + cycleIndex * 17) % 100;
        const hashB = (b.id.charCodeAt(0) + cycleIndex * 17) % 100;
        return hashA - hashB;
      });

      return shuffled.slice(0, 3);
    },
    staleTime: 60 * 1000
  });

  const handleConnect = async (e: React.MouseEvent, person: any) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("Please sign in to connect with professionals", {
        action: {
          label: "Sign In",
          onClick: () => navigate('/auth')
        }
      });
      return;
    }

    try {
      setPendingMap(prev => ({ ...prev, [person.id]: 'pending' }));
      await sendConnectionRequest.mutateAsync({ recipientId: person.id });
      setPendingMap(prev => ({ ...prev, [person.id]: 'sent' }));
      toast.success(`Connection request sent to ${person.full_name}!`);
    } catch (err: any) {
      setPendingMap(prev => {
        const copy = { ...prev };
        delete copy[person.id];
        return copy;
      });
      toast.error(err?.message || "Failed to send connection request");
    }
  };

  const handleShuffleSuggestions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCycleIndex(prev => prev + 1);
  };

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase px-1">
        Sponsored
      </div>

      {/* 1. PRO SPONSORED CARD 1: BOOST YOUR CAREER WITH PRO (30% more compact) */}
      <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-600 p-3.5 text-white shadow-md overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-amber-300 hover:bg-amber-300 text-slate-950 font-black text-[9px] px-2 py-0 rounded-full shadow-xs">
            Popular
          </Badge>
        </div>

        {/* 3D Gem Graphic Illustration (Scale reduced 30%) */}
        <div className="relative w-full h-20 flex items-center justify-center my-1">
          <div className="w-13 h-16 bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-600 rounded-xl rotate-45 shadow-xl flex items-center justify-center border border-white/40 transform group-hover:scale-105 transition-transform duration-300">
            <div className="transform -rotate-45 text-white font-black text-base tracking-tighter drop-shadow-sm">
              💎
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-1 left-8 p-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-amber-300 shadow-xs">
            <Crown className="h-3 w-3" />
          </div>
          <div className="absolute top-0 right-10 p-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-cyan-300 shadow-xs">
            <Zap className="h-3 w-3" />
          </div>
          <div className="absolute bottom-1 left-10 p-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-amber-200 shadow-xs">
            <Star className="h-3 w-3" />
          </div>
          <div className="absolute bottom-1 right-8 p-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-emerald-200 shadow-xs">
            <User className="h-3 w-3" />
          </div>
        </div>

        <div className="space-y-1 mt-2 text-left">
          <h3 className="font-bold text-sm tracking-tight text-white leading-tight">
            Boost Your Career with Pro
          </h3>
          <p className="text-[11px] text-emerald-50 leading-snug font-medium line-clamp-2">
            Unlock premium features, priority support, and exclusive networking opportunities.
          </p>

          <Button 
            onClick={() => navigate('/pro')}
            className="w-full mt-2 h-7.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 border-0"
          >
            Upgrade Now
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 2. PRO SPONSORED CARD 2: FIND YOUR DREAM JOB (30% more compact) */}
      <div className="relative rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-3.5 text-white shadow-md overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-emerald-400 hover:bg-emerald-400 text-slate-950 font-black text-[9px] px-2 py-0 rounded-full shadow-xs">
            New
          </Badge>
        </div>

        {/* 3D Briefcase Illustration (Scale reduced 30%) */}
        <div className="relative w-full h-20 flex items-center justify-center my-1">
          <div className="w-13 h-13 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-700 rounded-xl shadow-xl flex items-center justify-center border border-white/40 transform group-hover:scale-105 transition-transform duration-300">
            <Briefcase className="h-6 w-6 text-white drop-shadow-sm" />
          </div>

          <div className="absolute bottom-0 right-14 p-1.5 rounded-full bg-amber-400 text-slate-950 shadow-md border border-white">
            <Search className="h-3.5 w-3.5 stroke-[3]" />
          </div>
        </div>

        <div className="space-y-1 mt-2 text-left">
          <h3 className="font-bold text-sm tracking-tight text-white leading-tight">
            Find Your Dream Job
          </h3>
          <p className="text-[11px] text-purple-100 leading-snug font-medium line-clamp-2">
            Browse thousands of job opportunities from top companies.
          </p>

          <Button 
            onClick={() => navigate('/jobs')}
            className="w-full mt-2 h-7.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
          >
            Browse Jobs
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 3. PEOPLE YOU MAY KNOW CARD - DYNAMICALLY POPULATED & INTERACTIVE */}
      <Card className="border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-extrabold text-foreground tracking-tight">People You May Know</h3>
            <button
              type="button"
              onClick={handleShuffleSuggestions}
              title="Show more recommendations"
              className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-slate-100 dark:hover:bg-muted transition-colors"
            >
              <RotateCw className={`h-3 w-3 ${suggestionsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <Button variant="link" size="sm" onClick={() => navigate('/network/discover')} className="text-[11px] font-bold text-primary p-0 h-auto">
            View All
          </Button>
        </div>

        <div className="space-y-2">
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((person) => {
              const profileIdentifier = person.username || person.slug || person.id;
              const status = pendingMap[person.id];

              return (
                <div key={person.id} className="flex items-center justify-between gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors">
                  <div 
                    onClick={() => navigate(`/u/${profileIdentifier}`)}
                    className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                  >
                    <Avatar className="w-8 h-8 border border-slate-200 dark:border-border shrink-0">
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
                      <p className="text-[10px] text-muted-foreground truncate">{person.headline || person.title || "Professional"}</p>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    disabled={status === 'pending' || status === 'sent'}
                    onClick={(e) => handleConnect(e, person)}
                    className={`rounded-lg text-[10px] font-bold px-2.5 h-6.5 shadow-xs shrink-0 transition-all ${
                      status === 'sent'
                        ? 'bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 border border-slate-200'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {status === 'pending' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : status === 'sent' ? (
                      <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-600" /> Pending</span>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-[11px] text-muted-foreground">
              {suggestionsLoading ? 'Finding professionals...' : 'No new connection suggestions'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
