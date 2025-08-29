import React, { memo, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Building2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VirtualizedList } from "@/components/performance/VirtualizedList";

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

const ITEM_HEIGHT = 120; // Height of each suggestion card
const CONTAINER_HEIGHT = 480; // Max height for virtualized container

const ConnectionSuggestionCard = memo<{
  profile: ProfileSuggestion;
  onConnect: (profileId: string) => void;
  onDismiss: (profileId: string) => void;
  isConnecting: boolean;
}>(({ profile, onConnect, onDismiss, isConnecting }) => {
  const handleConnect = useCallback(() => {
    onConnect(profile.id);
  }, [onConnect, profile.id]);

  const handleDismiss = useCallback(() => {
    onDismiss(profile.id);
  }, [onDismiss, profile.id]);

  const initials = useMemo(() => {
    const names = profile.full_name.split(' ');
    return names.length > 1 
      ? names[0][0] + names[names.length - 1][0] 
      : names[0][0];
  }, [profile.full_name]);

  return (
    <Card className="hover:shadow-md transition-shadow border-border/60">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Link to={`/network/people/${profile.id}`} className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.profile_picture_url} />
              <AvatarFallback className="text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {profile.full_name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {profile.title}
              </p>
              {profile.current_company && (
                <div className="flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {profile.current_company}
                  </span>
                </div>
              )}
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        {profile.mutual_connections && profile.mutual_connections > 0 && (
          <div className="mb-3">
            <Badge variant="secondary" className="text-xs">
              {profile.mutual_connections} mutual connection{profile.mutual_connections > 1 ? 's' : ''}
            </Badge>
          </div>
        )}
        
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          size="sm"
          className="w-full"
        >
          <UserPlus className="h-3 w-3 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
      </CardContent>
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

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-suggestions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Get suggestions with optimized query
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['connection-suggestions', currentUser?.id, limit],
    queryFn: async () => {
      if (!currentUser) return [];

      // Get existing connections to exclude
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`);

      const connectedUserIds = new Set([
        ...connections?.map(c => c.requester_id === currentUser.id ? c.recipient_id : c.requester_id) || []
      ]);

      // Get profile suggestions
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, current_company')
        .neq('id', currentUser.id)
        .limit(limit * 2); // Get more to filter out connections

      if (!profiles) return [];

      // Filter out connected users and add mutual connections count
      const filteredProfiles = profiles
        .filter(profile => !connectedUserIds.has(profile.id))
        .slice(0, limit);

      // Add match scoring (simplified algorithm)
      return filteredProfiles.map(profile => ({
        ...profile,
        mutual_connections: Math.floor(Math.random() * 5), // Placeholder
        match_score: Math.random() * 100
      })).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Send connection request mutation
  const connectMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser?.id,
          recipient_id: recipientId,
          status: 'pending'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Connection request sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['connection-suggestions'] });
    },
    onError: (error) => {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    },
    onSettled: () => {
      setSendingConnection(null);
    }
  });

  // Optimized handlers
  const handleConnect = useCallback(async (profileId: string) => {
    setSendingConnection(profileId);
    connectMutation.mutate(profileId);
  }, [connectMutation]);

  const handleDismiss = useCallback((profileId: string) => {
    setDismissedProfiles(prev => new Set([...prev, profileId]));
  }, []);

  // Filter suggestions by dismissed profiles
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(profile => !dismissedProfiles.has(profile.id));
  }, [suggestions, dismissedProfiles]);

  // Render single suggestion
  const renderSuggestion = useCallback((profile: ProfileSuggestion, index: number) => (
    <div key={profile.id} className="p-2">
      <ConnectionSuggestionCard
        profile={profile}
        onConnect={handleConnect}
        onDismiss={handleDismiss}
        isConnecting={sendingConnection === profile.id}
      />
    </div>
  ), [handleConnect, handleDismiss, sendingConnection]);

  if (isLoading) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">People You May Know</h3>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredSuggestions.length === 0) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">People You May Know</h3>
          <p className="text-muted-foreground text-sm">No suggestions available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/60">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">People You May Know</h3>
          <Badge variant="secondary" className="text-xs">
            {filteredSuggestions.length} suggestions
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
          <div className="space-y-4">
            {filteredSuggestions.map((profile) => (
              <ConnectionSuggestionCard
                key={profile.id}
                profile={profile}
                onConnect={handleConnect}
                onDismiss={handleDismiss}
                isConnecting={sendingConnection === profile.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const OptimizedConnectionSuggestions = memo(OptimizedConnectionSuggestionsComponent);
OptimizedConnectionSuggestions.displayName = 'OptimizedConnectionSuggestions';