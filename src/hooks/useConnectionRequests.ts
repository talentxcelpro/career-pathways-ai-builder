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

      // Automatically dispatch Connection Request email notification with real profile attributes
      if (data && recipientId) {
        Promise.all([
          supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', recipientId)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('full_name, headline, current_job_title, current_company, location, profile_picture_url, avatar_url')
            .eq('id', user.id)
            .maybeSingle()
        ])
          .then(([{ data: recProfile }, { data: senderProfile }]) => {
            if (recProfile?.email) {
              const myName = senderProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'A TalentXcel Member';
              const myTitle = senderProfile?.headline || senderProfile?.current_job_title || '';
              const myCompany = senderProfile?.current_company || '';
              const myLocation = senderProfile?.location || '';
              const myAvatar = senderProfile?.avatar_url || senderProfile?.profile_picture_url || user.user_metadata?.avatar_url || '';

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
                    sender_name: myName,
                    senderName: myName,
                    inviter_name: myName,
                    sender_title: myTitle,
                    senderTitle: myTitle,
                    sender_company: myCompany,
                    senderCompany: myCompany,
                    sender_location: myLocation,
                    senderLocation: myLocation,
                    sender_avatar: myAvatar,
                    senderAvatar: myAvatar,
                    personal_note: message || '',
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

      // Automatically dispatch Connection Accepted email notification with real profile attributes
      if (data?.requester_id) {
        Promise.all([
          supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', data.requester_id)
            .maybeSingle(),
          supabase.auth.getUser()
        ])
          .then(async ([{ data: reqProfile }, { data: { user } }]) => {
            if (reqProfile?.email && user) {
              const { data: myProfile } = await supabase
                .from('profiles')
                .select('full_name, headline, current_job_title, current_company, location, profile_picture_url, avatar_url')
                .eq('id', user.id)
                .maybeSingle();

              const myName = myProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'A TalentXcel Member';
              const myTitle = myProfile?.headline || myProfile?.current_job_title || '';
              const myAvatar = myProfile?.avatar_url || myProfile?.profile_picture_url || user.user_metadata?.avatar_url || '';

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
                    connection_name: myName,
                    connectionName: myName,
                    sender_name: myName,
                    senderName: myName,
                    connection_title: myTitle,
                    connectionTitle: myTitle,
                    connection_avatar: myAvatar,
                    connectionAvatar: myAvatar,
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
