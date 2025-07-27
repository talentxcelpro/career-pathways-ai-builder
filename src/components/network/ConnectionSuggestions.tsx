import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';
import { supabase } from '@/integrations/supabase/client';

interface Connection {
  id: string;
  full_name: string;
  title: string;
  profile_picture_url?: string;
  current_company?: string;
}

export const ConnectionSuggestions: React.FC = () => {
  const {
    sendConnectionRequest,
    isProcessing,
    formatDisplayName,
    generateInitials,
    currentUser
  } = useConnectionRequests();

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

      // Filter out existing connections and return first 4
      const filteredProfiles = profiles
        .filter(profile => !connectedUserIds.has(profile.id))
        .slice(0, 4);

      return filteredProfiles;
    },
    enabled: !!currentUser
  });


  if (!currentUser) return null;

  return (
    <Card className="bg-white/80 backdrop-blur-md border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-primary" />
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-2 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : suggestions && suggestions.length > 0 ? (
            suggestions.map((person) => (
              <div key={person.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Link to={`/network/people/${person.id}`}>
                    <Avatar className="w-10 h-10 cursor-pointer hover:scale-105 transition-transform">
                      <AvatarImage 
                        src={person.profile_picture_url} 
                        alt={formatDisplayName(person)}
                      />
                      <AvatarFallback className="text-xs bg-slate-100">
                        {generateInitials(person)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link 
                      to={`/network/people/${person.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      <p className="font-medium text-sm truncate">
                        {formatDisplayName(person)}
                      </p>
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {person.title || person.current_company || 'Professional'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2 px-2 h-7"
                  onClick={() => sendConnectionRequest(person.id)}
                  disabled={isProcessing === person.id}
                >
                  {isProcessing === person.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <UserPlus className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No suggestions available</p>
            </div>
          )}
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="mt-4 pt-3 border-t text-center">
            <Link to="/network/suggestions">
              <Button variant="ghost" size="sm" className="text-xs">
                View All Suggestions
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};