import React, { memo, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Building2, Zap, Sparkles, Activity, Shield, ArrowUpRight, Radio, Globe, Network, Users } from "lucide-react";
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VirtualizedList } from "@/components/performance/VirtualizedList";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProfileSuggestion {
  id: string;
  full_name: string;
  title: string;
  profile_picture_url?: string;
  current_company?: string;
  mutual_connections?: number;
  match_score?: number;
}

interface OptimizedConnectionSuggestionsProps {
  limit?: number;
  showVirtualized?: boolean;
}

const ITEM_HEIGHT = 140; 
const CONTAINER_HEIGHT = 560;

const ConnectionSuggestionCard = memo<{
  profile: ProfileSuggestion;
  onConnect: (profileId: string) => void;
  onDismiss: (profileId: string) => void;
  isConnecting: boolean;
}>(({ profile, onConnect, onDismiss, isConnecting }) => {
  const handleConnect = useCallback(() => onConnect(profile.id), [onConnect, profile.id]);
  const handleDismiss = useCallback(() => onDismiss(profile.id), [onDismiss, profile.id]);

  const initials = useMemo(() => {
    const names = profile.full_name.split(' ');
    return names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0][0];
  }, [profile.full_name]);

  return (
    <Card className="rounded-[32px] border-white/20 bg-white/60 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden border">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
         <Users className="h-24 w-24 text-blue-600" />
      </div>
      
      <div className="flex items-start justify-between relative z-10 gap-4">
        <Link to={`/network/people/${profile.id}`} className="flex items-center gap-4 flex-1">
          <Avatar className="h-14 w-14 rounded-2xl shadow-lg shadow-blue-500/10 border-2 border-white">
            <AvatarImage src={profile.profile_picture_url} />
            <AvatarFallback className="bg-slate-950 text-white font-apple-heavy">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
               <h3 className="font-apple-heavy text-slate-950 text-sm truncate">{profile.full_name}</h3>
               {profile.match_score && profile.match_score > 90 && (
                 <Badge className="bg-blue-600 text-white border-0 rounded-lg px-2 py-0.5 font-apple-bold text-[8px] uppercase tracking-widest">STRATEGIC MATCH</Badge>
               )}
            </div>
            <p className="text-xs font-apple-medium text-slate-500 truncate">{profile.title}</p>
            {profile.current_company && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Building2 className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] font-apple-bold text-slate-400 truncate uppercase tracking-widest">{profile.current_company}</span>
              </div>
            )}
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-slate-300 hover:text-slate-950 hover:bg-slate-50"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-6 flex items-center justify-between gap-4">
        {profile.mutual_connections && profile.mutual_connections > 0 ? (
          <div className="flex items-center gap-2">
             <div className="flex -space-x-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-5 w-5 rounded-full border-2 border-white bg-slate-100" />
                ))}
             </div>
             <span className="text-[9px] font-apple-heavy text-slate-400 uppercase tracking-widest">{profile.mutual_connections} Ecosystem Ties</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
             <Activity className="h-3 w-3 text-emerald-500" />
             <span className="text-[9px] font-apple-heavy text-emerald-600 uppercase tracking-widest">Active Evolution</span>
          </div>
        )}
        
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="rounded-xl h-10 px-6 bg-slate-950 text-white font-apple-heavy text-xs shadow-xl shadow-slate-950/10 hover:scale-105 transition-all"
        >
          {isConnecting ? 'Syncing...' : 'Sync'} <UserPlus className="h-3 w-3 ml-2" />
        </Button>
      </div>
    </Card>
  );
});

ConnectionSuggestionCard.displayName = 'ConnectionSuggestionCard';

const OptimizedConnectionSuggestionsComponent: React.FC<OptimizedConnectionSuggestionsProps> = ({
  limit = 10,
  showVirtualized = false
}) => {
  const [sendingConnection, setSendingConnection] = useState<string | null>(null);
  const [dismissedProfiles, setDismissedProfiles] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-suggestions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['connection-suggestions', currentUser?.id, limit],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data: connections } = await supabase.from('connections').select('requester_id, recipient_id').or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`);
      const connectedUserIds = new Set([...connections?.map(c => c.requester_id === currentUser.id ? c.recipient_id : c.requester_id) || []]);
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, title, profile_picture_url, current_company').neq('id', currentUser.id).limit(limit * 2);
      if (!profiles) return [];
      const filteredProfiles = profiles.filter(profile => !connectedUserIds.has(profile.id)).slice(0, limit);
      return filteredProfiles.map(profile => ({
        ...profile,
        mutual_connections: Math.floor(Math.random() * 5),
        match_score: 85 + Math.random() * 15
      })).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
  });

  const connectMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const { data, error } = await supabase.from('connections').insert({ requester_id: currentUser?.id, recipient_id: recipientId, status: 'pending' });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Professional synchronization initialized.');
      queryClient.invalidateQueries({ queryKey: ['connection-suggestions'] });
    },
    onError: () => toast.error('Failed to initialize synchronization.'),
    onSettled: () => setSendingConnection(null)
  });

  const handleConnect = useCallback(async (profileId: string) => {
    setSendingConnection(profileId);
    connectMutation.mutate(profileId);
  }, [connectMutation]);

  const handleDismiss = useCallback((profileId: string) => {
    setDismissedProfiles(prev => new Set([...prev, profileId]));
  }, []);

  const filteredSuggestions = useMemo(() => suggestions.filter(profile => !dismissedProfiles.has(profile.id)), [suggestions, dismissedProfiles]);

  const renderSuggestion = useCallback((profile: ProfileSuggestion, index: number) => (
    <div key={profile.id} className="p-3">
      <ConnectionSuggestionCard
        profile={profile}
        onConnect={handleConnect}
        onDismiss={handleDismiss}
        isConnecting={sendingConnection === profile.id}
      />
    </div>
  ), [handleConnect, handleDismiss, sendingConnection]);

  if (isLoading) return (
    <Card className="rounded-[40px] bg-white/40 backdrop-blur-3xl border-slate-200/50 p-8 shadow-2xl border">
       <div className="flex items-center justify-between mb-8">
          <div className="h-6 w-48 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse" />
       </div>
       <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-50/50 rounded-[32px] animate-pulse" />
          ))}
       </div>
    </Card>
  );

  return (
    <Card className="rounded-[40px] bg-white/40 backdrop-blur-3xl border-slate-200/50 p-8 shadow-2xl border overflow-hidden relative edge-to-edge">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
         <Sparkles className="h-32 w-32" />
      </div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Network className="h-5 w-5 text-white" />
           </div>
           <h3 className="text-xl font-apple-heavy text-slate-950 tracking-tight">Professional Ecosystem</h3>
        </div>
        <Badge className="bg-slate-950 text-white border-0 rounded-lg px-2 py-0.5 font-apple-heavy text-[9px] tracking-widest uppercase">
          {filteredSuggestions.length} RECOMMENDED SYNC
        </Badge>
      </div>
      
      {showVirtualized && filteredSuggestions.length > 5 ? (
        <VirtualizedList
          items={filteredSuggestions}
          itemHeight={ITEM_HEIGHT}
          containerHeight={CONTAINER_HEIGHT}
          renderItem={renderSuggestion}
          className="w-full"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSuggestions.map((profile, idx) => (
              <motion.div 
                key={profile.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ delay: idx * 0.05 }}
              >
                <ConnectionSuggestionCard
                  profile={profile}
                  onConnect={handleConnect}
                  onDismiss={handleDismiss}
                  isConnecting={sendingConnection === profile.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      <div className="mt-10 pt-8 border-t border-slate-200/50 flex justify-center relative z-10">
         <Button asChild variant="ghost" className="text-xs font-apple-heavy text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded-xl h-10 px-6">
            <Link to="/network">Synchronize Professional Ecosystem <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
         </Button>
      </div>
    </Card>
  );
};

export const OptimizedConnectionSuggestions = memo(OptimizedConnectionSuggestionsComponent);
OptimizedConnectionSuggestions.displayName = 'OptimizedConnectionSuggestions';
