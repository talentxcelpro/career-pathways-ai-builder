import React, { useState, useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Sparkles, User, Video, Phone, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RealTimeMessagingProps {
  chatId?: string;
  recipientId?: string;
  className?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  messageType: 'text' | 'ai_suggestion' | 'system';
  metadata?: any;
  senderProfile?: {
    full_name: string;
    profile_picture_url?: string;
  };
}

interface ChatParticipant {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  title?: string;
  is_online: boolean;
  last_seen?: string;
}

export const RealTimeMessaging: React.FC<RealTimeMessagingProps> = memo(({
  chatId,
  recipientId,
  className
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch chat participants
  const { data: participants } = useQuery({
    queryKey: ['chat-participants', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      
      const { data, error } = await supabase
        .from('chat_participants')
        .select(`
          profiles:user_id (
            id,
            full_name,
            profile_picture_url,
            title
          )
        `)
        .eq('chat_id', chatId);

      if (error) throw error;
      return data?.map(p => p.profiles).filter(Boolean) || [];
    },
    enabled: !!chatId
  });

  // Fetch messages
  const { data: messageHistory } = useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:sender_id (
            full_name,
            profile_picture_url
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!chatId
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ content, type = 'text' }: { content: string; type?: string }) => {
      if (!chatId || !user) throw new Error('Missing required data');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          message_type: type
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  });

  // AI message enhancement
  const enhanceMessage = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase.functions.invoke('ai-message-enhancer', {
        body: {
          message: content,
          context: 'professional_networking',
          tone: 'professional'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.enhancedMessage) {
        setNewMessage(data.enhancedMessage);
        toast.success('Message enhanced with AI!');
      }
    }
  });

  // Smart reply suggestions
  const generateReplySuggestions = useMutation({
    mutationFn: async (lastMessage: string) => {
      const { data, error } = await supabase.functions.invoke('ai-reply-suggestions', {
        body: {
          lastMessage,
          conversationContext: messages.slice(-5),
          userProfile: user
        }
      });

      if (error) throw error;
      return data;
    }
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!chatId || !user) return;

    const messagesChannel = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new as any; // Using any since the DB structure differs from our interface
          if (newMessage.sender_id !== user.id) {
            const formattedMessage: Message = {
              id: newMessage.id,
              content: newMessage.content,
              senderId: newMessage.sender_id,
              recipientId: newMessage.recipient_id,
              timestamp: newMessage.created_at,
              messageType: newMessage.message_type || 'text',
              metadata: newMessage.metadata
            };
            setMessages(prev => [...prev, formattedMessage]);
            
            // Generate smart reply suggestions for received messages
            if (newMessage.message_type === 'text') {
              generateReplySuggestions.mutate(newMessage.content);
            }
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = messagesChannel.presenceState();
        const onlineUsers = Object.keys(state).filter(key => key !== user.id);
        setTypingUsers(onlineUsers);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          messagesChannel.track({
            user_id: user.id,
            username: user.email,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [chatId, user]);

  // Typing indicators
  const handleTyping = () => {
    if (!isTyping && chatId) {
      setIsTyping(true);
      supabase
        .channel(`typing_${chatId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { user_id: user?.id, typing: true }
        });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (chatId) {
        supabase
          .channel(`typing_${chatId}`)
          .send({
            type: 'broadcast',
            event: 'typing',
            payload: { user_id: user?.id, typing: false }
          });
      }
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessage.mutate({ content: newMessage.trim() });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  if (!chatId) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a conversation to start messaging</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} flex flex-col h-full`}>
      {/* Chat Header */}
      <CardHeader className="border-b bg-muted/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {participants && participants.length > 0 && (
              <>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={(participants[0] as any)?.profile_picture_url} />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">{(participants[0] as any)?.full_name}</h3>
                  <p className="text-xs text-muted-foreground">{(participants[0] as any)?.title}</p>
                </div>
              </>
            )}
            {isConnected && (
              <Badge variant="outline" className="text-xs">
                Connected
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost">
              <Video className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-3 py-2 ${
                message.senderId === user?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.messageType === 'ai_suggestion' && (
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs opacity-75">AI Enhanced</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4 flex-shrink-0">
        {/* AI Reply Suggestions */}
        {generateReplySuggestions.data?.suggestions && (
          <div className="mb-3 space-y-2">
            <p className="text-xs text-muted-foreground">Smart replies:</p>
            <div className="flex flex-wrap gap-2">
              {generateReplySuggestions.data.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => setNewMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1 space-y-2">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            
            {newMessage.trim() && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => enhanceMessage.mutate(newMessage)}
                disabled={enhanceMessage.isPending}
                className="text-xs h-7"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Enhance with AI
              </Button>
            )}
          </div>
          
          <Button 
            type="submit" 
            size="sm"
            disabled={!newMessage.trim() || sendMessage.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
});

RealTimeMessaging.displayName = 'RealTimeMessaging';