
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Video, MoreVertical, Send, Paperclip, Smile } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';
import MediaPreview from "@/components/posts/MediaPreview";

interface ChatAreaProps {
  selectedConversation: string | null;
  messages: any[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedConversation,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  isLoading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the profile of the selected conversation user
  const { data: conversationProfile } = useQuery({
    queryKey: ['conversationProfile', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .eq('id', selectedConversation)
        .single();

      if (error) {
        console.error('Error fetching conversation profile:', error);
        return null;
      }

      return profile;
    },
    enabled: !!selectedConversation
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  if (!selectedConversation) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="flex items-center justify-center h-full min-h-[500px]">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-500">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/user/${selectedConversation}`} className="hover:scale-105 transition-transform">
              <Avatar className="cursor-pointer">
                <AvatarImage src={conversationProfile?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {generateInitials(conversationProfile)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link 
                to={`/user/${selectedConversation}`}
                className="hover:text-blue-600 transition-colors"
              >
                <h3 className="font-semibold cursor-pointer">
                  {formatDisplayName(conversationProfile)}
                </h3>
              </Link>
              <p className="text-sm text-gray-500">
                {conversationProfile?.title || 'Professional'}
              </p>
              <p className="text-xs text-gray-400">
                <span className="text-green-600">● Online</span>
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {messages?.map((message: any) => {
              const isOwn = message.sender_id !== selectedConversation;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                   >
                     <MediaPreview content={message.content} isMessage={true} />
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
