import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, X } from 'lucide-react';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';

interface ConnectionSuggestion {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  headline?: string;
  current_company?: string;
  location?: string;
  mutual_connections: number;
}

export const ConnectionSuggestions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sendConnectionRequest } = useConnectionRequests();
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  // Fetch connection suggestions
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['connection-suggestions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get current connections to exclude them
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const connectedUserIds = connections?.map(conn => 
        conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
      ) || [];

      // Get suggested profiles (excluding current connections)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, headline, current_company, location')
        .neq('id', user.id)
        .not('id', 'in', `(${connectedUserIds.join(',') || 'null'})`)
        .limit(10);

      if (error) throw error;

      // Add mock mutual connections count for demo
      return (profiles || []).map(profile => ({
        ...profile,
        mutual_connections: Math.floor(Math.random() * 15) + 1
      })) as ConnectionSuggestion[];
    },
    enabled: !!user?.id
  });

  const handleConnect = async (suggestion: ConnectionSuggestion) => {
    try {
      await sendConnectionRequest.mutateAsync(suggestion.id);
      setDismissedSuggestions(prev => [...prev, suggestion.id]);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
  };

  const filteredSuggestions = suggestions?.filter(
    suggestion => !dismissedSuggestions.includes(suggestion.id)
  ) || [];

  if (isLoading || filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-4">
      <Card className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">People you may know</h3>
          <span className="text-xs text-gray-500">{filteredSuggestions.length} suggestions</span>
        </div>
        
        <div className="space-y-3">
          {filteredSuggestions.slice(0, 3).map((suggestion) => (
            <div key={suggestion.id} className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={suggestion.profile_picture_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {suggestion.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {suggestion.full_name || 'Professional User'}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {suggestion.headline || suggestion.current_company || 'Professional'}
                </p>
                <p className="text-xs text-gray-500">
                  {suggestion.mutual_connections} mutual connections
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => handleDismiss(suggestion.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleConnect(suggestion)}
                  disabled={sendConnectionRequest.isPending}
                  className="h-8 px-3 rounded-full"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredSuggestions.length > 3 && (
          <Button 
            variant="ghost" 
            className="w-full mt-3 text-primary"
            onClick={() => {/* Navigate to full suggestions page */}}
          >
            See all suggestions
          </Button>
        )}
      </Card>
    </div>
  );
};