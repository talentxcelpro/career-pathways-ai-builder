
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ConnectionRequests: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch pending connection requests
  const { data: connectionRequests, isLoading } = useQuery({
    queryKey: ['connectionRequests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get pending connection requests where current user is the recipient
      const { data: requestsData, error } = await supabase
        .from('connections')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connection requests:', error);
        return [];
      }

      if (!requestsData || requestsData.length === 0) return [];

      // Get profiles for requesters
      const requesterIds = requestsData.map(req => req.requester_id).filter(Boolean);
      if (requesterIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url')
        .in('id', requesterIds);

      if (profilesError) {
        console.error('Error fetching requester profiles:', profilesError);
      }

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return requestsData.map(request => ({
        ...request,
        requesterProfile: profilesMap.get(request.requester_id) || {
          id: request.requester_id,
          full_name: 'Unknown User',
          title: 'Professional',
          profile_picture_url: null
        }
      }));
    }
  });

  // Accept connection mutation
  const acceptConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      // Verify user is authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to accept connections');
      }

      console.log('Accepting connection:', connectionId, 'by user:', currentUser.id);
      
      // First, let's verify the connection exists and belongs to the current user
      const { data: connectionCheck, error: checkError } = await supabase
        .from('connections')
        .select('*')
        .eq('id', connectionId)
        .eq('recipient_id', currentUser.id)
        .eq('status', 'pending')
        .single();

      console.log('Connection check result:', { connectionCheck, checkError });

      if (checkError) {
        console.error('Error checking connection:', checkError);
        if (checkError.code === 'PGRST116') {
          throw new Error('Connection request not found or you are not authorized to accept it');
        }
        throw new Error(`Failed to verify connection: ${checkError.message}`);
      }

      if (!connectionCheck) {
        throw new Error('Connection request not found or already processed');
      }

      // Now update the connection
      const { data, error } = await supabase
        .from('connections')
        .update({ 
          status: 'accepted',
          connected_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .eq('recipient_id', currentUser.id)
        .eq('status', 'pending') // Extra safety check
        .select();

      console.log('Update result:', { data, error });

      if (error) {
        console.error('Supabase error accepting connection:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to accept connection: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.error('No rows updated - connection not found or not owned by user');
        throw new Error('Connection request not found or you are not authorized to accept it');
      }

      console.log('Connection accepted successfully:', data[0]);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
      toast.success('Connection request accepted!');
    },
    onError: (error) => {
      toast.error('Failed to accept connection request');
      console.error('Accept connection error:', error);
    }
  });

  // Decline connection mutation
  const declineConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'declined' })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      toast.success('Connection request declined');
    },
    onError: (error) => {
      toast.error('Failed to decline connection request');
      console.error('Decline connection error:', error);
    }
  });

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const handleAccept = (connectionId: string) => {
    console.log('User clicked accept for connection:', connectionId);
    acceptConnectionMutation.mutate(connectionId);
  };

  const handleDecline = (connectionId: string) => {
    console.log('User clicked decline for connection:', connectionId);
    declineConnectionMutation.mutate(connectionId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <UserPlus className="h-5 w-5 mr-2" />
            Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!connectionRequests || connectionRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <UserPlus className="h-5 w-5 mr-2" />
            Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <UserPlus className="h-5 w-5 mr-2" />
          Connection Requests ({connectionRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connectionRequests.map((request) => (
            <div key={request.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={request.requesterProfile?.profile_picture_url} />
                <AvatarFallback>
                  {generateInitials(request.requesterProfile)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {formatDisplayName(request.requesterProfile)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {request.requesterProfile?.title || 'Professional'}
                </p>
                {request.message && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    "{request.message}"
                  </p>
                )}
                <div className="flex space-x-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(request.id)}
                    disabled={acceptConnectionMutation.isPending}
                    className="h-7 px-2 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(request.id)}
                    disabled={declineConnectionMutation.isPending}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
