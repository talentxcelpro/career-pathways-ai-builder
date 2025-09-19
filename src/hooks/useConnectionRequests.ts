import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTXCIntegration } from './useTXCIntegration';

export const useConnectionRequests = () => {
  const queryClient = useQueryClient();
  const { triggerConnectionMade } = useTXCIntegration();

  const sendConnectionRequest = useMutation({
    mutationFn: async (recipientId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .single();

      if (existingConnection) {
        throw new Error('Connection already exists');
      }

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await triggerConnectionMade();
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-suggestions'] });
      toast.success('Connection request sent!');
    },
    onError: (error) => {
      console.error('Connection request error:', error);
      toast.error('Failed to send connection request');
    }
  });

  const acceptConnectionRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await triggerConnectionMade();
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      toast.success('Connection accepted!');
    },
    onError: (error) => {
      console.error('Accept connection error:', error);
      toast.error('Failed to accept connection');
    }
  });

  return {
    sendConnectionRequest,
    acceptConnectionRequest,
    isSending: sendConnectionRequest.isPending,
    isAccepting: acceptConnectionRequest.isPending
  };
};