import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, X, Check } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  suggested_user_id: string;
  suggestion_reason: string;
  suggestion_score: number;
  profiles?: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
    current_company?: string;
  };
}

export const PeopleYouMayKnow: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch connection suggestions
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['connection-suggestions', currentUser],
    queryFn: async () => {
      if (!currentUser) return [];

      const { data, error } = await supabase
        .from('connection_suggestions')
        .select(`
          id,
          suggested_user_id,
          suggestion_reason,
          suggestion_score,
          profiles:suggested_user_id (
            id,
            full_name,
            profile_picture_url,
            title,
            current_company
          )
        `)
        .eq('user_id', currentUser)
        .eq('is_dismissed', false)
        .order('suggestion_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      })) as Suggestion[];
    },
    enabled: !!currentUser,
  });

  // Send connection request
  const sendConnectionRequest = useMutation({
    mutationFn: async ({ recipientId, message }: { recipientId: string; message?: string }) => {
      if (!currentUser) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser,
          recipient_id: recipientId,
          message: message || 'I would like to connect with you.',
          status: 'pending'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Connection request sent!",
        description: "Your request has been sent successfully.",
      });
      
      // Remove from suggestions and invalidate queries
      queryClient.setQueryData(['connection-suggestions', currentUser], (old: Suggestion[] | undefined) => 
        old?.filter(s => s.suggested_user_id !== variables.recipientId) || []
      );
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive"
      });
      console.error('Connection request error:', error);
    }
  });

  // Dismiss suggestion
  const dismissSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('connection_suggestions')
        .update({ is_dismissed: true })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: (_, suggestionId) => {
      queryClient.setQueryData(['connection-suggestions', currentUser], (old: Suggestion[] | undefined) => 
        old?.filter(s => s.id !== suggestionId) || []
      );
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to dismiss suggestion.",
        variant: "destructive"
      });
    }
  });

  // Generate suggestions if none exist
  useEffect(() => {
    const generateSuggestions = async () => {
      if (currentUser && suggestions && suggestions.length === 0) {
        try {
          await supabase.rpc('generate_connection_suggestions', { p_user_id: currentUser });
          queryClient.invalidateQueries({ queryKey: ['connection-suggestions', currentUser] });
        } catch (error) {
          console.error('Error generating suggestions:', error);
        }
      }
    };

    generateSuggestions();
  }, [currentUser, suggestions, queryClient]);

  if (isLoading) {
    return (
      <Card className="border-0 bg-gradient-card shadow-float">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            People you may know
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="border-0 bg-gradient-card shadow-float">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            People you may know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No suggestions available right now.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Connect with more people to get better suggestions!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="border-0 bg-gradient-card shadow-float">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            People you may know
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={suggestion.profiles?.profile_picture_url} />
                    <AvatarFallback>
                      {suggestion.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {suggestion.profiles?.full_name || 'Unknown User'}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {suggestion.profiles?.title || 'Professional'}
                      {suggestion.profiles?.current_company && (
                        <span> • {suggestion.profiles.current_company}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {suggestion.suggestion_reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissSuggestion.mutate(suggestion.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendConnectionRequest.mutate({ recipientId: suggestion.suggested_user_id })}
                    disabled={sendConnectionRequest.isPending}
                    className="h-8 px-3 border-primary/20 hover:bg-primary/5"
                  >
                    <UserPlus className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {suggestions.length > 0 && (
            <div className="pt-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-muted-foreground hover:text-primary"
              >
                Show more
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};