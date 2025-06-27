import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Phone, Video, MoreVertical, Paperclip, Smile, Mic, Image, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const MessageConversation = () => {
  const { id } = useParams<{ id: string }>();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    refetchInterval: REFRESH_INTERVAL, // Auto-refresh every 3 seconds
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
      scrollToBottom();
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-3 py-4">
          <Link to="/network/messages" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors text-sm">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to Messages
          </Link>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <MoreVertical className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">Conversation not found</h3>
              <p className="text-gray-600 text-sm">This conversation may have been deleted or you don't have access to it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-3 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Link to="/network/messages" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors group text-sm">
            <ArrowLeft className="h-3 w-3 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to Messages
          </Link>
          <div className="flex items-center space-x-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isOnline ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="h-[calc(100vh-120px)] flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          {/* Chat Header */}
          <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to={`/network/people/${otherUser?.id}`} className="hover:scale-105 transition-transform">
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-1 ring-white/20">
                      <AvatarImage src={otherUser?.profile_picture_url} />
                      <AvatarFallback className="bg-white/20 text-white font-semibold text-xs">
                        {generateInitials(otherUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
                  </div>
                </Link>
                <div>
                  <Link 
                    to={`/network/people/${otherUser?.id}`}
                    className="hover:text-blue-200 transition-colors"
                  >
                    <h3 className="font-semibold text-sm cursor-pointer">
                      {formatDisplayName(otherUser)}
                    </h3>
                  </Link>
                  <p className="text-blue-100 text-xs">
                    {otherUser?.title || 'Professional'}
                  </p>
                  <p className="text-xs text-blue-200 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    Active now
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-7 w-7 p-0">
                  <Phone className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-7 w-7 p-0">
                  <Video className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-7 w-7 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 p-0 bg-gradient-to-b from-gray-50 to-white">
            <ScrollArea className="h-full p-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 text-xs">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages?.map((message: any, index: number) => {
                    const isOwn = message.sender_id === currentUserId;
                    const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div className={`flex items-end space-x-1.5 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!isOwn && showAvatar && (
                            <Avatar className="h-6 w-6 mb-0.5">
                              <AvatarImage src={otherUser?.profile_picture_url} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                {generateInitials(otherUser)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!isOwn && !showAvatar && <div className="w-6"></div>}
                          
                          <div
                            className={`rounded-xl px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md ${
                              isOwn
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-xs leading-relaxed">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-end space-x-1.5">
                        <Avatar className="h-6 w-6 mb-0.5">
                          <AvatarImage src={otherUser?.profile_picture_url} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                            {generateInitials(otherUser)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-3 py-2 shadow-sm">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="border-t bg-white p-2">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-7 w-7 p-0">
                <Plus className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-7 w-7 p-0">
                <Paperclip className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-7 w-7 p-0">
                <Image className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-7 w-7 p-0">
                <Smile className="h-3 w-3" />
              </Button>
              
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-0 bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-full px-3 py-1.5 text-sm transition-all h-8"
                disabled={sendMessageMutation.isPending}
              />
              
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-7 w-7 p-0">
                <Mic className="h-3 w-3" />
              </Button>
              
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-3 py-1.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 h-8 text-xs"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MessageConversation;
