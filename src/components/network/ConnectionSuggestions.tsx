import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, UserPlus, Loader2, Users, ArrowRight, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';

interface Connection {
  id: string;
  full_name: string;
  title: string;
  profile_picture_url?: string;
  current_company?: string;
}

export const ConnectionSuggestions: React.FC = () => {
  const { sendConnectionRequest, isSending } = useConnectionRequests();
  const [sendingConnection, setSendingConnection] = useState<string | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-suggestions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['connection-suggestions', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      // Get existing connections to exclude
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('recipient_id, requester_id')
        .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .in('status', ['accepted', 'pending']);

      const connectedUserIds = new Set([
        ...(existingConnections?.map(c => c.recipient_id) || []),
        ...(existingConnections?.map(c => c.requester_id) || [])
      ]);

      // Get profiles excluding current user and existing connections
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, current_company')
        .neq('id', currentUser.id)
        .not('full_name', 'is', null)
        .limit(20);

      if (error) throw error;

      // Filter out existing connections and return first 8
      const filteredProfiles = profiles
        .filter(profile => !connectedUserIds.has(profile.id))
        .slice(0, 8);

      return filteredProfiles;
    },
    enabled: !!currentUser
  });

  const handleConnectionRequest = async (userId: string) => {
    if (!currentUser) return;

    setSendingConnection(userId);
    try {
      await sendConnectionRequest.mutateAsync(userId);
    } finally {
      setSendingConnection(null);
    }
  };

  const formatDisplayName = (profile: Connection) => {
    return profile.full_name || 'Professional User';
  };

  const generateInitials = (profile: Connection) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (!currentUser) return null;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-8 w-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.slice(0, 6).map((suggestion, index) => (
              <div 
                key={suggestion.id} 
                className="group p-4 rounded-lg border hover:border-secondary/30 hover:bg-secondary/5 transition-all duration-200 animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Link to={`/user/${suggestion.id}`}>
                      <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-secondary/20 transition-all">
                        <AvatarImage src={suggestion.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-primary/20 text-foreground font-semibold">
                          {generateInitials(suggestion)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <Link 
                        to={`/user/${suggestion.id}`}
                        className="font-semibold text-foreground hover:text-secondary transition-colors story-link"
                      >
                        {formatDisplayName(suggestion)}
                      </Link>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {suggestion.title && (
                          <p className="line-clamp-1">{suggestion.title}</p>
                        )}
                        {suggestion.current_company && (
                          <p className="text-xs text-muted-foreground/80">
                            at {suggestion.current_company}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConnectionRequest(suggestion.id)}
                    disabled={sendingConnection === suggestion.id || sendConnectionRequest.isPending}
                    size="sm"
                    className="shrink-0 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    {sendingConnection === suggestion.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
            
            {/* View More Button */}
            <div className="pt-4 border-t">
              <Link to="/network/discover">
                <Button variant="outline" className="w-full hover:bg-secondary/10">
                  <Users className="h-4 w-4 mr-2" />
                  Discover More People
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 p-3 bg-muted/50 rounded-full w-fit">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No suggestions available</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
              Complete your profile to get personalized connection suggestions based on your interests and career goals.
            </p>
            <Link 
              to="/profile/edit" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Complete Profile
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};