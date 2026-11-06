import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTXCIntegration } from './useTXCIntegration';

export const useConnectionRequests = () => {
  const queryClient = useQueryClient();
  const { triggerConnectionMade } = useTXCIntegration();

  const sendConnectionRequest = useMutation({
    mutationFn: async (arg: string | { recipientId: string; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Normalize string or object argument
      let recipientId = typeof arg === 'string' ? arg : arg.recipientId;
      let connectionMessage = typeof arg === 'string' ? null : (arg.message || null);

      // Handle accidental double-stringified JSON payload
      if (typeof recipientId === 'string' && recipientId.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(recipientId);
          recipientId = parsed.recipientId || parsed.id || recipientId;
          if (parsed.message) connectionMessage = parsed.message;
        } catch (_) {}
      }

      if (!recipientId || typeof recipientId !== 'string') {
        throw new Error('Valid recipient UUID is required');
      }

      // Check if connection already exists
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .limit(1);

      if (existingConnections && existingConnections.length > 0) {
        throw new Error('Connection request or connection already exists');
      }

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          message: connectionMessage,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically dispatch Connection Request email notification
      if (data && recipientId) {
        supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', recipientId)
          .maybeSingle()
          .then(({ data: recProfile }) => {
            if (recProfile?.email) {
              const myName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'A professional';
              fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: recProfile.email,
                  recipientName: recProfile.full_name || 'Professional',
                  template: 'connection_request',
                  priority: 1,
                  immediate: true,
                  variables: {
                    inviter_name: myName,
                    name: recProfile.full_name || 'Professional',
                    recipient_name: recProfile.full_name || 'Professional'
                  }
                })
              }).catch(() => {});
            }
          })
          .catch(() => {});
      }

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
        .select('id, requester_id, recipient_id')
        .single();

      if (error) throw error;

      // Automatically dispatch Connection Accepted email notification
      if (data?.requester_id) {
        supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', data.requester_id)
          .maybeSingle()
          .then(async ({ data: reqProfile }) => {
            if (reqProfile?.email) {
              const { data: { user } } = await supabase.auth.getUser();
              const myName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'A TalentXcel member';
              fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: reqProfile.email,
                  recipientName: reqProfile.full_name || 'Professional',
                  template: 'connection_accepted',
                  priority: 1,
                  immediate: true,
                  variables: {
                    name: myName,
                    recipient_name: reqProfile.full_name || 'Professional'
                  }
                })
              }).catch(() => {});
            }
          })
          .catch(() => {});
      }

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
