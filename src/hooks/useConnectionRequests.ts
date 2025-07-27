import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConnectionRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  message?: string;
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    full_name: string;
    title: string;
    profile_picture_url?: string;
  };
  recipient?: {
    id: string;
    full_name: string;
    title: string;
    profile_picture_url?: string;
  };
}

export const useConnectionRequests = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-connections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch pending connection requests (received by current user)
  const { data: pendingRequests, isLoading: isLoadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['connectionRequests', 'pending', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        console.log('No current user, returning empty array');
        return [];
      }

      console.log('Fetching pending connection requests for user:', currentUser.id);

      const { data: requests, error } = await supabase
        .from('connections')
        .select('*')
        .eq('recipient_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending requests:', error);
        toast.error('Failed to load connection requests');
        return [];
      }

      if (!requests || requests.length === 0) {
        return [];
      }

      // Fetch requester profiles separately
      const requesterIds = requests.map(r => r.requester_id).filter(Boolean);
      
      if (requesterIds.length === 0) {
        return requests.map(r => ({ ...r, requester: null }));
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url')
        .in('id', requesterIds);

      if (profileError) {
        console.error('Error fetching requester profiles:', profileError);
      }

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const requestsWithProfiles = requests.map(request => ({
        ...request,
        requester: profileMap.get(request.requester_id) || null
      }));

      console.log('Fetched pending requests with profiles:', requestsWithProfiles);
      return requestsWithProfiles;
    },
    enabled: !!currentUser,
    staleTime: 0, // Always fetch fresh data
  });

  // Fetch sent connection requests
  const { data: sentRequests, isLoading: isLoadingSent, refetch: refetchSent } = useQuery({
    queryKey: ['connectionRequests', 'sent', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      const { data: requests, error } = await supabase
        .from('connections')
        .select('*')
        .eq('requester_id', currentUser.id)
        .in('status', ['pending', 'accepted', 'declined'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sent requests:', error);
        return [];
      }

      if (!requests || requests.length === 0) {
        return [];
      }

      // Fetch recipient profiles separately
      const recipientIds = requests.map(r => r.recipient_id).filter(Boolean);
      
      if (recipientIds.length === 0) {
        return requests.map(r => ({ ...r, recipient: null }));
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url')
        .in('id', recipientIds);

      if (profileError) {
        console.error('Error fetching recipient profiles:', profileError);
      }

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return requests.map(request => ({
        ...request,
        recipient: profileMap.get(request.recipient_id) || null
      }));
    },
    enabled: !!currentUser,
    staleTime: 0,
  });

  // Send connection request mutation
  const sendConnectionMutation = useMutation({
    mutationFn: async ({ recipientId, message }: { recipientId: string; message?: string }) => {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('Sending connection request:', {
        requester_id: currentUser.id,
        recipient_id: recipientId,
        message: message || 'Hi! I would love to connect with you.'
      });

      // Check if connection already exists
      const { data: existing, error: checkError } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(requester_id.eq.${currentUser.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${currentUser.id})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing connection:', checkError);
        throw checkError;
      }

      if (existing) {
        if (existing.status === 'pending') {
          throw new Error('Connection request already sent');
        } else if (existing.status === 'accepted') {
          throw new Error('You are already connected');
        }
      }

      // Insert new connection request
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser.id,
          recipient_id: recipientId,
          status: 'pending',
          message: message || 'Hi! I would love to connect with you.'
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting connection request:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Connection request sent successfully!');
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connection-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error: Error) => {
      console.error('Send connection request error:', error);
      toast.error(error.message || 'Failed to send connection request');
    }
  });

  // Accept connection request mutation
  const acceptConnectionMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('Accepting connection request:', requestId);

      // First, verify the request exists and belongs to current user
      const { data: request, error: fetchError } = await supabase
        .from('connections')
        .select('*')
        .eq('id', requestId)
        .eq('recipient_id', currentUser.id)
        .eq('status', 'pending')
        .single();

      if (fetchError) {
        console.error('Error fetching connection request:', fetchError);
        if (fetchError.code === 'PGRST116') {
          throw new Error('Connection request not found or already processed');
        }
        throw fetchError;
      }

      if (!request) {
        throw new Error('Connection request not found');
      }

      console.log('Found request to accept:', request);

      // Update the connection status
      const { data, error } = await supabase
        .from('connections')
        .update({
          status: 'accepted',
          connected_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('recipient_id', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error accepting connection:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Connection request accepted!');
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
    },
    onError: (error: Error) => {
      console.error('Accept connection request error:', error);
      toast.error(error.message || 'Failed to accept connection request');
    }
  });

  // Decline connection request mutation
  const declineConnectionMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('Declining connection request:', requestId);

      // First, verify the request exists and belongs to current user
      const { data: request, error: fetchError } = await supabase
        .from('connections')
        .select('*')
        .eq('id', requestId)
        .eq('recipient_id', currentUser.id)
        .eq('status', 'pending')
        .single();

      if (fetchError) {
        console.error('Error fetching connection request for decline:', fetchError);
        if (fetchError.code === 'PGRST116') {
          throw new Error('Connection request not found or already processed');
        }
        throw fetchError;
      }

      // Update the connection status
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'declined' })
        .eq('id', requestId)
        .eq('recipient_id', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error declining connection:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Connection request declined');
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
    },
    onError: (error: Error) => {
      console.error('Decline connection request error:', error);
      toast.error(error.message || 'Failed to decline connection request');
    }
  });

  // Helper functions
  const sendConnectionRequest = async (recipientId: string, message?: string) => {
    setIsProcessing(recipientId);
    try {
      await sendConnectionMutation.mutateAsync({ recipientId, message });
    } finally {
      setIsProcessing(null);
    }
  };

  const acceptConnectionRequest = async (requestId: string) => {
    setIsProcessing(requestId);
    try {
      await acceptConnectionMutation.mutateAsync(requestId);
    } finally {
      setIsProcessing(null);
    }
  };

  const declineConnectionRequest = async (requestId: string) => {
    setIsProcessing(requestId);
    try {
      await declineConnectionMutation.mutateAsync(requestId);
    } finally {
      setIsProcessing(null);
    }
  };

  // Format helper functions
  const formatDisplayName = (profile: any) => {
    return profile?.full_name || 'Professional User';
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

  return {
    // Data
    pendingRequests: pendingRequests || [],
    sentRequests: sentRequests || [],
    currentUser,
    
    // Loading states
    isLoadingPending,
    isLoadingSent,
    isProcessing,
    
    // Actions
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    
    // Refetch functions
    refetchPending,
    refetchSent,
    
    // Helper functions
    formatDisplayName,
    generateInitials,
    
    // Mutation states
    isSendingRequest: sendConnectionMutation.isPending,
    isAcceptingRequest: acceptConnectionMutation.isPending,
    isDecliningRequest: declineConnectionMutation.isPending,
  };
};