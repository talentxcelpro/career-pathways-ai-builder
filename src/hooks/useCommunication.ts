import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  participants: string[];
  is_group: boolean;
  name?: string;
  created_by: string;
  created_at: string;
  last_updated: string;
  last_message_id?: string;
  messages?: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    message_type: string;
    status: string;
  };
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
}

interface GroupChat {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: any[];
}

interface VideoConsultation {
  id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  consultation_type: string;
  client_id: string;
  expert_id: string;
  meeting_url?: string;
  created_at: string;
}

export const useCommunication = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realTimeMessages, setRealTimeMessages] = useState<Message[]>([]);

  // Fetch conversations
  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError
  } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages!conversations_last_message_id_fkey(
            id,
            content,
            created_at,
            sender_id,
            message_type,
            status
          )
        `)
        .contains('participants', [user.id])
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user
  });

  // Fetch messages for a specific conversation
  const {
    data: messages,
    isLoading: messagesLoading
  } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DirectMessage[];
    },
    enabled: !!user
  });

  // Fetch group chats
  const {
    data: groupChats,
    isLoading: groupChatsLoading
  } = useQuery({
    queryKey: ['groupChats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('group_chats')
        .select(`
          *,
          group_chat_members!inner(user_id)
        `)
        .eq('group_chat_members.user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data as GroupChat[];
    },
    enabled: !!user
  });

  // Fetch video consultations
  const {
    data: videoConsultations,
    isLoading: consultationsLoading
  } = useQuery({
    queryKey: ['videoConsultations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('video_consultations')
        .select('*')
        .or(`client_id.eq.${user.id},expert_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data as VideoConsultation[];
    },
    enabled: !!user
  });

  // Fetch consultation availability (mock for now)
  const {
    data: consultationAvailability
  } = useQuery({
    queryKey: ['consultationAvailability'],
    queryFn: async () => {
      // This would fetch from consultation_availability table
      return [];
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

      // For now, this is a simple direct message insert
      // In a full implementation, this would handle both direct and group messages
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: conversationId, // Simplified for demo
          content,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    }
  });

  // Create group chat mutation
  const createGroupChatMutation = useMutation({
    mutationFn: async ({ name, description, isPrivate }: {
      name: string;
      description?: string;
      isPrivate: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('group_chats')
        .insert({
          name,
          description,
          is_private: isPrivate,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as first member
      await supabase
        .from('group_chat_members')
        .insert({
          group_chat_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupChats'] });
      toast.success('Group chat created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create group chat');
    }
  });

  // Book consultation mutation
  const bookConsultationMutation = useMutation({
    mutationFn: async ({
      expertId,
      title,
      description,
      scheduledAt,
      duration,
      consultationType
    }: {
      expertId: string;
      title: string;
      description?: string;
      scheduledAt: Date;
      duration: number;
      consultationType: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('video_consultations')
        .insert({
          client_id: user.id,
          expert_id: expertId,
          title,
          description,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: duration,
          consultation_type: consultationType,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoConsultations'] });
      toast.success('Consultation booked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to book consultation');
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newMessage = payload.new as DirectMessage;
          setRealTimeMessages(prev => [...prev, newMessage as Message]);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, queryClient]);

  return {
    // Data
    conversations,
    messages: messages || realTimeMessages,
    groupChats,
    videoConsultations,
    consultationAvailability,

    // Loading states
    isLoading: conversationsLoading || messagesLoading || groupChatsLoading || consultationsLoading,

    // Actions
    sendMessage: sendMessageMutation.mutateAsync,
    createGroupChat: createGroupChatMutation.mutateAsync,
    bookConsultation: bookConsultationMutation.mutateAsync,

    // Mutation states
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingGroup: createGroupChatMutation.isPending,
    isBookingConsultation: bookConsultationMutation.isPending
  };
};