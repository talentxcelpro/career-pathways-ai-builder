import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MessageConversationHeader from "@/components/network/MessageConversationHeader";
import MessagesList from "@/components/network/MessagesList";
import MessageInput from "@/components/network/MessageInput";
import ConversationNotFound from "@/components/network/ConversationNotFound";

const MessageConversation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const queryClient = useQueryClient();

  // Auto-refresh interval (every 3 seconds)
  const REFRESH_INTERVAL = 3000;

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Set up auto-refresh for messages
  useEffect(() => {
    if (!id) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [id, queryClient]);

  // Simulate online status detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: conversation } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      if (!id) throw new Error('Conversation ID is required');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: otherUser } = useQuery({
    queryKey: ['otherUser', conversation?.participants],
    queryFn: async () => {
      if (!conversation?.participants) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const otherUserId = conversation.participants.find((p: string) => p !== user.id);
      if (!otherUserId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (error) {
        console.error('Error fetching other user:', error);
        return null;
      }
      return data;
    },
    enabled: !!conversation?.participants
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: true
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !id) throw new Error('Invalid state');

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: user.id,
          content,
          message_type: 'text'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
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

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  const handleClose = () => {
    navigate('/network/messages');
  };

  if (!conversation) {
    return <ConversationNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className={`mx-auto px-1 py-1 transition-all duration-300 ${isMinimized ? 'max-w-sm' : 'max-w-xl'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <Link to="/network/messages" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors group text-xs">
            <ArrowLeft className="h-2.5 w-2.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to Messages
          </Link>
          <div className="flex items-center space-x-1">
            <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isOnline ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
        </div>

        {/* Chat Container */}
        <Card className={`flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 ${
          isMinimized ? 'h-[400px]' : 'h-[calc(100vh-60px)]'
        }`}>
          <MessageConversationHeader
            otherUser={otherUser}
            formatDisplayName={formatDisplayName}
            generateInitials={generateInitials}
            isMinimized={isMinimized}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onClose={handleClose}
          />

          <MessagesList
            messages={messages || []}
            isLoading={isLoading}
            currentUserId={currentUserId}
            otherUser={otherUser}
            isTyping={isTyping}
            formatTime={formatTime}
            formatDisplayName={formatDisplayName}
            generateInitials={generateInitials}
          />

          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            sendMessageMutation={sendMessageMutation}
          />
        </Card>
      </div>
    </div>
  );
};

export default MessageConversation;
