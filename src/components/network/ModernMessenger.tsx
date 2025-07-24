import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal, 
  Send,
  Smile,
  Paperclip,
  Settings,
  X,
  Users,
  UserPlus,
  Archive,
  Star,
  Circle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ModernMessengerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Conversation {
  id: string;
  participants: string[];
  last_updated: string;
  last_message_id?: string;
  name?: string;
  is_group?: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  title?: string;
  online_status?: boolean;
}

const ModernMessenger: React.FC<ModernMessengerProps> = ({ isOpen, onClose }) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  // Fetch profiles for all participants
  const { data: profiles } = useQuery({
    queryKey: ['profiles', conversations],
    queryFn: async () => {
      if (!conversations) return {};
      
      const allParticipants = conversations.flatMap(conv => conv.participants);
      const uniqueParticipants = [...new Set(allParticipants)];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uniqueParticipants);

      if (error) throw error;
      
      return data.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, Profile>);
    },
    enabled: !!conversations && conversations.length > 0
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
      scrollToBottom();
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
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDisplayName = (profile: Profile | undefined) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Professional User';
  };

  const generateInitials = (profile: Profile | undefined) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!currentUserId || !profiles) return null;
    const otherUserId = conversation.participants.find(p => p !== currentUserId);
    return otherUserId ? profiles[otherUserId] : null;
  };

  const filteredConversations = conversations?.filter(conv => {
    if (!searchTerm) return true;
    const otherParticipant = getOtherParticipant(conv);
    const displayName = formatDisplayName(otherParticipant);
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100">
      <div className="h-screen flex">
        {/* Sidebar - Conversations List */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Messages</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations?.map((conv) => {
              const otherParticipant = getOtherParticipant(conv);
              const isSelected = selectedConversationId === conv.id;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-4 cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant?.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                          {generateInitials(otherParticipant)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online status indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900 truncate">
                          {formatDisplayName(otherParticipant)}
                        </p>
                        <span className="text-xs text-slate-500">
                          {formatTime(conv.last_updated)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {otherParticipant?.title || 'Professional'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {(!filteredConversations || filteredConversations.length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageCircle className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No conversations yet</p>
                <p className="text-slate-400 text-sm mt-1">Start connecting with professionals!</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversationId && conversation && profiles ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getOtherParticipant(conversation)?.profile_picture_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                        {generateInitials(getOtherParticipant(conversation))}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {formatDisplayName(getOtherParticipant(conversation))}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                        <span className="text-sm text-slate-500">Active now</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-slate-500">Loading messages...</div>
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === currentUserId;
                    const showAvatar = index === messages.length - 1 || 
                      messages[index + 1]?.sender_id !== message.sender_id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-2`}
                      >
                        {!isCurrentUser && (
                          <Avatar className={`h-8 w-8 ${showAvatar ? '' : 'invisible'}`}>
                            <AvatarImage src={getOtherParticipant(conversation)?.profile_picture_url} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                              {generateInitials(getOtherParticipant(conversation))}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : ''}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white rounded-br-sm'
                                : 'bg-white text-slate-900 rounded-bl-sm shadow-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          <p className={`text-xs text-slate-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex justify-center py-16">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No messages yet</p>
                      <p className="text-slate-400 text-sm mt-1">Start the conversation!</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-slate-200 p-4">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="pr-12 bg-slate-50 border-slate-200 rounded-full"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="h-9 w-9 p-0 rounded-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">Welcome to Messages</h3>
                <p className="text-slate-500 max-w-sm">
                  Select a conversation from the sidebar to start chatting with your professional network.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Profile Info (optional) */}
        {selectedConversationId && conversation && (
          <div className="w-80 bg-white border-l border-slate-200 p-4">
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={getOtherParticipant(conversation)?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                  {generateInitials(getOtherParticipant(conversation))}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="font-semibold text-lg text-slate-900 mb-1">
                {formatDisplayName(getOtherParticipant(conversation))}
              </h3>
              
              <p className="text-slate-500 mb-4">
                {getOtherParticipant(conversation)?.title || 'Professional'}
              </p>
              
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Chat
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernMessenger;