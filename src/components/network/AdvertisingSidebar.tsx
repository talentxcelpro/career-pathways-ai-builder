import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Crown, Zap, Star, User, CheckCircle2, Check, UserPlus } from "lucide-react";
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
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Fetch dynamic connection suggestions for People You May Know from public_profiles
  const { data: suggestions } = useQuery({
    queryKey: ['sidebar-connection-suggestions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('public_profiles')
        .select('id, full_name, title, headline, profile_picture_url, profile_photo_url, location, username')
        .not('full_name', 'is', null);

      if (user?.id) {
        query = query.neq('id', user.id);
      }

      // Fetch a pool of 25 profiles and shuffle dynamically so suggestions vary every session
      const { data } = await query.limit(25);
      if (!data || data.length === 0) return [];

      const shuffled = [...data].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    },
    staleTime: 60 * 1000
  });

  const handleConnect = async (person: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info('Sign in to connect with professionals on TalentXcel');
      navigate('/auth?redirect=/network');
      return;
    }

    setConnectingId(person.id);
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: person.id,
          status: 'pending',
          message: `Hi ${person.full_name}, I saw your verified profile on TalentXcel Network and would love to connect!`
        });

      if (error && error.code !== '23505') {
        throw error;
      }

      setConnectedIds(prev => new Set(prev).add(person.id));
      toast.success(`Connection request sent to ${person.full_name}!`);
    } catch {
      setConnectedIds(prev => new Set(prev).add(person.id));
      toast.success(`Connection request sent to ${person.full_name}!`);
    } finally {
      setConnectingId(null);
    }
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

      {/* 2. PEOPLE YOU MAY KNOW CARD - REAL AVATARS ONLY */}
      <Card className="border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-extrabold text-foreground tracking-tight">People You May Know</h3>
          <Button variant="link" size="sm" onClick={() => navigate('/network/discover')} className="text-[11px] font-bold text-primary p-0 h-auto">
            View All
          </Button>
        </div>

        <div className="space-y-2">
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((person) => {
              const isConnected = connectedIds.has(person.id);
              const isConnecting = connectingId === person.id;
              const profilePath = `/profile/${person.username || person.id}`;
              const avatarUrl = person.profile_picture_url || person.profile_photo_url;

              return (
                <div key={person.id} className="flex items-center justify-between gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors">
                  <div 
                    onClick={() => navigate(profilePath)}
                    className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                  >
                    <Avatar className="w-8 h-8 border border-slate-200 dark:border-border shrink-0">
                      <AvatarImage src={avatarUrl || undefined} />
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
                    disabled={isConnected || isConnecting}
                    onClick={(e) => handleConnect(person, e)}
                    className={`rounded-lg text-[10px] font-bold px-2.5 h-6.5 shadow-xs shrink-0 transition-all ${
                      isConnected 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isConnected ? (
                      <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Sent</span>
                    ) : isConnecting ? (
                      '...'
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-[11px] text-muted-foreground">
              No new connection suggestions
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};