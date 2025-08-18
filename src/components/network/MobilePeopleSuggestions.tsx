import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Loader2, Users, MapPin, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PeopleSuggestion {
  id: string;
  full_name: string;
  title?: string;
  profile_picture_url?: string;
  current_company?: string;
  location?: string;
  pro_plan?: string;
  pro_status?: string;
}

export const MobilePeopleSuggestions: React.FC = () => {
  const { user } = useAuth();
  const [connectingTo, setConnectingTo] = useState<string | null>(null);

  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['mobile-people-suggestions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get existing connections to exclude
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('recipient_id, requester_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .in('status', ['accepted', 'pending']);

      const connectedUserIds = new Set([
        ...(existingConnections?.map(c => c.recipient_id) || []),
        ...(existingConnections?.map(c => c.requester_id) || [])
      ]);

      // Get profiles excluding current user and existing connections
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, current_company, location, pro_plan, pro_status')
        .neq('id', user.id)
        .not('full_name', 'is', null)
        .limit(10);

      if (error) throw error;

      // Filter out existing connections
      const filteredProfiles = profiles
        .filter(profile => !connectedUserIds.has(profile.id))
        .slice(0, 5);

      return filteredProfiles;
    },
    enabled: !!user
  });

  const handleConnect = async (suggestion: PeopleSuggestion) => {
    if (!user) return;

    setConnectingTo(suggestion.id);
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: suggestion.id,
          status: 'pending',
          message: `Hi ${suggestion.full_name}! I would love to connect with you.`
        });

      if (error) throw error;
      toast.success('Connection request sent!');
      refetch(); // Refresh to remove from suggestions
    } catch (error) {
      toast.error('Failed to send connection request');
    } finally {
      setConnectingTo(null);
    }
  };

  const generateInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (!user || isLoading) {
    return (
      <Card className="mx-3 mb-4 bg-white border-0 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                </div>
                <div className="w-16 h-7 bg-muted rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mx-3 mb-4 bg-white border-0 shadow-sm rounded-3xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 text-sm">People you may know</h3>
        </div>
        
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                <AvatarImage src={suggestion.profile_picture_url} alt={suggestion.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm font-semibold">
                  {generateInitials(suggestion.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {suggestion.full_name}
                </h4>
                <div className="space-y-0.5">
                  {suggestion.title && (
                    <p className="text-xs text-gray-600 truncate">
                      {suggestion.title}
                    </p>
                  )}
                  {suggestion.current_company && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.current_company}
                      </p>
                    </div>
                  )}
                  {suggestion.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-3 py-1.5 h-auto rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => handleConnect(suggestion)}
                disabled={connectingTo === suggestion.id}
              >
                {connectingTo === suggestion.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 mr-1" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-sm text-blue-600 hover:bg-blue-50 rounded-xl"
        >
          View all suggestions
        </Button>
      </CardContent>
    </Card>
  );
};