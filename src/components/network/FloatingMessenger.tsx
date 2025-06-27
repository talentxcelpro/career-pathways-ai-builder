
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MessageConversationHeader from "./MessageConversationHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";

const FloatingMessenger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch conversations
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id])
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isOpen
  });

  // Fetch selected conversation details
  const { data: conversation } = useQuery({
    queryKey: ['conversation', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return null;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', selectedConversationId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedConversationId
  });

  // Fetch other user details
  const { data: otherUser } = useQuery({
    queryKey: ['otherUser', conversation?.participants],
    queryFn: async () => {
      if (!conversation?.participants || !currentUserId) return null;

      const otherUserId = conversation.participants.find((p: string) => p !== currentUserId);
      if (!otherUserId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!conversation?.participants && !!currentUserId
  });

  // Fetch messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedConversationId,
    refetchInterval: 3000
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedConversationId) throw new Error('Invalid state');

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversationId,
          sender_id: user.id,
          content,
          message_type: 'text'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const messageTime = new Date(dateString);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageTime.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 h-96 flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <h3 className="font-semibold text-sm">Messages</h3>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col min-h-0">
            {!selectedConversationId ? (
              // Conversations List
              <div className="flex-1 p-2">
                <div className="space-y-1 max-h-full overflow-y-auto">
                  {conversations?.map((conv) => {
                    const otherUserId = conv.participants.find((p: string) => p !== currentUserId);
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {otherUserId?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Conversation
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {formatTime(conv.last_updated)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!conversations || conversations.length === 0) && (
                    <div className="text-center py-8">
                      <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No conversations yet</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Selected Conversation
              <>
                {otherUser && (
                  <MessageConversationHeader
                    otherUser={otherUser}
                    formatDisplayName={formatDisplayName}
                    generateInitials={generateInitials}
                  />
                )}

                <div className="flex-1 min-h-0">
                  <MessagesList
                    messages={messages || []}
                    isLoading={messagesLoading}
                    currentUserId={currentUserId}
                    otherUser={otherUser}
                    isTyping={false}
                    formatTime={formatTime}
                    formatDisplayName={formatDisplayName}
                    generateInitials={generateInitials}
                  />
                </div>

                <MessageInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  handleKeyPress={handleKeyPress}
                  sendMessageMutation={sendMessageMutation}
                />

                {/* Back button */}
                <div className="p-1 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversationId(null)}
                    className="w-full text-xs"
                  >
                    ← Back to conversations
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FloatingMessenger;
