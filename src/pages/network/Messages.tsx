import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConversationsList } from "@/components/network/ConversationsList";
import { ChatArea } from "@/components/network/ChatArea";

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', searchTerm],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all messages for the current user
      let query = supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      const { data, error } = await query.limit(100);
      if (error) throw error;

      // Group messages by conversation partner
      const grouped = data.reduce((acc: any, message: any) => {
        const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
        
        if (!acc[otherUserId]) {
          acc[otherUserId] = {
            userId: otherUserId,
            lastMessage: message,
            messages: []
          };
        }
        
        // Keep only the most recent message as lastMessage
        if (new Date(message.created_at) > new Date(acc[otherUserId].lastMessage.created_at)) {
          acc[otherUserId].lastMessage = message;
        }
        
        acc[otherUserId].messages.push(message);
        return acc;
      }, {});

      // Filter by search term if provided
      let result = Object.values(grouped);
      if (searchTerm) {
        // This would be enhanced with actual user name searching
        result = result.filter((conv: any) => 
          conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return result;
    }
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedConversation
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedConversation) throw new Error('Invalid state');

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedConversation,
          content,
          message_type: 'text'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  // Set up real-time subscriptions for messages
  useEffect(() => {
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Connect with your professional network</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <ConversationsList
            conversations={conversations || []}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isLoading={isLoading}
          />

          <ChatArea
            selectedConversation={selectedConversation}
            messages={messages || []}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
            isLoading={sendMessageMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
